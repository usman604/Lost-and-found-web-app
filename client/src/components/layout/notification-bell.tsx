import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getUserNotifications, getNotificationCount, markNotificationAsRead } from "@/api/admin";
import { Bell, Link as LinkIcon, CheckCircle, Info } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ['/api/notifications'],
    queryFn: getUserNotifications,
  });

  const { data: countData = { count: 0 } } = useQuery({
    queryKey: ['/api/notifications/count'],
    queryFn: getNotificationCount,
  });

  const markAsReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/count'] });
    },
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markAsReadMutation.mutate(notification.id);
    }
    setIsOpen(false);
  };

  const getNotificationIcon = (title: string) => {
    if (title.includes("Match")) {
      return <LinkIcon className="text-primary" />;
    } else if (title.includes("Approved") || title.includes("Verified")) {
      return <CheckCircle className="text-secondary" />;
    } else {
      return <Info className="text-muted-foreground" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        className="p-2 relative"
        onClick={() => setIsOpen(!isOpen)}
        data-testid="notification-bell"
      >
        <Bell className="h-5 w-5" style={{ color: "hsl(215, 16%, 47%)" }} />
        {countData.count > 0 && (
          <Badge 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-semibold min-w-5"
            style={{ backgroundColor: "hsl(0, 84%, 60%)", color: "white" }}
            data-testid="notification-count"
          >
            {countData.count > 9 ? "9+" : countData.count}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <Card 
          className="absolute top-full right-0 mt-2 w-80 max-h-96 overflow-y-auto shadow-lg z-50"
          style={{ backgroundColor: "hsl(0, 0%, 100%)", borderColor: "hsl(214, 32%, 91%)" }}
        >
          <div className="p-4 border-b" style={{ borderColor: "hsl(214, 32%, 91%)" }}>
            <h3 className="font-semibold" style={{ color: "hsl(222, 47%, 11%)" }}>Notifications</h3>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center">
                <Bell className="mx-auto h-8 w-8 mb-2" style={{ color: "hsl(215, 16%, 47%)" }} />
                <p className="text-sm" style={{ color: "hsl(215, 16%, 47%)" }}>
                  No notifications yet
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="p-4 border-b hover:bg-accent cursor-pointer transition-colors"
                  style={{ borderColor: "hsl(214, 32%, 91%)" }}
                  onClick={() => handleNotificationClick(notification)}
                  data-testid={`notification-${notification.id}`}
                >
                  <div className="flex items-start">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3 flex-shrink-0" style={{ backgroundColor: "hsl(221, 83%, 53%, 0.1)" }}>
                      {getNotificationIcon(notification.title)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <p className="text-sm font-medium" style={{ color: "hsl(222, 47%, 11%)" }}>
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <div 
                            className="w-2 h-2 rounded-full ml-2 flex-shrink-0"
                            style={{ backgroundColor: "hsl(221, 83%, 53%)" }}
                          />
                        )}
                      </div>
                      <p className="text-xs mb-1" style={{ color: "hsl(215, 16%, 47%)" }}>
                        {notification.body}
                      </p>
                      <p className="text-xs" style={{ color: "hsl(215, 16%, 47%)" }}>
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t text-center" style={{ borderColor: "hsl(214, 32%, 91%)" }}>
              <button
                className="text-sm hover:underline"
                style={{ color: "hsl(221, 83%, 53%)" }}
                onClick={() => setIsOpen(false)}
                data-testid="view-all-notifications"
              >
                View all notifications
              </button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
