import React, { useState, useEffect, useMemo, useCallback } from 'react';
// import { toast } from 'sonner@2.0.3';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Calendar } from '../ui/calendar';
import { Upload as UploadIcon } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Switch } from '../ui/switch';
import {
  Heart, Calendar as CalendarIcon, TrendingUp, TrendingDown,
  Users, DollarSign, Clock, Phone, Mail, LogOut, Settings, Crown, Sparkles, Star,
  ChevronDown, ChevronUp, XCircle, MapPin, Info
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
// import ManualBooking from './ManualBooking';
import { toast } from 'sonner@2.0.3';
import { fetchVendorDashboardSummary, fetchCustomerBookings, submitBooking, cancelBookingAPI,fetchVendorImages,uploadVendorProfilePhoto } from '../services/vendorsummaryservices.js';
import RevenueDetails from './RevenueDetails';
import BookingsDetails from './BookingsDetails';
import AdvancePaymentDetails from './AdvancePaymentDetails';
import TodaysEventsDetails from './TodaysEventsDetails';
import ManualBooking from './ManualBooking';
import VendorAvailability from './VendorAvailability';

interface Booking {
  id: string;
  profileId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  date: string;
  time: string;
  amount: number;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid_advance' | 'paid_full' | 'failed' | 'manual'
  advancePaid: number;

}

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  date: string;
}

interface VendorDashboardProps {
  user: { id: string; name: string; email: string; role: 'vendor' | 'customer' };
  onLogout: () => void;
  onNavigateToManageServices?: () => void;
}

