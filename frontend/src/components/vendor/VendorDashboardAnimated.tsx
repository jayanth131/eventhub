import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Calendar } from '../ui/calendar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Switch } from '../ui/switch';
import { 
  Heart, Calendar as CalendarIcon, TrendingUp, TrendingDown, 
  Users, DollarSign, Clock, Phone, Mail, LogOut, Settings, Crown, Sparkles, Star,
  ChevronDown, ChevronUp, XCircle, MapPin, Info
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import ManualBooking from './ManualBooking';
import { toast } from 'sonner@2.0.3';
import RevenueDetails from './RevenueDetails';
import BookingsDetails from './BookingsDetails';
import AdvancePaymentDetails from './AdvancePaymentDetails';
import TodaysEventsDetails from './TodaysEventsDetails';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'vendor';
}

interface VendorDashboardProps {
  user: User;
  onLogout: () => void;
  onNavigateToManageServices?: () => void;
}

interface Booking {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  date: string;
  time: string;
  amount: number;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  advancePaid: number;
}

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  date: string;
}

const mockBookings: Booking[] = [
  {
    id: 'WB001',
    customerName: 'Rahul & Priya',
    customerPhone: '+91 98765 43210',
    customerEmail: 'rahul.priya@example.com',
    date: '2025-10-15',
    time: '10:00 AM - 2:00 PM',
    amount: 50000,
    status: 'confirmed',
    advancePaid: 12500
  },
  {
    id: 'WB002',
    customerName: 'Arjun & Meera',
    customerPhone: '+91 98765 43211',
    customerEmail: 'arjun.meera@example.com',
    date: '2025-10-20',
    time: '8:00 PM - 12:00 AM',
    amount: 70000,
    status: 'pending',
    advancePaid: 17500
  },
  {
    id: 'WB003',
    customerName: 'Vikram & Shweta',
    customerPhone: '+91 98765 43212',
    customerEmail: 'vikram.shweta@example.com',
    date: '2025-09-28',
    time: '3:00 PM - 7:00 PM',
    amount: 60000,
    status: 'completed',
    advancePaid: 60000
  }
];

const revenueData = [
  { month: 'Jan', revenue: 45000, bookings: 8 },
  { month: 'Feb', revenue: 52000, bookings: 10 },
  { month: 'Mar', revenue: 48000, bookings: 9 },
  { month: 'Apr', revenue: 61000, bookings: 12 },
  { month: 'May', revenue: 55000, bookings: 11 },
  { month: 'Jun', revenue: 67000, bookings: 13 },
  { month: 'Jul', revenue: 73000, bookings: 15 },
  { month: 'Aug', revenue: 68000, bookings: 14 },
  { month: 'Sep', revenue: 75000, bookings: 16 },
  { month: 'Oct', revenue: 42000, bookings: 8 }
];

const categoryData = [
  { name: 'Wedding Ceremonies', value: 40, color: 'var(--royal-maroon)' },
  { name: 'Reception Parties', value: 35, color: 'var(--royal-gold)' },
  { name: 'Pre-wedding Events', value: 15, color: 'var(--royal-orange)' },
  { name: 'Corporate Events', value: 10, color: 'var(--royal-emerald)' }
];

