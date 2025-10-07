import React from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  ArrowLeft, Calendar, CheckCircle, Clock, XCircle,
  TrendingUp, Users, MapPin, Phone, Mail
} from 'lucide-react';
import { 
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

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
  service: string;
}

interface BookingsDetailsProps {
  onBack: () => void;
  totalBookings: number;
  bookings: Booking[];
}

const bookingsTrendData = [
  { month: 'Jan', bookings: 8 },
  { month: 'Feb', bookings: 10 },
  { month: 'Mar', bookings: 9 },
  { month: 'Apr', bookings: 12 },
  { month: 'May', bookings: 11 },
  { month: 'Jun', bookings: 13 },
  { month: 'Jul', bookings: 15 },
  { month: 'Aug', bookings: 14 },
  { month: 'Sep', bookings: 16 },
  { month: 'Oct', bookings: 8 }
];

const statusDistribution = [
  { name: 'Confirmed', value: 45, color: 'var(--royal-emerald)' },
  { name: 'Pending', value: 25, color: 'var(--royal-orange)' },
  { name: 'Completed', value: 25, color: 'var(--royal-maroon)' },
  { name: 'Cancelled', value: 5, color: '#dc2626' }
];

export default function BookingsDetails({ onBack, totalBookings, bookings }: BookingsDetailsProps) {
  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;
  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const completedCount = bookings.filter(b => b.status === 'completed').length;
  const cancelledCount = bookings.filter(b => b.status === 'cancelled').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500 text-white';
      case 'pending': return 'bg-yellow-500 text-white';
      case 'completed': return 'bg-blue-500 text-white';
      case 'cancelled': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
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
                <span className="text-2xl text-white">Bookings Overview</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: 'Total Bookings',
              value: totalBookings,
              icon: Calendar,
              color: 'from-blue-500 to-indigo-600',
              trend: '+8 this month'
            },
            {
              title: 'Confirmed',
              value: confirmedCount,
              icon: CheckCircle,
              color: 'from-green-500 to-emerald-600',
              trend: 'Ready to go'
            },
            {
              title: 'Pending',
              value: pendingCount,
              icon: Clock,
              color: 'from-orange-500 to-amber-600',
              trend: 'Awaiting confirmation'
            },
            {
              title: 'Completed',
              value: completedCount,
              icon: CheckCircle,
              color: 'from-purple-500 to-pink-600',
              trend: 'Successfully done'
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
                  <p className="text-3xl text-[var(--royal-maroon)] mb-2">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.trend}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Bookings Trend */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-4 border-[var(--royal-gold)]/30 shadow-xl bg-white">
              <CardHeader>
                <CardTitle className="text-[var(--royal-maroon)] flex items-center">
                  <TrendingUp className="h-6 w-6 mr-2" />
                  Monthly Bookings Trend
                </CardTitle>
                <CardDescription>Number of bookings over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={bookingsTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="bookings" 
                      stroke="var(--royal-maroon)" 
                      strokeWidth={3}
                      dot={{ fill: 'var(--royal-gold)', r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Status Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-4 border-[var(--royal-gold)]/30 shadow-xl bg-white">
              <CardHeader>
                <CardTitle className="text-[var(--royal-maroon)] flex items-center">
                  <Users className="h-6 w-6 mr-2" />
                  Booking Status Distribution
                </CardTitle>
                <CardDescription>Breakdown by booking status</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* All Bookings List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-4 border-[var(--royal-gold)]/30 shadow-xl bg-white">
            <CardHeader>
              <CardTitle className="text-[var(--royal-maroon)] flex items-center">
                <Calendar className="h-6 w-6 mr-2" />
                All Bookings
              </CardTitle>
              <CardDescription>Complete list of all your bookings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bookings.map((booking, index) => (
                  <motion.div 
                    key={booking.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                    className="p-4 rounded-xl border-2 border-[var(--royal-gold)]/20 hover:border-[var(--royal-gold)] transition-all bg-gradient-to-r from-white to-amber-50/30"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg text-[var(--royal-maroon)]">{booking.customerName}</h3>
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>{new Date(booking.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            <span>{booking.time}</span>
                          </div>
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2" />
                            <span>{booking.customerPhone}</span>
                          </div>
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-2" />
                            <span>{booking.customerEmail}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-sm text-gray-600">Amount</p>
                        <p className="text-2xl text-[var(--royal-maroon)]">₹{booking.amount.toLocaleString()}</p>
                        <p className="text-sm text-[var(--royal-gold)]">
                          Advance: ₹{booking.advancePaid.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}