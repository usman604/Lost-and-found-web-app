import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { X, AlertTriangle, CheckCircle, Check, XIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface MatchModalProps {
  match: any;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  isLoading: boolean;
}

export default function MatchModal({ match, onClose, onApprove, onReject, isLoading }: MatchModalProps) {
  if (!match) return null;

  const scoreBreakdown = [
    { label: "Category Match", value: 40, current: match.lostItem.category === match.foundItem.category ? 40 : 0 },
    { label: "Location Match", value: 20, current: match.lostItem.location === match.foundItem.location ? 20 : 0 },
    { label: "Date Proximity", value: 15, current: Math.round(match.score * 0.15) },
    { label: "Keyword Match", value: 20, current: Math.round((match.score - 60) * 0.5) },
    { label: "Images Present", value: 5, current: (match.lostItem.image_path && match.foundItem.image_path) ? 5 : 0 },
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      onClick={onClose}
    >
      <Card 
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <CardContent className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold" style={{ color: "hsl(222, 47%, 11%)" }}>Match Details</h2>
              <p className="text-sm mt-1" style={{ color: "hsl(215, 16%, 47%)" }}>
                Match ID: #{match.id.slice(0, 8)}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              data-testid="button-close-modal"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Match Score */}
          <div className="mb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="text-center">
                <div 
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-2"
                  style={{ backgroundColor: "hsl(221, 83%, 53%, 0.1)" }}
                >
                  <span className="text-2xl font-bold" style={{ color: "hsl(221, 83%, 53%)" }}>
                    {match.score}%
                  </span>
                </div>
                <p className="text-sm" style={{ color: "hsl(215, 16%, 47%)" }}>Match Score</p>
              </div>
            </div>
            <div 
              className="w-full h-2 rounded-full overflow-hidden"
              style={{ backgroundColor: "hsl(210, 40%, 96%)" }}
            >
              <div 
                className="h-full bg-gradient-to-r"
                style={{ 
                  width: `${match.score}%`,
                  backgroundImage: "linear-gradient(to right, hsl(221, 83%, 53%), hsl(243, 75%, 59%))"
                }}
              />
            </div>
          </div>

          {/* Items Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Lost Item */}
            <Card className="border" style={{ borderColor: "hsl(214, 32%, 91%)" }}>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3 flex items-center" style={{ color: "hsl(222, 47%, 11%)" }}>
                  <AlertTriangle className="mr-2" style={{ color: "hsl(0, 84%, 60%)" }} />
                  Lost Item
                </h3>
                {match.lostItem.image_path ? (
                  <img 
                    src={match.lostItem.image_path} 
                    alt={match.lostItem.title}
                    className="w-full h-40 object-cover rounded mb-3"
                  />
                ) : (
                  <div 
                    className="w-full h-40 rounded mb-3 flex items-center justify-center"
                    style={{ backgroundColor: "hsl(210, 40%, 96%)" }}
                  >
                    <p className="text-sm" style={{ color: "hsl(215, 16%, 47%)" }}>No image</p>
                  </div>
                )}
                <h4 className="font-medium mb-2" style={{ color: "hsl(222, 47%, 11%)" }}>
                  {match.lostItem.title}
                </h4>
                <p className="text-sm mb-3" style={{ color: "hsl(215, 16%, 47%)" }}>
                  {match.lostItem.description}
                </p>
                <div className="space-y-1 text-xs" style={{ color: "hsl(215, 16%, 47%)" }}>
                  <div className="flex items-center">
                    <span className="w-4 text-center">👤</span>
                    <span className="ml-2">{match.lostItem.user.name} ({match.lostItem.user.university_id})</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-4 text-center">📍</span>
                    <span className="ml-2">{match.lostItem.location}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-4 text-center">📅</span>
                    <span className="ml-2">{formatDistanceToNow(new Date(match.lostItem.date_lost), { addSuffix: true })}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Found Item */}
            <Card className="border" style={{ borderColor: "hsl(214, 32%, 91%)" }}>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3 flex items-center" style={{ color: "hsl(222, 47%, 11%)" }}>
                  <CheckCircle className="mr-2" style={{ color: "hsl(221, 83%, 53%)" }} />
                  Found Item
                </h3>
                {match.foundItem.image_path ? (
                  <img 
                    src={match.foundItem.image_path} 
                    alt={match.foundItem.title}
                    className="w-full h-40 object-cover rounded mb-3"
                  />
                ) : (
                  <div 
                    className="w-full h-40 rounded mb-3 flex items-center justify-center"
                    style={{ backgroundColor: "hsl(210, 40%, 96%)" }}
                  >
                    <p className="text-sm" style={{ color: "hsl(215, 16%, 47%)" }}>No image</p>
                  </div>
                )}
                <h4 className="font-medium mb-2" style={{ color: "hsl(222, 47%, 11%)" }}>
                  {match.foundItem.title}
                </h4>
                <p className="text-sm mb-3" style={{ color: "hsl(215, 16%, 47%)" }}>
                  {match.foundItem.description}
                </p>
                <div className="space-y-1 text-xs" style={{ color: "hsl(215, 16%, 47%)" }}>
                  <div className="flex items-center">
                    <span className="w-4 text-center">👤</span>
                    <span className="ml-2">{match.foundItem.user.name} ({match.foundItem.user.university_id})</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-4 text-center">📍</span>
                    <span className="ml-2">{match.foundItem.location}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-4 text-center">📅</span>
                    <span className="ml-2">{formatDistanceToNow(new Date(match.foundItem.date_found), { addSuffix: true })}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Match Analysis */}
          <Card className="mb-6" style={{ backgroundColor: "hsl(210, 40%, 96%)" }}>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3" style={{ color: "hsl(222, 47%, 11%)" }}>Match Analysis</h3>
              <div className="space-y-2 text-sm">
                {scoreBreakdown.map((item) => (
                  <div key={item.label} className="flex justify-between items-center">
                    <span style={{ color: "hsl(215, 16%, 47%)" }}>{item.label}</span>
                    <span className="font-medium" style={{ color: "hsl(222, 47%, 11%)" }}>
                      {item.current}/{item.value} pts
                    </span>
                  </div>
                ))}
                <div className="border-t pt-2 mt-2" style={{ borderColor: "hsl(214, 32%, 91%)" }}>
                  <div className="flex justify-between items-center font-semibold">
                    <span style={{ color: "hsl(222, 47%, 11%)" }}>Total Score</span>
                    <span style={{ color: "hsl(221, 83%, 53%)" }}>{match.score}/100 pts</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex space-x-3">
            <Button 
              className="flex-1"
              onClick={onApprove}
              disabled={isLoading}
              data-testid="button-approve-match"
              style={{ backgroundColor: "hsl(221, 83%, 53%)" }}
            >
              <Check className="mr-2 h-4 w-4" />
              {isLoading ? "Processing..." : "Approve Match"}
            </Button>
            <Button 
              variant="destructive"
              className="flex-1"
              onClick={onReject}
              disabled={isLoading}
              data-testid="button-reject-match"
            >
              <XIcon className="mr-2 h-4 w-4" />
              {isLoading ? "Processing..." : "Reject Match"}
            </Button>
            <Button 
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              data-testid="button-cancel-match"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
