import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Switch } from '../ui/switch';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Plus, Edit2, Trash2, Save, X, Image as ImageIcon,
  Clock, ArrowLeft, Sparkles, Crown, CheckCircle, XCircle, Copy, DollarSign
} from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { fetchVendorDetailsForCard } from '../services/vendorsummaryservices.js';
import{updateVendorActiveStatusAPI } from '../services/vendorService.js';
import VendorDashboard from './VendorDashboardAnimated.js';
// import { useNavigate } from "react-router-dom";



interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'vendor';

}

interface TimeSlot {
  id: string;
  time: string;
  isAvailable: boolean;
}

interface ServiceImage {
  id: string;
  url: string;
}

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  cost: number;
  advancePayment: number;
  images: ServiceImage[];
  availableDates: string[];
  timeSlots: TimeSlot[];
  isActive: boolean;
}

interface ManageServicesProps {
  user: User;
  profileId: string;
  onBack: () => void;
}

const CATEGORIES = [
  'Function Halls',
  'Music & DJ',
  'Decoration',
  'Cars & Transport',
  'Catering',
  'Pandit Services',
  'Photography',
  'Makeup & Styling'
];

export default function ManageServices({ user, onBack, }: ManageServicesProps) {

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD
  });

  // --- Dialog & Form State ---
  const [showServiceDialog, setShowServiceDialog] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: CATEGORIES[0],
    cost: '',
    advancePayment: '',
    imageUrls: [''],
  });
  const [customSlots, setCustomSlots] = useState<string[]>(['']);

  // --- Fetch vendor data from backend ---
  const fetchVendorServices = async () => {
    if (!user) return;
    try {
      setLoading(true);
      console.log("Fetching services for user ID:", user);
      const data = await fetchVendorDetailsForCard(user.id._id, selectedDate);


      const mappedServices: Service[] = [
        {
          id: data.id,
          name: data.serviceName,
          description: data.description,
          category: 'Function Halls', // backend can provide category if available
          cost: data.minTotalCost,
          advancePayment: data.advancePaymentAmount,
          images: data.imageUrls.map((url: string, idx: number) => ({ id: `img-${idx}`, url })),
          availableDates: [selectedDate],
          timeSlots: data.availability.map((slot: any, idx: number) => ({
            id: `slot-${idx}`,
            time: slot.time,
            isAvailable: slot.status === 'available'
          })),
          isActive: data.ActiveStatus
        }
      ];
      console.log("Fetched Data:", data.ActiveStatus);
      console.log("Mapped Services:", mappedServices);
      setServices(mappedServices);
    } catch (err) {
      console.error('Error fetching vendor services:', err);
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorServices();
  }, [selectedDate]);

  // --- Slot & Active Toggles ---
  const toggleSlotAvailability = (serviceId: string, slotId: string) => {
    setServices(services.map(service => {
      if (service.id === serviceId) {
        return {
          ...service,
          timeSlots: service.timeSlots.map(slot =>
            slot.id === slotId ? { ...slot, isAvailable: !slot.isAvailable } : slot
          )
        };
      }
      return service;
    }));
  };
// const toggleServiceActive = (id: string) => {
//   setServices(services.map(service => 
//     service.id === id 
//       ? { 
//           ...service, 
//           isActive: !service.isActive
//         } 
//       : service
//   ));
//     console.log("Toggled active status for service ID:", services[0].isActive);
//     console.log("Toggling active status for service ID:", services);

// };

