import { InsertNotification } from "@shared/schema";
import { storage } from "../storage";

/**
 * Create a notification in the database
 */
export async function createNotification(notification: InsertNotification): Promise<void> {
  try {
    await storage.createNotification(notification);
    console.log(`[Notifier] Created notification for user ${notification.user_id}: ${notification.title}`);
    
    // TODO: Add email notification here if SENDGRID_API_KEY is present
    // await sendEmailNotification(notification);
  } catch (error) {
    console.error("[Notifier] Failed to create notification:", error);
  }
}

/**
 * Send email notification using SendGrid (placeholder)
 * Uncomment and implement when SENDGRID_API_KEY is available
 */
// async function sendEmailNotification(notification: InsertNotification): Promise<void> {
//   const sendGridApiKey = process.env.SENDGRID_API_KEY;
//   
//   if (!sendGridApiKey) {
//     console.log("[Notifier] SendGrid API key not found, skipping email notification");
//     return;
//   }
//
//   try {
//     // Get user email
//     const user = await storage.getUser(notification.user_id);
//     if (!user) return;
//
//     // TODO: Implement SendGrid email sending
//     // const sgMail = require('@sendgrid/mail');
//     // sgMail.setApiKey(sendGridApiKey);
//     //
//     // const msg = {
//     //   to: user.email,
//     //   from: 'noreply@campus-lostandfound.com',
//     //   subject: notification.title,
//     //   text: notification.body,
//     //   html: `<p>${notification.body}</p>${notification.link ? `<p><a href="${process.env.FRONTEND_URL}${notification.link}">View Details</a></p>` : ''}`,
//     // };
//     //
//     // await sgMail.send(msg);
//     
//     console.log(`[Notifier] Email sent to ${user.email}: ${notification.title}`);
//   } catch (error) {
//     console.error("[Notifier] Failed to send email notification:", error);
//   }
// }

/**
 * Notify users about match approval
 */
export async function notifyMatchApproval(matchId: string): Promise<void> {
  try {
    const matches = await storage.getMatchRequests();
    const match = matches.find(m => m.id === matchId);
    
    if (!match) {
      console.error(`[Notifier] Match ${matchId} not found`);
      return;
    }

    // Notify both users
    await createNotification({
      user_id: match.lostItem.user_id,
      title: "Match Approved!",
      body: `Your match for "${match.lostItem.title}" has been approved. You can now coordinate with the finder.`,
      link: `/dashboard?tab=matches`,
    });

    await createNotification({
      user_id: match.foundItem.user_id,
      title: "Match Approved!",
      body: `Your match for "${match.foundItem.title}" has been approved. You can now coordinate with the owner.`,
      link: `/dashboard?tab=matches`,
    });

    console.log(`[Notifier] Match approval notifications sent for match ${matchId}`);
  } catch (error) {
    console.error("[Notifier] Failed to send match approval notifications:", error);
  }
}

/**
 * Notify user about account verification
 */
export async function notifyUserVerification(userId: string): Promise<void> {
  try {
    await createNotification({
      user_id: userId,
      title: "Account Verified!",
      body: "Your account has been verified by an administrator. You can now access all features.",
      link: "/dashboard",
    });

    console.log(`[Notifier] Account verification notification sent for user ${userId}`);
  } catch (error) {
    console.error("[Notifier] Failed to send user verification notification:", error);
  }
}
