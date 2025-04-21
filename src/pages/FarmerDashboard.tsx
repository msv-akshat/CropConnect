
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

interface CropUpdate {
  id: string;
  type: string;
  stage: string;
  status: "pending" | "approved" | "rejected";
  timestamp: Date;
}

const FarmerDashboard = () => {
  const navigate = useNavigate();
  const farmerName = "John Smith";
  const [cropUpdates, setCropUpdates] = useState<CropUpdate[]>([]);

  useEffect(() => {
    fetchCropUpdates();
  }, []);

  const fetchCropUpdates = async () => {
    try {
      const q = query(collection(db, "cropUpdates"), where("farmerId", "==", "farmer1"));
      const querySnapshot = await getDocs(q);
      const updates: CropUpdate[] = [];
      querySnapshot.forEach((doc) => {
        updates.push({ id: doc.id, ...doc.data() } as CropUpdate);
      });
      setCropUpdates(updates);
    } catch (error) {
      console.error("Error fetching crop updates:", error);
      toast.error("Failed to fetch crop updates");
    }
  };

  const submitCropUpdate = async () => {
    try {
      await addDoc(collection(db, "cropUpdates"), {
        farmerId: "farmer1",
        type: "Wheat",
        stage: "Mature",
        status: "pending",
        timestamp: new Date(),
      });
      toast.success("Crop update submitted successfully");
      fetchCropUpdates();
    } catch (error) {
      console.error("Error submitting crop update:", error);
      toast.error("Failed to submit crop update");
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
        
        <h1 className="text-3xl font-bold mb-6">Welcome, {farmerName}</h1>
        
        <div className="grid gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Your Active Crops</h2>
            <div className="space-y-4">
              {cropUpdates.map((update) => (
                <div key={update.id} className="p-4 border rounded">
                  <p className="font-medium">Crop Type: {update.type}</p>
                  <p>Growth Stage: {update.stage}</p>
                  <p>Status: {update.status}</p>
                </div>
              ))}
            </div>
            <Button onClick={submitCropUpdate} className="mt-4">
              Submit New Crop Update
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;