const toggleServiceActive = async (id: string) => {
  // Find current service
  const currentService = services.find(service => service.id === id);
  const newStatus = !currentService?.isActive;

  // Optimistic UI update
  setServices(prevServices =>
    prevServices.map(service =>
      service.id === id
        ? { ...service, isActive: newStatus }
        : service
    )
  );

  try {
    // Update backend
    await updateVendorActiveStatusAPI(id, newStatus);
    console.log(`✅ Service ID ${id} ActiveStatus updated to ${newStatus}`);
  } catch (err) {
    console.error("❌ Failed to update ActiveStatus:", err.message);
    // Rollback on failure
    setServices(prevServices =>
      prevServices.map(service =>
        service.id === id
          ? { ...service, isActive: !currentService?.isActive }
          : service
      )
    );
  }
};

  return (

    <div className="min-h-screen bg-gradient-to-br from-[var(--royal-cream)] via-white to-[var(--royal-cream)]">

      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gradient-to-r from-[var(--royal-maroon)] via-[var(--royal-copper)] to-[var(--royal-maroon)] text-white shadow-2xl"
      >
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <Button onClick={(e) => {
            e.preventDefault();  // prevents page refresh
            onBack();
          }} variant="ghost" className="text-white hover:bg-white/20">
            <ArrowLeft className="h-5 w-5 mr-2" /> Back
          </Button>
          <div className="flex items-center gap-4">
            <Crown className="h-8 w-8" />
            <h1 className="text-2xl">Manage Services</h1>
            <Badge className="bg-[var(--royal-gold)] text-white">{services.length} Services</Badge>
          </div>
        </div>
      </motion.div>

      {/* Date Picker */}
      <div className="container mx-auto px-4 mt-6 mb-4 flex justify-end">
        <Label htmlFor="service-date" className="mr-2 text-sm text-[var(--royal-maroon)]">Select Date:</Label>
        <Input
          id="service-date"
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border-[var(--royal-gold)]/50 focus:border-[var(--royal-gold)]"
        />
      </div>

      {/* Services Grid */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-20 text-gray-600">Loading vendor services...</div>
        ) : services.length === 0 ? (
          <div className="text-center py-20">
            <Sparkles className="h-20 w-20 text-[var(--royal-gold)] mx-auto mb-4" />
            <h2 className="text-2xl text-[var(--royal-maroon)] mb-2">No Services Yet</h2>
            <p className="text-gray-600 mb-6">Start by adding your first royal service</p>
            <Button
              onClick={() => setShowServiceDialog(true)}
              className="bg-gradient-to-r from-[var(--royal-maroon)] to-[var(--royal-copper)] text-white"
            >
              <Plus className="h-5 w-5 mr-2" /> Add Service
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {services.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.1 }}
                  layout
                >
                  <Card className="overflow-hidden border-2 border-[var(--royal-gold)]/30 hover:border-[var(--royal-gold)] transition-all shadow-lg hover:shadow-2xl">

                    {/* Images */}
                    <div className="relative h-48 bg-gradient-to-br from-[var(--royal-maroon)]/10 to-[var(--royal-gold)]/10">
                      {service.images.length > 0 ? (
                        <ImageWithFallback
                          src={service.images[0].url}
                          alt={service.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="h-16 w-16 text-[var(--royal-gold)]/50" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2 flex gap-2">
                        <Badge
                          className={service.isActive ? "bg-green-500 text-white" : "bg-gray-400 text-white"}
                        >
                          {service.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>

                    <CardHeader>
                      <CardTitle className="text-[var(--royal-maroon)]">{service.name}</CardTitle>
                      <CardDescription>{service.category}</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <p className="text-sm text-gray-600 line-clamp-2">{service.description}</p>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Total Cost:</span>
                          <span className="text-[var(--royal-maroon)]">₹{service.cost.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Advance:</span>
                          <span className="text-[var(--royal-copper)]">₹{service.advancePayment.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Slots */}
                      <div>
                        <Label className="text-xs text-gray-600 mb-2 block">Available Slots</Label>
                        <div className="flex flex-wrap gap-1">
                          {service.timeSlots.map(slot => (
                            <Badge
                              key={slot.id}
                              variant="outline"
                              className={`text-xs cursor-pointer ${slot.isAvailable
                                ? 'border-green-500 text-green-700 bg-green-50'
                                : 'border-gray-300 text-gray-400 bg-gray-50'
                                }`}
                              onClick={() => toggleSlotAvailability(service.id, slot.id)}
                            >
                              {slot.isAvailable ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                              {slot.time.split(' - ')[0]}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Active Toggle */}
                      <div className="flex items-center gap-2 pt-2">
                        <Switch
                          checked={service.isActive}
                          onCheckedChange={() => toggleServiceActive(service.id)}
                        />
                        {console.log("Service ID:", service.id, "isActive:", service.isActive)}
                        <span className="text-xs text-gray-600">Active</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
