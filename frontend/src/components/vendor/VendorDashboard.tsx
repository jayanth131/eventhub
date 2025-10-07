// import React, { useState } from 'react';
// import { Button } from '../ui/button';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
// import { Badge } from '../ui/badge';
// import { Calendar } from '../ui/calendar';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
// import { Switch } from '../ui/switch';
// import { 
//   Heart, Calendar as CalendarIcon, TrendingUp, TrendingDown, 
//   Users, DollarSign, Clock, Phone, Mail, LogOut, Settings
// } from 'lucide-react';
// import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// interface User {
//   id: string;
//   name: string;
//   email: string;
//   role: 'customer' | 'vendor';
// }

// interface VendorDashboardProps {
//   user: User;
//   onLogout: () => void;
// }

// interface Booking {
//   id: string;
//   customerName: string;
//   customerPhone: string;
//   customerEmail: string;
//   date: string;
//   time: string;
//   amount: number;
//   status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
//   advancePaid: number;
// }

// interface TimeSlot {
//   id: string;
//   time: string;
//   available: boolean;
//   date: string;
// }

// const mockBookings: Booking[] = [
//   {
//     id: 'WB001',
//     customerName: 'Rahul & Priya',
//     customerPhone: '+91 98765 43210',
//     customerEmail: 'rahul.priya@example.com',
//     date: '2025-10-15',
//     time: '10:00 AM - 2:00 PM',
//     amount: 50000,
//     status: 'confirmed',
//     advancePaid: 12500
//   },
//   {
//     id: 'WB002',
//     customerName: 'Arjun & Meera',
//     customerPhone: '+91 98765 43211',
//     customerEmail: 'arjun.meera@example.com',
//     date: '2025-10-20',
//     time: '8:00 PM - 12:00 AM',
//     amount: 70000,
//     status: 'pending',
//     advancePaid: 17500
//   },
//   {
//     id: 'WB003',
//     customerName: 'Vikram & Shweta',
//     customerPhone: '+91 98765 43212',
//     customerEmail: 'vikram.shweta@example.com',
//     date: '2025-09-28',
//     time: '3:00 PM - 7:00 PM',
//     amount: 60000,
//     status: 'completed',
//     advancePaid: 60000
//   }
// ];

// const revenueData = [
//   { month: 'Jan', revenue: 45000, bookings: 8 },
//   { month: 'Feb', revenue: 52000, bookings: 10 },
//   { month: 'Mar', revenue: 48000, bookings: 9 },
//   { month: 'Apr', revenue: 61000, bookings: 12 },
//   { month: 'May', revenue: 55000, bookings: 11 },
//   { month: 'Jun', revenue: 67000, bookings: 13 },
//   { month: 'Jul', revenue: 73000, bookings: 15 },
//   { month: 'Aug', revenue: 68000, bookings: 14 },
//   { month: 'Sep', revenue: 75000, bookings: 16 },
//   { month: 'Oct', revenue: 42000, bookings: 8 }
// ];

// const categoryData = [
//   { name: 'Wedding Ceremonies', value: 40, color: '#ff6b35' },
//   { name: 'Reception Parties', value: 35, color: '#f7931e' },
//   { name: 'Pre-wedding Events', value: 15, color: '#ffd23f' },
//   { name: 'Corporate Events', value: 10, color: '#06d6a0' }
// ];

// export default function VendorDashboard({ user, onLogout }: VendorDashboardProps) {
//   const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
//   const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
//     { id: '1', time: '10:00 AM - 2:00 PM', available: true, date: '2025-10-15' },
//     { id: '2', time: '3:00 PM - 7:00 PM', available: false, date: '2025-10-15' },
//     { id: '3', time: '8:00 PM - 12:00 AM', available: true, date: '2025-10-15' },
//   ]);

//   const todaysBookings = mockBookings.filter(booking => 
//     new Date(booking.date).toDateString() === new Date().toDateString()
//   );

//   const upcomingBookings = mockBookings.filter(booking => 
//     new Date(booking.date) > new Date()
//   );

//   const totalRevenue = mockBookings.reduce((sum, booking) => sum + booking.amount, 0);
//   const totalAdvanceReceived = mockBookings.reduce((sum, booking) => sum + booking.advancePaid, 0);
//   const pendingAmount = totalRevenue - totalAdvanceReceived;

