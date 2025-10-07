// import React, { useState } from 'react';
// import { motion, AnimatePresence } from 'motion/react';
// import { Button } from '../ui/button';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
// import { Input } from '../ui/input';
// import { Badge } from '../ui/badge';
// import { Calendar } from '../ui/calendar';
// import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
// import { Slider } from '../ui/slider';
// import { 
//   Heart, ArrowLeft, MapPin, Star, Clock, Phone, Mail, 
//   Calendar as CalendarIcon, CreditCard, CheckCircle, XCircle, LogOut, Crown, Sparkles, Filter, Search, DollarSign, ArrowUpDown, Plus, X
// } from 'lucide-react';
// import { ImageWithFallback } from '../figma/ImageWithFallback';
// import { toast } from 'sonner@2.0.3';

// interface User {
//   id: string;
//   name: string;
//   email: string;
//   role: 'customer' | 'vendor';
// }

// interface CustomerBookingProps {
//   user: User;
//   category: string | null;
//   onNavigateHome: () => void;
//   onLogout: () => void;
//   onNavigateToMyBookings?: () => void;
// }

// interface TimeSlot {
//   id: string;
//   time: string;
//   available: boolean;
//   price: number;
// }

// interface Vendor {
//   id: string;
//   name: string;
//   category: string;
//   rating: number;
//   reviews: number;
//   location: string;
//   distance: string;
//   price: string;
//   description: string;
//   image: string;
//   phone: string;
//   email: string;
//   gallery: string[];
//   timeSlots: TimeSlot[];
// }

// const mockVendors: Vendor[] = [
//   // Function Halls
//   {
//     id: '1',
//     name: 'Raj Mahal Palace',
//     category: 'Function Halls',
//     rating: 4.8,
//     reviews: 156,
//     location: 'Juhu, Mumbai',
//     distance: '2.5 km away',
//     price: '₹1,50,000 - ₹3,00,000',
//     description: 'Royal heritage banquet hall with traditional Rajasthani architecture, crystal chandeliers and mandap facilities.',
//     image: 'https://images.unsplash.com/photo-1587271407850-8d438ca9fdf2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBwYWxhY2UlMjBiYW5xdWV0JTIwaGFsbCUyMHdlZGRpbmd8ZW58MXx8fHwxNzU5MzM2OTM2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
//     phone: '+91 98765 43210',
//     email: 'bookings@rajmahal.com',
//     gallery: ['https://images.unsplash.com/photo-1587271407850-8d438ca9fdf2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBwYWxhY2UlMjBiYW5xdWV0JTIwaGFsbCUyMHdlZGRpbmd8ZW58MXx8fHwxNzU5MzM2OTM2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'],
//     timeSlots: [
//       { id: '1', time: '10:00 AM - 2:00 PM', available: true, price: 150000 },
//       { id: '2', time: '3:00 PM - 7:00 PM', available: false, price: 200000 },
//       { id: '3', time: '8:00 PM - 12:00 AM', available: true, price: 250000 },
//     ]
//   },
//   {
//     id: '2',
//     name: 'Maharaja Convention Center',
//     category: 'Function Halls',
//     rating: 4.7,
//     reviews: 134,
//     location: 'Andheri, Mumbai',
//     distance: '4.2 km away',
//     price: '₹1,00,000 - ₹2,50,000',
//     description: 'Grand convention center with capacity for 1000+ guests, featuring golden decor and marble interiors.',
//     image: 'https://images.unsplash.com/photo-1644476534525-6a1aec0f2f38?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWhhcmFqYSUyMHdlZGRpbmclMjBoYWxsJTIwaW5kaWF8ZW58MXx8fHwxNzU5MzM2OTk3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
//     phone: '+91 98765 43213',
//     email: 'events@maharajacc.com',
//     gallery: ['https://images.unsplash.com/photo-1644476534525-6a1aec0f2f38?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWhhcmFqYSUyMHdlZGRpbmclMjBoYWxsJTIwaW5kaWF8ZW58MXx8fHwxNzU5MzM2OTk3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'],
//     timeSlots: [
//       { id: '1', time: '9:00 AM - 1:00 PM', available: true, price: 100000 },
//       { id: '2', time: '2:00 PM - 6:00 PM', available: true, price: 150000 },
//       { id: '3', time: '7:00 PM - 11:00 PM', available: false, price: 200000 },
//     ]
//   },
//   {
//     id: '3',
//     name: 'Heritage Mandap Gardens',
//     category: 'Function Halls',
//     rating: 4.9,
//     reviews: 98,
//     location: 'Powai, Mumbai',
//     distance: '6.1 km away',
//     price: '₹80,000 - ₹1,80,000',
//     description: 'Beautiful outdoor mandap venue with landscaped gardens, perfect for traditional Hindu ceremonies.',
//     image: 'https://images.unsplash.com/photo-1571983371651-221e6c0b910a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb3V0aCUyMGluZGlhbiUyMHdlZGRpbmclMjB2ZW51ZXxlbnwxfHx8fDE3NTkzMzcwMDF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
//     phone: '+91 98765 43214',
//     email: 'info@heritagegardens.com',
//     gallery: ['https://images.unsplash.com/photo-1571983371651-221e6c0b910a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb3V0aCUyMGluZGlhbiUyMHdlZGRpbmclMjB2ZW51ZXxlbnwxfHx8fDE3NTkzMzcwMDF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'],
//     timeSlots: [
//       { id: '1', time: '6:00 AM - 10:00 AM', available: true, price: 80000 },
//       { id: '2', time: '11:00 AM - 3:00 PM', available: true, price: 120000 },
//       { id: '3', time: '4:00 PM - 8:00 PM', available: false, price: 150000 },
//     ]
//   },

