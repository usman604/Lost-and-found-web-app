import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Navbar from "@/components/layout/navbar";
import MatchModal from "@/components/admin/match-modal";
import { getAdminStats, getPendingMatches, getPendingUsers, verifyUser, verifyMatch } from "@/api/admin";
import { useToast } from "@/hooks/use-toast";
import { Shield, AlertTriangle, CheckCircle, Link as LinkIcon, TrendingUp, Eye, Check, X } from "lucide-react";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("pending-matches");
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: stats = {}, isLoading: loadingStats } = useQuery({
    queryKey: ['/api/admin/stats'],
    queryFn: getAdminStats,
  });

  const { data: pendingMatches = [], isLoading: loadingMatches } = useQuery({
    queryKey: ['/api/matches/pending'],
    queryFn: getPendingMatches,
  });

  const { data: pendingUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ['/api/admin/users/pending'],
    queryFn: getPendingUsers,
  });

  const verifyUserMutation = useMutation({
    mutationFn: verifyUser,
    onSuccess: () => {
      toast({
        title: "User Verified",
        description: "User has been successfully verified",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users/pending'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to verify user",
        variant: "destructive",
      });
    },
  });

  const verifyMatchMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => verifyMatch(id, status),
    onSuccess: (_, { status }) => {
      toast({
        title: status === "approved" ? "Match Approved" : "Match Rejected",
        description: `Match has been ${status}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/matches/pending'] });
      setSelectedMatch(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process match",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: "hsl(210, 20%, 98%)" }}>
      <Navbar showAdmin />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium" style={{ color: "hsl(215, 16%, 47%)" }}>Total Lost Items</p>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "hsl(0, 84%, 60%, 0.1)" }}>
                  <AlertTriangle style={{ color: "hsl(0, 84%, 60%)" }} />
                </div>
              </div>
              <p className="text-3xl font-bold" style={{ color: "hsl(222, 47%, 11%)" }} data-testid="stat-total-lost">
                {loadingStats ? "..." : stats.totalLost || 0}
              </p>
              <p className="text-xs mt-1" style={{ color: "hsl(215, 16%, 47%)" }}>
                <span style={{ color: "hsl(0, 84%, 60%)" }}>+5</span> this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium" style={{ color: "hsl(215, 16%, 47%)" }}>Total Found Items</p>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "hsl(221, 83%, 53%, 0.1)" }}>
                  <CheckCircle style={{ color: "hsl(221, 83%, 53%)" }} />
                </div>
              </div>
              <p className="text-3xl font-bold" style={{ color: "hsl(222, 47%, 11%)" }} data-testid="stat-total-found">
                {loadingStats ? "..." : stats.totalFound || 0}
              </p>
              <p className="text-xs mt-1" style={{ color: "hsl(215, 16%, 47%)" }}>
                <span style={{ color: "hsl(221, 83%, 53%)" }}>+3</span> this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium" style={{ color: "hsl(215, 16%, 47%)" }}>Pending Matches</p>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "hsl(243, 75%, 59%, 0.1)" }}>
                  <LinkIcon style={{ color: "hsl(243, 75%, 59%)" }} />
                </div>
              </div>
              <p className="text-3xl font-bold" style={{ color: "hsl(222, 47%, 11%)" }} data-testid="stat-pending-matches">
                {loadingStats ? "..." : stats.pendingMatches || 0}
              </p>
              <p className="text-xs mt-1" style={{ color: "hsl(215, 16%, 47%)" }}>
                Awaiting review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium" style={{ color: "hsl(215, 16%, 47%)" }}>Success Rate</p>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "hsl(221, 83%, 53%, 0.1)" }}>
                  <TrendingUp style={{ color: "hsl(221, 83%, 53%)" }} />
                </div>
              </div>
              <p className="text-3xl font-bold" style={{ color: "hsl(222, 47%, 11%)" }} data-testid="stat-success-rate">
                {loadingStats ? "..." : `${stats.successRate || 0}%`}
              </p>
              <p className="text-xs mt-1" style={{ color: "hsl(215, 16%, 47%)" }}>
                Items returned
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="pending-matches" data-testid="tab-pending-matches">Pending Matches</TabsTrigger>
            <TabsTrigger value="user-verification" data-testid="tab-user-verification">User Verification</TabsTrigger>
            <TabsTrigger value="all-items" data-testid="tab-all-items">All Items</TabsTrigger>
          </TabsList>

          <TabsContent value="pending-matches">
            <Card>
              <CardContent className="p-0">
                <div className="p-6 border-b" style={{ borderColor: "hsl(214, 32%, 91%)" }}>
                  <h2 className="text-xl font-semibold" style={{ color: "hsl(222, 47%, 11%)" }}>Pending Match Requests</h2>
                  <p className="text-sm mt-1" style={{ color: "hsl(215, 16%, 47%)" }}>
                    Review and verify potential matches between lost and found items
                  </p>
                </div>

                {loadingMatches ? (
                  <div className="p-6">
                    <div className="animate-pulse space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-muted rounded h-16"></div>
                      ))}
                    </div>
                  </div>
                ) : pendingMatches.length === 0 ? (
                  <div className="p-6 text-center">
                    <LinkIcon className="mx-auto h-12 w-12 mb-4" style={{ color: "hsl(215, 16%, 47%)" }} />
                    <h3 className="text-lg font-semibold mb-2" style={{ color: "hsl(222, 47%, 11%)" }}>No Pending Matches</h3>
                    <p style={{ color: "hsl(215, 16%, 47%)" }}>There are no match requests awaiting review.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Match ID</TableHead>
                          <TableHead>Lost Item</TableHead>
                          <TableHead>Found Item</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingMatches.map((match) => (
                          <TableRow key={match.id} className="hover:bg-accent">
                            <TableCell>
                              <span className="text-sm font-mono" style={{ color: "hsl(215, 16%, 47%)" }}>
                                #{match.id.slice(0, 8)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-muted rounded mr-3 flex-shrink-0"></div>
                                <div>
                                  <p className="text-sm font-medium" style={{ color: "hsl(222, 47%, 11%)" }}>
                                    {match.lostItem.title}
                                  </p>
                                  <p className="text-xs" style={{ color: "hsl(215, 16%, 47%)" }}>
                                    {match.lostItem.user.name}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-muted rounded mr-3 flex-shrink-0"></div>
                                <div>
                                  <p className="text-sm font-medium" style={{ color: "hsl(222, 47%, 11%)" }}>
                                    {match.foundItem.title}
                                  </p>
                                  <p className="text-xs" style={{ color: "hsl(215, 16%, 47%)" }}>
                                    {match.foundItem.user.name}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="flex items-center mb-1">
                                  <span className="text-sm font-bold" style={{ color: "hsl(221, 83%, 53%)" }}>
                                    {match.score}%
                                  </span>
                                </div>
                                <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-gradient-to-r"
                                    style={{ 
                                      width: `${match.score}%`,
                                      backgroundImage: "linear-gradient(to right, hsl(221, 83%, 53%), hsl(243, 75%, 59%))"
                                    }}
                                  />
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm" style={{ color: "hsl(215, 16%, 47%)" }}>
                                {new Date(match.created_at).toLocaleDateString()}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedMatch(match)}
                                data-testid={`button-view-match-${match.id}`}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="user-verification">
            <Card>
              <CardContent className="p-0">
                <div className="p-6 border-b" style={{ borderColor: "hsl(214, 32%, 91%)" }}>
                  <h2 className="text-xl font-semibold" style={{ color: "hsl(222, 47%, 11%)" }}>Pending User Verifications</h2>
                  <p className="text-sm mt-1" style={{ color: "hsl(215, 16%, 47%)" }}>
                    Review and approve user registrations
                  </p>
                </div>

                {loadingUsers ? (
                  <div className="p-6">
                    <div className="animate-pulse space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-muted rounded h-16"></div>
                      ))}
                    </div>
                  </div>
                ) : pendingUsers.length === 0 ? (
                  <div className="p-6 text-center">
                    <Shield className="mx-auto h-12 w-12 mb-4" style={{ color: "hsl(215, 16%, 47%)" }} />
                    <h3 className="text-lg font-semibold mb-2" style={{ color: "hsl(222, 47%, 11%)" }}>No Pending Verifications</h3>
                    <p style={{ color: "hsl(215, 16%, 47%)" }}>All users are verified.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>University ID</TableHead>
                          <TableHead>Registration Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingUsers.map((user) => (
                          <TableRow key={user.id} className="hover:bg-accent">
                            <TableCell>
                              <div className="flex items-center">
                                <div 
                                  className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                                  style={{ backgroundColor: "hsl(243, 75%, 59%)" }}
                                >
                                  <span className="font-medium text-sm text-white">
                                    {user.name.split(' ').map(n => n[0]).join('')}
                                  </span>
                                </div>
                                <span className="text-sm font-medium" style={{ color: "hsl(222, 47%, 11%)" }}>
                                  {user.name}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm" style={{ color: "hsl(215, 16%, 47%)" }}>
                                {user.email}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm" style={{ color: "hsl(222, 47%, 11%)" }}>
                                {user.university_id}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm" style={{ color: "hsl(215, 16%, 47%)" }}>
                                {new Date(user.created_at).toLocaleDateString()}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button
                                  size="sm"
                                  onClick={() => verifyUserMutation.mutate(user.id)}
                                  disabled={verifyUserMutation.isPending}
                                  data-testid={`button-approve-user-${user.id}`}
                                  style={{ backgroundColor: "hsl(221, 83%, 53%)" }}
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  data-testid={`button-reject-user-${user.id}`}
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all-items">
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <h3 className="text-lg font-semibold mb-2" style={{ color: "hsl(222, 47%, 11%)" }}>All Items View</h3>
                  <p style={{ color: "hsl(215, 16%, 47%)" }}>
                    This section will show all lost and found items with admin controls.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Match Details Modal */}
      {selectedMatch && (
        <MatchModal
          match={selectedMatch}
          onClose={() => setSelectedMatch(null)}
          onApprove={() => verifyMatchMutation.mutate({ id: selectedMatch.id, status: "approved" })}
          onReject={() => verifyMatchMutation.mutate({ id: selectedMatch.id, status: "rejected" })}
          isLoading={verifyMatchMutation.isPending}
        />
      )}
    </div>
  );
}
