import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/layout/navbar";
import { getLostItem, getFoundItem } from "@/api/items";
import { ArrowLeft, MapPin, Calendar, User, MessageSquare, Link as LinkIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ItemDetailProps {
  type: "lost" | "found";
  id: string;
}

export default function ItemDetail({ type, id }: ItemDetailProps) {
  const [, setLocation] = useLocation();

  const { data: item, isLoading, error } = useQuery({
    queryKey: ['/api', type, id],
    queryFn: () => type === "lost" ? getLostItem(id) : getFoundItem(id),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "hsl(210, 20%, 98%)" }}>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="bg-muted rounded h-6 w-24 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-muted rounded-lg h-96"></div>
              <div className="space-y-4">
                <div className="bg-muted rounded h-8 w-3/4"></div>
                <div className="bg-muted rounded h-4 w-full"></div>
                <div className="bg-muted rounded h-4 w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "hsl(210, 20%, 98%)" }}>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2" style={{ color: "hsl(222, 47%, 11%)" }}>Item Not Found</h3>
            <p style={{ color: "hsl(215, 16%, 47%)" }}>The item you're looking for doesn't exist or has been removed.</p>
            <Button 
              onClick={() => setLocation(type === "lost" ? "/lost" : "/found")} 
              className="mt-4"
              data-testid="button-back-to-list"
            >
              Back to {type === "lost" ? "Lost" : "Found"} Items
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const statusColors = {
    pending: "hsl(38, 92%, 50%)",
    matched: "hsl(142, 71%, 45%)",
    returned: "hsl(221, 83%, 53%)",
    closed: "hsl(0, 0%, 40%)",
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "hsl(210, 20%, 98%)" }}>
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button 
          variant="outline" 
          className="mb-6"
          onClick={() => setLocation(type === "lost" ? "/lost" : "/found")}
          data-testid="button-back"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to {type === "lost" ? "Lost" : "Found"} Items
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Item Image */}
          <div>
            {item.image_path ? (
              <img 
                src={item.image_path} 
                alt={item.title}
                className="w-full rounded-lg border"
                style={{ borderColor: "hsl(214, 32%, 91%)" }}
                data-testid="item-image"
              />
            ) : (
              <div 
                className="w-full h-96 rounded-lg border flex items-center justify-center"
                style={{ 
                  backgroundColor: "hsl(210, 40%, 96%)",
                  borderColor: "hsl(214, 32%, 91%)"
                }}
              >
                <p style={{ color: "hsl(215, 16%, 47%)" }}>No image available</p>
              </div>
            )}
          </div>

          {/* Item Details */}
          <div>
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h1 className="text-3xl font-bold" style={{ color: "hsl(222, 47%, 11%)" }} data-testid="item-title">
                    {item.title}
                  </h1>
                  <Badge 
                    variant="secondary" 
                    className="ml-4"
                    style={{ 
                      backgroundColor: `${statusColors[item.status as keyof typeof statusColors]}15`,
                      color: statusColors[item.status as keyof typeof statusColors]
                    }}
                    data-testid="item-status"
                  >
                    {item.status}
                  </Badge>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-start">
                    <MessageSquare className="mr-3 mt-1" style={{ color: "hsl(215, 16%, 47%)" }} />
                    <div>
                      <p className="text-sm font-medium mb-1" style={{ color: "hsl(222, 47%, 11%)" }}>Description</p>
                      <p className="text-sm" style={{ color: "hsl(215, 16%, 47%)" }} data-testid="item-description">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <span className="inline-block w-6 h-6 mr-3 text-center" style={{ color: "hsl(215, 16%, 47%)" }}>
                      #
                    </span>
                    <div>
                      <p className="text-sm font-medium mb-1" style={{ color: "hsl(222, 47%, 11%)" }}>Category</p>
                      <p className="text-sm" style={{ color: "hsl(215, 16%, 47%)" }} data-testid="item-category">
                        {item.category}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <MapPin className="mr-3" style={{ color: "hsl(215, 16%, 47%)" }} />
                    <div>
                      <p className="text-sm font-medium mb-1" style={{ color: "hsl(222, 47%, 11%)" }}>Location</p>
                      <p className="text-sm" style={{ color: "hsl(215, 16%, 47%)" }} data-testid="item-location">
                        {item.location}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Calendar className="mr-3" style={{ color: "hsl(215, 16%, 47%)" }} />
                    <div>
                      <p className="text-sm font-medium mb-1" style={{ color: "hsl(222, 47%, 11%)" }}>
                        Date {type === "lost" ? "Lost" : "Found"}
                      </p>
                      <p className="text-sm" style={{ color: "hsl(215, 16%, 47%)" }} data-testid="item-date">
                        {new Date(type === "lost" ? item.date_lost : item.date_found).toLocaleDateString()} 
                        ({formatDistanceToNow(new Date(type === "lost" ? item.date_lost : item.date_found), { addSuffix: true })})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <User className="mr-3" style={{ color: "hsl(215, 16%, 47%)" }} />
                    <div>
                      <p className="text-sm font-medium mb-1" style={{ color: "hsl(222, 47%, 11%)" }}>
                        Reported By
                      </p>
                      <p className="text-sm" style={{ color: "hsl(215, 16%, 47%)" }} data-testid="item-reporter">
                        {item.user.name} ({item.user.university_id})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <span className="inline-block w-6 h-6 mr-3 text-center" style={{ color: "hsl(215, 16%, 47%)" }}>
                      ⏰
                    </span>
                    <div>
                      <p className="text-sm font-medium mb-1" style={{ color: "hsl(222, 47%, 11%)" }}>
                        Reported On
                      </p>
                      <p className="text-sm" style={{ color: "hsl(215, 16%, 47%)" }} data-testid="item-created">
                        {new Date(item.created_at).toLocaleDateString()} at {new Date(item.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6" style={{ borderColor: "hsl(214, 32%, 91%)" }}>
                  <Button 
                    className="w-full mb-3"
                    style={{ backgroundColor: "hsl(243, 75%, 59%)" }}
                    data-testid="button-suggest-match"
                  >
                    <LinkIcon className="mr-2 h-4 w-4" />
                    Suggest Potential Match
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    data-testid="button-contact-reporter"
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Contact Reporter
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Potential Matches Section - Placeholder for future implementation */}
            <Card className="mt-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4" style={{ color: "hsl(222, 47%, 11%)" }}>
                  Potential Matches
                </h3>
                <div className="text-center py-8">
                  <p className="text-sm" style={{ color: "hsl(215, 16%, 47%)" }}>
                    No potential matches found yet. The system will automatically suggest matches when similar items are reported.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
