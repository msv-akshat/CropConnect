
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Settings, Megaphone, LifeBuoy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, getDocs, query } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardMetrics from "@/components/DashboardMetrics";
import SubmissionChart from "@/components/SubmissionChart";
import ActivityFeed from "@/components/ActivityFeed";
import CropCalendar from "@/components/CropCalendar";
import Documentation from "@/components/Documentation";
import ReportExport from "@/components/ReportExport";
import UserManagement from "@/components/admin/UserManagement";
import Announcements from "@/components/admin/Announcements";
import SupportTickets from "@/components/admin/SupportTickets";

interface SystemStats {
  totalUsers: number;
  pendingVerifications: number;
  totalApproved: number;
  totalRejected: number;
}

const AdminDashboard = ({ user }: { user: { uid: string; name: string; email: string; role: string } }) => {
  const navigate = useNavigate();
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

      // Get total users
      const usersSnapshot = await getDocs(collection(db, "users"));
      const totalUsers = usersSnapshot.size;

      setStats({
        totalUsers,
        pendingVerifications: pending,
        totalApproved: approved,
        totalRejected: rejected,
      });
    } catch (error) {
      console.error("Error fetching system stats:", error);
      toast.error("Failed to fetch system statistics");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out");
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8E7]">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-6"
          >
            <ArrowLeft className="mr-2" />
            Back to Home
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
        
        <h1 className="text-3xl font-bold mb-6">Welcome, {user.name}</h1>
        
        {/* Dashboard Metrics */}
        <div className="mb-8">
          <DashboardMetrics role="admin" />
        </div>
        
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid grid-cols-6 max-w-3xl mx-auto mb-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Settings size={16} />
              System Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users size={16} />
              Users
            </TabsTrigger>
            <TabsTrigger value="announcements" className="flex items-center gap-2">
              <Megaphone size={16} />
              Announcements
            </TabsTrigger>
            <TabsTrigger value="support" className="flex items-center gap-2">
              <LifeBuoy size={16} />
              Support
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Settings size={16} />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <Settings size={16} />
              Reports
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid gap-8">
              <SubmissionChart role="admin" />
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div className="md:col-span-3">
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
                
                <div className="md:col-span-2">
                  <ActivityFeed />
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
          
          <TabsContent value="announcements">
            <Announcements />
          </TabsContent>
          
          <TabsContent value="support">
            <SupportTickets />
          </TabsContent>
          
          <TabsContent value="calendar">
            <CropCalendar role="admin" />
          </TabsContent>
          
          <TabsContent value="reports">
            <ReportExport role="admin" userName={user.name} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
