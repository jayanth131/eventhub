import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Heart, Search, MapPin, Star, Calendar, Users, Car, Music, Utensils, Church, LogOut, Sparkles, Crown, Flower2, Filter, Check, ChevronLeft, ChevronRight, Quote, TrendingUp, Receipt } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'vendor';
}

interface DashboardProps {
  user: User;
  onLogout: () => void;
  onNavigateToBooking: (category?: string) => void;
  onNavigateHome: () => void;
  onNavigateToMyBookings?: () => void;
}

const services = [
  {
    id: 'venues',
    name: 'Function Hall',
    description: 'Royal banquet halls & mandap venues',
    icon: Church,
    image: 'https://images.unsplash.com/photo-1739047598460-f249269b7708?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB3ZWRkaW5nJTIwdmVudWUlMjBoYWxsJTIwbWFuZGFwJTIwZGVjb3JhdGlvbnxlbnwxfHx8fDE3NTkzMzY4MjV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    count: '150+ venues'
  },
  {
    id: 'music',
    name: 'Music & Entertainment',
    description: 'Dhol, Tabla, Bollywood & Classical',
    icon: Music,
    image: 'https://images.unsplash.com/photo-1759253139451-e27dd04b1cb4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB3ZWRkaW5nJTIwbXVzaWMlMjBkaG9sJTIwdGFibGF8ZW58MXx8fHwxNzU5MzM2ODM2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    count: '80+ artists'
  },
  {
    id: 'decoration',
    name: 'Decoration',
    description: 'Marigold, Rose & Traditional Decor',
    icon: Heart,
    image: 'https://images.unsplash.com/photo-1710498689566-868b93f934c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB3ZWRkaW5nJTIwZGVjb3JhdGlvbiUyMGZsb3dlcnMlMjBtYXJpZ29sZHxlbnwxfHx8fDE3NTkzMzY4NDN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    count: '65+ decorators'
  },
  {
    id: 'cars',
    name: 'Wedding Cars',
    description: 'Luxury cars with elegant floral decoration',
    icon: Car,
    image: 'https://images.unsplash.com/photo-1650096384939-425397001569?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBCTVclMjBjYXIlMjB3aGl0ZSUyMGZsb3dlcnMlMjB3ZWRkaW5nfGVufDF8fHx8MTc1OTMzNzg3NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    count: '45+ vehicles'
  },
  {
    id: 'catering',
    name: 'Catering',
    description: 'Authentic Indian cuisine & sweets',
    icon: Utensils,
    image: 'https://images.unsplash.com/photo-1577678550902-99b98b98dcb6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB3ZWRkaW5nJTIwZm9vZCUyMGNhdGVyaW5nJTIwdGhhbGl8ZW58MXx8fHwxNzU5MzM2ODMzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    count: '120+ caterers'
  },
  {
    id: 'pandits',
    name: 'Pandits & Priests',
    description: 'Vedic ceremonies & religious rituals',
    icon: Users,
    image: 'https://images.unsplash.com/photo-1641755322620-b99e132fceb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBwYW5kaXQlMjBwcmllc3QlMjB3ZWRkaW5nJTIwY2VyZW1vbnl8ZW58MXx8fHwxNzU5MzM2ODQ3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    count: '55+ pandits'
  }
];

