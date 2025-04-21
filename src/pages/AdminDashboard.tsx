
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const adminName = "Michael Chen";

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
            <p className="text-gray-600">10 Active Users | 5 Pending Verifications</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <p className="text-gray-600">Last Action: Updated system settings</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
