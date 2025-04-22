
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { collection, getDocs, query, where, Timestamp, DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  BarChart, 
  Bar 
} from "recharts";

interface SubmissionChartProps {
  role: string;
  uid?: string;
}

interface ChartData {
  name: string;
  pending: number;
  approved: number;
  rejected: number;
}

interface SubmissionData {
  status: string;
  timestamp: Date;
  [key: string]: any;
}

const SubmissionChart = ({ role, uid }: SubmissionChartProps) => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [chartType, setChartType] = useState<"line" | "bar">("line");
  const [timeRange, setTimeRange] = useState<"monthly" | "seasonal">("monthly");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setIsLoading(true);
        let q;
        if (role === "farmer" && uid) {
          q = query(collection(db, "cropUpdates"), where("farmerId", "==", uid));
        } else {
          q = query(collection(db, "cropUpdates"));
        }

        const querySnapshot = await getDocs(q);
        const submissions: SubmissionData[] = [];
        
        querySnapshot.forEach(doc => {
          const data = doc.data() as DocumentData;
          submissions.push({
            ...data,
            timestamp: data.timestamp instanceof Timestamp 
              ? data.timestamp.toDate() 
              : new Date(data.timestamp)
          });
        });
        
        let processedData: ChartData[];
        
        if (timeRange === "monthly") {
          // Group by month
          const monthlyData: Record<string, ChartData> = {};
          const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          
          submissions.forEach(submission => {
            const date = new Date(submission.timestamp);
            const month = months[date.getMonth()];
            
            if (!monthlyData[month]) {
              monthlyData[month] = { name: month, pending: 0, approved: 0, rejected: 0 };
            }
            
            if (submission.status === "pending") monthlyData[month].pending++;
            else if (submission.status === "approved") monthlyData[month].approved++;
            else if (submission.status === "rejected") monthlyData[month].rejected++;
          });
          
          // Convert to array and sort by month order
          processedData = Object.values(monthlyData).sort((a, b) => 
            months.indexOf(a.name) - months.indexOf(b.name)
          );
        } else {
          // Group by season
          const seasonalData: Record<string, ChartData> = {
            Spring: { name: "Spring", pending: 0, approved: 0, rejected: 0 },
            Summer: { name: "Summer", pending: 0, approved: 0, rejected: 0 },
            Fall: { name: "Fall", pending: 0, approved: 0, rejected: 0 },
            Winter: { name: "Winter", pending: 0, approved: 0, rejected: 0 }
          };
          
          submissions.forEach(submission => {
            const date = new Date(submission.timestamp);
            const month = date.getMonth();
            let season;
            
            if (month >= 2 && month <= 4) season = "Spring";
            else if (month >= 5 && month <= 7) season = "Summer";
            else if (month >= 8 && month <= 10) season = "Fall";
            else season = "Winter";
            
            if (submission.status === "pending") seasonalData[season].pending++;
            else if (submission.status === "approved") seasonalData[season].approved++;
            else if (submission.status === "rejected") seasonalData[season].rejected++;
          });
          
          // Convert to array and sort by season order
          const seasonOrder = ["Spring", "Summer", "Fall", "Winter"];
          processedData = Object.values(seasonalData).sort((a, b) => 
            seasonOrder.indexOf(a.name) - seasonOrder.indexOf(b.name)
          );
        }
        
        setChartData(processedData);
      } catch (error) {
        console.error("Error fetching chart data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChartData();
  }, [role, uid, timeRange]);

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Submissions Chart</CardTitle>
        <div className="flex items-center space-x-2">
          <select 
            className="px-2 py-1 text-sm border rounded"
            value={chartType}
            onChange={(e) => setChartType(e.target.value as "line" | "bar")}
          >
            <option value="line">Line</option>
            <option value="bar">Bar</option>
          </select>
          <select 
            className="px-2 py-1 text-sm border rounded"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as "monthly" | "seasonal")}
          >
            <option value="monthly">Monthly</option>
            <option value="seasonal">Seasonal</option>
          </select>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-80 flex items-center justify-center">Loading chart data...</div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            {chartType === "line" ? (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="approved" 
                  stroke="#22c55e" 
                  activeDot={{ r: 8 }} 
                  name="Approved" 
                />
                <Line 
                  type="monotone" 
                  dataKey="pending" 
                  stroke="#eab308" 
                  name="Pending" 
                />
                <Line 
                  type="monotone" 
                  dataKey="rejected" 
                  stroke="#ef4444" 
                  name="Rejected" 
                />
              </LineChart>
            ) : (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="approved" fill="#22c55e" name="Approved" />
                <Bar dataKey="pending" fill="#eab308" name="Pending" />
                <Bar dataKey="rejected" fill="#ef4444" name="Rejected" />
              </BarChart>
            )}
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default SubmissionChart;
