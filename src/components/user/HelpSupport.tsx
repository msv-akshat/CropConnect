
import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { LifeBuoy } from "lucide-react";

interface HelpSupportProps {
  user: {
    uid: string;
    name: string;
    email: string;
    role: string;
  };
}

const supportTicketSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters" }),
  description: z.string().min(20, { message: "Description must be at least 20 characters" }),
});

const HelpSupport = ({ user }: HelpSupportProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof supportTicketSchema>>({
    resolver: zodResolver(supportTicketSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof supportTicketSchema>) => {
    setIsSubmitting(true);
    
    try {
      await addDoc(collection(db, "supportTickets"), {
        ...data,
        status: "open",
        userId: user.uid,
        userName: user.name,
        userEmail: user.email,
        userRole: user.role,
        createdAt: serverTimestamp(),
      });
      
      toast.success("Support ticket submitted successfully");
      form.reset();
    } catch (error) {
      console.error("Error submitting support ticket:", error);
      toast.error("Failed to submit support ticket");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="bg-muted pb-6">
        <CardTitle className="text-xl flex items-center gap-2">
          <LifeBuoy className="h-5 w-5" />
          Help & Support
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="mb-6">
          <p className="text-muted-foreground">
            Having issues or questions? Submit a support ticket and our team will get back to you as soon as possible.
          </p>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Brief description of your issue" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Please provide as much detail as possible" 
                      className="min-h-[200px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Support Ticket"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default HelpSupport;
