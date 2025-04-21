
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

interface SystemStats {
  totalUsers: number;
  pendingVerifications: number;
  totalApproved: number;
  totalRejected: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const adminName = "Michael Chen";
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    pendingVerifications: 0,
    totalApproved: 0,
    totalRejected: 0,
  });

  useEffect(() => {
    fetchSystemStats();
  }, []);

  const fetchSystemStats = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "cropUpdates"));
      let pending = 0;
      let approved = 0;
      let rejected = 0;

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.status === "pending") pending++;
        if (data.status === "approved") approved++;
        if (data.status === "rejected") rejected++;
      });

      setStats({
        totalUsers: 10, // This would normally come from a users collection
        pendingVerifications: pending,
        totalApproved: approved,
        totalRejected: rejected,
      });
    } catch (error) {
      console.error("Error fetching system stats:", error);
      toast.error("Failed to fetch system statistics");
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8E7]">
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2" />
          Back to Role Selection
        </Button>
        
        <h1 className="text-3xl font-bold mb-6">Welcome, {adminName}</h1>
        
        <div className="grid gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">System Overview</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded">
                <p className="text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded">
                <p className="text-gray-600">Pending Verifications</p>
                <p className="text-2xl font-bold">{stats.pendingVerifications}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded">
                <p className="text-gray-600">Total Approved</p>
                <p className="text-2xl font-bold">{stats.totalApproved}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded">
                <p className="text-gray-600">Total Rejected</p>
                <p className="text-2xl font-bold">{stats.totalRejected}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
