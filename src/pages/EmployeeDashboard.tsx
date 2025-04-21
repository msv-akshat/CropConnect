
import { Button } from "@/components/ui/button";
import { ArrowLeft, Filter, Search, Check, X, MessageCircle, Calendar, FileText, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, doc, updateDoc, Timestamp } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { db, auth } from "@/lib/firebase";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface CropUpdate {
  id: string;
  farmerId: string;
  farmerName?: string;
  type: string;
  stage: string;
  quantity: number;
  plantedDate: string;
  expectedHarvestDate: string;
  notes: string;
  status: "pending" | "approved" | "rejected";
  feedback?: string;
  timestamp: Timestamp;
}

interface User {
  uid: string;
  name: string;
  email: string;
  role: string;
}

interface FarmerDetails {
  id: string;
  name: string;
  email: string;
}

const EmployeeDashboard = ({ user }: { user: User }) => {
  const navigate = useNavigate();
  const [pendingUpdates, setPendingUpdates] = useState<CropUpdate[]>([]);
  const [approvedUpdates, setApprovedUpdates] = useState<CropUpdate[]>([]);
  const [rejectedUpdates, setRejectedUpdates] = useState<CropUpdate[]>([]);
  const [farmers, setFarmers] = useState<Record<string, FarmerDetails>>({});
  const [selectedUpdate, setSelectedUpdate] = useState<CropUpdate | null>(null);
  const [feedback, setFeedback] = useState("");
  const [filterCropType, setFilterCropType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  useEffect(() => {
    fetchUpdates();
    fetchFarmers();
  }, [user]);

  const fetchFarmers = async () => {
    try {
      const q = query(collection(db, "users"), where("role", "==", "farmer"));
      const querySnapshot = await getDocs(q);
      const farmersMap: Record<string, FarmerDetails> = {};
      
      querySnapshot.forEach((doc) => {
        const farmerData = doc.data() as FarmerDetails;
        farmersMap[doc.id] = { id: doc.id, ...farmerData };
      });
      
      setFarmers(farmersMap);
    } catch (error) {
      console.error("Error fetching farmers:", error);
      toast.error("Failed to fetch farmer details");
    }
  };

  const fetchUpdates = async () => {
    try {
      // Fetch pending updates
      const pendingQ = query(collection(db, "cropUpdates"), where("status", "==", "pending"));
      const pendingSnapshot = await getDocs(pendingQ);
      const pendingData: CropUpdate[] = [];
      pendingSnapshot.forEach((doc) => {
        pendingData.push({ id: doc.id, ...doc.data() } as CropUpdate);
      });
      setPendingUpdates(pendingData);
      
      // Fetch approved updates
      const approvedQ = query(collection(db, "cropUpdates"), where("status", "==", "approved"));
      const approvedSnapshot = await getDocs(approvedQ);
      const approvedData: CropUpdate[] = [];
      approvedSnapshot.forEach((doc) => {
        approvedData.push({ id: doc.id, ...doc.data() } as CropUpdate);
      });
      setApprovedUpdates(approvedData);
      
      // Fetch rejected updates
      const rejectedQ = query(collection(db, "cropUpdates"), where("status", "==", "rejected"));
      const rejectedSnapshot = await getDocs(rejectedQ);
      const rejectedData: CropUpdate[] = [];
      rejectedSnapshot.forEach((doc) => {
        rejectedData.push({ id: doc.id, ...doc.data() } as CropUpdate);
      });
      setRejectedUpdates(rejectedData);
      
    } catch (error) {
      console.error("Error fetching updates:", error);
      toast.error("Failed to fetch updates");
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

  const handleUpdateStatus = async (updateId: string, status: "approved" | "rejected") => {
    try {
      const updateRef = doc(db, "cropUpdates", updateId);
      
      const updateData: { status: string; feedback?: string } = { status };
      if (feedback.trim() && status === "rejected") {
        updateData.feedback = feedback;
      }
      
      await updateDoc(updateRef, updateData);
      toast.success(`Update ${status} successfully`);
      setFeedback("");
      setSelectedUpdate(null);
      fetchUpdates();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const getFarmerName = (farmerId: string) => {
    return farmers[farmerId]?.name || "Unknown Farmer";
  };

  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp || !timestamp.toDate) {
      return "N/A";
    }
    return timestamp.toDate().toLocaleDateString();
  };

  const filterUpdates = (updates: CropUpdate[]) => {
    return updates
      .filter(update => !filterCropType || update.type === filterCropType)
      .filter(update => {
        const farmerName = getFarmerName(update.farmerId).toLowerCase();
        const searchLower = searchTerm.toLowerCase();
        return update.type.toLowerCase().includes(searchLower) || 
               farmerName.includes(searchLower) || 
               update.stage.toLowerCase().includes(searchLower);
      });
  };

  const getCropTypes = () => {
    const allUpdates = [...pendingUpdates, ...approvedUpdates, ...rejectedUpdates];
    const uniqueTypes = new Set(allUpdates.map(update => update.type));
    return Array.from(uniqueTypes);
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
        
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid grid-cols-5 max-w-2xl mx-auto mb-4">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <MessageCircle size={16} />
              Pending <span className="ml-1 bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">{pendingUpdates.length}</span>
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex items-center gap-2">
              <Check size={16} />
              Approved
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex items-center gap-2">
              <X size={16} />
              Rejected
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar size={16} />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings size={16} />
              Settings
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center mb-4 gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by farmer, crop type..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={16} />
              <select
                className="p-2 rounded-md border"
                value={filterCropType}
                onChange={(e) => setFilterCropType(e.target.value)}
              >
                <option value="">All Crop Types</option>
                {getCropTypes().map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
          
          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Pending Verifications</CardTitle>
              </CardHeader>
              <CardContent>
                {filterUpdates(pendingUpdates).length === 0 ? (
                  <p className="text-center py-8">No pending verifications found.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Farmer</TableHead>
                        <TableHead>Crop Type</TableHead>
                        <TableHead>Stage</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Submitted On</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filterUpdates(pendingUpdates).map((update) => (
                        <TableRow key={update.id}>
                          <TableCell>{getFarmerName(update.farmerId)}</TableCell>
                          <TableCell>{update.type}</TableCell>
                          <TableCell>{update.stage}</TableCell>
                          <TableCell>{update.quantity} acres</TableCell>
                          <TableCell>{formatDate(update.timestamp)}</TableCell>
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm">Review</Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-xl">
                                <DialogHeader>
                                  <DialogTitle>Review Crop Update</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-sm font-medium">Farmer</p>
                                      <p>{getFarmerName(update.farmerId)}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">Submitted On</p>
                                      <p>{formatDate(update.timestamp)}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-sm font-medium">Crop Type</p>
                                      <p>{update.type}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">Growth Stage</p>
                                      <p>{update.stage}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-3 gap-4">
                                    <div>
                                      <p className="text-sm font-medium">Quantity</p>
                                      <p>{update.quantity} acres</p>
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
                                      <p className="text-sm font-medium">Farmer's Notes</p>
                                      <p className="bg-gray-50 p-3 rounded">{update.notes}</p>
                                    </div>
                                  )}
                                  
                                  <div>
                                    <p className="text-sm font-medium mb-1">Feedback (required for rejection)</p>
                                    <Textarea 
                                      placeholder="Add your feedback here..."
                                      value={feedback}
                                      onChange={(e) => setFeedback(e.target.value)}
                                    />
                                  </div>
                                </div>
                                <DialogFooter className="gap-2">
                                  <Button 
                                    variant="outline" 
                                    onClick={() => handleUpdateStatus(update.id, "rejected")}
                                    className="flex items-center"
                                  >
                                    <X className="mr-2 h-4 w-4" />
                                    Reject
                                  </Button>
                                  <Button 
                                    onClick={() => handleUpdateStatus(update.id, "approved")}
                                    className="flex items-center"
                                  >
                                    <Check className="mr-2 h-4 w-4" />
                                    Approve
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="approved">
            <Card>
              <CardHeader>
                <CardTitle>Approved Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                {filterUpdates(approvedUpdates).length === 0 ? (
                  <p className="text-center py-8">No approved submissions found.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Farmer</TableHead>
                        <TableHead>Crop Type</TableHead>
                        <TableHead>Stage</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Approved On</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filterUpdates(approvedUpdates).map((update) => (
                        <TableRow key={update.id}>
                          <TableCell>{getFarmerName(update.farmerId)}</TableCell>
                          <TableCell>{update.type}</TableCell>
                          <TableCell>{update.stage}</TableCell>
                          <TableCell>{update.quantity} acres</TableCell>
                          <TableCell>{formatDate(update.timestamp)}</TableCell>
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline">View</Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Approved Crop Update</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-sm font-medium">Farmer</p>
                                      <p>{getFarmerName(update.farmerId)}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">Submitted On</p>
                                      <p>{formatDate(update.timestamp)}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-sm font-medium">Crop Type</p>
                                      <p>{update.type}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">Growth Stage</p>
                                      <p>{update.stage}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-3 gap-4">
                                    <div>
                                      <p className="text-sm font-medium">Quantity</p>
                                      <p>{update.quantity} acres</p>
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
                                      <p className="text-sm font-medium">Farmer's Notes</p>
                                      <p className="bg-gray-50 p-3 rounded">{update.notes}</p>
                                    </div>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="rejected">
            <Card>
              <CardHeader>
                <CardTitle>Rejected Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                {filterUpdates(rejectedUpdates).length === 0 ? (
                  <p className="text-center py-8">No rejected submissions found.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Farmer</TableHead>
                        <TableHead>Crop Type</TableHead>
                        <TableHead>Stage</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Rejected On</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filterUpdates(rejectedUpdates).map((update) => (
                        <TableRow key={update.id}>
                          <TableCell>{getFarmerName(update.farmerId)}</TableCell>
                          <TableCell>{update.type}</TableCell>
                          <TableCell>{update.stage}</TableCell>
                          <TableCell>{update.quantity} acres</TableCell>
                          <TableCell>{formatDate(update.timestamp)}</TableCell>
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline">View</Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Rejected Crop Update</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-sm font-medium">Farmer</p>
                                      <p>{getFarmerName(update.farmerId)}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">Submitted On</p>
                                      <p>{formatDate(update.timestamp)}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-sm font-medium">Crop Type</p>
                                      <p>{update.type}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">Growth Stage</p>
                                      <p>{update.stage}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-3 gap-4">
                                    <div>
                                      <p className="text-sm font-medium">Quantity</p>
                                      <p>{update.quantity} acres</p>
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
                                      <p className="text-sm font-medium">Farmer's Notes</p>
                                      <p className="bg-gray-50 p-3 rounded">{update.notes}</p>
                                    </div>
                                  )}
                                  
                                  {update.feedback && (
                                    <div>
                                      <p className="text-sm font-medium">Feedback</p>
                                      <p className="bg-red-50 text-red-800 p-3 rounded">{update.feedback}</p>
                                    </div>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <CardTitle>Harvest Calendar</CardTitle>
              </CardHeader>
              <CardContent>
                <p>This is where the calendar view of expected harvests would be displayed.</p>
                <p className="text-muted-foreground mt-2">Coming soon: Visual calendar showing upcoming harvests.</p>
              </CardContent>
            </Card>
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

export default EmployeeDashboard;
