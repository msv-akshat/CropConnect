
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { collection, query, where, getDocs, Timestamp, DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { FileText, FileDown, Calendar as CalendarIcon, Printer } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ReportExportProps {
  role: string;
  uid?: string;
  userName?: string;
}

interface SubmissionData {
  id: string;
  type: string;
  stage: string;
  status: string;
  timestamp: Date;
  displayName: string;
  [key: string]: any;
}

const ReportExport = ({ role, uid, userName }: ReportExportProps) => {
  const [reportType, setReportType] = useState<"submission" | "seasonal" | "certificate">("submission");
  const [startDate, setStartDate] = useState<Date | undefined>(
    new Date(new Date().setMonth(new Date().getMonth() - 1))
  );
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [selectedSubmission, setSelectedSubmission] = useState<string>("");
  const [submissions, setSubmissions] = useState<SubmissionData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const searchSubmissions = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }
    
    try {
      setIsSearching(true);
      
      let q;
      if (role === "farmer" && uid) {
        q = query(
          collection(db, "cropUpdates"), 
          where("farmerId", "==", uid),
          where("timestamp", ">=", startDate),
          where("timestamp", "<=", endDate)
        );
      } else {
        q = query(
          collection(db, "cropUpdates"),
          where("timestamp", ">=", startDate),
          where("timestamp", "<=", endDate)
        );
      }
      
      const querySnapshot = await getDocs(q);
      const results: SubmissionData[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data() as DocumentData;
        
        const timestamp = data.timestamp instanceof Timestamp 
          ? data.timestamp.toDate() 
          : new Date(data.timestamp);
          
        results.push({
          id: doc.id,
          type: data.type || "Unknown",
          stage: data.stage || "Unknown",
          status: data.status || "pending",
          timestamp,
          displayName: `${data.type || "Unknown"} - ${data.stage || "Unknown"} (${format(
            timestamp,
            "MMM d, yyyy"
          )})`
        });
      });
      
      setSubmissions(results);
      
      if (results.length === 0) {
        toast.info("No submissions found in the selected date range");
      } else {
        setSelectedSubmission(results[0].id);
      }
    } catch (error) {
      console.error("Error searching submissions:", error);
      toast.error("Failed to search submissions");
    } finally {
      setIsSearching(false);
    }
  };

  const generatePdf = async () => {
    setIsLoading(true);
    
    // This is a simulation of PDF generation - in a real app you would use a PDF library
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Report generated successfully");
      // In a real implementation, this would trigger download of the PDF file
    }, 2000);
  };

  const generateCertificate = async () => {
    if (!selectedSubmission) {
      toast.error("Please select a submission first");
      return;
    }
    
    setIsLoading(true);
    
    // This is a simulation of certificate generation - in a real app you would use a PDF library
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Certificate generated successfully");
      // In a real implementation, this would trigger download or print of the certificate
    }, 2000);
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileDown className="mr-2 h-5 w-5" />
          Report Export
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="reportType">Report Type</Label>
            <select
              id="reportType"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
              value={reportType}
              onChange={(e) => setReportType(e.target.value as "submission" | "seasonal" | "certificate")}
            >
              <option value="submission">Submission History Report</option>
              <option value="seasonal">Seasonal Summary Report</option>
              <option value="certificate">Verification Certificate</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="startDate"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="endDate"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <Button onClick={searchSubmissions} disabled={isSearching || !startDate || !endDate}>
            {isSearching ? "Searching..." : "Search"}
          </Button>

          {submissions.length > 0 && reportType === "certificate" && (
            <div className="space-y-2 mt-4">
              <Label htmlFor="submission">Select Submission</Label>
              <select
                id="submission"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedSubmission}
                onChange={(e) => setSelectedSubmission(e.target.value)}
              >
                {submissions
                  .filter(sub => sub.status === "approved")
                  .map(submission => (
                    <option key={submission.id} value={submission.id}>
                      {submission.displayName}
                    </option>
                  ))}
              </select>
              {submissions.filter(sub => sub.status === "approved").length === 0 && (
                <p className="text-sm text-yellow-600">No approved submissions found in this date range.</p>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 mt-4">
            {reportType === "certificate" ? (
              <Button 
                onClick={generateCertificate} 
                disabled={isLoading || !selectedSubmission || submissions.filter(sub => sub.status === "approved" && sub.id === selectedSubmission).length === 0}
                className="flex items-center gap-2"
              >
                <Printer className="h-4 w-4" />
                {isLoading ? "Generating..." : "Generate Certificate"}
              </Button>
            ) : (
              <Button 
                onClick={generatePdf} 
                disabled={isLoading || submissions.length === 0}
                className="flex items-center gap-2"
              >
                <FileDown className="h-4 w-4" />
                {isLoading ? "Generating..." : "Export PDF"}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportExport;
