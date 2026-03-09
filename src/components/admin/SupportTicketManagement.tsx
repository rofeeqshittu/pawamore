import { useState, useEffect } from "react";
import { Loader2, Search, Filter, Eye, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface SupportTicket {
  id: string;
  user_id: string | null;
  guest_email: string | null;
  subject: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
}

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

const priorityColors: Record<string, string> = {
  low: "bg-blue-100 text-blue-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800",
};

const statusIcons: Record<string, React.ElementType> = {
  open: Clock,
  in_progress: AlertCircle,
  resolved: CheckCircle,
  closed: CheckCircle,
};

const SupportTicketManagement = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchTickets = async () => {
    let query = supabase
      .from("support_tickets")
      .select("*")
      .order("created_at", { ascending: false });

    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }

    const { data, error } = await query;

    if (!error && data) {
      setTickets(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter]);

  const updateTicketStatus = async (ticketId: string, newStatus: string) => {
    setUpdating(true);
    try {
      const updates: Record<string, unknown> = { status: newStatus };
      if (newStatus === "resolved" || newStatus === "closed") {
        updates.closed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("support_tickets")
        .update(updates)
        .eq("id", ticketId);

      if (error) throw error;

      toast.success(`Ticket status updated to ${newStatus}`);
      fetchTickets();
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status: newStatus });
      }
    } catch (error) {
      console.error("Error updating ticket:", error);
      toast.error("Failed to update ticket status");
    } finally {
      setUpdating(false);
    }
  };

  const filteredTickets = tickets.filter((ticket) =>
    ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.guest_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const ticketStats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === "open").length,
    inProgress: tickets.filter((t) => t.status === "in_progress").length,
    resolved: tickets.filter((t) => t.status === "resolved" || t.status === "closed").length,
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Tickets</p>
          <p className="text-2xl font-bold">{ticketStats.total}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-600">Open</p>
          <p className="text-2xl font-bold text-blue-700">{ticketStats.open}</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-600">In Progress</p>
          <p className="text-2xl font-bold text-yellow-700">{ticketStats.inProgress}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-600">Resolved</p>
          <p className="text-2xl font-bold text-green-700">{ticketStats.resolved}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tickets Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium">Subject</th>
                <th className="text-left px-4 py-3 text-sm font-medium hidden sm:table-cell">Category</th>
                <th className="text-left px-4 py-3 text-sm font-medium">Priority</th>
                <th className="text-left px-4 py-3 text-sm font-medium">Status</th>
                <th className="text-left px-4 py-3 text-sm font-medium hidden md:table-cell">Created</th>
                <th className="text-right px-4 py-3 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-muted-foreground">
                    No tickets found
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => {
                  const StatusIcon = statusIcons[ticket.status] || Clock;
                  return (
                    <tr key={ticket.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="max-w-[200px]">
                          <p className="font-medium truncate">{ticket.subject}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {ticket.user_id ? "Registered User" : ticket.guest_email}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <Badge variant="outline">{ticket.category}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${priorityColors[ticket.priority] || "bg-gray-100"}`}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <StatusIcon className="w-4 h-4" />
                          <span className="text-sm capitalize">{ticket.status.replace("_", " ")}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">
                        {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedTicket(ticket)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Detail Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedTicket?.subject}</DialogTitle>
            <DialogDescription>
              {selectedTicket?.user_id ? "Registered User" : selectedTicket?.guest_email} •{" "}
              {selectedTicket && formatDistanceToNow(new Date(selectedTicket.created_at), { addSuffix: true })}
            </DialogDescription>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{selectedTicket.category}</Badge>
                <span className={`px-2 py-1 rounded text-xs font-medium ${priorityColors[selectedTicket.priority]}`}>
                  {selectedTicket.priority}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Description</h4>
                <Textarea
                  value={selectedTicket.description}
                  readOnly
                  className="min-h-[120px]"
                />
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Update Status</h4>
                <div className="flex flex-wrap gap-2">
                  {["open", "in_progress", "resolved", "closed"].map((status) => (
                    <Button
                      key={status}
                      variant={selectedTicket.status === status ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateTicketStatus(selectedTicket.id, status)}
                      disabled={updating || selectedTicket.status === status}
                    >
                      {updating && selectedTicket.status !== status ? (
                        <Loader2 className="w-3 h-3 animate-spin mr-1" />
                      ) : null}
                      {status.replace("_", " ")}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupportTicketManagement;