//   const toggleSlotAvailability = (slotId: string) => {
//     setTimeSlots(prev => prev.map(slot => 
//       slot.id === slotId ? { ...slot, available: !slot.available } : slot
//     ));
//   };

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'confirmed': return 'bg-green-100 text-green-800';
//       case 'pending': return 'bg-yellow-100 text-yellow-800';
//       case 'completed': return 'bg-blue-100 text-blue-800';
//       case 'cancelled': return 'bg-red-100 text-red-800';
//       default: return 'bg-gray-100 text-gray-800';
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
//       {/* Header */}
//       <header className="bg-gradient-to-r from-white via-amber-50 to-orange-50 border-b-2 border-amber-200 sticky top-0 z-50 shadow-lg">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex items-center justify-between h-16">
//             <div className="flex items-center space-x-3">
//               <div className="relative">
//                 <Heart className="h-10 w-10 text-amber-500 fill-current" />
//                 <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
//               </div>
//               <span className="text-2xl font-bold bg-gradient-to-r from-red-700 via-amber-600 to-orange-600 bg-clip-text text-transparent">EventHub</span>
//               <Badge className="ml-2 bg-gradient-to-r from-red-500 to-orange-500 text-white">Royal Vendor</Badge>
//             </div>
            
//             <div className="flex items-center space-x-4">
//               <span className="text-sm text-gray-600">Welcome, {user.name}</span>
//               <Button variant="outline" size="sm">
//                 <Settings className="h-4 w-4 mr-2" />
//                 Settings
//               </Button>
//               <Button variant="outline" size="sm" onClick={onLogout}>
//                 <LogOut className="h-4 w-4 mr-2" />
//                 Logout
//               </Button>
//             </div>
//           </div>
//         </div>
//       </header>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Stats Overview */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//           <Card className="border-2 border-amber-200 shadow-lg bg-gradient-to-br from-white to-amber-50 hover:shadow-xl transition-all duration-300">
//             <CardContent className="p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600">Total Revenue</p>
//                   <p className="text-2xl font-bold text-gray-900">₹{totalRevenue.toLocaleString()}</p>
//                 </div>
//                 <div className="p-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-lg">
//                   <DollarSign className="h-6 w-6 text-white" />
//                 </div>
//               </div>
//               <div className="flex items-center mt-2">
//                 <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
//                 <span className="text-sm text-green-600">+12.5% from last month</span>
//               </div>
//             </CardContent>
//           </Card>

//           <Card className="border-2 border-amber-200 shadow-lg bg-gradient-to-br from-white to-amber-50 hover:shadow-xl transition-all duration-300">
//             <CardContent className="p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600">Total Bookings</p>
//                   <p className="text-2xl font-bold text-gray-900">{mockBookings.length}</p>
//                 </div>
//                 <div className="p-3 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full shadow-lg">
//                   <CalendarIcon className="h-6 w-6 text-white" />
//                 </div>
//               </div>
//               <div className="flex items-center mt-2">
//                 <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
//                 <span className="text-sm text-green-600">+8 new this month</span>
//               </div>
//             </CardContent>
//           </Card>

//           <Card className="border-2 border-amber-200 shadow-lg bg-gradient-to-br from-white to-amber-50 hover:shadow-xl transition-all duration-300">
//             <CardContent className="p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600">Advance Received</p>
//                   <p className="text-2xl font-bold text-gray-900">₹{totalAdvanceReceived.toLocaleString()}</p>
//                 </div>
//                 <div className="p-3 bg-gradient-to-r from-orange-400 to-amber-500 rounded-full shadow-lg">
//                   <DollarSign className="h-6 w-6 text-white" />
//                 </div>
//               </div>
//               <div className="flex items-center mt-2">
//                 <Clock className="h-4 w-4 text-orange-500 mr-1" />
//                 <span className="text-sm text-orange-600">₹{pendingAmount.toLocaleString()} pending</span>
//               </div>
//             </CardContent>
//           </Card>

//           <Card className="border-2 border-amber-200 shadow-lg bg-gradient-to-br from-white to-amber-50 hover:shadow-xl transition-all duration-300">
//             <CardContent className="p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600">Today's Events</p>
//                   <p className="text-2xl font-bold text-gray-900">{todaysBookings.length}</p>
//                 </div>
//                 <div className="p-3 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full shadow-lg">
//                   <Users className="h-6 w-6 text-white" />
//                 </div>
//               </div>
//               <div className="flex items-center mt-2">
//                 <CalendarIcon className="h-4 w-4 text-purple-500 mr-1" />
//                 <span className="text-sm text-purple-600">{upcomingBookings.length} upcoming</span>
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         <Tabs defaultValue="bookings" className="space-y-6">
//           <TabsList className="grid w-full lg:w-auto grid-cols-4">
//             <TabsTrigger value="bookings">Bookings</TabsTrigger>
//             <TabsTrigger value="analytics">Analytics</TabsTrigger>
//             <TabsTrigger value="availability">Availability</TabsTrigger>
//             <TabsTrigger value="profile">Profile</TabsTrigger>
//           </TabsList>

