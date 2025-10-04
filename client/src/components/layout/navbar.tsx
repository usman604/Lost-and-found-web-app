import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import NotificationBell from "./notification-bell";
import { useAuth } from "@/hooks/use-auth";
import { logoutUser } from "@/api/auth";
import { Search, Shield } from "lucide-react";

interface NavbarProps {
  showAdmin?: boolean;
}

export default function Navbar({ showAdmin = false }: NavbarProps) {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logoutUser();
      logout();
      setLocation("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      // Force logout on client side even if server request fails
      logout();
      setLocation("/login");
    }
  };

  const navItems = showAdmin ? [
    { path: "/admin", label: "Dashboard", active: location === "/admin" },
    { path: "/admin", label: "Matches", active: false },
    { path: "/admin", label: "Users", active: false },
    { path: "/admin", label: "Reports", active: false },
  ] : [
    { path: "/dashboard", label: "Dashboard", active: location === "/dashboard" || location === "/" },
    { path: "/lost", label: "Lost Items", active: location === "/lost" },
    { path: "/found", label: "Found Items", active: location === "/found" },
  ];

  return (
    <nav className="sticky top-0 z-40" style={{ backgroundColor: "hsl(0, 0%, 100%)", borderBottom: "1px solid hsl(214, 32%, 91%)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex items-center mr-8">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center mr-3"
                style={{ backgroundColor: showAdmin ? "hsl(221, 83%, 53%)" : "hsl(221, 83%, 53%)" }}
              >
                {showAdmin ? <Shield className="text-white" /> : <Search className="text-white" />}
              </div>
              <span className="text-xl font-bold" style={{ color: "hsl(222, 47%, 11%)" }}>
                {showAdmin ? "Admin Panel" : "Campus L&F"}
              </span>
            </div>
            <div className="hidden md:flex space-x-6">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => setLocation(item.path)}
                  className={`font-medium pb-1 border-b-2 transition-colors ${
                    item.active 
                      ? "border-primary" 
                      : "border-transparent hover:text-foreground"
                  }`}
                  style={{ 
                    color: item.active ? "hsl(221, 83%, 53%)" : "hsl(215, 16%, 47%)",
                    borderBottomColor: item.active ? "hsl(221, 83%, 53%)" : "transparent"
                  }}
                  data-testid={`nav-${item.label.toLowerCase().replace(" ", "-")}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <NotificationBell />

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: user?.role === "admin" ? "hsl(0, 84%, 60%)" : "hsl(243, 75%, 59%)" }}
              >
                <span className="text-white font-medium" data-testid="user-avatar">
                  {user?.name?.split(' ').map(n => n[0]).join('') || "U"}
                </span>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium" style={{ color: "hsl(222, 47%, 11%)" }} data-testid="user-name">
                  {user?.name || "User"}
                </p>
                <p className="text-xs" style={{ color: "hsl(215, 16%, 47%)" }} data-testid="user-id">
                  {user?.role === "admin" ? "Administrator" : user?.email || ""}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-sm"
                data-testid="button-logout"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
