
import { useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { fetchVendorDetailsForCard } from "../services/vendorsummaryservices.js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';


interface Slot {
  time: string;
  status: string;
  price: number;
}

interface VendorAvailabilityProps {
  vendorId: string;
}

export default function VendorAvailability({ vendorId }: VendorAvailabilityProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [timeSlots, setTimeSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedDate || !vendorId) return;

    const loadSlots = async () => {
      try {
        setLoading(true);
        const dateStr = selectedDate.toLocaleDateString('en-CA');
        const vendorDetails = await fetchVendorDetailsForCard(vendorId, dateStr);
        const slots = vendorDetails?.availability ?? [];
        setTimeSlots(Array.isArray(slots) ? slots : []);
      } catch (err) {
        console.error("Failed to fetch slots:", err);
        toast.error("Could not load time slots");
        setTimeSlots([]);
      } finally {
        setLoading(false);
      }
    };

    loadSlots();
  }, [selectedDate, vendorId]);
  // console.log("sele");
  console.log("date:", selectedDate)

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "booked":
        return "bg-red-500";
      case "available":
        return "bg-green-500";
      default:
        return "bg-gray-400";
    }

  };

  return (
              <TabsContent value="availability" className="space-y-6">

    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle>Availability</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col md:flex-row gap-4">
        {/* 📅 Calendar */}
        <div className="w-full md:w-1/2 flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
          />
        </div>

        {/* ⏰ Time Slots */}
        <div className="w-full md:w-1/2 flex flex-col gap-2 max-h-[300px] overflow-y-auto">
          {loading ? (
            <p className="text-center text-gray-500">Loading slots...</p>
          ) : timeSlots.length === 0 ? (
            <p className="text-center text-gray-500">No slots available for this date.</p>
          ) : (
            timeSlots.map((slot, index) => (
              <div
                key={index}
                className="flex justify-between items-center border rounded-md p-2"
              >
                <span>{slot.time}</span>
                <Badge className={`${getStatusColor(slot.status)} text-white`}>
                  {slot.status}
                </Badge>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
              </TabsContent>
  );
}
