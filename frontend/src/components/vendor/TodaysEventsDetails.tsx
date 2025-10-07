import React from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  ArrowLeft, Calendar, Clock, Users, MapPin, Phone, Mail,
  CheckCircle, AlertCircle, Star, DollarSign, Info
} from 'lucide-react';

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
  service?: string;
  location?: string;
}

interface TodaysEventsDetailsProps {
  onBack: () => void;
  todaysBookings: Booking[];
  upcomingBookings: Booking[];
}

export default function TodaysEventsDetails({ 
  onBack, 
  todaysBookings, 
  upcomingBookings 
}: TodaysEventsDetailsProps) {
  const todaysRevenue = todaysBookings.reduce((sum, b) => sum + b.amount, 0);
  const confirmedToday = todaysBookings.filter(b => b.status === 'confirmed').length;
  const pendingToday = todaysBookings.filter(b => b.status === 'pending').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500 text-white';
      case 'pending': return 'bg-yellow-500 text-white';
      case 'completed': return 'bg-blue-500 text-white';
      case 'cancelled': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getTimeCategory = (time: string) => {
    const hour = parseInt(time.split(':')[0]);
    if (hour < 12) return { label: 'Morning', color: 'from-yellow-500 to-orange-500' };
    if (hour < 17) return { label: 'Afternoon', color: 'from-orange-500 to-red-500' };
    return { label: 'Evening', color: 'from-purple-500 to-pink-500' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--royal-cream)] via-amber-50 to-orange-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-[var(--royal-maroon)] to-[var(--royal-copper)] border-b-4 border-[var(--royal-gold)] shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={onBack}
                className="bg-white/10 text-white border-2 border-[var(--royal-gold)] hover:bg-[var(--royal-gold)]"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center space-x-3">
                <Calendar className="h-10 w-10 text-[var(--royal-gold)]" />
                <span className="text-2xl text-white">Today's Events</span>
              </div>
            </div>
            <div className="text-white text-right">
              <p className="text-sm opacity-80">Current Date</p>
              <p className="text-lg">
                {new Date().toLocaleDateString('en-IN', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: 'Total Events Today',
              value: todaysBookings.length,
              icon: Calendar,
              color: 'from-blue-500 to-indigo-600',
              trend: 'Active bookings'
            },
            {
              title: 'Confirmed Events',
              value: confirmedToday,
              icon: CheckCircle,
              color: 'from-green-500 to-emerald-600',
              trend: 'Ready to proceed'
            },
            {
              title: 'Pending Confirmation',
              value: pendingToday,
              icon: AlertCircle,
              color: 'from-orange-500 to-amber-600',
              trend: 'Needs attention'
            },
            {
              title: "Today's Revenue",
              value: `₹${todaysRevenue.toLocaleString()}`,
              icon: DollarSign,
              color: 'from-purple-500 to-pink-600',
              trend: 'Expected earnings'
            }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-4 border-[var(--royal-gold)]/20 hover:border-[var(--royal-gold)] shadow-xl bg-white transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <div className={`p-3 bg-gradient-to-r ${stat.color} rounded-xl shadow-lg`}>
                      <stat.icon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <p className="text-3xl text-[var(--royal-maroon)] mb-2">
                    {typeof stat.value === 'string' ? stat.value : stat.value}
                  </p>
                  <p className="text-xs text-gray-500">{stat.trend}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Today's Events Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <Card className="border-4 border-[var(--royal-gold)]/30 shadow-xl bg-white">
            <CardHeader>
              <CardTitle className="text-[var(--royal-maroon)] flex items-center">
                <Clock className="h-6 w-6 mr-2" />
                Today's Event Schedule
              </CardTitle>
              <CardDescription>
                {todaysBookings.length > 0 
                  ? `You have ${todaysBookings.length} event${todaysBookings.length > 1 ? 's' : ''} scheduled today` 
                  : 'No events scheduled for today'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {todaysBookings.length > 0 ? (
                <div className="space-y-4">
                  {todaysBookings.map((booking, index) => {
                    const timeCategory = getTimeCategory(booking.time);
                    return (
                      <motion.div
                        key={booking.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="relative"
                      >
                        <div className="p-6 rounded-xl border-2 border-[var(--royal-gold)]/20 hover:border-[var(--royal-gold)] transition-all bg-gradient-to-r from-white to-amber-50/30">
                          {/* Time Badge */}
                          <div className="absolute -left-2 -top-2">
                            <div className={`px-4 py-2 bg-gradient-to-r ${timeCategory.color} rounded-lg shadow-lg`}>
                              <span className="text-white text-sm">{timeCategory.label}</span>
                            </div>
                          </div>

                          <div className="flex items-start justify-between mt-4">
                            <div className="space-y-3 flex-1">
                              <div className="flex items-center space-x-3">
                                <h3 className="text-xl text-[var(--royal-maroon)]">{booking.customerName}</h3>
                                <Badge className={getStatusColor(booking.status)}>
                                  {booking.status}
                                </Badge>
                              </div>

                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="flex items-center text-gray-600">
                                  <Clock className="h-4 w-4 mr-2" />
                                  <span>{booking.time}</span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                  <Users className="h-4 w-4 mr-2" />
                                  <span>{booking.service || 'Wedding Event'}</span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                  <Phone className="h-4 w-4 mr-2" />
                                  <span>{booking.customerPhone}</span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                  <Mail className="h-4 w-4 mr-2" />
                                  <span className="truncate">{booking.customerEmail}</span>
                                </div>
                              </div>

                              {booking.location && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <MapPin className="h-4 w-4 mr-2" />
                                  <span>{booking.location}</span>
                                </div>
                              )}
                            </div>

                            <div className="text-right space-y-2 ml-4">
                              <p className="text-sm text-gray-600">Total Amount</p>
                              <p className="text-2xl text-[var(--royal-maroon)]">
                                ₹{booking.amount.toLocaleString()}
                              </p>
                              <p className="text-sm text-[var(--royal-gold)]">
                                Advance: ₹{booking.advancePaid.toLocaleString()}
                              </p>
                              <Badge variant="outline" className="text-xs">
                                Balance: ₹{(booking.amount - booking.advancePaid).toLocaleString()}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">No events scheduled for today</p>
                  <p className="text-sm text-gray-400">Check your upcoming events below</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-4 border-[var(--royal-gold)]/30 shadow-xl bg-white">
            <CardHeader>
              <CardTitle className="text-[var(--royal-maroon)] flex items-center">
                <Calendar className="h-6 w-6 mr-2" />
                Upcoming Events
              </CardTitle>
              <CardDescription>
                {upcomingBookings.length > 0
                  ? `${upcomingBookings.length} event${upcomingBookings.length > 1 ? 's' : ''} scheduled in the coming days`
                  : 'No upcoming events'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingBookings.length > 0 ? (
                <div className="space-y-4">
                  {upcomingBookings.slice(0, 5).map((booking, index) => (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="p-4 rounded-xl border-2 border-[var(--royal-gold)]/20 hover:border-[var(--royal-gold)] transition-all bg-gradient-to-r from-white to-amber-50/30"
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-3">
                            <h3 className="text-lg text-[var(--royal-maroon)]">{booking.customerName}</h3>
                            <Badge className={getStatusColor(booking.status)}>
                              {booking.status}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>{new Date(booking.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              <span>{booking.time}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg text-[var(--royal-maroon)]">
                            ₹{booking.amount.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            {Math.ceil((new Date(booking.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days away
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Info className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No upcoming events scheduled</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}