const featuredVendors = [
  {
    id: 1,
    name: 'Raj Mahal Palace',
    category: 'Function Hall',
    rating: 4.8,
    reviews: 156,
    location: 'Juhu, Mumbai',
    price: '₹1,50,000',
    image: 'https://images.unsplash.com/photo-1587271407850-8d438ca9fdf2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBwYWxhY2UlMjBiYW5xdWV0JTIwaGFsbCUyMHdlZGRpbmd8ZW58MXx8fHwxNzU5MzM2OTM2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  },
  {
    id: 2,
    name: 'Sangam Musical Group',
    category: 'Music & Entertainment',
    rating: 4.9,
    reviews: 89,
    location: 'Bandra, Mumbai',
    price: '₹45,000',
    image: 'https://images.unsplash.com/photo-1722903905445-a0bbf292e23b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBjbGFzc2ljYWwlMjBtdXNpYyUyMGJhbmQlMjB3ZWRkaW5nfGVufDF8fHx8MTc1OTMzNjk0MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  },
  {
    id: 3,
    name: 'Swadisht Caterers',
    category: 'Catering',
    rating: 4.7,
    reviews: 203,
    location: 'All Mumbai',
    price: '₹1,200/person',
    image: 'https://images.unsplash.com/photo-1577678550902-99b98b98dcb6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB3ZWRkaW5nJTIwZm9vZCUyMGNhdGVyaW5nJTIwdGhhbGl8ZW58MXx8fHwxNzU5MzM2ODMzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  }
];

const testimonials = [
  {
    id: 1,
    name: 'Priya & Rahul Sharma',
    location: 'Mumbai',
    image: 'https://images.unsplash.com/photo-1606407039818-d0a045916d78?w=150&h=150&fit=crop',
    text: 'EventHub made our dream wedding come true! The vendors were exceptional, and the booking process was seamless. Our guests are still talking about the magnificent celebration.',
    rating: 5,
    event: 'Royal Wedding - Dec 2024'
  },
  {
    id: 2,
    name: 'Ananya & Vikram Patel',
    location: 'Delhi',
    image: 'https://images.unsplash.com/photo-1605462863863-10d9e47e15ee?w=150&h=150&fit=crop',
    text: 'Outstanding service! From the function hall to catering, every vendor exceeded our expectations. The platform made it so easy to compare and book everything in one place.',
    rating: 5,
    event: 'Grand Wedding - Jan 2025'
  },
  {
    id: 3,
    name: 'Meera & Arjun Reddy',
    location: 'Bangalore',
    image: 'https://images.unsplash.com/photo-1610276198568-eb6d0ff53e48?w=150&h=150&fit=crop',
    text: 'The best decision we made was choosing EventHub. The quality of vendors, transparent pricing, and excellent customer support made our wedding planning stress-free.',
    rating: 5,
    event: 'Traditional Wedding - Mar 2025'
  },
  {
    id: 4,
    name: 'Sneha & Karthik Kumar',
    location: 'Chennai',
    image: 'https://images.unsplash.com/photo-1612828780770-ee09e0a84be4?w=150&h=150&fit=crop',
    text: 'Incredible experience from start to finish! The vendor recommendations were spot-on, and the booking system was intuitive. Our wedding was absolutely perfect.',
    rating: 5,
    event: 'Luxury Wedding - Feb 2025'
  }
];

const pricingPackages = [
  {
    id: 'basic',
    name: 'Classic Celebration',
    price: '₹5,00,000',
    guests: '200-300',
    features: [
      'Function Hall Booking',
      'Basic Decoration',
      'Vegetarian Catering',
      'Traditional Music Band',
      'Photography (4 hours)',
      'Standard Wedding Car',
    ],
    popular: false,
    color: 'from-amber-500 to-orange-500'
  },
  {
    id: 'premium',
    name: 'Royal Magnificence',
    price: '₹12,00,000',
    guests: '300-500',
    features: [
      'Premium Palace Hall',
      'Luxury Floral Decoration',
      'Multi-Cuisine Catering',
      'Live Orchestra & DJ',
      'Photography & Videography',
      'Luxury Car Collection',
      'Professional Pandit',
      'Complimentary Sangeet Setup'
    ],
    popular: true,
    color: 'from-red-600 to-amber-600'
  },
  {
    id: 'luxury',
    name: 'Imperial Grandeur',
    price: '₹25,00,000',
    guests: '500+',
    features: [
      'Heritage Palace Venue',
      'Designer Theme Decoration',
      'Celebrity Chef Catering',
      'International Artists',
      'Cinematic Production',
      'Vintage Car Fleet',
      'Premium Pandit Services',
      'Destination Planning',
      'Personal Wedding Coordinator'
    ],
    popular: false,
    color: 'from-purple-600 to-pink-600'
  }
];

// Floating decoration component
const FloatingDecoration = ({ delay = 0, duration = 3 }: { delay?: number; duration?: number }) => (
  <motion.div
    className="absolute w-16 h-16 opacity-20"
    animate={{
      y: [0, -20, 0],
      rotate: [0, 180, 360],
      scale: [1, 1.1, 1],
    }}
    transition={{
      duration,
      repeat: Infinity,
      delay,
      ease: "easeInOut"
    }}
  >
    <Flower2 className="w-full h-full text-[var(--royal-gold)]" />
  </motion.div>
);

const Dashboard = React.memo(function Dashboard({ user, onLogout, onNavigateToBooking, onNavigateToMyBookings }: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const nextTestimonial = React.useCallback(() => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  }, []);

  const prevTestimonial = React.useCallback(() => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, []);

  const filteredServices = React.useMemo(() => 
    selectedCategory 
      ? services.filter(s => s.id === selectedCategory)
      : services,
    [selectedCategory]
  );

  return (
    <div className="min-h-screen bg-[var(--royal-cream)] overflow-x-hidden">
      {/* Header */}
      <motion.header 
        className="bg-gradient-to-r from-[var(--royal-maroon)] to-[var(--royal-copper)] border-b-4 border-[var(--royal-gold)] sticky top-0 z-50 shadow-2xl"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div 
                className="relative"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Crown className="h-12 w-12 text-[var(--royal-gold)] fill-current" />
                <motion.div 
                  className="absolute -top-1 -right-1 w-3 h-3 bg-[var(--royal-gold)] rounded-full"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </motion.div>
              <span className="text-3xl text-[var(--royal-gold)] drop-shadow-lg">
                EventHub
              </span>
            </motion.div>
            
            <div className="flex items-center space-x-4">
              <motion.span 
                className="text-sm text-[var(--royal-cream)]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Welcome, {user.name}
              </motion.span>
              {onNavigateToMyBookings && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={onNavigateToMyBookings}
                    className="bg-white/10 text-[var(--royal-cream)] border-2 border-[var(--royal-gold)] hover:bg-[var(--royal-gold)] hover:text-white backdrop-blur-sm"
                  >
                    <Receipt className="h-4 w-4 mr-2" />
                    My Bookings
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
      </motion.header>

      {/* Hero Section */}
      <motion.section 
        className="relative min-h-[90vh] flex items-center justify-center overflow-hidden"
        style={{ opacity: heroOpacity, scale: heroScale }}
      >
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--royal-maroon)] via-[var(--royal-copper)] to-[var(--royal-orange)]">
          {/* Static Overlay Pattern - Reduced animation for performance */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, var(--royal-gold) 1px, transparent 1px),
                               radial-gradient(circle at 80% 80%, var(--royal-gold) 1px, transparent 1px)`,
              backgroundSize: '50px 50px'
            }}
          />
          
          {/* Simplified Decorative Elements */}
          <div className="absolute w-64 h-64 border-4 border-[var(--royal-gold)] rounded-full opacity-5 top-20 left-10" />
          <div className="absolute w-64 h-64 border-4 border-[var(--royal-gold)] rounded-full opacity-5 bottom-20 right-10" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div
              className="flex justify-center items-center space-x-4 mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4, type: "spring", stiffness: 200 }}
            >
              <Sparkles className="h-8 w-8 text-[var(--royal-gold)]" />
              <Crown className="h-12 w-12 text-[var(--royal-gold)] fill-current" />
              <Sparkles className="h-8 w-8 text-[var(--royal-gold)]" />
            </motion.div>

            <motion.h1 
              className="text-5xl md:text-7xl lg:text-8xl text-white mb-6 drop-shadow-2xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Celebrate Your
              <span 
                className="block text-[var(--royal-gold)]"
                style={{ textShadow: "0 0 30px rgba(212, 175, 55, 0.6)" }}
              >
                Royal Wedding
              </span>
            </motion.h1>

            <motion.p 
              className="text-xl md:text-2xl text-[var(--royal-cream)] mb-12 max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              Where tradition meets magnificence. Connect with India's finest wedding vendors 
              to create an unforgettable celebration fit for royalty.
            </motion.p>
          </motion.div>

        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-[var(--royal-gold)] rounded-full flex justify-center">
            <motion.div 
              className="w-1.5 h-3 bg-[var(--royal-gold)] rounded-full mt-2"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </motion.section>

      {/* Services Section with Filtering */}
      <section className="py-24 bg-gradient-to-b from-white to-[var(--royal-cream)] relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 right-10 w-40 h-40 bg-[var(--royal-maroon)] rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-60 h-60 bg-[var(--royal-gold)] rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="flex justify-center mb-4"
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex items-center space-x-3">
                <div className="w-16 h-0.5 bg-gradient-to-r from-transparent to-[var(--royal-gold)]" />
                <Sparkles className="h-6 w-6 text-[var(--royal-gold)]" />
                <div className="w-16 h-0.5 bg-gradient-to-l from-transparent to-[var(--royal-gold)]" />
              </div>
            </motion.div>
            
            <h2 className="text-5xl md:text-6xl text-[var(--royal-maroon)] mb-6">
              Premium Wedding Services
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Handpicked luxury services to make your special day extraordinary
            </p>
          </motion.div>

          {/* Animated Filter Bar */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-wrap items-center justify-center gap-3">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant={selectedCategory === null ? "default" : "outline"}
                  onClick={() => setSelectedCategory(null)}
                  className={`${
                    selectedCategory === null
                      ? 'bg-gradient-to-r from-[var(--royal-maroon)] to-[var(--royal-copper)] text-white border-2 border-[var(--royal-gold)]'
                      : 'border-2 border-[var(--royal-maroon)]/30 hover:border-[var(--royal-gold)]'
                  }`}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  All Services
                </Button>
              </motion.div>
              
              {services.map((service) => (
                <motion.div
                  key={service.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3 }}
                >
                  <Button
                    variant={selectedCategory === service.id ? "default" : "outline"}
                    onClick={() => setSelectedCategory(service.id)}
                    className={`${
                      selectedCategory === service.id
                        ? 'bg-gradient-to-r from-[var(--royal-maroon)] to-[var(--royal-copper)] text-white border-2 border-[var(--royal-gold)]'
                        : 'border-2 border-[var(--royal-maroon)]/30 hover:border-[var(--royal-gold)]'
                    }`}
                  >
                    <service.icon className="mr-2 h-4 w-4" />
                    {service.name}
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          {/* Animated Services Grid */}
          <AnimatePresence mode="wait">
            <motion.div 
              key={selectedCategory || 'all'}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {filteredServices.map((service, index) => {
                const IconComponent = service.icon;
                return (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -50 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    layout
                  >
                    <motion.div
                      whileHover={{ 
                        y: -10,
                        rotateY: 5,
                        rotateX: 5,
                      }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Card 
                        className="group cursor-pointer border-4 border-[var(--royal-gold)]/20 hover:border-[var(--royal-gold)] bg-white hover:shadow-2xl transition-all duration-500 overflow-hidden"
                        onClick={() => onNavigateToBooking(service.name)}
                      >
                        <div className="relative h-56 overflow-hidden">
                          <motion.div
                            whileHover={{ scale: 1.15 }}
                            transition={{ duration: 0.6 }}
                          >
                            <ImageWithFallback
                              src={service.image}
                              alt={service.name}
                              className="w-full h-full object-cover"
                            />
                          </motion.div>
                          
                          {/* Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          
                          {/* Floating Icon */}
                          <motion.div 
                            className="absolute top-4 left-4"
                            whileHover={{ rotate: 360, scale: 1.2 }}
                            transition={{ duration: 0.6 }}
                          >
                            <div className="bg-gradient-to-br from-[var(--royal-gold)] to-[var(--royal-orange)] backdrop-blur-sm rounded-2xl p-4 shadow-xl">
                              <IconComponent className="h-7 w-7 text-white" />
                            </div>
                          </motion.div>
                          
                          {/* Count Badge */}
                          <div className="absolute bottom-4 right-4">
                            <Badge className="bg-[var(--royal-maroon)] text-[var(--royal-gold)] border-2 border-[var(--royal-gold)] shadow-xl px-4 py-1">
                              {service.count}
                            </Badge>
                          </div>
                        </div>
                        
                        <CardHeader className="pb-3">
                          <CardTitle className="text-2xl text-[var(--royal-maroon)] group-hover:text-[var(--royal-copper)] transition-colors">
                            {service.name}
                          </CardTitle>
                          <CardDescription className="text-base">
                            {service.description}
                          </CardDescription>
                        </CardHeader>
                        
                        <CardContent className="pt-0">
                          <motion.div 
                            className="flex items-center text-[var(--royal-maroon)] group-hover:text-[var(--royal-gold)] transition-colors"
                            whileHover={{ x: 5 }}
                          >
                            <span className="mr-2">Explore Services</span>
                            <motion.span
                              animate={{ x: [0, 5, 0] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            >
                              →
                            </motion.span>
                          </motion.div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Testimonials Carousel Section */}
      <section className="py-24 bg-gradient-to-b from-[var(--royal-cream)] to-white relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-72 h-72 border-8 border-[var(--royal-gold)]/10 rounded-full" />
        <div className="absolute bottom-10 right-10 w-96 h-96 border-8 border-[var(--royal-maroon)]/10 rounded-full" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="flex justify-center mb-4"
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Quote className="h-12 w-12 text-[var(--royal-gold)]" />
            </motion.div>
            
            <h2 className="text-5xl md:text-6xl text-[var(--royal-maroon)] mb-6">
              Love Stories & Celebrations
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Hear from our delighted couples who created magical memories
            </p>
          </motion.div>

          {/* Carousel */}
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="border-4 border-[var(--royal-gold)] bg-gradient-to-br from-white to-amber-50 shadow-2xl">
                  <CardContent className="p-12">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                      {/* Image */}
                      <motion.div
                        className="relative"
                        whileHover={{ scale: 1.05 }}
                      >
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[var(--royal-gold)] shadow-xl">
                          <ImageWithFallback
                            src={testimonials[currentTestimonial].image}
                            alt={testimonials[currentTestimonial].name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <motion.div
                          className="absolute -top-2 -right-2 w-10 h-10 bg-[var(--royal-gold)] rounded-full flex items-center justify-center"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        >
                          <Crown className="h-6 w-6 text-white fill-current" />
                        </motion.div>
                      </motion.div>

                      {/* Content */}
                      <div className="flex-1 text-center md:text-left">
                        <Quote className="h-8 w-8 text-[var(--royal-gold)] mb-4" />
                        <p className="text-xl text-gray-700 mb-6 leading-relaxed italic">
                          "{testimonials[currentTestimonial].text}"
                        </p>
                        
                        <div className="mb-4">
                          <h4 className="text-2xl text-[var(--royal-maroon)] mb-1">
                            {testimonials[currentTestimonial].name}
                          </h4>
                          <p className="text-[var(--royal-gold)]">
                            {testimonials[currentTestimonial].event}
                          </p>
                          <p className="text-gray-600 flex items-center justify-center md:justify-start mt-2">
                            <MapPin className="h-4 w-4 mr-1" />
                            {testimonials[currentTestimonial].location}
                          </p>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center justify-center md:justify-start space-x-1">
                          {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                            <motion.div
                              key={i}
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ delay: i * 0.1, type: "spring" }}
                            >
                              <Star className="h-6 w-6 text-[var(--royal-gold)] fill-current" />
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={prevTestimonial}
                  className="w-12 h-12 rounded-full border-2 border-[var(--royal-gold)] hover:bg-[var(--royal-gold)] hover:text-white"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
              </motion.div>

              {/* Indicators */}
              <div className="flex items-center gap-2">
                {testimonials.map((_, index) => (
                  <motion.button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`h-3 rounded-full transition-all ${
                      index === currentTestimonial
                        ? 'w-8 bg-[var(--royal-gold)]'
                        : 'w-3 bg-[var(--royal-gold)]/30'
                    }`}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  />
                ))}
              </div>

              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={nextTestimonial}
                  className="w-12 h-12 rounded-full border-2 border-[var(--royal-gold)] hover:bg-[var(--royal-gold)] hover:text-white"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-gray-900 to-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Crown className="h-8 w-8 text-[var(--royal-gold)] fill-current" />
                <span className="text-xl text-[var(--royal-gold)]">EventHub</span>
              </div>
              <p className="text-gray-400">
                Connecting couples with the finest event vendors since 2025.
              </p>
            </div>
            <div>
              <h3 className="text-[var(--royal-gold)] mb-4">Services</h3>
              <ul className="space-y-2 text-gray-400">
                <li 
                  className="hover:text-[var(--royal-gold)] cursor-pointer transition-colors"
                  onClick={() => onNavigateToBooking('Function Hall')}
                >
                  Function Hall
                </li>
                <li 
                  className="hover:text-[var(--royal-gold)] cursor-pointer transition-colors"
                  onClick={() => onNavigateToBooking('Music & Entertainment')}
                >
                  Music & Entertainment
                </li>
                <li 
                  className="hover:text-[var(--royal-gold)] cursor-pointer transition-colors"
                  onClick={() => onNavigateToBooking('Catering')}
                >
                  Catering
                </li>
                <li 
                  className="hover:text-[var(--royal-gold)] cursor-pointer transition-colors"
                  onClick={() => onNavigateToBooking('Wedding Cars')}
                >
                  Wedding Cars
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-[var(--royal-gold)] mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li 
                  className="hover:text-[var(--royal-gold)] cursor-pointer transition-colors"
                  onClick={() => onNavigateHome()}
                >
                  Help Center
                </li>
                <li 
                  className="hover:text-[var(--royal-gold)] cursor-pointer transition-colors"
                  onClick={() => onNavigateHome()}
                >
                  Contact Us
                </li>
                <li 
                  className="hover:text-[var(--royal-gold)] cursor-pointer transition-colors"
                  onClick={() => onNavigateHome()}
                >
                  Vendor Registration
                </li>
                <li 
                  className="hover:text-[var(--royal-gold)] cursor-pointer transition-colors"
                  onClick={() => onNavigateHome()}
                >
                  Terms & Conditions
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-[var(--royal-gold)] mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400">
                <li>support@eventhub.com</li>
                <li>+91 98765 43210</li>
                <li>Mumbai, India</li>
              </ul>
            </div>
          </motion.div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2025 EventHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
});

export default Dashboard;