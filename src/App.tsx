import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import FarmerDashboard from "./pages/FarmerDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ChatBot from "./components/ChatBot";

const queryClient = new QueryClient();

interface UserData {
  uid: string;
  name: string;
  email: string;
  role: string;
  [key: string]: any; // For any additional properties
}

const App = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser({ 
            uid: currentUser.uid, 
            email: currentUser.email || "", 
            name: userData.name || currentUser.displayName || "",
            role: userData.role || "",
            ...userData
          });
        } else {
          setUser({ 
            uid: currentUser.uid, 
            email: currentUser.email || "",
            name: currentUser.displayName || "",
            role: ""  // Default empty role if no user document exists
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route 
              path="/farmer" 
              element={
                user && user.role === "farmer" ? 
                <FarmerDashboard user={user} /> : 
                <Navigate to="/login" />
              } 
            />
            <Route 
              path="/employee" 
              element={
                user && user.role === "employee" ? 
                <EmployeeDashboard user={user} /> : 
                <Navigate to="/login" />
              } 
            />
            <Route 
              path="/admin" 
              element={
                user && user.role === "admin" ? 
                <AdminDashboard user={user} /> : 
                <Navigate to="/login" />
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
          {user && <ChatBot />}
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