//   // Music & Entertainment
//   {
//     id: '4',
//     name: 'Sangam Musical Group',
//     category: 'Music & Entertainment',
//     rating: 4.9,
//     reviews: 89,
//     location: 'Bandra, Mumbai',
//     distance: '1.8 km away',
//     price: '₹45,000 - ₹75,000',
//     description: 'Premier classical Indian music ensemble specializing in tabla, sitar, and traditional wedding songs.',
//     image: 'https://images.unsplash.com/photo-1722903905445-a0bbf292e23b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBjbGFzc2ljYWwlMjBtdXNpYyUyMGJhbmQlMjB3ZWRkaW5nfGVufDF8fHx8MTc1OTMzNjk0MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
//     phone: '+91 98765 43215',
//     email: 'contact@sangammusic.com',
//     gallery: ['https://images.unsplash.com/photo-1722903905445-a0bbf292e23b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBjbGFzc2ljYWwlMjBtdXNpYyUyMGJhbmQlMjB3ZWRkaW5nfGVufDF8fHx8MTc1OTMzNjk0MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'],
//     timeSlots: [
//       { id: '1', time: '6:00 PM - 10:00 PM', available: true, price: 45000 },
//       { id: '2', time: '7:00 PM - 11:00 PM', available: true, price: 55000 },
//       { id: '3', time: '8:00 PM - 12:00 AM', available: false, price: 65000 },
//     ]
//   },
//   {
//     id: '7',
//     name: 'Marigold Dreams Decor',
//     category: 'Decoration',
//     rating: 4.8,
//     reviews: 145,
//     location: 'Versova, Mumbai',
//     distance: '3.7 km away',
//     price: '₹75,000 - ₹2,50,000',
//     description: 'Traditional Indian wedding decoration specialists in marigold, rose, and jasmine flower arrangements.',
//     image: 'https://images.unsplash.com/photo-1732382643619-872165f61891?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB3ZWRkaW5nJTIwZGVjb3JhdGlvbiUyMG1hbmRhcHxlbnwxfHx8fDE3NTkyNTQ2NzN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
//     phone: '+91 98765 43218',
//     email: 'design@marigolddreams.com',
//     gallery: ['https://images.unsplash.com/photo-1732382643619-872165f61891?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB3ZWRkaW5nJTIwZGVjb3JhdGlvbiUyMG1hbmRhcHxlbnwxfHx8fDE3NTkyNTQ2NzN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'],
//     timeSlots: [
//       { id: '1', time: 'Setup (6:00 AM - 12:00 PM)', available: true, price: 75000 },
//       { id: '2', time: 'Premium Setup (5:00 AM - 2:00 PM)', available: true, price: 150000 },
//       { id: '3', time: 'Royal Package (4:00 AM - 4:00 PM)', available: false, price: 250000 },
//     ]
//   },
//   {
//     id: '8',
//     name: 'Royal Baraat Cars',
//     category: 'Wedding Cars',
//     rating: 4.6,
//     reviews: 67,
//     location: 'Malad, Mumbai',
//     distance: '5.8 km away',
//     price: '₹15,000 - ₹75,000',
//     description: 'Premium luxury cars (Audi, BMW, Mercedes) with elegant white flower decorations for royal baraat processions.',
//     image: 'https://images.unsplash.com/photo-1650096384939-425397001569?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBCTVclMjBjYXIlMjB3aGl0ZSUyMGZsb3dlcnMlMjB3ZWRkaW5nfGVufDF8fHx8MTc1OTMzNzg3NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
//     phone: '+91 98765 43219',
//     email: 'rentals@royalbaraat.com',
//     gallery: ['https://images.unsplash.com/photo-1650096384939-425397001569?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBCTVclMjBjYXIlMjB3aGl0ZSUyMGZsb3dlcnMlMjB3ZWRkaW5nfGVufDF8fHx8MTc1OTMzNzg3NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'],
//     timeSlots: [
//       { id: '1', time: 'Half Day (6 hrs)', available: true, price: 15000 },
//       { id: '2', time: 'Full Day (12 hrs)', available: true, price: 35000 },
//       { id: '3', time: 'Premium Package (24 hrs)', available: false, price: 65000 },
//     ]
//   },
//   {
//     id: '9',
//     name: 'Swadisht Caterers',
//     category: 'Catering',
//     rating: 4.7,
//     reviews: 203,
//     location: 'All Mumbai',
//     distance: 'Service Area',
//     price: '₹1,200 - ₹2,500/person',
//     description: 'Authentic Indian cuisine specialists serving traditional Gujarati, Punjabi, South Indian and Maharashtrian thalis.',
//     image: 'https://images.unsplash.com/photo-1577678550902-99b98b98dcb6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB3ZWRkaW5nJTIwZm9vZCUyMGNhdGVyaW5nJTIwdGhhbGl8ZW58MXx8fHwxNzU5MzM2ODMzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
//     phone: '+91 98765 43220',
//     email: 'orders@swadisht.com',
//     gallery: ['https://images.unsplash.com/photo-1577678550902-99b98b98dcb6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB3ZWRkaW5nJTIwZm9vZCUyMGNhdGVyaW5nJTIwdGhhbGl8ZW58MXx8fHwxNzU5MzM2ODMzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'],
//     timeSlots: [
//       { id: '1', time: 'Lunch (12:00 PM - 4:00 PM)', available: true, price: 100000 },
//       { id: '2', time: 'Dinner (7:00 PM - 11:00 PM)', available: true, price: 150000 },
//       { id: '3', time: 'Full Day Catering', available: false, price: 220000 },
//     ]
//   },
//   {
//     id: '10',
//     name: 'Pandit Rajesh Shastri',
//     category: 'Pandits & Priests',
//     rating: 4.9,
//     reviews: 87,
//     location: 'Dadar, Mumbai',
//     distance: '4.5 km away',
//     price: '₹5,000 - ₹25,000',
//     description: 'Experienced Vedic scholar specializing in Hindu wedding ceremonies, puja rituals, and sacred mantras.',
//     image: 'https://images.unsplash.com/photo-1641755322620-b99e9132fceb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBwYW5kaXQlMjBwcmllc3QlMjB3ZWRkaW5nJTIwY2VyZW1vbnl8ZW58MXx8fHwxNzU5MzM2ODQ3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
//     phone: '+91 98765 43221',
//     email: 'panditji@vedwisdom.com',
//     gallery: ['https://images.unsplash.com/photo-1641755322620-b99e9132fceb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBwYW5kaXQlMjBwcmllc3QlMjB3ZWRkaW5nJTIwY2VyZW1vbnl8ZW58MXx8fHwxNzU5MzM2ODQ3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'],
//     timeSlots: [
//       { id: '1', time: 'Morning Ceremony (6:00 AM - 10:00 AM)', available: true, price: 5000 },
//       { id: '2', time: 'Full Wedding Ceremony (6:00 AM - 12:00 PM)', available: true, price: 15000 },
//       { id: '3', time: 'Multi-Day Rituals', available: false, price: 25000 },
//     ]
//   }
// ];

