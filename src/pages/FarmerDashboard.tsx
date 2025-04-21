
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FarmerDashboard = () => {
  const navigate = useNavigate();
  const farmerName = "John Smith";

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
        
        <h1 className="text-3xl font-bold mb-6">Welcome, {farmerName}</h1>
        
        <div className="grid gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Your Active Crops</h2>
            <p className="text-gray-600">Example Crop: Wheat (Growth Stage: Mature)</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Recent Updates</h2>
            <p className="text-gray-600">Last Update: Irrigation completed on 04/20/2025</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;
