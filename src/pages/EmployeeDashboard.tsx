
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

interface CropUpdate {
  id: string;
  farmerId: string;
  type: string;
  stage: string;
  status: "pending" | "approved" | "rejected";
  timestamp: Date;
}

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const employeeName = "Sarah Johnson";
  const [pendingUpdates, setPendingUpdates] = useState<CropUpdate[]>([]);

  useEffect(() => {
    fetchPendingUpdates();
  }, []);

  const fetchPendingUpdates = async () => {
    try {
      const q = query(collection(db, "cropUpdates"), where("status", "==", "pending"));
      const querySnapshot = await getDocs(q);
      const updates: CropUpdate[] = [];
      querySnapshot.forEach((doc) => {
        updates.push({ id: doc.id, ...doc.data() } as CropUpdate);
      });
      setPendingUpdates(updates);
    } catch (error) {
      console.error("Error fetching pending updates:", error);
      toast.error("Failed to fetch pending updates");
    }
  };

  const handleUpdateStatus = async (updateId: string, status: "approved" | "rejected") => {
    try {
      const updateRef = doc(db, "cropUpdates", updateId);
      await updateDoc(updateRef, { status });
      toast.success(`Update ${status} successfully`);
      fetchPendingUpdates();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
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
        
        <h1 className="text-3xl font-bold mb-6">Welcome, {employeeName}</h1>
        
        <div className="grid gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Pending Verifications</h2>
            <div className="space-y-4">
              {pendingUpdates.map((update) => (
                <div key={update.id} className="p-4 border rounded">
                  <p className="font-medium">Farmer ID: {update.farmerId}</p>
                  <p>Crop Type: {update.type}</p>
                  <p>Growth Stage: {update.stage}</p>
                  <div className="mt-2 space-x-2">
                    <Button
                      variant="default"
                      onClick={() => handleUpdateStatus(update.id, "approved")}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleUpdateStatus(update.id, "rejected")}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