// const locations = [
//   'All Locations',
//   'Juhu, Mumbai',
//   'Andheri, Mumbai',
//   'Powai, Mumbai',
//   'Bandra, Mumbai',
//   'Versova, Mumbai',
//   'Malad, Mumbai',
//   'All Mumbai',
//   'Dadar, Mumbai'
// ];

// // Helper function to extract min price from vendor
// const getMinPrice = (vendor: Vendor): number => {
//   if (vendor.timeSlots && vendor.timeSlots.length > 0) {
//     return Math.min(...vendor.timeSlots.map(slot => slot.price));
//   }
//   // Fallback: parse from price string
//   const priceMatch = vendor.price.match(/₹([\d,]+)/);
//   if (priceMatch) {
//     return parseInt(priceMatch[1].replace(/,/g, ''));
//   }
//   return 0;
// };

// // Helper function to extract distance in km
// const getDistance = (vendor: Vendor): number => {
//   const distanceMatch = vendor.distance.match(/([\d.]+)\s*km/);
//   if (distanceMatch) {
//     return parseFloat(distanceMatch[1]);
//   }
//   return 999; // For vendors with 'Service Area' instead of distance
// };

// const sortOptions = [
//   { value: 'featured', label: 'Featured' },
//   { value: 'price-low', label: 'Price: Low to High' },
//   { value: 'price-high', label: 'Price: High to Low' },
//   { value: 'rating', label: 'Rating: High to Low' },
//   { value: 'distance', label: 'Distance: Nearest First' },
// ];

// const CustomerBooking = React.memo(function CustomerBooking({ user, category, onNavigateHome, onLogout, onNavigateToMyBookings }: CustomerBookingProps) {
//   const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
//   const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
//   const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
//   const [showBookingDialog, setShowBookingDialog] = useState(false);
//   const [bookingStep, setBookingStep] = useState<'details' | 'payment' | 'confirmation'>('details');
//   const [selectedLocation, setSelectedLocation] = useState<string>('All Locations');
//   const [budgetRange, setBudgetRange] = useState<number[]>([0, 300000]);
//   const [searchQuery, setSearchQuery] = useState<string>('');
//   const [sortBy, setSortBy] = useState<string>('featured');
  
//   // Event details states
//   const [eventType, setEventType] = useState<string>('');
//   const [customEventType, setCustomEventType] = useState<string>('');
//   const [eventHolderNames, setEventHolderNames] = useState<string[]>(['']);

//   const handleBookSlot = React.useCallback((vendor: Vendor, slot: TimeSlot) => {
//     if (!slot.available) return;
//     setSelectedVendor(vendor);
//     setSelectedSlot(slot);
//     setShowBookingDialog(true);
//     setBookingStep('details');
//     // Reset event details
//     setEventType('');
//     setCustomEventType('');
//     setEventHolderNames(['']);
//   }, []);

//   const addEventHolderName = React.useCallback(() => {
//     setEventHolderNames(prev => [...prev, '']);
//   }, []);

