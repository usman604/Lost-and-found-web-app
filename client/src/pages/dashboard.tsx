import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/layout/navbar";
import ItemCard from "@/components/items/item-card";
import { getUserLostItems, getUserFoundItems } from "@/api/items";
import { getUserMatches } from "@/api/admin";
import { AlertTriangle, CheckCircle, Link as LinkIcon, Plus } from "lucide-react";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("lost");

  const { data: lostItems = [], isLoading: loadingLost } = useQuery({
    queryKey: ['/api/lost/my'],
    queryFn: () => getUserLostItems(),
  });

  const { data: foundItems = [], isLoading: loadingFound } = useQuery({
    queryKey: ['/api/found/my'],
    queryFn: () => getUserFoundItems(),
  });

  const { data: matches = [], isLoading: loadingMatches } = useQuery({
    queryKey: ['/api/matches/my'],
    queryFn: () => getUserMatches(),
  });

  const stats = {
    lostItems: lostItems.length,
    foundItems: foundItems.length,
    pendingMatches: matches.filter(m => m.status === 'pending').length,
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "hsl(210, 20%, 98%)" }}>
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: "hsl(215, 16%, 47%)" }}>My Lost Items</p>
                  <p className="text-3xl font-bold mt-2" style={{ color: "hsl(222, 47%, 11%)" }} data-testid="stat-lost-items">
                    {stats.lostItems}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: "hsl(0, 84%, 60%, 0.1)" }}>
                  <AlertTriangle style={{ color: "hsl(0, 84%, 60%)" }} className="text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: "hsl(215, 16%, 47%)" }}>My Found Items</p>
                  <p className="text-3xl font-bold mt-2" style={{ color: "hsl(222, 47%, 11%)" }} data-testid="stat-found-items">
                    {stats.foundItems}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: "hsl(221, 83%, 53%, 0.1)" }}>
                  <CheckCircle style={{ color: "hsl(221, 83%, 53%)" }} className="text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: "hsl(215, 16%, 47%)" }}>Pending Matches</p>
                  <p className="text-3xl font-bold mt-2" style={{ color: "hsl(222, 47%, 11%)" }} data-testid="stat-pending-matches">
                    {stats.pendingMatches}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: "hsl(243, 75%, 59%, 0.1)" }}>
                  <LinkIcon style={{ color: "hsl(243, 75%, 59%)" }} className="text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="lost" data-testid="tab-lost">My Lost Items</TabsTrigger>
            <TabsTrigger value="found" data-testid="tab-found">My Found Items</TabsTrigger>
            <TabsTrigger value="matches" data-testid="tab-matches">Matches</TabsTrigger>
          </TabsList>

          <TabsContent value="lost">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold" style={{ color: "hsl(222, 47%, 11%)" }}>My Lost Items</h2>
              <Button onClick={() => setLocation("/report/lost")} data-testid="button-report-lost">
                <Plus className="mr-2 h-4 w-4" />
                Report Lost Item
              </Button>
            </div>

            {loadingLost ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-muted rounded-lg h-48 mb-4"></div>
                    <div className="bg-muted rounded h-4 mb-2"></div>
                    <div className="bg-muted rounded h-3 w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : lostItems.length === 0 ? (
              <div className="text-center py-12">
                <AlertTriangle className="mx-auto h-12 w-12 mb-4" style={{ color: "hsl(215, 16%, 47%)" }} />
                <h3 className="text-lg font-semibold mb-2" style={{ color: "hsl(222, 47%, 11%)" }}>No Lost Items</h3>
                <p className="mb-4" style={{ color: "hsl(215, 16%, 47%)" }}>You haven't reported any lost items yet.</p>
                <Button onClick={() => setLocation("/report/lost")} data-testid="button-report-first-lost">
                  <Plus className="mr-2 h-4 w-4" />
                  Report Your First Lost Item
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lostItems.map((item) => (
                  <ItemCard key={item.id} item={item} type="lost" />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="found">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold" style={{ color: "hsl(222, 47%, 11%)" }}>My Found Items</h2>
              <Button onClick={() => setLocation("/report/found")} variant="secondary" data-testid="button-report-found">
                <Plus className="mr-2 h-4 w-4" />
                Report Found Item
              </Button>
            </div>

            {loadingFound ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-muted rounded-lg h-48 mb-4"></div>
                    <div className="bg-muted rounded h-4 mb-2"></div>
                    <div className="bg-muted rounded h-3 w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : foundItems.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="mx-auto h-12 w-12 mb-4" style={{ color: "hsl(215, 16%, 47%)" }} />
                <h3 className="text-lg font-semibold mb-2" style={{ color: "hsl(222, 47%, 11%)" }}>No Found Items</h3>
                <p className="mb-4" style={{ color: "hsl(215, 16%, 47%)" }}>You haven't reported any found items yet.</p>
                <Button onClick={() => setLocation("/report/found")} variant="secondary" data-testid="button-report-first-found">
                  <Plus className="mr-2 h-4 w-4" />
                  Report Your First Found Item
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {foundItems.map((item) => (
                  <ItemCard key={item.id} item={item} type="found" />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="matches">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold" style={{ color: "hsl(222, 47%, 11%)" }}>My Matches</h2>
            </div>

            {loadingMatches ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-muted rounded-lg h-24"></div>
                  </div>
                ))}
              </div>
            ) : matches.length === 0 ? (
              <div className="text-center py-12">
                <LinkIcon className="mx-auto h-12 w-12 mb-4" style={{ color: "hsl(215, 16%, 47%)" }} />
                <h3 className="text-lg font-semibold mb-2" style={{ color: "hsl(222, 47%, 11%)" }}>No Matches Yet</h3>
                <p style={{ color: "hsl(215, 16%, 47%)" }}>When potential matches are found, they'll appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {matches.map((match) => (
                  <Card key={match.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold" style={{ color: "hsl(222, 47%, 11%)" }}>
                          Match Found!
                        </h3>
                        <div className="flex items-center space-x-2">
                          <Badge variant={match.status === 'pending' ? 'secondary' : match.status === 'approved' ? 'default' : 'destructive'}>
                            {match.status}
                          </Badge>
                          <span className="text-sm font-bold" style={{ color: "hsl(221, 83%, 53%)" }}>
                            {match.score}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border rounded-lg p-4" style={{ borderColor: "hsl(214, 32%, 91%)" }}>
                          <p className="text-sm font-medium mb-2" style={{ color: "hsl(215, 16%, 47%)" }}>Lost Item</p>
                          <p className="font-semibold" style={{ color: "hsl(222, 47%, 11%)" }}>{match.lostItem.title}</p>
                          <p className="text-sm" style={{ color: "hsl(215, 16%, 47%)" }}>{match.lostItem.description}</p>
                        </div>
                        
                        <div className="border rounded-lg p-4" style={{ borderColor: "hsl(214, 32%, 91%)" }}>
                          <p className="text-sm font-medium mb-2" style={{ color: "hsl(215, 16%, 47%)" }}>Found Item</p>
                          <p className="font-semibold" style={{ color: "hsl(222, 47%, 11%)" }}>{match.foundItem.title}</p>
                          <p className="text-sm" style={{ color: "hsl(215, 16%, 47%)" }}>{match.foundItem.description}</p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="w-full h-2 rounded-full" style={{ backgroundColor: "hsl(210, 40%, 96%)" }}>
                          <div 
                            className="h-full rounded-full bg-gradient-to-r"
                            style={{ 
                              width: `${match.score}%`,
                              backgroundImage: "linear-gradient(to right, hsl(221, 83%, 53%), hsl(243, 75%, 59%))"
                            }}
                          />
                        </div>
                        <p className="text-xs mt-2" style={{ color: "hsl(215, 16%, 47%)" }}>
                          Match Score: {match.score}% - {match.status === 'pending' ? 'Awaiting admin review' : `Status: ${match.status}`}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
