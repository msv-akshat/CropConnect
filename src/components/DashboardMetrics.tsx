
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Progress } from "@/components/ui/progress";
import { AreaChart, BarChart } from "lucide-react";

interface DashboardMetricsProps {
  role: string;
  uid?: string;
}

interface MetricCounts {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

const DashboardMetrics = ({ role, uid }: DashboardMetricsProps) => {
  const [counts, setCounts] = useState<MetricCounts>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setIsLoading(true);
        let q;
        if (role === "farmer" && uid) {
          q = query(collection(db, "cropUpdates"), where("farmerId", "==", uid));
        } else {
          q = query(collection(db, "cropUpdates"));
        }
        
        const querySnapshot = await getDocs(q);
        
        const counts = {
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0
        };
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          counts.total++;
          if (data.status === "pending") counts.pending++;
          if (data.status === "approved") counts.approved++;
          if (data.status === "rejected") counts.rejected++;
        });
        
        setCounts(counts);
      } catch (error) {
        console.error("Error fetching metrics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCounts();
  }, [role, uid]);

  const getProgressValue = (count: number) => {
    return counts.total > 0 ? (count / counts.total) * 100 : 0;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
          <BarChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{counts.total}</div>
          {!isLoading && (
            <Progress value={100} className="h-2 mt-2" />
          )}
        </CardContent>
      </Card>
      
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Pending</CardTitle>
          <AreaChart className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{counts.pending}</div>
          {!isLoading && (
            <Progress value={getProgressValue(counts.pending)} className="h-2 mt-2 bg-gray-100">
              <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${getProgressValue(counts.pending)}%` }} />
            </Progress>
          )}
        </CardContent>
      </Card>
      
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Approved</CardTitle>
          <AreaChart className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{counts.approved}</div>
          {!isLoading && (
            <Progress value={getProgressValue(counts.approved)} className="h-2 mt-2 bg-gray-100">
              <div className="h-full bg-green-500 rounded-full" style={{ width: `${getProgressValue(counts.approved)}%` }} />
            </Progress>
          )}
        </CardContent>
      </Card>
      
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Rejected</CardTitle>
          <AreaChart className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{counts.rejected}</div>
          {!isLoading && (
            <Progress value={getProgressValue(counts.rejected)} className="h-2 mt-2 bg-gray-100">
              <div className="h-full bg-red-500 rounded-full" style={{ width: `${getProgressValue(counts.rejected)}%` }} />
            </Progress>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardMetrics;
