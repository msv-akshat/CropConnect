
import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Megaphone } from "lucide-react";
import { format } from "date-fns";

interface AnnouncementsViewProps {
  userRole: string;
}

interface Announcement {
  id: string;
  title: string;
  message: string;
  audience: string;
  createdAt: Date;
}

const AnnouncementsView = ({ userRole }: AnnouncementsViewProps) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        // Query announcements that are for all users OR for this specific user role
        const q = query(
          collection(db, "announcements"),
          where("audience", "in", ["all", userRole === "farmer" ? "farmers" : "employees"]),
          orderBy("createdAt", "desc")
        );
        
        const querySnapshot = await getDocs(q);
        const announcementsData: Announcement[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          announcementsData.push({
            id: doc.id,
            title: data.title,
            message: data.message,
            audience: data.audience,
            createdAt: data.createdAt?.toDate() || new Date(),
          });
        });
        
        setAnnouncements(announcementsData);
      } catch (error) {
        console.error("Error fetching announcements:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, [userRole]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            Announcements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-8 text-muted-foreground">Loading announcements...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="h-5 w-5" />
          Announcements
        </CardTitle>
        <CardDescription>
          Important updates from the administration
        </CardDescription>
      </CardHeader>
      <CardContent>
        {announcements.length > 0 ? (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <Card key={announcement.id} className="bg-muted/50">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{announcement.title}</CardTitle>
                      <span className="text-xs text-muted-foreground">
                        {format(announcement.createdAt, "MMM dd, yyyy")}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{announcement.message}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <p className="text-center py-8 text-muted-foreground">No announcements available</p>
        )}
      </CardContent>
    </Card>
  );
};

export default AnnouncementsView;
