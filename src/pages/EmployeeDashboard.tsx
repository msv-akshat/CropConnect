
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const employeeName = "Sarah Johnson";

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
        
        <h1 className="text-3xl font-bold mb-6">Welcome, {employeeName}</h1>
        
        <div className="grid gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Pending Verifications</h2>
            <p className="text-gray-600">2 crop updates need your review</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <p className="text-gray-600">Last Verification: Approved wheat harvest report</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