// Counter animation component - simplified to prevent infinite loops
const AnimatedCounter = ({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  React.useEffect(() => {
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
  }, []); // Empty deps - only run once on mount

  return (
    <span>{prefix}{(hasAnimated ? value : count).toLocaleString()}{suffix}</span>
  );
};

export default function VendorDashboard({ user, onLogout, onNavigateToManageServices }: VendorDashboardProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'revenue' | 'bookings' | 'advance' | 'todaysEvents'>('dashboard');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
    { id: '1', time: '10:00 AM - 2:00 PM', available: true, date: '2025-10-15' },
    { id: '2', time: '3:00 PM - 7:00 PM', available: false, date: '2025-10-15' },
    { id: '3', time: '8:00 PM - 12:00 AM', available: true, date: '2025-10-15' },
    { id: '4', time: '10:00 AM - 2:00 PM', available: true, date: '2025-10-20' },
    { id: '5', time: '3:00 PM - 7:00 PM', available: true, date: '2025-10-20' },
    { id: '6', time: '8:00 PM - 12:00 AM', available: false, date: '2025-10-20' },
    { id: '7', time: '10:00 AM - 2:00 PM', available: false, date: '2025-09-28' },
    { id: '8', time: '3:00 PM - 7:00 PM', available: true, date: '2025-09-28' },
  ]);

  const todaysBookings = React.useMemo(() => 
    bookings.filter(booking => 
      new Date(booking.date).toDateString() === new Date().toDateString()
    ), [bookings]
  );

  const upcomingBookings = React.useMemo(() => 
    bookings.filter(booking => 
      new Date(booking.date) > new Date()
    ), [bookings]
  );

  const totalRevenue = React.useMemo(() => 
    bookings.reduce((sum, booking) => sum + booking.amount, 0), [bookings]
  );
  
  const totalAdvanceReceived = React.useMemo(() => 
    bookings.reduce((sum, booking) => sum + booking.advancePaid, 0), [bookings]
  );
  
  const pendingAmount = totalRevenue - totalAdvanceReceived;

  const handleAddBooking = (newBooking: Booking) => {
    setBookings(prev => [newBooking, ...prev]);
    
    // Also mark the time slot as unavailable for that date
    const existingSlot = timeSlots.find(
      slot => slot.date === newBooking.date && slot.time === newBooking.time
    );
    
    if (existingSlot) {
      setTimeSlots(prev => prev.map(slot => 
        slot.id === existingSlot.id ? { ...slot, available: false } : slot
      ));
    } else {
      // Create a new slot if it doesn't exist
      const newSlot: TimeSlot = {
        id: Date.now().toString(),
        time: newBooking.time,
        available: false,
        date: newBooking.date
      };
      setTimeSlots(prev => [...prev, newSlot]);
    }
  };

  const toggleSlotAvailability = (slotId: string) => {
    setTimeSlots(prev => prev.map(slot => 
      slot.id === slotId ? { ...slot, available: !slot.available } : slot
    ));
  };

  const handleCancelBooking = (bookingId: string) => {
    // Find the booking to free up its time slot
    const cancelledBooking = bookings.find(b => b.id === bookingId);
    
    setBookings(prev => prev.filter(booking => booking.id !== bookingId));
    
    if (cancelledBooking) {
      setTimeSlots(prev => prev.map(slot => 
        slot.date === cancelledBooking.date && slot.time === cancelledBooking.time
          ? { ...slot, available: true }
          : slot
      ));
      
      toast.success('Booking Cancelled', {
        description: `Booking ${bookingId} for ${cancelledBooking.customerName} has been cancelled successfully. The time slot is now available.`
      });
    }
    
    setExpandedBookingId(null);
  };

  const toggleBookingExpansion = (bookingId: string) => {
    setExpandedBookingId(prev => prev === bookingId ? null : bookingId);
  };

  // Get time slots for the selected date - memoized
  const currentDateSlots = React.useMemo(() => {
    if (!selectedDate) return [];
    const dateStr = selectedDate.toISOString().split('T')[0];
    return timeSlots.filter(slot => slot.date === dateStr);
  }, [selectedDate, timeSlots]);

  // Create a map of dates with bookings for efficient lookup - memoized
  const bookedDatesSet = React.useMemo(() => {
    const dates = new Set<string>();
    timeSlots.forEach(slot => {
      if (!slot.available) {
        dates.add(slot.date);
      }
    });
    return dates;
  }, [timeSlots]);

  // Check if a date has bookings - optimized with Set lookup
  const hasBookingsOnDate = React.useCallback((date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return bookedDatesSet.has(dateStr);
  }, [bookedDatesSet]);

  // Add a new time slot for the selected date
  const addTimeSlot = React.useCallback((time: string) => {
    if (!selectedDate) return;
    const dateStr = selectedDate.toISOString().split('T')[0];
    const newSlot: TimeSlot = {
      id: Date.now().toString(),
      time,
      available: false, // Mark as booked for offline bookings
      date: dateStr
    };
    setTimeSlots(prev => [...prev, newSlot]);
  }, [selectedDate]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500 text-white';
      case 'pending': return 'bg-yellow-500 text-white';
      case 'completed': return 'bg-blue-500 text-white';
      case 'cancelled': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  // Handle detail page navigation
  if (currentView === 'revenue') {
    return (
      <RevenueDetails
        onBack={() => setCurrentView('dashboard')}
        totalRevenue={totalRevenue}
        totalAdvanceReceived={totalAdvanceReceived}
        pendingAmount={pendingAmount}
      />
    );
  }

  if (currentView === 'bookings') {
    return (
      <BookingsDetails
        onBack={() => setCurrentView('dashboard')}
        totalBookings={bookings.length}
        bookings={bookings}
      />
    );
  }

  if (currentView === 'advance') {
    return (
      <AdvancePaymentDetails
        onBack={() => setCurrentView('dashboard')}
        totalAdvanceReceived={totalAdvanceReceived}
        pendingAmount={pendingAmount}
      />
    );
  }

  if (currentView === 'todaysEvents') {
    return (
      <TodaysEventsDetails
        onBack={() => setCurrentView('dashboard')}
        todaysBookings={todaysBookings}
        upcomingBookings={upcomingBookings}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--royal-cream)] via-amber-50 to-orange-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-20 right-10 w-40 h-40 bg-[var(--royal-maroon)] rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-60 h-60 bg-[var(--royal-gold)] rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="bg-gradient-to-r from-[var(--royal-maroon)] to-[var(--royal-copper)] border-b-4 border-[var(--royal-gold)] sticky top-0 z-50 shadow-2xl">
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
                    className="bg-white/10 text-white border-2 border-[var(--royal-gold)] hover:bg-[var(--royal-gold)]"
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
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: 'Total Revenue',
              value: totalRevenue,
              icon: DollarSign,
              color: 'from-green-500 to-emerald-600',
              trend: '+12.5%',
              trendUp: true,
              prefix: '₹',
              onClick: () => setCurrentView('revenue')
            },
            {
              title: 'Total Bookings',
              value: bookings.length,
              icon: CalendarIcon,
              color: 'from-blue-500 to-indigo-600',
              trend: '+8 new',
              trendUp: true,
              onClick: () => setCurrentView('bookings')
            },
            {
              title: 'Advance Received',
              value: totalAdvanceReceived,
              icon: DollarSign,
              color: 'from-orange-500 to-amber-600',
              trend: `₹${pendingAmount.toLocaleString()} pending`,
              trendUp: false,
              prefix: '₹',
              onClick: () => setCurrentView('advance')
            },
            {
              title: "Today's Events",
              value: todaysBookings.length,
              icon: Users,
              color: 'from-purple-500 to-pink-600',
              trend: `${upcomingBookings.length} upcoming`,
              trendUp: true,
              onClick: () => setCurrentView('todaysEvents')
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
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-10 rounded-bl-full" style={{
                  backgroundImage: `linear-gradient(135deg, var(--royal-gold), var(--royal-maroon))`
                }} />
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
                  <div className="flex items-center mt-3">
                    {stat.trendUp ? (
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <Clock className="h-4 w-4 text-orange-500 mr-1" />
                    )}
                    <span className={`text-sm ${stat.trendUp ? 'text-green-600' : 'text-orange-600'}`}>
                      {stat.trend}
                    </span>
                  </div>
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
                value="analytics"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[var(--royal-maroon)] data-[state=active]:to-[var(--royal-copper)] data-[state=active]:text-white"
              >
                Analytics
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
                          <Card className="border-2 border-[var(--royal-gold)]/20 hover:border-[var(--royal-gold)] transition-all duration-300 bg-gradient-to-r from-white to-amber-50/30 overflow-hidden">
                            <CardContent className="p-6">
                              {/* Main Content - Always Visible */}
                              <div 
                                className="flex items-start justify-between cursor-pointer"
                                onClick={() => toggleBookingExpansion(booking.id)}
                              >
                                <div className="space-y-2 flex-1">
                                  <div className="flex items-center space-x-3">
                                    <h3 className="text-lg text-[var(--royal-maroon)]">{booking.customerName}</h3>
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
                                      <span>{booking.customerPhone}</span>
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                      <Mail className="h-4 w-4 mr-1" />
                                      <span>{booking.customerEmail}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right space-y-1 flex flex-col items-end">
                                  <p className="text-sm text-gray-600">Total Amount</p>
                                  <p className="text-2xl text-[var(--royal-maroon)]">₹{booking.amount.toLocaleString()}</p>
                                  <p className="text-sm text-[var(--royal-gold)]">
                                    Advance: ₹{booking.advancePaid.toLocaleString()}
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
                                    className="overflow-hidden"
                                  >
                                    <div className="mt-6 pt-6 border-t-2 border-[var(--royal-gold)]/20 space-y-4">
                                      {/* Full Details Section */}
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Payment Details */}
                                        <div className="space-y-3 bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border-2 border-green-200">
                                          <h4 className="text-sm text-gray-700 flex items-center">
                                            <DollarSign className="h-4 w-4 mr-2 text-green-600" />
                                            Payment Details
                                          </h4>
                                          <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                              <span className="text-gray-600">Total Amount:</span>
                                              <span className="text-green-700">₹{booking.amount.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-gray-600">Advance Paid:</span>
                                              <span className="text-green-700">₹{booking.advancePaid.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between pt-2 border-t border-green-300">
                                              <span className="text-gray-700">Pending:</span>
                                              <span className="text-orange-600">₹{pendingPayment.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-gray-600">Payment Status:</span>
                                              <Badge className={pendingPayment === 0 ? 'bg-green-500' : 'bg-orange-500'}>
                                                {pendingPayment === 0 ? 'Fully Paid' : 'Partial'}
                                              </Badge>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Booking Details */}
                                        <div className="space-y-3 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border-2 border-blue-200">
                                          <h4 className="text-sm text-gray-700 flex items-center">
                                            <Info className="h-4 w-4 mr-2 text-blue-600" />
                                            Booking Information
                                          </h4>
                                          <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                              <span className="text-gray-600">Booking ID:</span>
                                              <span className="text-blue-700">{booking.id}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-gray-600">Event Date:</span>
                                              <span className="text-blue-700">
                                                {new Date(booking.date).toLocaleDateString('en-IN', {
                                                  weekday: 'long',
                                                  year: 'numeric',
                                                  month: 'long',
                                                  day: 'numeric'
                                                })}
                                              </span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-gray-600">Time Slot:</span>
                                              <span className="text-blue-700">{booking.time}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-gray-600">Status:</span>
                                              <Badge className={getStatusColor(booking.status)}>
                                                {booking.status.toUpperCase()}
                                              </Badge>
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Customer Contact Information */}
                                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border-2 border-purple-200">
                                        <h4 className="text-sm text-gray-700 flex items-center mb-3">
                                          <Users className="h-4 w-4 mr-2 text-purple-600" />
                                          Customer Contact Details
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                          <div className="flex items-center space-x-2">
                                            <Phone className="h-4 w-4 text-purple-600" />
                                            <span className="text-gray-700">{booking.customerPhone}</span>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            <Mail className="h-4 w-4 text-purple-600" />
                                            <span className="text-gray-700">{booking.customerEmail}</span>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            <Users className="h-4 w-4 text-purple-600" />
                                            <span className="text-gray-700">{booking.customerName}</span>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Action Buttons */}
                                      <div className="flex justify-end gap-3 pt-4">
                                        <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                            <Button 
                                              variant="destructive"
                                              className="bg-red-500 hover:bg-red-600"
                                              onClick={(e) => e.stopPropagation()}
                                            >
                                              <XCircle className="h-4 w-4 mr-2" />
                                              Cancel Booking
                                            </Button>
                                          </AlertDialogTrigger>
                                          <AlertDialogContent className="border-4 border-[var(--royal-gold)]/30">
                                            <AlertDialogHeader>
                                              <AlertDialogTitle className="text-[var(--royal-maroon)]">
                                                Cancel Booking - {booking.id}
                                              </AlertDialogTitle>
                                              <AlertDialogDescription>
                                                Are you sure you want to cancel this booking for <strong>{booking.customerName}</strong>?
                                                This action cannot be undone. The time slot will be freed up for new bookings.
                                              </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                              <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                                              <AlertDialogAction
                                                onClick={() => handleCancelBooking(booking.id)}
                                                className="bg-red-500 hover:bg-red-600"
                                              >
                                                Yes, Cancel Booking
                                              </AlertDialogAction>
                                            </AlertDialogFooter>
                                          </AlertDialogContent>
                                        </AlertDialog>
                                      </div>
                                    </div>
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

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <Card className="border-4 border-[var(--royal-gold)]/30 shadow-xl bg-white">
                  <CardHeader>
                    <CardTitle className="text-[var(--royal-maroon)]">Revenue Trends</CardTitle>
                    <CardDescription>Monthly revenue performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={revenueData}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--royal-maroon)" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="var(--royal-gold)" stopOpacity={0.2}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="revenue" stroke="var(--royal-maroon)" fillOpacity={1} fill="url(#colorRevenue)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card className="border-4 border-[var(--royal-gold)]/30 shadow-xl bg-white">
                  <CardHeader>
                    <CardTitle className="text-[var(--royal-maroon)]">Event Distribution</CardTitle>
                    <CardDescription>Breakdown by event type</CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="availability" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <Card className="border-4 border-[var(--royal-gold)]/30 shadow-xl bg-white">
                  <CardHeader>
                    <CardTitle className="text-[var(--royal-maroon)] flex items-center">
                      <CalendarIcon className="h-6 w-6 mr-2" />
                      Select Date
                    </CardTitle>
                    <CardDescription>Choose a date to manage availability</CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    <div className="w-full flex justify-center">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        className="rounded-xl border-2 border-[var(--royal-gold)]/20"
                      />
                    </div>
                  </CardContent>
                  <div className="px-6 pb-6">
                    <div className="flex items-center justify-around p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border-2 border-[var(--royal-gold)]/20">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded-full bg-[var(--royal-maroon)]"></div>
                        <span className="text-sm text-gray-600">Has Bookings</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
                        <span className="text-sm text-gray-600">No Bookings</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              <div>
                <Card className="border-4 border-[var(--royal-gold)]/30 shadow-xl bg-white">
                  <CardHeader>
                    <CardTitle className="text-[var(--royal-maroon)] flex items-center justify-between">
                      <div className="flex items-center">
                        <Clock className="h-6 w-6 mr-2" />
                        Time Slots
                      </div>
                      {selectedDate && (
                        <span className="text-sm text-gray-600">
                          {selectedDate.toLocaleDateString('en-IN', { 
                            weekday: 'short', 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription>Manage slots for the selected date</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedDate ? (
                      <>
                        {currentDateSlots.length > 0 ? (
                          currentDateSlots.map((slot) => (
                            <div
                              key={slot.id}
                              className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                                slot.available
                                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 hover:border-green-500'
                                  : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-300 hover:border-red-500 opacity-75'
                              }`}
                            >
                              <div className="flex items-center space-x-4">
                                <Clock className={`h-5 w-5 ${slot.available ? 'text-green-600' : 'text-red-600'}`} />
                                <div>
                                  <p className={`${slot.available ? 'text-green-900' : 'text-red-900'}`}>
                                    {slot.time}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {slot.available ? 'Available for booking' : 'Offline booking'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-3">
                                <Badge className={slot.available ? 'bg-green-500' : 'bg-red-500'}>
                                  {slot.available ? 'Available' : 'Booked'}
                                </Badge>
                                <Switch
                                  checked={slot.available}
                                  onCheckedChange={() => toggleSlotAvailability(slot.id)}
                                />
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 space-y-4">
                            <div className="flex justify-center">
                              <div>
                                <CalendarIcon className="h-16 w-16 text-gray-300" />
                              </div>
                            </div>
                            <p className="text-gray-500">No time slots configured for this date</p>
                            <div className="space-y-2">
                              <p className="text-sm text-gray-600">Quick add common slots:</p>
                              <div className="flex flex-wrap gap-2 justify-center">
                                {['10:00 AM - 2:00 PM', '3:00 PM - 7:00 PM', '8:00 PM - 12:00 AM'].map((time) => (
                                  <Button
                                    key={time}
                                    size="sm"
                                    variant="outline"
                                    onClick={() => addTimeSlot(time)}
                                    className="border-2 border-[var(--royal-gold)]/20 hover:border-[var(--royal-gold)] hover:bg-[var(--royal-gold)]/10"
                                  >
                                    Mark {time} as Booked
                                  </Button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {currentDateSlots.length > 0 && (
                          <div className="pt-4 border-t border-[var(--royal-gold)]/20">
                            <p className="text-sm text-gray-600 mb-3">Add offline booking for other times:</p>
                            <div className="flex flex-wrap gap-2">
                              {['10:00 AM - 2:00 PM', '3:00 PM - 7:00 PM', '8:00 PM - 12:00 AM', '6:00 AM - 10:00 AM'].map((time) => {
                                const slotExists = currentDateSlots.some(s => s.time === time);
                                if (slotExists) return null;
                                return (
                                  <Button
                                    key={time}
                                    size="sm"
                                    variant="outline"
                                    onClick={() => addTimeSlot(time)}
                                    className="border-2 border-[var(--royal-gold)]/20 hover:border-[var(--royal-gold)] hover:bg-[var(--royal-gold)]/10"
                                  >
                                    + {time}
                                  </Button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-12">
                        <Sparkles className="h-12 w-12 text-[var(--royal-gold)] mx-auto mb-4" />
                        <p className="text-gray-500">Select a date from the calendar to view and manage time slots</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <div>
              <Card className="border-4 border-[var(--royal-gold)]/30 shadow-xl bg-white">
                <CardHeader>
                  <CardTitle className="text-[var(--royal-maroon)] flex items-center">
                    <Crown className="h-6 w-6 mr-2 text-[var(--royal-gold)]" />
                    Royal Vendor Profile
                  </CardTitle>
                  <CardDescription>Your premium wedding service details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-6">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      className="w-24 h-24 rounded-full bg-gradient-to-r from-[var(--royal-maroon)] to-[var(--royal-copper)] flex items-center justify-center"
                    >
                      <Crown className="h-12 w-12 text-[var(--royal-gold)] fill-current" />
                    </motion.div>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[var(--royal-gold)]/20">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Events</p>
                      <p className="text-2xl text-[var(--royal-maroon)]">
                        <AnimatedCounter value={156} />
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Years Experience</p>
                      <p className="text-2xl text-[var(--royal-maroon)]">
                        <AnimatedCounter value={8} />
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Customer Satisfaction</p>
                      <p className="text-2xl text-[var(--royal-maroon)]">
                        <AnimatedCounter value={98} suffix="%" />
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Repeat Customers</p>
                      <p className="text-2xl text-[var(--royal-maroon)]">
                        <AnimatedCounter value={45} suffix="%" />
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
