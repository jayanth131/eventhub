import React from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  ArrowLeft, Wallet, CreditCard, Clock, CheckCircle,
  TrendingUp, AlertCircle, Calendar, DollarSign
} from 'lucide-react';
import { 
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

interface AdvancePaymentDetailsProps {
  onBack: () => void;
  totalAdvanceReceived: number;
  pendingAmount: number;
}

const advanceCollectionData = [
  { month: 'Jan', collected: 30000, pending: 15000 },
  { month: 'Feb', collected: 35000, pending: 17000 },
  { month: 'Mar', collected: 32000, pending: 16000 },
  { month: 'Apr', collected: 42000, pending: 19000 },
  { month: 'May', collected: 38000, pending: 17000 },
  { month: 'Jun', collected: 48000, pending: 19000 },
  { month: 'Jul', collected: 55000, pending: 18000 },
  { month: 'Aug', collected: 50000, pending: 18000 },
  { month: 'Sep', collected: 58000, pending: 17000 },
  { month: 'Oct', collected: 28000, pending: 14000 }
];

const paymentStatusData = [
  { name: 'Fully Paid', value: 30, color: 'var(--royal-emerald)' },
  { name: 'Partial Payment', value: 50, color: 'var(--royal-orange)' },
  { name: 'Payment Pending', value: 20, color: '#dc2626' }
];

const upcomingCollections = [
  { customer: 'Rahul & Priya', amount: 37500, dueDate: '2025-10-15', status: 'Due Soon' },
  { customer: 'Arjun & Meera', amount: 52500, dueDate: '2025-10-20', status: 'Due Soon' },
  { customer: 'Aditya & Kavya', amount: 45000, dueDate: '2025-10-25', status: 'Upcoming' },
  { customer: 'Siddharth & Ananya', amount: 38000, dueDate: '2025-10-30', status: 'Upcoming' }
];

export default function AdvancePaymentDetails({ 
  onBack, 
  totalAdvanceReceived, 
  pendingAmount 
}: AdvancePaymentDetailsProps) {
  const collectionRate = ((totalAdvanceReceived / (totalAdvanceReceived + pendingAmount)) * 100).toFixed(1);

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
                <Wallet className="h-10 w-10 text-[var(--royal-gold)]" />
                <span className="text-2xl text-white">Advance Payment Details</span>
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
              title: 'Total Advance Received',
              value: `₹${totalAdvanceReceived.toLocaleString()}`,
              icon: Wallet,
              color: 'from-green-500 to-emerald-600',
              trend: '+15% vs last month'
            },
            {
              title: 'Pending Collections',
              value: `₹${pendingAmount.toLocaleString()}`,
              icon: Clock,
              color: 'from-orange-500 to-amber-600',
              trend: 'To be collected'
            },
            {
              title: 'Collection Rate',
              value: `${collectionRate}%`,
              icon: TrendingUp,
              color: 'from-blue-500 to-indigo-600',
              trend: 'Performance metric'
            },
            {
              title: 'Due This Week',
              value: '₹90,000',
              icon: AlertCircle,
              color: 'from-purple-500 to-pink-600',
              trend: '2 payments'
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
                  <p className="text-2xl text-[var(--royal-maroon)] mb-2">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.trend}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Advance Collection Trend */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-4 border-[var(--royal-gold)]/30 shadow-xl bg-white">
              <CardHeader>
                <CardTitle className="text-[var(--royal-maroon)] flex items-center">
                  <TrendingUp className="h-6 w-6 mr-2" />
                  Advance Collection Trend
                </CardTitle>
                <CardDescription>Collected vs pending amounts</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={advanceCollectionData}>
                    <defs>
                      <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--royal-emerald)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="var(--royal-emerald)" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--royal-orange)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="var(--royal-orange)" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="collected" stroke="var(--royal-emerald)" fillOpacity={1} fill="url(#colorCollected)" />
                    <Area type="monotone" dataKey="pending" stroke="var(--royal-orange)" fillOpacity={1} fill="url(#colorPending)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Payment Status Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-4 border-[var(--royal-gold)]/30 shadow-xl bg-white">
              <CardHeader>
                <CardTitle className="text-[var(--royal-maroon)] flex items-center">
                  <CreditCard className="h-6 w-6 mr-2" />
                  Payment Status Distribution
                </CardTitle>
                <CardDescription>Breakdown by payment completion</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={paymentStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {paymentStatusData.map((entry, index) => (
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

        {/* Upcoming Collections */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-4 border-[var(--royal-gold)]/30 shadow-xl bg-white">
            <CardHeader>
              <CardTitle className="text-[var(--royal-maroon)] flex items-center">
                <Calendar className="h-6 w-6 mr-2" />
                Upcoming Balance Collections
              </CardTitle>
              <CardDescription>Pending payments to be collected</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingCollections.map((collection, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-xl border-2 border-[var(--royal-gold)]/20 hover:border-[var(--royal-gold)] transition-all bg-gradient-to-r from-white to-amber-50/30"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl">
                        <DollarSign className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-[var(--royal-maroon)]">{collection.customer}</p>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Calendar className="h-3 w-3" />
                          <span>Due: {new Date(collection.dueDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg text-orange-600">₹{collection.amount.toLocaleString()}</p>
                      <Badge 
                        className={collection.status === 'Due Soon' ? 'bg-red-500 text-white' : 'bg-yellow-500 text-white'}
                      >
                        {collection.status}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Collection Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-6"
        >
          <Card className="border-4 border-[var(--royal-gold)]/30 shadow-xl bg-white">
            <CardHeader>
              <CardTitle className="text-[var(--royal-maroon)] flex items-center">
                <CheckCircle className="h-6 w-6 mr-2" />
                Collection Performance Metrics
              </CardTitle>
              <CardDescription>Key performance indicators for advance collection</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    metric: 'Average Collection Time',
                    value: '3 Days',
                    description: 'Time taken to collect advance',
                    icon: Clock,
                    color: 'blue'
                  },
                  {
                    metric: 'Collection Success Rate',
                    value: '95%',
                    description: 'Successful advance collections',
                    icon: CheckCircle,
                    color: 'green'
                  },
                  {
                    metric: 'Pending Follow-ups',
                    value: '4',
                    description: 'Customers to contact',
                    icon: AlertCircle,
                    color: 'orange'
                  }
                ].map((item, index) => (
                  <div 
                    key={index}
                    className={`p-6 rounded-xl border-2 border-${item.color}-200 bg-gradient-to-br from-${item.color}-50 to-white`}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`p-2 bg-${item.color}-100 rounded-lg`}>
                        <item.icon className={`h-5 w-5 text-${item.color}-600`} />
                      </div>
                      <span className="text-sm text-gray-600">{item.metric}</span>
                    </div>
                    <p className="text-3xl text-[var(--royal-maroon)] mb-2">{item.value}</p>
                    <p className="text-xs text-gray-500">{item.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}