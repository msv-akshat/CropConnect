
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HelpSupport from "@/components/user/HelpSupport";
import AnnouncementsView from "@/components/user/AnnouncementsView";

interface EmployeeDashboardProps {
  user: {
    uid: string;
    name: string;
    email: string;
    role: string;
  };
}

interface Farmer {
  id: string;
  name: string;
  email: string;
  region?: string;
}

const EmployeeDashboard = ({ user }: EmployeeDashboardProps) => {
  const navigate = useNavigate();
  const [assignedFarmers, setAssignedFarmers] = useState<Farmer[]>([]);

  useEffect(() => {
    const fetchAssignedFarmers = async () => {
      try {
        const q = query(
          collection(db, "users"),
          where("role", "==", "farmer"),
          where("assignedTo", "==", user.uid)
        );
        
        const querySnapshot = await getDocs(q);
        const farmers: Farmer[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          farmers.push({
            id: doc.id,
            name: data.name || "",
            email: data.email || "",
            region: data.region,
          });
        });
        
        setAssignedFarmers(farmers);
      } catch (error) {
        console.error("Error fetching assigned farmers:", error);
        toast.error("Failed to load assigned farmers");
      }
    };
    
    fetchAssignedFarmers();
  }, [user.uid]);

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
        
        <div className="mb-8">
          <AnnouncementsView userRole={user.role} />
        </div>
        
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="farmers">My Farmers</TabsTrigger>
            <TabsTrigger value="verifications">Verifications</TabsTrigger>
            <TabsTrigger value="support">Help & Support</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Employee Dashboard Content</h2>
                <p>This is the employee dashboard content.</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Statistics</h2>
                <p>You have {assignedFarmers.length} assigned farmers.</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="farmers">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">My Assigned Farmers</h2>
              {assignedFarmers.length > 0 ? (
                <ul className="space-y-2">
                  {assignedFarmers.map(farmer => (
                    <li key={farmer.id} className="p-3 bg-gray-50 rounded">
                      <div className="font-medium">{farmer.name}</div>
                      <div className="text-sm text-gray-600">{farmer.email}</div>
                      {farmer.region && <div className="text-xs text-gray-500">Region: {farmer.region}</div>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>You have no farmers assigned to you yet.</p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="verifications">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Pending Verifications</h2>
              <p>Crop update verifications will appear here.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="support">
            <HelpSupport user={user} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