//   const removeEventHolderName = React.useCallback((index: number) => {
//     setEventHolderNames(prev => {
//       if (prev.length > 1) {
//         return prev.filter((_, i) => i !== index);
//       }
//       return prev;
//     });
//   }, []);

//   const updateEventHolderName = React.useCallback((index: number, value: string) => {
//     setEventHolderNames(prev => {
//       const newNames = [...prev];
//       newNames[index] = value;
//       return newNames;
//     });
//   }, []);

//   const handlePayment = React.useCallback(() => {
//     setBookingStep('payment');
//     setTimeout(() => {
//       setBookingStep('confirmation');
//     }, 2000);
//   }, []);

//   // Filter and sort vendors based on all criteria
//   const filteredVendors = React.useMemo(() => 
//     mockVendors
//       .filter(vendor => {
//         // Filter by category if one is selected
//         const matchesCategory = !category || vendor.category === category;
//         const matchesLocation = selectedLocation === 'All Locations' || vendor.location === selectedLocation;
//         const matchesSearch = vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//                              vendor.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
//                              vendor.location.toLowerCase().includes(searchQuery.toLowerCase());
        
//         // Check if vendor's minimum price is within budget range
//         const vendorMinPrice = getMinPrice(vendor);
//         const matchesBudget = vendorMinPrice >= budgetRange[0] && vendorMinPrice <= budgetRange[1];
        
//         return matchesCategory && matchesLocation && matchesSearch && matchesBudget;
//       })
//       .sort((a, b) => {
//         switch (sortBy) {
//           case 'price-low':
//             return getMinPrice(a) - getMinPrice(b);
//           case 'price-high':
//             return getMinPrice(b) - getMinPrice(a);
//           case 'rating':
//             return b.rating - a.rating;
//           case 'distance':
//             return getDistance(a) - getDistance(b);
//           case 'featured':
//           default:
//             return b.rating - a.rating; // Default to highest rated
//         }
//       }),
//     [category, selectedLocation, searchQuery, budgetRange, sortBy]
//   );

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-[var(--royal-cream)] via-amber-50 to-orange-50 relative overflow-hidden">
//       {/* Static Background Elements - Reduced animation for performance */}
//       <div className="absolute inset-0 opacity-5">
//         <div className="absolute top-20 right-10 w-40 h-40 bg-[var(--royal-maroon)] rounded-full blur-3xl opacity-40" />
//         <div className="absolute bottom-20 left-10 w-60 h-60 bg-[var(--royal-gold)] rounded-full blur-3xl opacity-50" />
//       </div>

//       {/* Header */}
//       <header 
//         className="bg-gradient-to-r from-[var(--royal-maroon)] to-[var(--royal-copper)] border-b-4 border-[var(--royal-gold)] sticky top-0 z-50 shadow-2xl"
//       >
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex items-center justify-between h-20">
//             <div className="flex items-center space-x-4">
//               <div>
//                 <Button 
//                   variant="ghost" 
//                   size="sm" 
//                   onClick={onNavigateHome}
//                   className="text-[var(--royal-cream)] hover:text-white hover:bg-white/10"
//                 >
//                   <ArrowLeft className="h-4 w-4 mr-2" />
//                   Back to Home
//                 </Button>
//               </div>
//               <div className="flex items-center space-x-3">
//                 <div>
//                   <Crown className="h-10 w-10 text-[var(--royal-gold)] fill-current" />
//                 </div>
//                 <div className="flex flex-col">
//                   <span className="text-2xl text-[var(--royal-gold)]">EventHub</span>
//                   {category && typeof category === 'string' && (
//                     <Badge className="bg-[var(--royal-gold)] text-white mt-1">
//                       {category}
//                     </Badge>
//                   )}
//                 </div>
//               </div>
//             </div>
            
//             <div className="flex items-center space-x-4">
//               <span className="text-sm text-[var(--royal-cream)]">Welcome, {user.name}</span>
//               {onNavigateToMyBookings && (
//                 <Button 
//                   variant="outline" 
//                   size="sm" 
//                   onClick={onNavigateToMyBookings}
//                   className="bg-white/10 text-[var(--royal-cream)] border-2 border-[var(--royal-gold)] hover:bg-[var(--royal-gold)] hover:text-white backdrop-blur-sm"
//                 >
//                   My Bookings
//                 </Button>
//               )}
//               <Button 
//                 variant="outline" 
//                 size="sm" 
//                 onClick={onLogout}
//                 className="bg-[var(--royal-cream)] text-[var(--royal-maroon)] border-2 border-[var(--royal-gold)] hover:bg-[var(--royal-gold)] hover:text-white"
//               >
//                 <LogOut className="h-4 w-4 mr-2" />
//                 Logout
//               </Button>
//             </div>
//           </div>
//         </div>
//       </header>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
//         <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
//           {/* Filters Sidebar */}
//           <motion.div 
//             className="lg:col-span-1 space-y-6"
//             initial={{ opacity: 0, x: -50 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ duration: 0.6 }}
//           >
//             {/* Date Selection */}
//             <div>
//               <Card className="border-4 border-[var(--royal-gold)]/30 hover:border-[var(--royal-gold)] shadow-xl bg-white transition-all duration-300">
//                 <CardHeader>
//                   <CardTitle className="text-center text-[var(--royal-maroon)] flex items-center justify-center">
//                     <CalendarIcon className="h-5 w-5 mr-2" />
//                     Select Date
//                   </CardTitle>
//                   <CardDescription className="text-center">Choose your royal wedding date</CardDescription>
//                 </CardHeader>
//                 <CardContent className="p-4 flex justify-center">
//                   <Calendar
//                     mode="single"
//                     selected={selectedDate}
//                     onSelect={(date) => setSelectedDate(date)}
//                     className="rounded-lg border border-[var(--royal-gold)]/30 bg-white shadow-sm"
//                     disabled={(date) => date < new Date()}
//                   />
//                 </CardContent>
//               </Card>
//             </div>

