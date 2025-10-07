import React from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  ArrowLeft, DollarSign, TrendingUp, TrendingDown, Calendar,
  CreditCard, Wallet, PieChart, BarChart3
} from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart as RePieChart, Pie, Cell 
} from 'recharts';

interface RevenueDetailsProps {
  onBack: () => void;
  totalRevenue: number;
  totalAdvanceReceived: number;
  pendingAmount: number;
}

const monthlyRevenueData = [
  { month: 'Jan', revenue: 45000, advance: 30000, pending: 15000 },
  { month: 'Feb', revenue: 52000, advance: 35000, pending: 17000 },
  { month: 'Mar', revenue: 48000, advance: 32000, pending: 16000 },
  { month: 'Apr', revenue: 61000, advance: 42000, pending: 19000 },
  { month: 'May', revenue: 55000, advance: 38000, pending: 17000 },
  { month: 'Jun', revenue: 67000, advance: 48000, pending: 19000 },
  { month: 'Jul', revenue: 73000, advance: 55000, pending: 18000 },
  { month: 'Aug', revenue: 68000, advance: 50000, pending: 18000 },
  { month: 'Sep', revenue: 75000, advance: 58000, pending: 17000 },
  { month: 'Oct', revenue: 42000, advance: 28000, pending: 14000 }
];

const paymentMethodData = [
  { name: 'Online Payment', value: 45, color: 'var(--royal-maroon)' },
  { name: 'Cash', value: 30, color: 'var(--royal-gold)' },
  { name: 'Bank Transfer', value: 20, color: 'var(--royal-orange)' },
  { name: 'Cheque', value: 5, color: 'var(--royal-emerald)' }
];

const revenueByService = [
  { service: 'Function Hall', revenue: 180000, percentage: 40 },
  { service: 'Catering', revenue: 135000, percentage: 30 },
  { service: 'Decoration', revenue: 90000, percentage: 20 },
  { service: 'Music', revenue: 45000, percentage: 10 }
];

export default function RevenueDetails({ 
  onBack, 
  totalRevenue, 
  totalAdvanceReceived, 
  pendingAmount 
}: RevenueDetailsProps) {
  const collectionRate = ((totalAdvanceReceived / totalRevenue) * 100).toFixed(1);

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
                <DollarSign className="h-10 w-10 text-[var(--royal-gold)]" />
                <span className="text-2xl text-white">Revenue Details</span>
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
              title: 'Total Revenue',
              value: `₹${totalRevenue.toLocaleString()}`,
              icon: DollarSign,
              color: 'from-green-500 to-emerald-600',
              trend: '+12.5% vs last month'
            },
            {
              title: 'Advance Received',
              value: `₹${totalAdvanceReceived.toLocaleString()}`,
              icon: Wallet,
              color: 'from-blue-500 to-indigo-600',
              trend: `${collectionRate}% collected`
            },
            {
              title: 'Pending Amount',
              value: `₹${pendingAmount.toLocaleString()}`,
              icon: CreditCard,
              color: 'from-orange-500 to-amber-600',
              trend: 'To be collected'
            },
            {
              title: 'Collection Rate',
              value: `${collectionRate}%`,
              icon: TrendingUp,
              color: 'from-purple-500 to-pink-600',
              trend: 'Average performance'
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
          {/* Monthly Revenue Trend */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-4 border-[var(--royal-gold)]/30 shadow-xl bg-white">
              <CardHeader>
                <CardTitle className="text-[var(--royal-maroon)] flex items-center">
                  <BarChart3 className="h-6 w-6 mr-2" />
                  Monthly Revenue Trend
                </CardTitle>
                <CardDescription>Revenue, advance, and pending amounts over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyRevenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--royal-maroon)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="var(--royal-maroon)" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorAdvance" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--royal-gold)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="var(--royal-gold)" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="revenue" stroke="var(--royal-maroon)" fillOpacity={1} fill="url(#colorRevenue)" />
                    <Area type="monotone" dataKey="advance" stroke="var(--royal-gold)" fillOpacity={1} fill="url(#colorAdvance)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Payment Methods */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-4 border-[var(--royal-gold)]/30 shadow-xl bg-white">
              <CardHeader>
                <CardTitle className="text-[var(--royal-maroon)] flex items-center">
                  <PieChart className="h-6 w-6 mr-2" />
                  Payment Methods Distribution
                </CardTitle>
                <CardDescription>Breakdown by payment type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RePieChart>
                    <Pie
                      data={paymentMethodData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {paymentMethodData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RePieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Revenue by Service */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-4 border-[var(--royal-gold)]/30 shadow-xl bg-white">
            <CardHeader>
              <CardTitle className="text-[var(--royal-maroon)] flex items-center">
                <BarChart3 className="h-6 w-6 mr-2" />
                Revenue by Service Category
              </CardTitle>
              <CardDescription>Income breakdown by service type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {revenueByService.map((service, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{service.service}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-[var(--royal-maroon)]">
                          ₹{service.revenue.toLocaleString()}
                        </span>
                        <Badge className="bg-[var(--royal-gold)] text-white">
                          {service.percentage}%
                        </Badge>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${service.percentage}%` }}
                        transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                        className="h-full bg-gradient-to-r from-[var(--royal-maroon)] to-[var(--royal-gold)] rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-6"
        >
          <Card className="border-4 border-[var(--royal-gold)]/30 shadow-xl bg-white">
            <CardHeader>
              <CardTitle className="text-[var(--royal-maroon)] flex items-center">
                <Calendar className="h-6 w-6 mr-2" />
                Recent Transactions
              </CardTitle>
              <CardDescription>Latest payment activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { date: '2025-10-15', customer: 'Rahul & Priya', amount: 12500, type: 'Advance', status: 'Received' },
                  { date: '2025-10-20', customer: 'Arjun & Meera', amount: 17500, type: 'Advance', status: 'Received' },
                  { date: '2025-09-28', customer: 'Vikram & Shweta', amount: 60000, type: 'Full Payment', status: 'Completed' },
                  { date: '2025-09-25', customer: 'Aditya & Priya', amount: 25000, type: 'Advance', status: 'Received' },
                  { date: '2025-09-20', customer: 'Rohan & Isha', amount: 35000, type: 'Balance', status: 'Received' }
                ].map((transaction, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-4 rounded-xl border-2 border-[var(--royal-gold)]/20 hover:border-[var(--royal-gold)] transition-all bg-gradient-to-r from-white to-amber-50/30"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                        <DollarSign className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-[var(--royal-maroon)]">{transaction.customer}</p>
                        <p className="text-sm text-gray-600">{new Date(transaction.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg text-green-600">₹{transaction.amount.toLocaleString()}</p>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">{transaction.type}</Badge>
                        <Badge className="text-xs bg-green-500 text-white">{transaction.status}</Badge>
                      </div>
                    </div>
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