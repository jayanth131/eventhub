import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Changed from 'motion/react'
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  ArrowLeft, Crown, Sparkles, Calendar, Clock, MapPin, Phone, Mail,
  Star, CheckCircle, XCircle, AlertCircle, Download, MessageSquare,
  CreditCard, LogOut, Receipt, Heart
} from 'lucide-react';
// Assuming ImageWithFallback is defined elsewhere
// import { ImageWithFallback } from '../figma/ImageWithFallback'; 

// --- BACKEND SERVICE IMPORTS ---
import { fetchCustomerBookings } from '../services/vendorService';
// -----------------------------


interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'vendor';
}

interface MyBookingsProps {
  user: User;
  onNavigateHome: () => void;
  onLogout: () => void;
}

// Interface aligned with the transformed booking data from the backend (fetchCustomerBookings)
interface BookingRecord {
  id: string;
  bookingId: string; // The MongoDB ID
  vendorName: string;
  serviceCategory: string;
  vendorLocation: string;
  vendorImage: string;
  vendorEmail: string; // Fetched from User model linked to vendor
  date: string; // YYYY-MM-DD
  time: string;
  total: number; // totalCost
  paid: number; // advanceAmountPaid
  balance: number; // calculated balance
  status: 'confirmed' | 'completed' | 'canceled_customer' | 'canceled_vendor' | 'pending_vendor' | 'upcoming' | 'cancelled';
  location: string; // vendorLocation
  rating?: number;
  review?: string;
}