//             {/* Filters */}
//             <div>
//               <Card className="border-4 border-[var(--royal-gold)]/30 hover:border-[var(--royal-gold)] shadow-xl bg-white transition-all duration-300">
//                 <CardHeader>
//                   <CardTitle className="text-[var(--royal-maroon)] flex items-center">
//                     <Filter className="h-5 w-5 mr-2" />
//                     Filters
//                   </CardTitle>
//                   <CardDescription>Refine your search</CardDescription>
//                 </CardHeader>
//                 <CardContent className="space-y-6">
//                   {/* Budget Range Filter */}
//                   <div className="space-y-3">
//                     <label className="text-sm flex items-center text-[var(--royal-maroon)]">
//                       <DollarSign className="h-4 w-4 mr-2" />
//                       Budget Range
//                     </label>
//                     <div className="space-y-2">
//                       <Slider
//                         min={0}
//                         max={300000}
//                         step={5000}
//                         value={budgetRange}
//                         onValueChange={(value) => setBudgetRange(value)}
//                         className="w-full"
//                       />
//                       <div className="flex items-center justify-between text-sm">
//                         <span className="text-[var(--royal-gold)] bg-[var(--royal-maroon)]/10 px-3 py-1 rounded-full">
//                           ₹{budgetRange[0].toLocaleString()}
//                         </span>
//                         <span className="text-gray-500">to</span>
//                         <span className="text-[var(--royal-gold)] bg-[var(--royal-maroon)]/10 px-3 py-1 rounded-full">
//                           ₹{budgetRange[1].toLocaleString()}
//                         </span>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Location Filter */}
//                   <div className="space-y-2">
//                     <label className="text-sm flex items-center text-[var(--royal-maroon)]">
//                       <MapPin className="h-4 w-4 mr-2" />
//                       Location
//                     </label>
//                     <Select value={selectedLocation} onValueChange={(value) => setSelectedLocation(value)}>
//                       <SelectTrigger className="w-full border-2 border-[var(--royal-gold)]/30">
//                         <SelectValue placeholder="Select location" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {locations.map((location) => (
//                           <SelectItem key={location} value={location}>
//                             {location}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   {/* Clear Filters Button */}
//                   <Button
//                     variant="outline"
//                     className="w-full border-2 border-[var(--royal-gold)]/30 text-[var(--royal-maroon)] hover:bg-[var(--royal-gold)] hover:text-white"
//                     onClick={() => {
//                       setBudgetRange([0, 300000]);
//                       setSelectedLocation('All Locations');
//                       setSearchQuery('');
//                       setSortBy('featured');
//                     }}
//                   >
//                     Clear All Filters
//                   </Button>
//                 </CardContent>
//               </Card>
//             </div>

//             {/* Quick Stats */}
//             <div>
//               <Card className="border-4 border-[var(--royal-gold)] shadow-xl bg-gradient-to-br from-[var(--royal-maroon)] to-[var(--royal-copper)]">
//                 <CardContent className="p-6 text-center">
//                   <div className="space-y-2">
//                     <Crown className="h-10 w-10 text-[var(--royal-gold)] mx-auto fill-current" />
//                     <h3 className="text-white">Vendors Found</h3>
//                     <div className="text-5xl text-[var(--royal-gold)]">
//                       {filteredVendors.length}
//                     </div>
//                     <div className="space-y-1 text-sm text-[var(--royal-cream)]">
//                       {category && typeof category === 'string' && (
//                         <p className="text-[var(--royal-gold)]">{category}</p>
//                       )}
//                       {selectedLocation !== 'All Locations' && typeof selectedLocation === 'string' && (
//                         <p>near {selectedLocation}</p>
//                       )}
//                       <p className="text-xs">
//                         Budget: ₹{(budgetRange[0]/1000).toFixed(0)}K - ₹{(budgetRange[1]/1000).toFixed(0)}K
//                       </p>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             </div>
//           </motion.div>

//           {/* Vendors List */}
//           <div className="lg:col-span-3">
//             {/* Search Bar */}
//             <motion.div
//               initial={{ opacity: 0, y: -20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.5 }}
//               className="mb-6"
//             >
//               <Card className="border-4 border-[var(--royal-gold)]/30 shadow-xl bg-white">
//                 <CardContent className="p-4">
//                   <div className="relative">
//                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[var(--royal-gold)]" />
//                     <Input
//                       placeholder="Search vendors by name, service, or location..."
//                       value={searchQuery}
//                       onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
//                       className="pl-10 pr-4 py-6 border-2 border-[var(--royal-gold)]/30 focus:border-[var(--royal-gold)] text-base"
//                     />
//                   </div>
//                 </CardContent>
//               </Card>
//             </motion.div>

