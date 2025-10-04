import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { authenticate, generateToken, AuthenticatedRequest } from "./middleware/auth";
import { requireAdmin } from "./middleware/admin";
import { MatchingEngine } from "./utils/matchingEngine";
import { notifyMatchApproval, notifyUserVerification } from "./utils/notifier";
import { verifyStudentWithUniversityApi } from "./utils/universityConnector";
import { insertUserSchema, insertLostItemSchema, insertFoundItemSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import multer, { type FileFilterCallback } from "multer";
import path from "path";
import { promises as fs } from "fs";

// File upload configuration
const uploadDir = path.join(process.cwd(), "server", "uploads");

// Ensure uploads directory exists
fs.mkdir(uploadDir, { recursive: true }).catch(console.error);

interface MulterRequest extends AuthenticatedRequest {
  file?: Express.Multer.File;
}

const storage_multer = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage_multer,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb: FileFilterCallback) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded files statically
  app.use('/uploads', express.static(uploadDir));

  // Auth routes
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }

      // Verify university ID if enabled
      const isValidStudent = await verifyStudentWithUniversityApi(validatedData.university_id);
      if (!isValidStudent) {
        return res.status(400).json({ message: "Invalid university ID. Please check with your institution." });
      }

      const user = await storage.createUser(validatedData);
      const token = generateToken({ id: user.id, email: user.email, role: user.role });
      
      // Set HTTP-only cookie
      res.cookie('token', token, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.status(201).json({ 
        message: user.verified ? "Account created successfully" : "Account created. Waiting for admin verification.",
        user: { 
          id: user.id, 
          name: user.name, 
          email: user.email, 
          role: user.role,
          verified: user.verified 
        } 
      });
    } catch (error: any) {
      console.error('Signup error:', error);
      if (error.issues) {
        return res.status(400).json({ message: "Validation failed", errors: error.issues });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      if (!user.verified) {
        return res.status(403).json({ message: "Account not verified. Please wait for admin approval." });
      }

      const token = generateToken({ id: user.id, email: user.email, role: user.role });
      
      res.cookie('token', token, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.json({ 
        message: "Login successful",
        user: { 
          id: user.id, 
          name: user.name, 
          email: user.email, 
          role: user.role,
          verified: user.verified 
        } 
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get('/api/auth/me', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        verified: user.verified,
        university_id: user.university_id
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: "Logged out successfully" });
  });

  // Lost items routes
  app.post('/api/lost', authenticate, upload.single('image'), async (req: MulterRequest, res) => {
    try {
      const data = {
        ...req.body,
        date_lost: new Date(req.body.date_lost),
        image_path: req.file ? `/uploads/${req.file.filename}` : null
      };
      
      const validatedData = insertLostItemSchema.parse(data);
      const lostItem = await storage.createLostItem(validatedData, req.user!.id);
      
      // Run matching engine
      await MatchingEngine.matchLostItem(lostItem);
      
      res.status(201).json(lostItem);
    } catch (error: any) {
      console.error('Create lost item error:', error);
      if (error.issues) {
        return res.status(400).json({ message: "Validation failed", errors: error.issues });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get('/api/lost', async (req, res) => {
    try {
      const { category, location, search } = req.query;
      const filters = {
        category: category as string,
        location: location as string,
        search: search as string
      };
      
      const lostItems = await storage.getLostItems(filters);
      res.json(lostItems);
    } catch (error) {
      console.error('Get lost items error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get('/api/lost/my', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const lostItems = await storage.getUserLostItems(req.user!.id);
      res.json(lostItems);
    } catch (error) {
      console.error('Get user lost items error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get('/api/lost/:id', async (req, res) => {
    try {
      const lostItem = await storage.getLostItem(req.params.id);
      if (!lostItem) {
        return res.status(404).json({ message: "Lost item not found" });
      }
      res.json(lostItem);
    } catch (error) {
      console.error('Get lost item error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete('/api/lost/:id', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      await storage.deleteLostItem(req.params.id, req.user!.id);
      res.json({ message: "Lost item deleted successfully" });
    } catch (error) {
      console.error('Delete lost item error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Found items routes
  app.post('/api/found', authenticate, upload.single('image'), async (req: MulterRequest, res) => {
    try {
      const data = {
        ...req.body,
        date_found: new Date(req.body.date_found),
        image_path: req.file ? `/uploads/${req.file.filename}` : null
      };
      
      const validatedData = insertFoundItemSchema.parse(data);
      const foundItem = await storage.createFoundItem(validatedData, req.user!.id);
      
      // Run matching engine
      await MatchingEngine.matchFoundItem(foundItem);
      
      res.status(201).json(foundItem);
    } catch (error: any) {
      console.error('Create found item error:', error);
      if (error.issues) {
        return res.status(400).json({ message: "Validation failed", errors: error.issues });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get('/api/found', async (req, res) => {
    try {
      const { category, location, search } = req.query;
      const filters = {
        category: category as string,
        location: location as string,
        search: search as string
      };
      
      const foundItems = await storage.getFoundItems(filters);
      res.json(foundItems);
    } catch (error) {
      console.error('Get found items error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get('/api/found/my', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const foundItems = await storage.getUserFoundItems(req.user!.id);
      res.json(foundItems);
    } catch (error) {
      console.error('Get user found items error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get('/api/found/:id', async (req, res) => {
    try {
      const foundItem = await storage.getFoundItem(req.params.id);
      if (!foundItem) {
        return res.status(404).json({ message: "Found item not found" });
      }
      res.json(foundItem);
    } catch (error) {
      console.error('Get found item error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete('/api/found/:id', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      await storage.deleteFoundItem(req.params.id, req.user!.id);
      res.json({ message: "Found item deleted successfully" });
    } catch (error) {
      console.error('Delete found item error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Match requests routes
  app.get('/api/matches/pending', authenticate, requireAdmin, async (req, res) => {
    try {
      const matches = await storage.getPendingMatchRequests();
      res.json(matches);
    } catch (error) {
      console.error('Get pending matches error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get('/api/matches/my', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const matches = await storage.getUserMatches(req.user!.id);
      res.json(matches);
    } catch (error) {
      console.error('Get user matches error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post('/api/matches/generate', authenticate, requireAdmin, async (req, res) => {
    try {
      const matchCount = await MatchingEngine.generateAllMatches();
      res.json({ message: `Generated matches for ${matchCount} items` });
    } catch (error) {
      console.error('Generate matches error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post('/api/matches/:id/verify', authenticate, requireAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Status must be 'approved' or 'rejected'" });
      }

      await storage.updateMatchRequestStatus(req.params.id, status);
      
      if (status === 'approved') {
        await notifyMatchApproval(req.params.id);
        
        // Update item statuses to matched
        const matches = await storage.getMatchRequests();
        const match = matches.find(m => m.id === req.params.id);
        if (match) {
          await storage.updateLostItemStatus(match.lost_id, 'matched');
          await storage.updateFoundItemStatus(match.found_id, 'matched');
        }
      }

      res.json({ message: `Match ${status} successfully` });
    } catch (error) {
      console.error('Verify match error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Notifications routes
  app.get('/api/notifications', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const notifications = await storage.getUserNotifications(req.user!.id);
      res.json(notifications);
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get('/api/notifications/count', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const count = await storage.getUnreadNotificationCount(req.user!.id);
      res.json({ count });
    } catch (error) {
      console.error('Get notification count error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post('/api/notifications/mark-read', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const { notificationId } = req.body;
      await storage.markNotificationAsRead(notificationId, req.user!.id);
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error('Mark notification as read error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin routes
  app.get('/api/admin/users', authenticate, requireAdmin, async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get('/api/admin/users/pending', authenticate, requireAdmin, async (req, res) => {
    try {
      const users = await storage.getPendingUsers();
      res.json(users);
    } catch (error) {
      console.error('Get pending users error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post('/api/admin/users/:id/verify', authenticate, requireAdmin, async (req, res) => {
    try {
      await storage.verifyUser(req.params.id);
      await notifyUserVerification(req.params.id);
      res.json({ message: "User verified successfully" });
    } catch (error) {
      console.error('Verify user error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get('/api/admin/stats', authenticate, requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