//           {/* Bookings Tab */}
//           <TabsContent value="bookings" className="space-y-6">
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               {/* Today's Bookings */}
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Today's Bookings</CardTitle>
//                   <CardDescription>Events scheduled for today</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   {todaysBookings.length === 0 ? (
//                     <p className="text-gray-500 text-center py-4">No bookings for today</p>
//                   ) : (
//                     <div className="space-y-4">
//                       {todaysBookings.map((booking) => (
//                         <div key={booking.id} className="border rounded-lg p-4">
//                           <div className="flex items-center justify-between mb-2">
//                             <h4 className="font-semibold">{booking.customerName}</h4>
//                             <Badge className={getStatusColor(booking.status)}>
//                               {booking.status}
//                             </Badge>
//                           </div>
//                           <p className="text-sm text-gray-600 mb-1">{booking.time}</p>
//                           <div className="flex items-center justify-between">
//                             <span className="text-sm font-medium">₹{booking.amount.toLocaleString()}</span>
//                             <div className="flex items-center space-x-2">
//                               <Button size="sm" variant="outline">
//                                 <Phone className="h-4 w-4 mr-1" />
//                                 Call
//                               </Button>
//                               <Button size="sm" variant="outline">
//                                 <Mail className="h-4 w-4 mr-1" />
//                                 Email
//                               </Button>
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </CardContent>
//               </Card>

//               {/* Upcoming Bookings */}
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Upcoming Bookings</CardTitle>
//                   <CardDescription>Future scheduled events</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-4">
//                     {upcomingBookings.map((booking) => (
//                       <div key={booking.id} className="border rounded-lg p-4">
//                         <div className="flex items-center justify-between mb-2">
//                           <h4 className="font-semibold">{booking.customerName}</h4>
//                           <Badge className={getStatusColor(booking.status)}>
//                             {booking.status}
//                           </Badge>
//                         </div>
//                         <p className="text-sm text-gray-600 mb-1">
//                           {new Date(booking.date).toLocaleDateString()} - {booking.time}
//                         </p>
//                         <div className="flex items-center justify-between">
//                           <div>
//                             <span className="text-sm font-medium">₹{booking.amount.toLocaleString()}</span>
//                             <span className="text-xs text-gray-500 ml-2">
//                               (₹{booking.advancePaid.toLocaleString()} paid)
//                             </span>
//                           </div>
//                           <div className="flex items-center space-x-2">
//                             <Button size="sm" variant="outline">
//                               <Phone className="h-4 w-4 mr-1" />
//                               Call
//                             </Button>
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </CardContent>
//               </Card>
//             </div>
//           </TabsContent>

//           {/* Analytics Tab */}
//           <TabsContent value="analytics" className="space-y-6">
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               {/* Revenue Chart */}
//               <Card className="lg:col-span-2">
//                 <CardHeader>
//                   <CardTitle>Revenue Trend</CardTitle>
//                   <CardDescription>Monthly revenue and booking trends</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <ResponsiveContainer width="100%" height={300}>
//                     <AreaChart data={revenueData}>
//                       <CartesianGrid strokeDasharray="3 3" />
//                       <XAxis dataKey="month" />
//                       <YAxis />
//                       <Tooltip formatter={(value, name) => [
//                         name === 'revenue' ? `₹${value.toLocaleString()}` : value,
//                         name === 'revenue' ? 'Revenue' : 'Bookings'
//                       ]} />
//                       <Area 
//                         type="monotone" 
//                         dataKey="revenue" 
//                         stroke="#ff6b35" 
//                         fill="#ff6b35" 
//                         fillOpacity={0.3}
//                       />
//                       <Line 
//                         type="monotone" 
//                         dataKey="bookings" 
//                         stroke="#f7931e" 
//                         strokeWidth={2}
//                       />
//                     </AreaChart>
//                   </ResponsiveContainer>
//                 </CardContent>
//               </Card>

