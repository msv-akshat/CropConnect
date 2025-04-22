
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Filter, Search, Calendar, FileText, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, addDoc, query, where, getDocs, doc, deleteDoc, Timestamp } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { db, auth } from "@/lib/firebase";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardMetrics from "@/components/DashboardMetrics";
import SubmissionChart from "@/components/SubmissionChart";
import ActivityFeed from "@/components/ActivityFeed";
import CropCalendar from "@/components/CropCalendar";
import Documentation from "@/components/Documentation";
import ReportExport from "@/components/ReportExport";

interface CropUpdate {
  id: string;
  farmerId: string;
  type: string;
  stage: string;
  quantity: number;
  plantedDate: string;
  expectedHarvestDate: string;
  notes: string;
  status: "pending" | "approved" | "rejected";
  timestamp: Timestamp | Date; // Updated to accept both Timestamp and Date
}

interface User {
  uid: string;
  name: string;
  email: string;
  role: string;
}

const FarmerDashboard = ({ user }: { user: User }) => {
  const navigate = useNavigate();
  const [cropUpdates, setCropUpdates] = useState<CropUpdate[]>([]);
  const [cropType, setCropType] = useState("");
  const [cropStage, setCropStage] = useState("");
  const [quantity, setQuantity] = useState<number>(0);
  const [plantedDate, setPlantedDate] = useState("");
  const [expectedHarvestDate, setExpectedHarvestDate] = useState("");
  const [notes, setNotes] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCropUpdates();
  }, [user]);

  const fetchCropUpdates = async () => {
    try {
      const q = query(collection(db, "cropUpdates"), where("farmerId", "==", user.uid));
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

  const submitCropUpdate = async () => {
    try {
      if (!cropType || !cropStage || quantity <= 0 || !plantedDate || !expectedHarvestDate) {
        toast.error("Please fill out all required fields");
        return;
      }

      await addDoc(collection(db, "cropUpdates"), {
        farmerId: user.uid,
        type: cropType,
        stage: cropStage,
        quantity: quantity,
        plantedDate: plantedDate,
        expectedHarvestDate: expectedHarvestDate,
        notes: notes,
        status: "pending",
        timestamp: new Date(),
      });
      
      toast.success("Crop update submitted successfully");
      setIsAddDialogOpen(false);
      resetForm();
      fetchCropUpdates();
    } catch (error) {
      console.error("Error submitting crop update:", error);
      toast.error("Failed to submit crop update");
    }
  };

  const resetForm = () => {
    setCropType("");
    setCropStage("");
    setQuantity(0);
    setPlantedDate("");
    setExpectedHarvestDate("");
    setNotes("");
  };

  const deleteCropUpdate = async (id: string) => {
    try {
      await deleteDoc(doc(db, "cropUpdates", id));
      toast.success("Crop update deleted successfully");
      fetchCropUpdates();
    } catch (error) {
      console.error("Error deleting crop update:", error);
      toast.error("Failed to delete crop update");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "text-green-600 bg-green-100";
      case "rejected":
        return "text-red-600 bg-red-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getProgressValue = (status: string) => {
    switch (status) {
      case "approved":
        return 100;
      case "rejected":
        return 100;
      case "pending":
        return 50;
      default:
        return 0;
    }
  };

  const filteredUpdates = cropUpdates
    .filter(update => filterStatus === "all" || update.status === filterStatus)
    .filter(update => 
      update.type.toLowerCase().includes(searchTerm.toLowerCase()) || 
      update.stage.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Helper function to format dates from either Timestamp or Date objects
  const formatDate = (dateValue: Timestamp | Date | undefined) => {
    if (!dateValue) return "N/A";
    
    // Handle Firebase Timestamp objects
    if ('toDate' in dateValue) {
      return dateValue.toDate().toLocaleDateString();
    }
    
    // Handle regular Date objects
    if (dateValue instanceof Date) {
      return dateValue.toLocaleDateString();
    }
    
    return "N/A";
  };

  return (
    <div className="min-h-screen bg-[#FFF8E7]">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="flex items-center"
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
          <DashboardMetrics role="farmer" uid={user.uid} />
        </div>
        
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid grid-cols-5 max-w-2xl mx-auto mb-4">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <FileText size={16} />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar size={16} />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText size={16} />
              Reports
            </TabsTrigger>
            <TabsTrigger value="docs" className="flex items-center gap-2">
              <FileText size={16} />
              Documentation
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings size={16} />
              Settings
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard">
            <div className="grid gap-8">
              {/* Submission Chart */}
              <SubmissionChart role="farmer" uid={user.uid} />

              <div className="grid md:grid-cols-5 gap-6">
                {/* Main content - 3/5 width */}
                <div className="md:col-span-3">
                  <Card className="shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-xl">Your Crops</CardTitle>
                      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                          <Button className="flex items-center gap-1">
                            <Plus size={16} />
                            Add Crop Update
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Add New Crop Update</DialogTitle>
                            <DialogDescription>
                              Enter the details about your crop to submit for verification.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label htmlFor="cropType" className="text-sm font-medium">Crop Type</label>
                                <select 
                                  id="cropType"
                                  value={cropType}
                                  onChange={(e) => setCropType(e.target.value)}
                                  className="w-full rounded-md border p-2"
                                >
                                  <option value="">Select Type</option>
                                  <option value="Wheat">Wheat</option>
                                  <option value="Rice">Rice</option>
                                  <option value="Corn">Corn</option>
                                  <option value="Soybeans">Soybeans</option>
                                  <option value="Cotton">Cotton</option>
                                </select>
                              </div>
                              <div className="space-y-2">
                                <label htmlFor="cropStage" className="text-sm font-medium">Growth Stage</label>
                                <select 
                                  id="cropStage"
                                  value={cropStage}
                                  onChange={(e) => setCropStage(e.target.value)}
                                  className="w-full rounded-md border p-2"
                                >
                                  <option value="">Select Stage</option>
                                  <option value="Seedling">Seedling</option>
                                  <option value="Vegetative">Vegetative</option>
                                  <option value="Flowering">Flowering</option>
                                  <option value="Fruiting">Fruiting</option>
                                  <option value="Mature">Mature</option>
                                  <option value="Harvested">Harvested</option>
                                </select>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label htmlFor="quantity" className="text-sm font-medium">Quantity (in acres)</label>
                              <Input 
                                id="quantity" 
                                type="number" 
                                min="0"
                                value={quantity}
                                onChange={(e) => setQuantity(Number(e.target.value))}
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label htmlFor="plantedDate" className="text-sm font-medium">Planted Date</label>
                                <Input 
                                  id="plantedDate" 
                                  type="date" 
                                  value={plantedDate}
                                  onChange={(e) => setPlantedDate(e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <label htmlFor="expectedHarvestDate" className="text-sm font-medium">Expected Harvest</label>
                                <Input 
                                  id="expectedHarvestDate" 
                                  type="date"
                                  value={expectedHarvestDate}
                                  onChange={(e) => setExpectedHarvestDate(e.target.value)}
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label htmlFor="notes" className="text-sm font-medium">Notes</label>
                              <Textarea 
                                id="notes" 
                                placeholder="Additional information about your crop"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                            <Button onClick={submitCropUpdate}>Submit Update</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center mb-4 gap-4">
                        <div className="relative flex-grow">
                          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search crops..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Filter size={16} />
                          <select
                            className="p-2 rounded-md border"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                          >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </div>
                      </div>

                      {filteredUpdates.length === 0 ? (
                        <div className="text-center py-10">
                          <p className="text-gray-500">No crop updates found. Add a new crop update to get started.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {filteredUpdates.map((update) => (
                            <Card key={update.id} className="p-4 border rounded">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h3 className="font-semibold text-lg">{update.type}</h3>
                                  <p className="text-sm text-gray-600">Growth Stage: {update.stage}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(update.status)}`}>
                                  {update.status.charAt(0).toUpperCase() + update.status.slice(1)}
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-2 mb-2 text-sm">
                                <div>
                                  <p className="text-gray-600">Quantity: {update.quantity} acres</p>
                                  <p className="text-gray-600">Planted: {update.plantedDate || "N/A"}</p>
                                </div>
                                <div>
                                  <p className="text-gray-600">Expected Harvest: {update.expectedHarvestDate || "N/A"}</p>
                                  <p className="text-gray-600">Submitted: {formatDate(update.timestamp)}</p>
                                </div>
                              </div>

                              {update.notes && (
                                <p className="text-sm bg-gray-50 p-2 rounded mt-2 mb-3">{update.notes}</p>
                              )}

                              <div className="mt-2">
                                <p className="text-xs text-gray-500 mb-1">Verification Status</p>
                                <Progress value={getProgressValue(update.status)} className="h-2" />
                              </div>

                              <div className="flex justify-end mt-3 gap-2">
                                <Button variant="outline" size="sm" onClick={() => deleteCropUpdate(update.id)}>
                                  Delete
                                </Button>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button size="sm">View Details</Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Crop Details</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <p className="text-sm font-medium">Crop Type</p>
                                          <p>{update.type}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium">Growth Stage</p>
                                          <p>{update.stage}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium">Quantity</p>
                                          <p>{update.quantity} acres</p>
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium">Status</p>
                                          <p className={getStatusColor(update.status)}>
                                            {update.status.charAt(0).toUpperCase() + update.status.slice(1)}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium">Planted Date</p>
                                          <p>{update.plantedDate || "N/A"}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium">Expected Harvest</p>
                                          <p>{update.expectedHarvestDate || "N/A"}</p>
                                        </div>
                                      </div>
                                      {update.notes && (
                                        <div>
                                          <p className="text-sm font-medium">Notes</p>
                                          <p className="bg-gray-50 p-3 rounded">{update.notes}</p>
                                        </div>
                                      )}
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
                
                {/* Activity feed - 2/5 width */}
                <div className="md:col-span-2">
                  <ActivityFeed />
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="calendar">
            <div className="grid gap-6">
              <CropCalendar role="farmer" uid={user.uid} />
            </div>
          </TabsContent>
          
          <TabsContent value="reports">
            <div className="grid gap-6">
              <ReportExport role="farmer" uid={user.uid} userName={user.name} />
            </div>
          </TabsContent>
          
          <TabsContent value="docs">
            <div className="grid gap-6">
              <Documentation />
            </div>
          </TabsContent>
          
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium">Profile Information</h3>
                  <p className="text-sm text-gray-600">Name: {user.name}</p>
                  <p className="text-sm text-gray-600">Email: {user.email}</p>
                  <p className="text-sm text-gray-600">Role: {user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
                </div>
                <Button onClick={handleLogout} variant="outline">Logout</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FarmerDashboard;