const AnimatedCounter = ({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) => {
  const [count, setCount] = useState(0);

  React.useEffect(() => {
    let start = 0;
    const end = value;
    const duration = 1500;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
};

export default function MyBookings({ user, onNavigateHome, onLogout }: MyBookingsProps) {
  const [selectedTab, setSelectedTab] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookings, setBookings] = useState<BookingRecord[]>([]); // API Data state

  // --- FETCH API DATA ---
  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCustomerBookings(); // API call to /api/bookings/me

      // Transform the backend status codes into frontend display statuses
      const mappedData = data.map((b: any) => ({
        ...b,
        id: b.bookingId,
        // vendorLocation: b.vendor.location,
        // vendorImage: b.vendorImage || 'https://placehold.co/400x250/8B0000/FFD700?text=Venue',
        // vendorName: b.vendor.vendorName,
        // vendorCategory: b.serviceCategory, // Use the service category stored in the booking record

        // Map backend status to frontend display status
        status: b.status === 'completed'
          ? 'completed'
          : b.status.includes('cancel')
            ? 'cancelled'
            : 'upcoming',

        total: b.total,
        paid: b.paid,
        balance: b.balance,
        Phone: b.vendorPhone,
      

      }));

      setBookings(mappedData);
      console.log("mapped data:", mappedData)
    } catch (err: any) {
      console.error("Failed to load customer bookings:", err);
      setError("Unable to load booking history. Please check your network or token.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);
  // --------------------

  const filteredBookings = React.useMemo(() => {
    const statusMap = {
      'upcoming': 'upcoming',
      'completed': 'completed',
      'cancelled': 'cancelled',
      'all': 'all'
    };
    const targetStatus = statusMap[selectedTab];

    return bookings.filter(b => targetStatus === 'all' || b.status === targetStatus);
  }, [bookings, selectedTab]);

  const upcomingCount = bookings.filter(b => b.status === 'upcoming').length;
  const completedCount = bookings.filter(b => b.status === 'completed').length;
  const cancelledCount = bookings.filter(b => b.status === 'cancelled').length; // Added cancelled count

  const totalSpent = bookings
    .filter(b => b.status !== 'cancelled') // Only count non-cancelled bookings towards total spent
    .reduce((sum, b) => sum + b.paid, 0); // Sum of advance paid

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'upcoming':
        return {
          color: 'bg-gradient-to-r from-blue-500 to-indigo-600',
          icon: Clock,
          text: 'Upcoming'
        };
      case 'completed':
        return {
          color: 'bg-gradient-to-r from-green-500 to-emerald-600',
          icon: CheckCircle,
          text: 'Completed'
        };
      case 'cancelled':
        return {
          color: 'bg-gradient-to-r from-red-500 to-rose-600',
          icon: XCircle,
          text: 'Cancelled'
        };
      default:
        return {
          color: 'bg-gradient-to-r from-gray-500 to-slate-600',
          icon: AlertCircle,
          text: 'Unknown'
        };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--royal-cream)] via-amber-50 to-orange-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <motion.div
          className="absolute top-20 right-10 w-40 h-40 bg-[var(--royal-maroon)] rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 left-10 w-60 h-60 bg-[var(--royal-gold)] rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 7, repeat: Infinity, delay: 1 }}
        />
      </div>

      {/* Header */}
      <motion.header
        className="bg-gradient-to-r from-[var(--royal-maroon)] to-[var(--royal-copper)] border-b-4 border-[var(--royal-gold)] sticky top-0 z-50 shadow-2xl"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onNavigateHome}
                  className="text-[var(--royal-cream)] hover:text-white hover:bg-white/10"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </motion.div>
              <div className="flex items-center space-x-3">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Crown className="h-10 w-10 text-[var(--royal-gold)] fill-current" />
                </motion.div>
                <span className="text-2xl text-[var(--royal-gold)]">EventHub</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-[var(--royal-cream)]">Welcome, {user.name}</span>
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
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-4 mb-2">
            <Sparkles className="h-10 w-10 text-[var(--royal-gold)]" />
            <h1 className="text-4xl text-[var(--royal-maroon)]">My Royal Bookings</h1>
          </div>
          <p className="text-gray-700 text-lg">Track and manage your wedding service bookings</p>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            {
              title: 'Upcoming Events',
              value: upcomingCount,
              icon: Calendar,
              color: 'from-blue-500 to-indigo-600',
            },
            {
              title: 'Completed',
              value: completedCount,
              icon: CheckCircle,
              color: 'from-green-500 to-emerald-600',
            },
            {
              title: 'Total Invested',
              value: totalSpent,
              icon: CreditCard,
              color: 'from-purple-500 to-pink-600',
              prefix: '₹',
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              <Card className="border-4 border-[var(--royal-gold)]/20 hover:border-[var(--royal-gold)] shadow-xl bg-white transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-10 rounded-bl-full" style={{
                  backgroundImage: `linear-gradient(135deg, var(--royal-gold), var(--royal-maroon))`
                }} />
                <CardContent className="p-6 relative">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">{stat.title}</p>
                      <motion.p
                        className="text-4xl text-[var(--royal-maroon)]"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, delay: 0.3 + index * 0.1 }}
                      >
                        <AnimatedCounter value={stat.value} prefix={stat.prefix} />
                      </motion.p>
                    </div>
                    <motion.div
                      className={`p-4 bg-gradient-to-r ${stat.color} rounded-2xl shadow-lg`}
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    >
                      <stat.icon className="h-8 w-8 text-white" />
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Bookings List */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="border-2 border-[var(--royal-gold)]/30 shadow-xl bg-white">
            <CardHeader>
              <CardTitle className="text-2xl text-[var(--royal-maroon)] flex items-center">
                <Receipt className="h-6 w-6 mr-2" />
                Booking History
              </CardTitle>
              <CardDescription>View all your past and upcoming wedding bookings</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as any)}>
                <TabsList className="grid w-full grid-cols-4 bg-[var(--royal-cream)] mb-6">
                  <TabsTrigger
                    value="all"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[var(--royal-maroon)] data-[state=active]:to-[var(--royal-copper)] data-[state=active]:text-white"
                  >
                    All ({bookings.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="upcoming"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
                  >
                    Upcoming ({upcomingCount})
                  </TabsTrigger>
                  <TabsTrigger
                    value="completed"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white"
                  >
                    Completed ({completedCount})
                  </TabsTrigger>
                  <TabsTrigger
                    value="cancelled"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-rose-600 data-[state=active]:text-white"
                  >
                    Cancelled ({cancelledCount})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value={selectedTab}>
                  <AnimatePresence mode="wait">
                    {loading ? (
                      <div className="text-center py-12">
                        <Crown className="h-10 w-10 mx-auto animate-spin text-[var(--royal-gold)]" />
                        <p className="mt-2 text-gray-600">Loading your bookings...</p>
                      </div>
                    ) : error ? (
                      <div className="text-center py-12 text-red-600 border border-red-300 bg-red-50 rounded-lg">
                        <XCircle className="h-10 w-10 mx-auto mb-2" />
                        <h3 className="text-xl mb-1">Error Loading Bookings</h3>
                        <p className="text-sm">{error}</p>
                      </div>
                    ) : filteredBookings.length === 0 ? (
                      <motion.div
                        key="no-bookings"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="text-center py-12"
                      >
                        <Crown className="h-16 w-16 text-[var(--royal-gold)] mx-auto opacity-50 mb-4" />
                        <h3 className="text-xl text-[var(--royal-maroon)] mb-2">No bookings found</h3>
                        <p className="text-gray-600">You don't have any {selectedTab !== 'all' ? selectedTab : ''} bookings yet.</p>
                      </motion.div>
                    ) : (
                      <div className="space-y-4">
                        {filteredBookings.map((booking, index) => {
                          const statusConfig = getStatusConfig(booking.status);
                          const StatusIcon = statusConfig.icon;

                          return (
                            <motion.div
                              key={booking.id}
                              initial={{ opacity: 0, x: -50 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 50 }}
                              transition={{ duration: 0.5, delay: index * 0.1 }}
                              layout
                            >
                              <motion.div
                                whileHover={{ y: -5, scale: 1.01 }}
                                transition={{ type: "spring", stiffness: 300 }}
                              >
                                <Card className="border-2 border-[var(--royal-gold)]/20 hover:border-[var(--royal-gold)] bg-gradient-to-r from-white to-amber-50/30 shadow-lg hover:shadow-2xl transition-all duration-300">
                                  <CardContent className="p-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                      {/* Vendor Image */}
                                      <div className="lg:col-span-3">
                                        <div className="relative rounded-xl overflow-hidden border-2 border-[var(--royal-gold)]/30 h-40 lg:h-full">
                                          <img
                                            src={booking.vendorImage}
                                            alt={booking.vendorName}
                                            className="w-full h-full object-cover"
                                          />
                                          <div className="absolute top-3 left-3">
                                            <Badge className={`${statusConfig.color} text-white border-2 border-white`}>
                                              <StatusIcon className="h-3 w-3 mr-1" />
                                              {statusConfig.text}
                                            </Badge>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Booking Details */}
                                      <div className="lg:col-span-6 space-y-3">
                                        <div>
                                          <h3 className="text-xl text-[var(--royal-maroon)] mb-1">{booking.vendorName}</h3>
                                          <p className="text-[var(--royal-gold)]">{booking.serviceCategory}</p>
                                        </div>



                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                          <div className="flex items-center text-gray-700">
                                            <Calendar className="h-4 w-4 mr-2 text-[var(--royal-gold)]" />
                                            <span>{new Date(booking.date).toLocaleDateString('en-IN', {
                                              day: 'numeric',
                                              month: 'long',
                                              year: 'numeric'
                                            })}</span>
                                          </div>
                                          <div className="flex items-center text-gray-700">
                                            <Clock className="h-4 w-4 mr-2 text-[var(--royal-gold)]" />
                                            <span>{booking.time}</span>
                                          </div>
                                          <div className="flex items-center text-gray-700">
                                            <MapPin className="h-4 w-4 mr-2 text-[var(--royal-gold)]" />
                                            <span>{booking.vendorLocation}</span>
                                          </div>
                                          <div className="flex items-center text-gray-700">
                                            <Receipt className="h-4 w-4 mr-2 text-[var(--royal-gold)]" />
                                            <span>ID: {booking.id}</span>
                                          </div>
                                        </div>

                                        <div className="flex items-center space-x-4 text-sm pt-2 border-t border-[var(--royal-gold)]/20">
                                          <div className="flex items-center text-gray-600">
                                            <Phone className="h-4 w-4 mr-1" />
                                            <span>{booking.Phone}</span>
                                          </div>
                                          <div className="flex items-center text-gray-600">
                                            <Mail className="h-4 w-4 mr-1" />
                                            <span>{booking.vendorEmail}</span>
                                          </div>
                                        </div>

                                        {booking.rating && (
                                          <div className="flex items-center space-x-2 pt-2">
                                            <div className="flex">
                                              {[...Array(5)].map((_, i) => (
                                                <Star
                                                  key={i}
                                                  className={`h-4 w-4 ${i < booking.rating! ? 'text-[var(--royal-gold)] fill-current' : 'text-gray-300'}`}
                                                />
                                              ))}
                                            </div>
                                            {booking.review && (
                                              <p className="text-sm text-gray-600 italic">"{booking.review}"</p>
                                            )}
                                          </div>
                                        )}
                                      </div>

                                      {/* Payment & Actions */}
                                      <div className="lg:col-span-3 flex flex-col justify-between">
                                        <div className="space-y-2">
                                          <div className="text-right">
                                            <p className="text-sm text-gray-600">
                                              Total Amount: <span className="text-2xl text-[var(--royal-maroon)] font-semibold">₹{booking.total}</span>
                                            </p>
                                            {/*                                             <p className="text-lg text-green-600">₹{booking.paid.toLocaleString()}</p> */}
                                          </div>
                                          <div className="text-right">
                                            <p className="text-sm text-gray-600">
                                              Paid: <span className="text-2xl text-[var(--royal-maroon)] font-semibold">₹{booking.paid}</span>
                                            </p>
                                            {/*                                             <p className="text-lg text-green-600">₹{booking.paid.toLocaleString()}</p> */}
                                          </div>
                                          {booking.paid < booking.total && (
                                            <div className="text-right">
                                            <p className="text-sm text-gray-600">
                                              balance: <span className="text-2xl text-[var(--royal-maroon)] font-semibold">₹{booking.balance}</span>
                                            </p>
                                            {/*                                             <p className="text-lg text-green-600">₹{booking.paid.toLocaleString()}</p> */}
                                          </div>
                                          )}
                                        </div>

                                        <div className="space-y-2 mt-4">
                                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                            <Button
                                              className="w-full bg-gradient-to-r from-[var(--royal-maroon)] to-[var(--royal-copper)] hover:from-[var(--royal-copper)] hover:to-[var(--royal-maroon)] text-white border-2 border-[var(--royal-gold)]"
                                              size="sm"
                                            >
                                              <Download className="h-4 w-4 mr-2" />
                                              Download Receipt
                                            </Button>
                                          </motion.div>
                                          {booking.status === 'upcoming' && (
                                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                              <Button
                                                variant="outline"
                                                className="w-full border-2 border-[var(--royal-gold)] text-[var(--royal-maroon)] hover:bg-[var(--royal-gold)] hover:text-white"
                                                size="sm"
                                              >
                                                <MessageSquare className="h-4 w-4 mr-2" />
                                                Contact Vendor
                                              </Button>
                                            </motion.div>
                                          )}
                                          {booking.status === 'completed' && !booking.rating && (
                                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                              <Button
                                                variant="outline"
                                                className="w-full border-2 border-[var(--royal-gold)] text-[var(--royal-maroon)] hover:bg-[var(--royal-gold)] hover:text-white"
                                                size="sm"
                                              >
                                                <Star className="h-4 w-4 mr-2" />
                                                Leave Review
                                              </Button>
                                            </motion.div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </AnimatePresence>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
