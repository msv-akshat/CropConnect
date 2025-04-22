
import { useState, useEffect } from "react";
import { collection, addDoc, getDocs, query, orderBy, where, serverTimestamp, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { MessageSquare } from "lucide-react";

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  status: "open" | "in-progress" | "resolved";
  userId: string;
  userName: string;
  userRole: string;
  createdAt: Date;
  adminResponse?: string;
  updatedAt?: Date;
}

const responseSchema = z.object({
  adminResponse: z.string().min(5, { message: "Response must be at least 5 characters" }),
});

const SupportTickets = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<SupportTicket[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof responseSchema>>({
    resolver: zodResolver(responseSchema),
    defaultValues: {
      adminResponse: "",
    },
  });

  // Fetch support tickets
  const fetchTickets = async () => {
    try {
      const q = query(collection(db, "supportTickets"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      
      const ticketsData: SupportTicket[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        ticketsData.push({
          id: doc.id,
          title: data.title,
          description: data.description,
          status: data.status,
          userId: data.userId,
          userName: data.userName,
          userRole: data.userRole,
          createdAt: data.createdAt?.toDate() || new Date(),
          adminResponse: data.adminResponse,
          updatedAt: data.updatedAt?.toDate(),
        });
      });
      
      setTickets(ticketsData);
      setFilteredTickets(ticketsData);
    } catch (error) {
      console.error("Error fetching support tickets:", error);
      toast.error("Failed to load support tickets");
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Filter tickets by status
  useEffect(() => {
    if (statusFilter === "all") {
      setFilteredTickets(tickets);
    } else {
      setFilteredTickets(tickets.filter(ticket => ticket.status === statusFilter));
    }
  }, [statusFilter, tickets]);

  // Open response dialog
  const openResponseDialog = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    form.reset({ adminResponse: ticket.adminResponse || "" });
    setIsDialogOpen(true);
  };

  // Update ticket with response
  const handleSubmitResponse = async (data: z.infer<typeof responseSchema>) => {
    if (!selectedTicket) return;
    
    try {
      const ticketRef = doc(db, "supportTickets", selectedTicket.id);
      await updateDoc(ticketRef, {
        adminResponse: data.adminResponse,
        status: "resolved",
        updatedAt: serverTimestamp(),
      });
      
      toast.success("Response submitted successfully");
      setIsDialogOpen(false);
      fetchTickets();
    } catch (error) {
      console.error("Error submitting response:", error);
      toast.error("Failed to submit response");
    }
  };

  // Change ticket status
  const changeTicketStatus = async (ticketId: string, newStatus: "open" | "in-progress" | "resolved") => {
    try {
      const ticketRef = doc(db, "supportTickets", ticketId);
      await updateDoc(ticketRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
      
      toast.success("Ticket status updated");
      fetchTickets();
    } catch (error) {
      console.error("Error updating ticket status:", error);
      toast.error("Failed to update ticket status");
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Support Tickets</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="all" onValueChange={setStatusFilter} className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="all">All Tickets</TabsTrigger>
            <TabsTrigger value="open">Open</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
          </TabsList>
          
          <TabsContent value={statusFilter} className="mt-0">
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.length > 0 ? (
                    filteredTickets.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell className="font-medium">{ticket.title}</TableCell>
                        <TableCell>{ticket.userName}</TableCell>
                        <TableCell>
                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                            ticket.userRole === 'admin' ? 'bg-purple-100 text-purple-800' :
                            ticket.userRole === 'employee' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {ticket.userRole.charAt(0).toUpperCase() + ticket.userRole.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                            ticket.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                            ticket.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {ticket.status === "open" ? "Open" : 
                             ticket.status === "in-progress" ? "In Progress" : 
                             "Resolved"}
                          </span>
                        </TableCell>
                        <TableCell>{ticket.createdAt.toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => openResponseDialog(ticket)}
                            >
                              <MessageSquare className="mr-2 h-4 w-4" />
                              {ticket.adminResponse ? "View/Edit Response" : "Respond"}
                            </Button>
                            {ticket.status !== "in-progress" && ticket.status !== "resolved" && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => changeTicketStatus(ticket.id, "in-progress")}
                              >
                                Mark In Progress
                              </Button>
                            )}
                            {ticket.status !== "resolved" && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => changeTicketStatus(ticket.id, "resolved")}
                              >
                                Mark Resolved
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        No tickets found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Response Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Respond to Ticket</DialogTitle>
          </DialogHeader>
          
          {selectedTicket && (
            <div className="space-y-4">
              <div className="space-y-2 rounded-md bg-muted p-4">
                <h3 className="font-semibold">{selectedTicket.title}</h3>
                <p className="text-sm text-muted-foreground">
                  From: {selectedTicket.userName} ({selectedTicket.userRole})
                </p>
                <p className="mt-2 whitespace-pre-wrap">{selectedTicket.description}</p>
              </div>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmitResponse)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="adminResponse"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Response</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Type your response here..." 
                            className="min-h-[150px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button type="submit">
                      Submit Response
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default SupportTickets;
