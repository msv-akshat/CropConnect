
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { collection, getDocs, query, where, DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CalendarCheck, Calendar as CalendarIcon } from "lucide-react";
import { toast } from "sonner";

interface CropEvent {
  id: string;
  title: string;
  type: string;
  date: Date;
  eventType: "planting" | "harvest";
}

interface CropCalendarProps {
  role: string;
  uid?: string;
}

interface CropDataType {
  type: string;
  plantedDate?: string;
  expectedHarvestDate?: string;
}

const CropCalendar = ({ role, uid }: CropCalendarProps) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<CropEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const cropColors: Record<string, string> = {
    "Wheat": "bg-amber-500",
    "Rice": "bg-green-500",
    "Corn": "bg-yellow-500",
    "Soybeans": "bg-emerald-500",
    "Cotton": "bg-blue-500",
    "default": "bg-gray-500"
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        let q;
        if (role === "farmer" && uid) {
          q = query(collection(db, "cropUpdates"), where("farmerId", "==", uid));
        } else {
          q = query(collection(db, "cropUpdates"));
        }

        const querySnapshot = await getDocs(q);
        const fetchedEvents: CropEvent[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data() as CropDataType;

          // Add planting date event if it exists
          if (data.plantedDate) {
            fetchedEvents.push({
              id: `${doc.id}-planting`,
              title: `${data.type} Planting`,
              type: data.type,
              date: new Date(data.plantedDate),
              eventType: "planting"
            });
          }

          // Add harvest date event if it exists
          if (data.expectedHarvestDate) {
            fetchedEvents.push({
              id: `${doc.id}-harvest`,
              title: `${data.type} Expected Harvest`,
              type: data.type,
              date: new Date(data.expectedHarvestDate),
              eventType: "harvest"
            });
          }
        });

        setEvents(fetchedEvents);
      } catch (error) {
        console.error("Error fetching calendar events:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [role, uid]);

  // Function to get events for a specific date
  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  // Custom day rendering to show events
  const renderDay = (day: Date) => {
    const dayEvents = getEventsForDate(day);
    const hasEvents = dayEvents.length > 0;
    
    return (
      <div className="relative">
        <div>{day.getDate()}</div>
        {hasEvents && (
          <div className="flex mt-1 justify-center space-x-1">
            {dayEvents.slice(0, 3).map((event, index) => (
              <div 
                key={event.id}
                className={`w-2 h-2 rounded-full ${cropColors[event.type] || cropColors.default}`}
                title={event.title}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  const exportToGoogleCalendar = () => {
    // Check if there are any events to export
    if (events.length === 0) {
      toast.error("No events to export");
      return;
    }

    // For simplicity, we'll create a Google Calendar link for the first event
    // In a real app, you might want to export all events or selected events
    const event = events[0];
    const title = encodeURIComponent(event.title);
    const startDate = encodeURIComponent(event.date.toISOString());
    const endDate = encodeURIComponent(new Date(event.date.getTime() + 60*60*1000).toISOString()); // Add 1 hour
    const details = encodeURIComponent(`Event Type: ${event.eventType}`);
    
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&details=${details}`;
    
    // Open Google Calendar in a new tab
    window.open(url, '_blank');
    toast.success("Opening Google Calendar...");
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center">
          <CalendarIcon className="mr-2 h-5 w-5" />
          Crop Calendar
        </CardTitle>
        <Button 
          variant="outline" 
          size="sm"
          onClick={exportToGoogleCalendar}
          className="flex items-center gap-1"
        >
          <CalendarCheck className="h-4 w-4" />
          <span className="hidden sm:inline">Export to Google</span>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">Loading calendar...</div>
        ) : (
          <div className="flex flex-col space-y-4">
            <Calendar 
              mode="single" 
              selected={date} 
              onSelect={setDate} 
              className="rounded-md border p-3 pointer-events-auto"
            />

            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Legend</h3>
              <div className="flex flex-wrap gap-3">
                {Object.entries(cropColors)
                  .filter(([key]) => key !== "default")
                  .map(([cropType, colorClass]) => (
                    <div key={cropType} className="flex items-center">
                      <div className={`w-3 h-3 rounded-full ${colorClass} mr-1`}></div>
                      <span className="text-sm">{cropType}</span>
                    </div>
                  ))}
              </div>
            </div>

            {date && (
              <div className="mt-4">
                <h3 className="text-lg font-medium mb-2">
                  Events for {date.toLocaleDateString()}
                </h3>
                {getEventsForDate(date).length > 0 ? (
                  <div className="space-y-2">
                    {getEventsForDate(date).map(event => (
                      <div 
                        key={event.id} 
                        className="p-2 rounded border flex items-center"
                      >
                        <div 
                          className={`w-4 h-4 rounded-full ${cropColors[event.type] || cropColors.default} mr-2`}
                        ></div>
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <p className="text-xs text-gray-500">
                            {event.eventType === "planting" ? "Planting Date" : "Expected Harvest"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No events for this date</p>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CropCalendar;
