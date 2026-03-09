import { useState, useEffect } from "react";
import { Loader2, Ticket, Clock, CheckCircle, AlertCircle, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";

interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  open: { label: "Open", color: "bg-blue-500", icon: Clock },
  in_progress: { label: "In Progress", color: "bg-yellow-500", icon: AlertCircle },
  resolved: { label: "Resolved", color: "bg-green-500", icon: CheckCircle },
  closed: { label: "Closed", color: "bg-muted", icon: CheckCircle },
};

const priorityConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  low: { label: "Low", variant: "secondary" },
  medium: { label: "Medium", variant: "default" },
  high: { label: "High", variant: "destructive" },
};

const UserTickets = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchTickets = async () => {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setTickets(data);
      }
      setLoading(false);
    };

    fetchTickets();
  }, [user]);

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Please log in to view your support tickets.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="w-5 h-5" />
            Your Support Tickets
          </CardTitle>
          <CardDescription>
            Track the status of your support requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tickets.length === 0 ? (
            <div className="text-center py-8">
              <Ticket className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">You haven't submitted any support tickets yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => {
                const status = statusConfig[ticket.status] || statusConfig.open;
                const priority = priorityConfig[ticket.priority] || priorityConfig.medium;
                const StatusIcon = status.icon;

                return (
                  <div
                    key={ticket.id}
                    className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{ticket.subject}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                          {ticket.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {ticket.category}
                          </Badge>
                          <Badge variant={priority.variant} className="text-xs">
                            {priority.label}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <StatusIcon className={`w-3 h-3 ${status.color.replace("bg-", "text-")}`} />
                            {status.label}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedTicket(ticket)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ticket Detail Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedTicket?.subject}</DialogTitle>
            <DialogDescription>
              Submitted {selectedTicket && formatDistanceToNow(new Date(selectedTicket.created_at), { addSuffix: true })}
            </DialogDescription>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Badge variant="outline">{selectedTicket.category}</Badge>
                <Badge variant={priorityConfig[selectedTicket.priority]?.variant || "default"}>
                  {priorityConfig[selectedTicket.priority]?.label || selectedTicket.priority}
                </Badge>
                <Badge className={`${statusConfig[selectedTicket.status]?.color || "bg-muted"} text-white`}>
                  {statusConfig[selectedTicket.status]?.label || selectedTicket.status}
                </Badge>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Description</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {selectedTicket.description}
                </p>
              </div>
              {selectedTicket.closed_at && (
                <div className="text-sm text-muted-foreground">
                  Closed: {new Date(selectedTicket.closed_at).toLocaleDateString()}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserTickets;