//             {/* Header with Sort */}
//             <motion.div 
//               className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6"
//               initial={{ opacity: 0, y: -20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.6, delay: 0.1 }}
//             >
//               <div className="flex-1">
//                 <h1 className="text-3xl text-[var(--royal-maroon)] flex items-center">
//                   <Sparkles className="h-8 w-8 mr-3 text-[var(--royal-gold)]" />
//                   {category && typeof category === 'string' ? category : 'All Vendors'}
//                 </h1>
//                 <p className="text-gray-700 mt-1">
//                   {selectedDate ? `Available for ${selectedDate.toLocaleDateString()}` : 'Select a date to view availability'}
//                   {searchQuery && typeof searchQuery === 'string' && ` • Searching for "${searchQuery}"`}
//                 </p>
//               </div>

//               <div className="flex items-center gap-3">
//                 {/* Sort Dropdown */}
//                 <div className="flex items-center gap-2">
//                   <label className="text-sm text-[var(--royal-maroon)] whitespace-nowrap">
//                     Sort by:
//                   </label>
//                   <Select value={sortBy} onValueChange={(value) => setSortBy(value)}>
//                     <SelectTrigger className="w-[180px] border-2 border-[var(--royal-gold)]/30 hover:border-[var(--royal-gold)] bg-white">
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {sortOptions.map((option) => (
//                         <SelectItem key={option.value} value={option.value}>
//                           {option.label}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 {/* Results Badge */}
//                 <motion.div
//                   animate={{ scale: [1, 1.05, 1] }}
//                   transition={{ duration: 2, repeat: Infinity }}
//                 >
//                   <Badge className="bg-gradient-to-r from-[var(--royal-maroon)] to-[var(--royal-copper)] text-white shadow-lg border-2 border-[var(--royal-gold)] px-4 py-2 whitespace-nowrap">
//                     {filteredVendors.length} vendors
//                   </Badge>
//                 </motion.div>
//               </div>
//             </motion.div>

//             {filteredVendors.length === 0 ? (
//                 <div>
//                   <Card className="border-4 border-[var(--royal-gold)]/30 shadow-xl bg-white">
//                     <CardContent className="p-12 text-center">
//                       <div className="space-y-4">
//                         <Crown className="h-16 w-16 text-[var(--royal-gold)] mx-auto opacity-50" />
//                         <h3 className="text-xl text-[var(--royal-maroon)]">No vendors found</h3>
//                         <p className="text-gray-600">
//                           Try adjusting your filters or search terms to find royal vendors.
//                         </p>
//                         <Button 
//                           variant="outline" 
//                           onClick={() => {
//                             setSelectedLocation('All Locations');
//                             setBudgetRange([0, 300000]);
//                             setSearchQuery('');
//                             setSortBy('featured');
//                           }}
//                           className="mt-4 border-2 border-[var(--royal-gold)] text-[var(--royal-maroon)] hover:bg-[var(--royal-gold)] hover:text-white"
//                         >
//                           Clear All Filters
//                         </Button>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 </div>
//               ) : (
//                 <div className="space-y-6">
//                   {filteredVendors.map((vendor, index) => (
//                     <div key={vendor.id}>
//                         <Card className="overflow-hidden border-4 border-[var(--royal-gold)]/20 hover:border-[var(--royal-gold)] shadow-xl bg-white hover:shadow-2xl transition-all duration-500">
//                           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                             {/* Vendor Image */}
//                             <div className="relative overflow-hidden">
//                               <ImageWithFallback
//                                 src={vendor.image}
//                                 alt={vendor.name}
//                                 className="w-full h-64 md:h-full object-cover transition-transform duration-300 hover:scale-105"
//                               />
//                               <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
//                               <div className="absolute top-4 left-4">
//                                 <Badge className="bg-gradient-to-r from-[var(--royal-gold)] to-[var(--royal-orange)] text-white shadow-lg border-2 border-white">
//                                   ⭐ Royal Choice
//                                 </Badge>
//                               </div>
//                             </div>

//                             {/* Vendor Details */}
//                             <div className="md:col-span-2 p-6">
//                               <div className="flex items-start justify-between mb-4">
//                                 <div>
//                                   <h3 className="text-2xl text-[var(--royal-maroon)]">{vendor.name}</h3>
//                                   <p className="text-[var(--royal-gold)]">{vendor.category}</p>
//                                   <div className="flex items-center space-x-4 mt-3">
//                                     <div className="flex items-center space-x-1">
//                                       <Star className="h-5 w-5 text-[var(--royal-gold)] fill-current" />
//                                       <span className="font-medium">{vendor.rating}</span>
//                                       <span className="text-sm text-gray-500">({vendor.reviews} reviews)</span>
//                                     </div>
//                                     <div className="flex items-center space-x-1">
//                                       <MapPin className="h-4 w-4 text-gray-400" />
//                                       <span className="text-sm text-gray-600">{vendor.distance}</span>
//                                     </div>
//                                   </div>
//                                 </div>
//                                 <div className="text-right">
//                                   <p className="text-xl text-[var(--royal-maroon)]">{vendor.price}</p>
//                                 </div>
//                               </div>

//                               <p className="text-gray-600 mb-4">{vendor.description}</p>

//                               <div className="flex items-center justify-between mb-4">
//                                 <div className="flex items-center space-x-4 text-sm">
//                                   <div className="flex items-center space-x-1 text-gray-600">
//                                     <Phone className="h-4 w-4" />
//                                     <span>{vendor.phone}</span>
//                                   </div>
//                                   <div className="flex items-center space-x-1 text-gray-600">
//                                     <Mail className="h-4 w-4" />
//                                     <span>{vendor.email}</span>
//                                   </div>
//                                 </div>
//                               </div>

//                               {/* Time Slots */}
//                               <div>
//                                 <h4 className="text-[var(--royal-maroon)] mb-3 flex items-center">
//                                   <Clock className="h-5 w-5 mr-2" />
//                                   Royal Time Slots
//                                 </h4>
//                                 <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
//                                   {vendor.timeSlots.map((slot, slotIndex) => (
//                                     <div key={slot.id}>
//                                       <Button
//                                         variant={slot.available ? "default" : "outline"}
//                                         onClick={() => handleBookSlot(vendor, slot)}
//                                         disabled={!slot.available}
//                                         className={`w-full h-auto py-3 flex flex-col items-start ${
//                                           slot.available
//                                             ? 'bg-gradient-to-r from-[var(--royal-maroon)] to-[var(--royal-copper)] hover:from-[var(--royal-copper)] hover:to-[var(--royal-maroon)] text-white border-2 border-[var(--royal-gold)]'
//                                             : 'opacity-50 cursor-not-allowed bg-gray-100'
//                                         }`}
//                                       >
//                                         <span className="text-xs">{slot.time}</span>
//                                         <span className="text-sm">₹{slot.price.toLocaleString()}</span>
//                                         {!slot.available && (
//                                           <span className="text-xs text-gray-500 mt-1">Booked</span>
//                                         )}
//                                       </Button>
//                                     </div>
//                                   ))}
//                                 </div>
//                               </div>
//                             </div>
//                           </div>
//                         </Card>
//                       </div>
//                   ))}
//                 </div>
//               )}
//           </div>
//         </div>
//       </div>

//       {/* Booking Dialog */}
//       {showBookingDialog && selectedVendor && selectedSlot && (
//         <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
//             <DialogContent className="max-w-lg border-4 border-[var(--royal-gold)] max-h-[90vh] overflow-y-auto">
//               <DialogHeader>
//                 <DialogTitle className="text-2xl text-[var(--royal-maroon)] flex items-center">
//                   <Crown className="h-6 w-6 mr-2 text-[var(--royal-gold)]" />
//                   {bookingStep === 'confirmation' ? 'Booking Confirmed!' : 'Confirm Royal Booking'}
//                 </DialogTitle>
//                 <DialogDescription>
//                   {bookingStep === 'details' && 'Review your booking details'}
//                   {bookingStep === 'payment' && 'Processing secure payment...'}
//                   {bookingStep === 'confirmation' && 'Your royal celebration awaits!'}
//                 </DialogDescription>
//               </DialogHeader>

//               {bookingStep === 'details' && (
//                   <div className="space-y-4">
//                     {/* Booking Summary */}
//                     <div className="space-y-2 pb-4 border-b border-[var(--royal-gold)]/30">
//                       <div className="flex justify-between">
//                         <span className="text-gray-600">Vendor:</span>
//                         <span className="font-medium">{selectedVendor.name}</span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-gray-600">Category:</span>
//                         <span className="font-medium">{selectedVendor.category}</span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-gray-600">Time Slot:</span>
//                         <span className="font-medium">{selectedSlot.time}</span>
//                       </div>
//                     </div>

//                     {/* Event Type */}
//                     <div className="space-y-2">
//                       <label className="text-sm text-[var(--royal-maroon)]">Event Type *</label>
//                       <Select value={eventType} onValueChange={setEventType}>
//                         <SelectTrigger className="w-full border-2 border-[var(--royal-gold)]/30">
//                           <SelectValue placeholder="Select event type" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="marriage">Marriage</SelectItem>
//                           <SelectItem value="birthday">Birthday</SelectItem>
//                           <SelectItem value="retirement">Retirement</SelectItem>
//                           <SelectItem value="cooperative-party">Cooperative Party</SelectItem>
//                           <SelectItem value="private-party">Private Party</SelectItem>
//                           <SelectItem value="engagement">Engagement</SelectItem>
//                           <SelectItem value="other">Other</SelectItem>
//                         </SelectContent>
//                       </Select>
//                       {eventType === 'other' && (
//                         <Input
//                           placeholder="Please specify event type"
//                           value={customEventType}
//                           onChange={(e) => setCustomEventType(e.target.value)}
//                           className="border-2 border-[var(--royal-gold)]/30 focus:border-[var(--royal-gold)]"
//                         />
//                       )}
//                     </div>

//                     {/* Event Holder Names */}
//                     <div className="space-y-2">
//                       <label className="text-sm text-[var(--royal-maroon)]">Event Holder Name(s) *</label>
//                       <div className="space-y-2">
//                         {eventHolderNames.map((name, index) => (
//                           <div key={index} className="flex items-center space-x-2">
//                             <Input
//                               placeholder={index === 0 ? "e.g., Krishna Radha" : "Add another name"}
//                               value={name}
//                               onChange={(e) => updateEventHolderName(index, e.target.value)}
//                               className="flex-1 border-2 border-[var(--royal-gold)]/30 focus:border-[var(--royal-gold)]"
//                             />
//                             {eventHolderNames.length > 1 && (
//                               <Button
//                                 variant="ghost"
//                                 size="icon"
//                                 onClick={() => removeEventHolderName(index)}
//                                 className="h-10 w-10 text-red-500 hover:text-red-700 hover:bg-red-50"
//                               >
//                                 <X className="h-4 w-4" />
//                               </Button>
//                             )}
//                           </div>
//                         ))}
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           onClick={addEventHolderName}
//                           className="w-full border-2 border-[var(--royal-gold)]/30 text-[var(--royal-maroon)] hover:bg-[var(--royal-gold)] hover:text-white"
//                         >
//                           <Plus className="h-4 w-4 mr-2" />
//                           Add Name
//                         </Button>
//                       </div>
//                     </div>

//                     {/* Payment Summary */}
//                     <div className="space-y-2 pt-4 border-t border-[var(--royal-gold)]/30">
//                       <div className="flex justify-between">
//                         <span className="text-gray-600">Total Amount:</span>
//                         <span className="text-xl text-[var(--royal-maroon)]">₹{selectedSlot.price.toLocaleString()}</span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-gray-600">Advance Payment (25%):</span>
//                         <span className="font-bold text-[var(--royal-gold)]">₹{(selectedSlot.price * 0.25).toLocaleString()}</span>
//                       </div>
//                     </div>

//                     <Button 
//                       onClick={handlePayment}
//                       disabled={!eventType || (eventType === 'other' && !customEventType) || eventHolderNames.every(name => !name.trim())}
//                       className="w-full bg-gradient-to-r from-[var(--royal-maroon)] to-[var(--royal-copper)] hover:from-[var(--royal-copper)] hover:to-[var(--royal-maroon)] text-white border-2 border-[var(--royal-gold)] disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                       <CreditCard className="h-5 w-5 mr-2" />
//                       Proceed to Payment
//                     </Button>
//                   </div>
//                 )}

//                 {bookingStep === 'payment' && (
//                   <div className="py-8 text-center">
//                     <div className="inline-block animate-spin">
//                       <Crown className="h-16 w-16 text-[var(--royal-gold)]" />
//                     </div>
//                     <p className="mt-4 text-gray-600">Processing your royal booking...</p>
//                   </div>
//                 )}

//                 {bookingStep === 'confirmation' && (
//                   <div className="py-8 text-center space-y-6">
//                     <div>
//                       <CheckCircle className="h-20 w-20 text-green-500 mx-auto" />
//                     </div>
//                     <div className="space-y-2">
//                       <h3 className="text-2xl text-[var(--royal-maroon)]">Booking Confirmed!</h3>
//                       <p className="text-gray-600">
//                         Your vendor will contact you shortly to finalize details for your royal celebration.
//                       </p>
//                     </div>

//                     {/* Event Details Summary */}
//                     <div className="bg-[var(--royal-cream)] p-4 rounded-lg space-y-2 text-left border-2 border-[var(--royal-gold)]/30">
//                       <div className="flex justify-between items-start">
//                         <span className="text-sm text-gray-600">Event Type:</span>
//                         <span className="text-sm text-[var(--royal-maroon)] capitalize">
//                           {eventType === 'other' ? customEventType : eventType.replace('-', ' ')}
//                         </span>
//                       </div>
//                       <div className="flex justify-between items-start">
//                         <span className="text-sm text-gray-600">Event Holder(s):</span>
//                         <span className="text-sm text-[var(--royal-maroon)] text-right">
//                           {eventHolderNames.filter(name => name.trim()).join(', ')}
//                         </span>
//                       </div>
//                     </div>
                    
//                     <div className="pt-4 border-t border-[var(--royal-gold)]/30">
//                       <p className="text-sm text-[var(--royal-maroon)] mb-4">
//                         Would you like to view your bookings?
//                       </p>
//                       <div className="flex flex-col sm:flex-row gap-3 justify-center">
//                         {onNavigateToMyBookings && (
//                           <Button 
//                             onClick={() => {
//                               setShowBookingDialog(false);
//                               onNavigateToMyBookings();
//                             }}
//                             className="w-full sm:w-auto bg-gradient-to-r from-[var(--royal-maroon)] to-[var(--royal-copper)] hover:from-[var(--royal-copper)] hover:to-[var(--royal-maroon)] text-white shadow-lg border-2 border-[var(--royal-gold)]"
//                           >
//                             <Sparkles className="mr-2 h-4 w-4" />
//                             View My Bookings
//                           </Button>
//                         )}
//                         <Button 
//                           onClick={() => setShowBookingDialog(false)}
//                           variant="outline"
//                           className="w-full sm:w-auto border-2 border-[var(--royal-gold)] text-[var(--royal-maroon)] hover:bg-[var(--royal-gold)] hover:text-white"
//                         >
//                           Close
//                         </Button>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//             </DialogContent>
//           </Dialog>
//         )}
//     </div>
//   );
// });

// export default CustomerBooking;