export default function VendorDashboard({ user, onLogout, onNavigateToManageServices }: VendorDashboardProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [dashboardData, setDashboardData] = useState<any>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [profileId, setProfileId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'revenue' | 'bookings' | 'advance' | 'todaysEvents'>('dashboard');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [profilePhoto, setProfilePhoto] = useState(null);


  // ✅ Fetch dashboard & bookings from backend
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [summary, bookingList] = await Promise.all([
          fetchVendorDashboardSummary(),
          fetchCustomerBookings(),
        ]);
        setDashboardData(summary);
        setBookings(bookingList);
        setProfileId(bookingList[0].profileId);
        // console.log('Fetched Dashboard Data:', summary);
        // console.log('Fetched profileid:', profileId);
        console.log('Fetched overall:', bookings);

        // console.log("bookings:",bookings)
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        toast.error('Unable to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  useEffect(() => {
  const loadImages = async () => {
    const res = await fetchVendorImages(profileId);
    if (res.success) {
      setProfilePhoto(res.images[0]); // first img
    }
  };

  loadImages();
}, [profileId]);


console.log("profile photo url: ",profilePhoto);

const handlePhotoUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  toast.loading("Uploading profile photo...");

  const res = await uploadVendorProfilePhoto(file);

  toast.dismiss();

  if (res.success) {
    toast.success("Profile photo updated!");
    setProfilePhoto(`http://localhost:5000${res.imageUrl}`);
  } else {
    toast.error(res.message || "Upload failed");
  }
};



  // ✅ Add new booking (integrated with backend)
  const handleAddBooking = async (newBooking: Booking) => {
    try {
      const createdBooking = await submitBooking(newBooking); // call backend
      setBookings(prev => [createdBooking, ...prev]);

      // Mark the time slot unavailable
      const existingSlot = timeSlots.find(slot => slot.date === createdBooking.date && slot.time === createdBooking.time);
      if (existingSlot) {
        setTimeSlots(prev => prev.map(slot => slot.id === existingSlot.id ? { ...slot, available: false } : slot));
      } else {
        setTimeSlots(prev => [...prev, { id: Date.now().toString(), time: createdBooking.time, date: createdBooking.date, available: false }]);
      }

      toast.success('Booking Added Successfully', {
        description: `${createdBooking.customerName}'s booking was created.`,
      });
    } catch (error) {
      console.error('Failed to add booking:', error);
      toast.error('Failed to add new booking');
    }
  };

  // ✅ Cancel booking (backend call can be added later)
  const handleCancelBooking = async (bookingId: string) => {
    try {
      const cancelledBooking = bookings.find(b => b.id === bookingId);
      if (!cancelledBooking) return;

      // ✅ Call the cancel booking API
      const response = await cancelBookingAPI(bookingId);

      if (!response || response.error) {
        throw new Error(response?.message || 'Failed to cancel booking');
      }

      // ✅ Update the bookings state locally after successful cancellation

      setBookings(prev => prev.filter(b => b.id !== bookingId));

      // ✅ Mark the corresponding time slot as available
      setTimeSlots(prev =>
        prev.map(slot =>
          slot.date === cancelledBooking.date && slot.time === cancelledBooking.time
            ? { ...slot, available: true }
            : slot
        )
      );

      // ✅ Show success toast
      toast.success('Booking Cancelled', {
        description: `Booking ${bookingId} for ${cancelledBooking.customerName} has been cancelled. Time slot is now available.`,
      });

      // ✅ Collapse expanded booking card
      setExpandedBookingId(null);
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel booking');
    }
  };


  // ✅ Toggle booking expansion
  const toggleBookingExpansion = (bookingId: string) => {
    setExpandedBookingId(prev => (prev === bookingId ? null : bookingId));
  };

  // ✅ Time slots for selected date
  const currentDateSlots = useMemo(() => {
    if (!selectedDate) return [];
    const dateStr = selectedDate.toISOString().split('T')[0];
    return timeSlots.filter(slot => slot.date === dateStr);
  }, [selectedDate, timeSlots]);

  // ✅ Booked dates set
  const bookedDatesSet = useMemo(() => {
    const dates = new Set<string>();
    timeSlots.forEach(slot => { if (!slot.available) dates.add(slot.date); });
    return dates;
  }, [timeSlots]);

  const AnimatedCounter = ({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) => {
    const [count, setCount] = useState(0);
    const [hasAnimated, setHasAnimated] = useState(false);

    useEffect(() => {
      if (hasAnimated) return; // Only animate once

      let start = 0;
      const end = value;
      const duration = 1500;
      const increment = end / (duration / 16);

      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
          setHasAnimated(true);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(timer);
    }, [value, hasAnimated]); // ✅ Reacts if `value` changes

    return (
      <span>
        {prefix}
        {(hasAnimated ? value : count).toLocaleString()}
        {suffix}
      </span>
    );
  };

  const hasBookingsOnDate = useCallback((date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return bookedDatesSet.has(dateStr);
  }, [bookedDatesSet]);

  const addTimeSlot = useCallback((time: string) => {
    if (!selectedDate) return;
    const dateStr = selectedDate.toISOString().split('T')[0];
    setTimeSlots(prev => [...prev, { id: Date.now().toString(), time, date: dateStr, available: false }]);
  }, [selectedDate]);

  // ✅ Derived values
  const todaysBookings = useMemo(() => bookings.filter(b => new Date(b.date).toDateString() === new Date().toDateString()), [bookings]);
  const upcomingBookings = useMemo(() => bookings.filter(b => new Date(b.date) > new Date()), [bookings]);
  const totalRevenue = useMemo(() => bookings.reduce((sum, b) => sum + b.amount, 0), [bookings]);
  const totalAdvanceReceived = useMemo(() => bookings.reduce((sum, b) => sum + b.advancePaid, 0), [bookings]);
  const pendingAmount = totalRevenue - totalAdvanceReceived;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500 text-white';
      case 'pending': return 'bg-yellow-500 text-white';
      case 'completed': return 'bg-blue-500 text-white';
      case 'cancelled': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  // ✅ Conditional views
  if (currentView === 'revenue') return <RevenueDetails onBack={() => setCurrentView('dashboard')} totalRevenue={totalRevenue} totalAdvanceReceived={totalAdvanceReceived} pendingAmount={pendingAmount} />;
  if (currentView === 'bookings') return <BookingsDetails onBack={() => setCurrentView('dashboard')} totalBookings={bookings.length} bookings={bookings} />;
  if (currentView === 'advance') return <AdvancePaymentDetails onBack={() => setCurrentView('dashboard')} totalAdvanceReceived={totalAdvanceReceived} pendingAmount={pendingAmount} />;
  if (currentView === 'todaysEvents') return <TodaysEventsDetails onBack={() => setCurrentView('dashboard')} todaysBookings={todaysBookings} upcomingBookings={upcomingBookings} />;

  // ✅ Default dashboard UI rendering
  return (
    <div className="relative">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-3">
            <Crown className="h-12 w-12 text-[var(--royal-gold)] fill-current" />
            <span className="text-3xl text-[var(--royal-gold)]">EventHub</span>
            <Badge className="bg-gradient-to-r from-[var(--royal-gold)] to-[var(--royal-orange)] text-white border-2 border-white">
              Royal Vendor
            </Badge>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-[var(--royal-cream)]">Welcome, {user.name}</span>
            {onNavigateToManageServices && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onNavigateToManageServices}
                  className="bg-white/10 text-black border-2 border-[var(--royal-gold)] hover:bg-[var(--royal-gold)]"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Services
                </Button>
              </motion.div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onLogout}
              className="bg-[var(--royal-cream)] text-[var(--royal-maroon)] border-2 border-[var(--royal-gold)] hover:bg-[var(--royal-gold)] hover:text-white"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Dashboard */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Manual Booking */}
        {/* <ManualBooking onAddBooking={handleAddBooking} /> */}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 mt-6">
          {[
            {
              title: 'Total Revenue',
              value: dashboardData.overallRevenue,
              icon: DollarSign,
              color: 'from-green-500 to-emerald-600',
              trend: '+12.5%',
              trendUp: true,
              prefix: '₹',
              // onClick: () => setCurrentView('revenue')
            },
            {
              title: 'Total Bookings',
              value: dashboardData.totalBookingsCount,
              icon: CalendarIcon,
              color: 'from-blue-500 to-indigo-600',
              // trend: `+${upcomingBookings.length} upcoming`,
              // trendUp: true,
              // onClick: () => setCurrentView('bookings')
            },
            {
              title: 'Advance Received',
              value: dashboardData.advanceReceived,
              icon: DollarSign,
              color: 'from-orange-500 to-amber-600',
              // trend: `₹${pendingAmount.toLocaleString()} pending`,
              // trendUp: false,
              // prefix: '₹',
              // onClick: () => setCurrentView('advance')
            },
            {
              title: "Today's Events",
              value: todaysBookings.length,
              icon: Users,
              color: 'from-purple-500 to-pink-600',
              trend: `${dashboardData.upcomingEventsCount} upcoming`,
              trendUp: true,
              // onClick: () => setCurrentView('todaysEvents')
            }
          ].map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.03, y: -5 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card
                className="border-4 border-[var(--royal-gold)]/20 hover:border-[var(--royal-gold)] shadow-xl bg-white transition-all duration-300 overflow-hidden cursor-pointer"
                onClick={stat.onClick}
              >
                <div
                  className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-10 rounded-bl-full"
                  style={{ backgroundImage: `linear-gradient(135deg, var(--royal-gold), var(--royal-maroon))` }}
                />
                <CardContent className="p-6 relative">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">{stat.title}</p>
                      <p className="text-3xl text-[var(--royal-maroon)]">
                        <AnimatedCounter value={stat.value} prefix={stat.prefix} />
                      </p>
                    </div>
                    <div className={`p-4 bg-gradient-to-r ${stat.color} rounded-2xl shadow-lg`}>
                      <stat.icon className="h-7 w-7 text-white" />
                    </div>
                  </div>
                  {/* <div className="flex items-center mt-3">
                    {stat.trendUp ? (
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <Clock className="h-4 w-4 text-orange-500 mr-1" />
                    )}
                    <span className={`text-sm ${stat.trendUp ? 'text-green-600' : 'text-orange-600'}`}>
                      {stat.trend}
                    </span>
                  </div> */}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Tabs defaultValue="bookings" className="space-y-6">
          <div>
            <TabsList className="grid w-full lg:w-auto grid-cols-4 bg-white border-2 border-[var(--royal-gold)]/30">
              <TabsTrigger
                value="bookings"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[var(--royal-maroon)] data-[state=active]:to-[var(--royal-copper)] data-[state=active]:text-white"
              >
                Bookings
              </TabsTrigger>

              <TabsTrigger
                value="availability"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[var(--royal-maroon)] data-[state=active]:to-[var(--royal-copper)] data-[state=active]:text-white"
              >
                Availability
              </TabsTrigger>
              <TabsTrigger
                value="profile"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[var(--royal-maroon)] data-[state=active]:to-[var(--royal-copper)] data-[state=active]:text-white"
              >
                Profile
              </TabsTrigger>
            </TabsList>
          </div>

          {/* --- BOOKINGS TAB --- */}
          <TabsContent value="bookings" className="space-y-6">
            <div>
              <Card className="border-4 border-[var(--royal-gold)]/30 shadow-xl bg-white">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-[var(--royal-maroon)] flex items-center">
                        <CalendarIcon className="h-6 w-6 mr-2" />
                        Royal Bookings
                      </CardTitle>
                      <CardDescription>Manage your wedding event bookings</CardDescription>
                    </div>
                    <ManualBooking onAddBooking={handleAddBooking} />
                  </div>
                </CardHeader>
                <CardContent>

                  {/* --- Bookings List --- */}
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[var(--royal-gold)] scrollbar-track-[var(--royal-cream)]">
                    {bookings.map((booking) => {
                      const isExpanded = expandedBookingId === booking.id;
                      const pendingPayment = booking.amount - booking.advancePaid;

                      return (
                        <motion.div
                          key={booking.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -100 }}
                        >
                          {/* Booking Card */}
                          <Card className="border-2 border-[var(--royal-gold)]/20 hover:border-[var(--royal-gold)] transition-all duration-300 bg-gradient-to-r from-white to-amber-50/30 overflow-hidden">
                            <CardContent className="p-6">
                              {/* Main Content */}
                              <div
                                className="flex items-start justify-between cursor-pointer"
                                onClick={() => toggleBookingExpansion(booking.id)}
                              >
                                <div className="space-y-2 flex-1">
                                  <div className="flex items-center space-x-3">
                                    <h3 className="text-lg text-[var(--royal-maroon)]">{booking.eventHolderNames}</h3>
                                    <Badge className={getStatusColor(booking.status)}>
                                      {booking.status}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                                    <div className="flex items-center">
                                      <CalendarIcon className="h-4 w-4 mr-1" />
                                      <span>{new Date(booking.date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center">
                                      <Clock className="h-4 w-4 mr-1" />
                                      <span>{booking.time}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-4 text-sm">
                                    <div className="flex items-center text-gray-600">
                                      <Phone className="h-4 w-4 mr-1" />
                                      <span>{booking.phone}</span>
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                      <Mail className="h-4 w-4 mr-1" />
                                      <span>{booking.paymentStatus === "manual" ? booking.email : booking.customerEmail}</span>
                                      {/* {console.log(booking.paymentStatus)} */}
                                    </div>
                                  </div>
                                </div>

                                <div className="text-right space-y-1 flex flex-col items-end">
                                  <p className="text-sm text-gray-600">Total Amount</p>
                                  <p className="text-2xl text-[var(--royal-maroon)]">₹{booking.total.toLocaleString()}</p>
                                  <p className="text-sm text-[var(--royal-gold)]">
                                    Advance: ₹{booking.paid.toLocaleString()}
                                  </p>
                                  <motion.div
                                    animate={{ rotate: isExpanded ? 180 : 0 }}
                                    transition={{ duration: 0.3 }}
                                  >
                                    <ChevronDown className="h-5 w-5 text-[var(--royal-maroon)] mt-2" />
                                  </motion.div>
                                </div>
                              </div>

                              {/* Expanded Details */}
                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="overflow-hidden pt-4"
                                  >
                                    {/* --- Expanded Details Section --- */}
                                    {/* <div className="flex items-center justify-between border-t pt-4"> */}


                                    {/* --- Cancel Booking Button --- */}
                                    <button
                                      onClick={() => handleCancelBooking(booking.id)}
                                      className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-all duration-300"
                                    >
                                      Cancel Booking
                                    </button>

                                    {/* </div> */}
                                  </motion.div>
                                )}
                              </AnimatePresence>

                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <VendorAvailability vendorId={profileId} />

          <TabsContent value="profile" className="space-y-6">
            <Card className="border-4 border-[var(--royal-gold)]/30 shadow-xl bg-white">
<div className="flex flex-col items-center">
  <div className="relative">
    <img
      src={profilePhoto}
      className="w-24 h-24 rounded-full object-cover border-4 border-[var(--royal-gold)] shadow-lg"
    />

    {/* Upload button overlay */}
    <label className="absolute bottom-0 right-0 bg-[var(--royal-gold)] text-white p-1 rounded-full cursor-pointer">
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handlePhotoUpload}
      />
      <UploadIcon size={16} />
    </label>
  </div>
</div>



              <CardContent className="space-y-6">
                {/* Avatar & Info */}
                <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
                  {/* <motion.div
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="w-24 h-24 rounded-full bg-gradient-to-r from-[var(--royal-maroon)] to-[var(--royal-copper)] flex items-center justify-center"
                  >
                    <Crown className="h-12 w-12 text-[var(--royal-gold)] fill-current" />
                  </motion.div> */}
                  <div>
                    <h3 className="text-2xl text-[var(--royal-maroon)]">{user.name}</h3>
                    <p className="text-gray-600">{user.email}</p>
                    <div className="flex items-center mt-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-[var(--royal-gold)] fill-current" />
                      ))}
                      <span className="ml-2 text-sm text-gray-600">(4.9 rating)</span>
                    </div>
                  </div>
                </div>

                {/* Stats Counters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[var(--royal-gold)]/20">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Events</p>
                    <p className="text-2xl text-[var(--royal-maroon)]">
                      <AnimatedCounter value={dashboardData.totalBookingsCount} />
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Years Experience</p>
                    <p className="text-2xl text-[var(--royal-maroon)]">
                      <AnimatedCounter value={2} />
                    </p>
                  </div>
                  
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div >
  );
}