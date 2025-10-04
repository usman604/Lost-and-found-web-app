import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ItemCardProps {
  item: any;
  type: "lost" | "found";
  showUser?: boolean;
}

export default function ItemCard({ item, type, showUser = false }: ItemCardProps) {
  const [, setLocation] = useLocation();

  const statusColors = {
    pending: { bg: "hsl(38, 92%, 50%, 0.15)", text: "hsl(25, 95%, 53%)" },
    matched: { bg: "hsl(142, 76%, 36%, 0.15)", text: "hsl(142, 71%, 45%)" },
    returned: { bg: "hsl(221, 83%, 53%, 0.15)", text: "hsl(221, 83%, 53%)" },
    closed: { bg: "hsl(0, 0%, 60%, 0.15)", text: "hsl(0, 0%, 40%)" },
  };

  const statusColor = statusColors[item.status as keyof typeof statusColors] || statusColors.pending;

  const dateField = type === "lost" ? item.date_lost : item.date_found;
  const userName = showUser && item.user ? `${item.user.name.split(' ')[0]} ${item.user.name.split(' ')[1]?.[0] || ''}.` : null;

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => setLocation(`/${type}/${item.id}`)}
      data-testid={`item-card-${item.id}`}
    >
      {item.image_path ? (
        <img 
          src={item.image_path} 
          alt={item.title}
          className="w-full h-48 object-cover"
        />
      ) : (
        <div 
          className="w-full h-48 flex items-center justify-center"
          style={{ backgroundColor: "hsl(210, 40%, 96%)" }}
        >
          <p className="text-sm" style={{ color: "hsl(215, 16%, 47%)" }}>No image</p>
        </div>
      )}
      
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold" style={{ color: "hsl(222, 47%, 11%)" }} data-testid="item-title">
            {item.title}
          </h3>
          <Badge 
            className="ml-2"
            style={{ 
              backgroundColor: statusColor.bg,
              color: statusColor.text
            }}
            data-testid="item-status"
          >
            {item.status}
          </Badge>
        </div>
        
        <p className="text-sm mb-3" style={{ color: "hsl(215, 16%, 47%)" }} data-testid="item-description">
          {item.description.length > 80 ? `${item.description.substring(0, 80)}...` : item.description}
        </p>
        
        <div className="space-y-2 text-xs mb-4" style={{ color: "hsl(215, 16%, 47%)" }}>
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-2" />
            <span data-testid="item-location">{item.location}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            <span data-testid="item-date">
              {formatDistanceToNow(new Date(dateField), { addSuffix: true })}
            </span>
          </div>
          {userName && (
            <div className="flex items-center">
              <User className="w-4 h-4 mr-2" />
              <span data-testid="item-user">{userName}</span>
            </div>
          )}
        </div>
        
        <Button 
          variant="outline" 
          className="w-full text-sm"
          onClick={(e) => {
            e.stopPropagation();
            setLocation(`/${type}/${item.id}`);
          }}
          data-testid="button-view-details"
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );
}