//               {/* Booking Categories */}
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Booking Categories</CardTitle>
//                   <CardDescription>Distribution by event type</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <ResponsiveContainer width="100%" height={250}>
//                     <PieChart>
//                       <Pie
//                         data={categoryData}
//                         cx="50%"
//                         cy="50%"
//                         labelLine={false}
//                         label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
//                         outerRadius={80}
//                         fill="#8884d8"
//                         dataKey="value"
//                       >
//                         {categoryData.map((entry, index) => (
//                           <Cell key={`cell-${index}`} fill={entry.color} />
//                         ))}
//                       </Pie>
//                       <Tooltip />
//                     </PieChart>
//                   </ResponsiveContainer>
//                 </CardContent>
//               </Card>

//               {/* Monthly Performance */}
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Monthly Performance</CardTitle>
//                   <CardDescription>Last 10 months comparison</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <ResponsiveContainer width="100%" height={250}>
//                     <BarChart data={revenueData}>
//                       <CartesianGrid strokeDasharray="3 3" />
//                       <XAxis dataKey="month" />
//                       <YAxis />
//                       <Tooltip formatter={(value) => [`${value}`, 'Bookings']} />
//                       <Bar dataKey="bookings" fill="#ff6b35" />
//                     </BarChart>
//                   </ResponsiveContainer>
//                 </CardContent>
//               </Card>
//             </div>
//           </TabsContent>

//           {/* Availability Tab */}
//           <TabsContent value="availability" className="space-y-6">
//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//               {/* Calendar */}
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="text-center">Select Date</CardTitle>
//                   <CardDescription className="text-center">Choose a date to manage availability</CardDescription>
//                 </CardHeader>
//                 <CardContent className="p-4">
//                   <Calendar
//                     mode="single"
//                     selected={selectedDate}
//                     onSelect={setSelectedDate}
//                     className="w-full rounded-lg border border-amber-200 bg-white shadow-sm"
//                   />
//                 </CardContent>
//               </Card>

//               {/* Time Slots Management */}
//               <Card className="lg:col-span-2">
//                 <CardHeader>
//                   <CardTitle>Manage Time Slots</CardTitle>
//                   <CardDescription>
//                     Toggle availability for {selectedDate?.toLocaleDateString()}
//                   </CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-4">
//                     {timeSlots.map((slot) => (
//                       <div key={slot.id} className="flex items-center justify-between p-4 border rounded-lg">
//                         <div>
//                           <h4 className="font-medium">{slot.time}</h4>
//                           <p className="text-sm text-gray-600">
//                             Status: {slot.available ? 'Available' : 'Blocked'}
//                           </p>
//                         </div>
//                         <div className="flex items-center space-x-2">
//                           <span className="text-sm text-gray-600">Available</span>
//                           <Switch
//                             checked={slot.available}
//                             onCheckedChange={() => toggleSlotAvailability(slot.id)}
//                           />
//                         </div>
//                       </div>
//                     ))}
//                   </div>
                  
//                   <div className="mt-6 p-4 bg-orange-50 rounded-lg">
//                     <h4 className="font-medium text-orange-800 mb-2">Note:</h4>
//                     <p className="text-sm text-orange-700">
//                       Use the toggles above to manually block time slots for offline bookings or maintenance. 
//                       Blocked slots will not be available for online booking.
//                     </p>
//                   </div>
//                 </CardContent>
//               </Card>
//             </div>
//           </TabsContent>

//           {/* Profile Tab */}
//           <TabsContent value="profile" className="space-y-6">
//             <Card>
//               <CardHeader>
//                 <CardTitle>Business Profile</CardTitle>
//                 <CardDescription>Manage your business information</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-4">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
//                       <p className="text-lg font-semibold">Grand Palace Events</p>
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
//                       <p className="text-lg">Function Halls</p>
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
//                       <p className="text-lg">+91 98765 43210</p>
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
//                       <p className="text-lg">booking@grandpalace.com</p>
//                     </div>
//                     <div className="md:col-span-2">
//                       <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
//                       <p className="text-lg">123 Wedding Street, Downtown Mumbai, Maharashtra 400001</p>
//                     </div>
//                   </div>
                  
//                   <div className="pt-4 border-t">
//                     <Button className="bg-gradient-to-r from-red-600 via-amber-500 to-orange-500 hover:from-red-700 hover:via-amber-600 hover:to-orange-600 text-white shadow-lg font-semibold">
//                       Edit Royal Profile
//                     </Button>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </TabsContent>
//         </Tabs>
//       </div>
//     </div>
//   );
// }