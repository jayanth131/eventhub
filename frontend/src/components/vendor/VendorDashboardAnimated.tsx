import React, { useState, useEffect, useMemo, useCallback } from 'react';
// import { toast } from 'sonner@2.0.3';
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
// import ManualBooking from './ManualBooking';
import { toast } from 'sonner@2.0.3';
import { fetchVendorDashboardSummary, fetchCustomerBookings, submitBooking } from '../services/vendorsummaryservices.js';
import RevenueDetails from './RevenueDetails';
import BookingsDetails from './BookingsDetails';
import AdvancePaymentDetails from './AdvancePaymentDetails';
import TodaysEventsDetails from './TodaysEventsDetails';
import ManualBooking from './ManualBooking';

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

interface VendorDashboardProps {
  user: { id: string; name: string; email: string; role: 'vendor' | 'customer' };
  onLogout: () => void;
  onNavigateToManageServices?: () => void;
}

export default function VendorDashboard({ user, onLogout, onNavigateToManageServices }: VendorDashboardProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [dashboardData, setDashboardData] = useState<any>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'revenue' | 'bookings' | 'advance' | 'todaysEvents'>('dashboard');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

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
        console.log('Fetched Dashboard Data:', summary);
        console.log('Fetched overall:', dashboardData.overallRevenue);

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

      // TODO: integrate cancel API call here if backend supports

      setBookings(prev => prev.filter(b => b.id !== bookingId));

      setTimeSlots(prev =>
        prev.map(slot =>
          slot.date === cancelledBooking.date && slot.time === cancelledBooking.time
            ? { ...slot, available: true }
            : slot
        )
      );

      toast.success('Booking Cancelled', {
        description: `Booking ${bookingId} for ${cancelledBooking.customerName} has been cancelled. Time slot is now available.`,
      });

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

      {/* Main Dashboard */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Manual Booking */}
        <ManualBooking onAddBooking={handleAddBooking} />

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
              onClick: () => setCurrentView('revenue')
            },
            {
              title: 'Total Bookings',
              value: dashboardData.totalBookingsCount,
              icon: CalendarIcon,
              color: 'from-blue-500 to-indigo-600',
              // trend: `+${upcomingBookings.length} upcoming`,
              // trendUp: true,
              onClick: () => setCurrentView('bookings')
            },
            {
              title: 'Advance Received',
              value: dashboardData.advanceReceived,
              icon: DollarSign,
              color: 'from-orange-500 to-amber-600',
              // trend: `₹${pendingAmount.toLocaleString()} pending`,
              // trendUp: false,
              // prefix: '₹',
              onClick: () => setCurrentView('advance')
            },
            {
              title: "Today's Events",
              value: todaysBookings.length,
              icon: Users,
              color: 'from-purple-500 to-pink-600',
              trend: `${dashboardData.upcomingEventsCount} upcoming`,
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
                  {/* --- Stats Cards for Dashboard ---
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
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
                  </div> */}

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
                                    className="overflow-hidden"
                                  >
                                    {/* Detailed Sections here */}
                                    {/* Payment / Booking Info / Customer Contact / Action Buttons */}
                                    {/* Same structure as your previous expanded content */}
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
            {/* Stats Counters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-4 border-[var(--royal-gold)]/30 shadow-xl bg-white">
                <CardContent className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Revenue</p>
                    <p className="text-3xl text-[var(--royal-maroon)]">
                      <AnimatedCounter value={totalRevenue} prefix="₹" />
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-[var(--royal-maroon)]" />
                </CardContent>
              </Card>

              <Card className="border-4 border-[var(--royal-gold)]/30 shadow-xl bg-white">
                <CardContent className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Bookings</p>
                    <p className="text-3xl text-[var(--royal-maroon)]">
                      <AnimatedCounter value={bookings.length} />
                    </p>
                  </div>
                  <CalendarIcon className="h-8 w-8 text-[var(--royal-maroon)]" />
                </CardContent>
              </Card>

              <Card className="border-4 border-[var(--royal-gold)]/30 shadow-xl bg-white">
                <CardContent className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Upcoming Events</p>
                    <p className="text-3xl text-[var(--royal-maroon)]">
                      <AnimatedCounter value={upcomingBookings.length} />
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-[var(--royal-maroon)]" />
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Trends */}
              <Card className="border-4 border-[var(--royal-gold)]/30 shadow-xl bg-white">
                <CardHeader>
                  <CardTitle className="text-[var(--royal-maroon)]">Revenue Trends</CardTitle>
                  <CardDescription>Monthly revenue performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={[]}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--royal-maroon)" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="var(--royal-gold)" stopOpacity={0.2} />
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

              {/* Event Distribution */}
              <Card className="border-4 border-[var(--royal-gold)]/30 shadow-xl bg-white">
                <CardHeader>
                  <CardTitle className="text-[var(--royal-maroon)]">Event Distribution</CardTitle>
                  <CardDescription>Breakdown by event type</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        dataKey="value"
                      >
                        {[].map((entry: any, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="availability" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Calendar Selection */}
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

              {/* Time Slots */}
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
                            className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${slot.available
                              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 hover:border-green-500'
                              : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-300 hover:border-red-500 opacity-75'
                              }`}
                          >
                            <div className="flex items-center space-x-4">
                              <Clock className={`h-5 w-5 ${slot.available ? 'text-green-600' : 'text-red-600'}`} />
                              <div>
                                <p className={`${slot.available ? 'text-green-900' : 'text-red-900'}`}>{slot.time}</p>
                                <p className="text-sm text-gray-600">
                                  {slot.available ? 'Available for booking' : 'Offline booking'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Badge className={slot.available ? 'bg-green-500' : 'bg-red-500'}>
                                {slot.available ? 'Available' : 'Booked'}
                              </Badge>
                              <Switch checked={!slot.available} onCheckedChange={() => {}} />
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 space-y-4">
                          <div className="flex justify-center">
                            <CalendarIcon className="h-16 w-16 text-gray-300" />
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
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card className="border-4 border-[var(--royal-gold)]/30 shadow-xl bg-white">
              <CardHeader>
                <CardTitle className="text-[var(--royal-maroon)] flex items-center">
                  <Crown className="h-6 w-6 mr-2 text-[var(--royal-gold)]" />
                  Royal Vendor Profile
                </CardTitle>
                <CardDescription>Your premium wedding service details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar & Info */}
                <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
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

                {/* Stats Counters */}
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
          </TabsContent>
        </Tabs>
      </div>
    </div >
  );
}