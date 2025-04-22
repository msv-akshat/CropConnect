
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { collection, query, orderBy, limit, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Check, Clock, X } from "lucide-react";

interface ActivityItem {
  id: string;
  type: string;
  stage: string;
  status: string;
  farmerName: string;
  farmerId: string;
  timestamp: Date;
}

const ActivityFeed = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setIsLoading(true);
        const q = query(collection(db, "cropUpdates"), orderBy("timestamp", "desc"), limit(10));
        const querySnapshot = await getDocs(q);
        
        const activityPromises = querySnapshot.docs.map(async (doc) => {
          const data = doc.data();
          
          // Fetch farmer name
          let farmerName = "Unknown Farmer";
          try {
            const userDoc = await db.collection("users").doc(data.farmerId).get();
            if (userDoc.exists) {
              farmerName = userDoc.data()?.name || "Unknown Farmer";
            }
          } catch (error) {
            console.error("Error fetching farmer name:", error);
          }
          
          return {
            id: doc.id,
            type: data.type,
            stage: data.stage,
            status: data.status,
            farmerName,
            farmerId: data.farmerId,
            timestamp: data.timestamp instanceof Timestamp 
              ? data.timestamp.toDate() 
              : new Date(data.timestamp)
          };
        });
        
        const activityItems = await Promise.all(activityPromises);
        setActivities(activityItems);
      } catch (error) {
        console.error("Error fetching activity feed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      return 'just now';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <Check className="h-5 w-5 text-green-500" />;
      case "rejected":
        return <X className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "approved":
        return "was approved";
      case "rejected":
        return "was rejected";
      default:
        return "is pending review";
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">Loading activities...</div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8">No recent activities found.</div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 pb-4 border-b last:border-b-0">
                <div className="mt-1">{getStatusIcon(activity.status)}</div>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-medium">{activity.farmerName}'s</span> {activity.type} crop ({activity.stage} stage) {getStatusText(activity.status)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatTimestamp(activity.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;
