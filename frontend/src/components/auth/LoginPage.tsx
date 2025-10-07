import React, { useState } from 'react';
// Changed from 'motion/react' to 'framer-motion' for standard practice in this combined file structure
import { motion, AnimatePresence } from 'framer-motion'; 
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
// Added ListTodo icon for the new Category selector
import { Heart, Users, MapPin, Crown, Sparkles, Star, Flower2, Mail, Lock, User, Phone, Building, CheckCircle, ListTodo } from 'lucide-react'; 
import { ImageWithFallback } from '../figma/ImageWithFallback';

// --- BACKEND INTEGRATION IMPORTS ---
import { loginUser, registerUser } from '../services/authService'; 
// NOTE: Ensure your 'authService.js' file exists with the API logic as discussed.
// ------------------------------------

interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'vendor';
}

interface LoginPageProps {
  onLogin: (user: User) => void;
}

// Vendor categories (Must match Mongoose enum)
const VENDOR_CATEGORIES = [
  'Function Hall', 'Music', 'Decoration', 'Car', 'Catering', 'Pandit'
];

// Floating particle component (Unchanged)
const FloatingParticle = ({ delay = 0, position = 0 }: { delay?: number; position?: number }) => (
  <motion.div
    className="absolute"
    style={{
      left: `${position}%`,
      bottom: -20
    }}
    animate={{
      y: [-20, -800],
      opacity: [0, 1, 1, 0],
    }}
    transition={{
      duration: 8 + Math.random() * 4,
      delay,
      repeat: Infinity,
      ease: "linear"
    }}
  >
    <Sparkles className="h-4 w-4 text-[var(--royal-gold)]" />
  </motion.div>
);

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [userType, setUserType] = useState<'customer' | 'vendor'>('customer');
  const [error, setError] = useState<string | null>(null); // State for displaying API errors
  const [loading, setLoading] = useState(false); // State for disabling button during API call
  
  // MODIFIED: Updated formData to include all backend requirements
  const [formData, setFormData] = useState({
    name: '',
    username: '', // <-- NEW: User Model Requirement
    email: '',
    password: '',
    phone: '',
    businessName: '',
    location: '', // <-- NEW: Profile Model Requirement
    category: VENDOR_CATEGORIES[0] // <-- NEW: Vendor Profile Requirement
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // MODIFIED: Updated handleSubmit to include API logic
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let response;

      if (isSignUp) {
        // --- SIGN UP LOGIC (Calls /api/auth/signup/role) ---
        const signupPayload = {
          // Fields required by User model
          username: formData.username,
          email: formData.email,
          password: formData.password,
          
          // Fields required by Customer/Vendor Profiles
          name: formData.name, 
          phone: formData.phone,
          location: formData.location, 
        };

        if (userType === 'vendor') {
          // Add vendor-specific fields
          Object.assign(signupPayload, {
            businessName: formData.businessName,
            category: formData.category, 
          });
        }
        
        // Call the service layer
        response = await registerUser(signupPayload, userType);
        
      } else {
        // --- LOGIN LOGIC (Calls /api/auth/login) ---
        response = await loginUser(formData.email, formData.password);
      }

      // --- Success Handling ---
      const { token, role, userId } = response;

      // 1. Store Token (Essential for all protected API calls)
      localStorage.setItem('authToken', token);

      // 2. Prepare User Object for App State
      const userDetails = {
        id: userId,
        name: formData.name || formData.username || formData.email, // Use best available name
        email: formData.email,
        role: role,
      };

      // 3. Navigate the user (handled by parent component via onLogin)
      onLogin(userDetails); 

    } catch (err: any) {
      // Catch and display the error message returned from the backend
      setError(err.message || "An unexpected error occurred. Check server status.");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: Crown, text: 'Premium Vendors', color: 'from-[var(--royal-maroon)] to-[var(--royal-copper)]' },
    { icon: Star, text: 'Verified Quality', color: 'from-[var(--royal-gold)] to-[var(--royal-orange)]' },
    { icon: CheckCircle, text: 'Trusted by 10,000+', color: 'from-[var(--royal-emerald)] to-green-500' },
    { icon: MapPin, text: '50+ Cities', color: 'from-purple-600 to-pink-600' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--royal-maroon)] via-[var(--royal-copper)] to-[var(--royal-orange)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated gradient overlay */}
        <motion.div 
          className="absolute inset-0 opacity-20"
          animate={{ 
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, var(--royal-gold) 1px, transparent 1px),
                             radial-gradient(circle at 80% 80%, var(--royal-gold) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />

        {/* Floating particles */}
        {[...Array(8)].map((_, i) => (
          <FloatingParticle key={i} delay={i * 0.8} position={(i * 12.5) + Math.random() * 10} />
        ))}

        {/* Rotating mandalas */}
        <motion.div
          className="absolute w-96 h-96 border-4 border-[var(--royal-gold)] rounded-full opacity-10 top-0 left-0"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute w-96 h-96 border-4 border-[var(--royal-gold)] rounded-full opacity-10 bottom-0 right-0"
          animate={{ rotate: -360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        />

        {/* Floating flowers */}
        <motion.div
          className="absolute top-10 left-10"
          animate={{
            y: [0, -20, 0],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 5, repeat: Infinity }}
        >
          <Flower2 className="h-12 w-12 text-[var(--royal-gold)] opacity-10" />
        </motion.div>
        <motion.div
          className="absolute top-40 right-20"
          animate={{
            y: [0, -20, 0],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 6, repeat: Infinity, delay: 1 }}
        >
          <Flower2 className="h-12 w-12 text-[var(--royal-gold)] opacity-10" />
        </motion.div>
        <motion.div
          className="absolute bottom-20 left-1/3"
          animate={{
            y: [0, -20, 0],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 7, repeat: Infinity, delay: 2 }}
        >
          <Flower2 className="h-12 w-12 text-[var(--royal-gold)] opacity-10" />
        </motion.div>
      </div>

      <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Left side - Branding & Features */}
        <motion.div 
          className="hidden lg:block space-y-8"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Logo & Title */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="flex items-center space-x-4">
              <motion.div
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <div className="relative">
                  <Crown className="h-16 w-16 text-[var(--royal-gold)] fill-current drop-shadow-2xl" />
                  <motion.div
                    className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--royal-gold)] rounded-full"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
              </motion.div>
              <div>
                <motion.h1 
                  className="text-6xl text-white drop-shadow-2xl"
                  animate={{ 
                    textShadow: [
                      "0 0 20px rgba(212, 175, 55, 0.5)",
                      "0 0 40px rgba(212, 175, 55, 0.8)",
                      "0 0 20px rgba(212, 175, 55, 0.5)",
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  EventHub
                </motion.h1>
                <p className="text-[var(--royal-gold)] text-xl">Where Dreams Come True</p>
              </div>
            </div>

            <motion.p 
              className="text-xl text-white/90 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Step into a world of royal celebrations. Connect with India's finest wedding vendors 
              and create memories that last forever.
            </motion.p>
          </motion.div>

          {/* Feature Cards */}
          <div className="grid grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <div className={`bg-white/10 backdrop-blur-md rounded-2xl p-5 border-2 border-white/20 hover:border-[var(--royal-gold)] transition-all duration-300`}>
                  <motion.div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-3 shadow-lg`}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <feature.icon className="h-6 w-6 text-white" />
                  </motion.div>
                  <p className="text-white">{feature.text}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Image Gallery */}
          <motion.div
            className="grid grid-cols-2 gap-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            {[
              'https://images.unsplash.com/photo-1739047598460-f249269b7708?w=400&h=250&fit=crop',
              'https://images.unsplash.com/photo-1587271407850-8d438ca9fdf2?w=400&h=250&fit=crop'
            ].map((img, index) => (
              <motion.div
                key={index}
                className="relative rounded-2xl overflow-hidden border-4 border-[var(--royal-gold)] shadow-2xl group cursor-pointer"
                whileHover={{ scale: 1.05, rotate: index === 0 ? -2 : 2 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <ImageWithFallback
                  src={img}
                  alt={`Wedding ${index + 1}`}
                  className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <motion.div 
                  className="absolute bottom-3 left-3 flex items-center space-x-2"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                >
                  <Star className="h-4 w-4 text-[var(--royal-gold)] fill-current" />
                  <span className="text-white text-sm">Premium Venue</span>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right side - Login/Signup Form */}
        <motion.div
          className="w-full max-w-md mx-auto"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <motion.div
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="border-4 border-[var(--royal-gold)] shadow-2xl bg-white/95 backdrop-blur-md overflow-hidden">
              {/* Decorative header gradient */}
              <div className="h-2 bg-gradient-to-r from-[var(--royal-maroon)] via-[var(--royal-gold)] to-[var(--royal-orange)]" />
              
              <CardHeader className="text-center space-y-4 pt-8">
                {/* Mobile Logo */}
                <motion.div 
                  className="lg:hidden flex items-center justify-center space-x-3 mb-2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <Crown className="h-10 w-10 text-[var(--royal-gold)] fill-current" />
                  <span className="text-3xl text-[var(--royal-maroon)]">
                    EventHub
                  </span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <CardTitle className="text-3xl text-[var(--royal-maroon)]">
                    {isSignUp ? 'Begin Your Journey' : 'Welcome Back'}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {isSignUp 
                      ? 'Join the royal celebration of love and traditions' 
                      : 'Sign in to continue planning your dream wedding'}
                  </CardDescription>
                </motion.div>

                {/* Decorative divider */}
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-16 h-0.5 bg-gradient-to-r from-transparent to-[var(--royal-gold)]" />
                  <Sparkles className="h-4 w-4 text-[var(--royal-gold)]" />
                  <div className="w-16 h-0.5 bg-gradient-to-l from-transparent to-[var(--royal-gold)]" />
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6 px-8 pb-8">
                {/* Error Message Display (NEW) */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-3 text-sm font-medium text-white bg-red-600 rounded-lg text-center border border-red-800"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <Tabs value={userType} onValueChange={(value) => setUserType(value as 'customer' | 'vendor')}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <TabsList className="grid w-full grid-cols-2 bg-[var(--royal-cream)] p-1">
                      <TabsTrigger 
                        value="customer"
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[var(--royal-maroon)] data-[state=active]:to-[var(--royal-copper)] data-[state=active]:text-white"
                      >
                        <Heart className="h-4 w-4 mr-2" />
                        Customer
                      </TabsTrigger>
                      <TabsTrigger 
                        value="vendor"
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[var(--royal-maroon)] data-[state=active]:to-[var(--royal-copper)] data-[state=active]:text-white"
                      >
                        <Crown className="h-4 w-4 mr-2" />
                        Vendor
                      </TabsTrigger>
                    </TabsList>
                  </motion.div>
                  
                  <AnimatePresence mode="wait">
                    <motion.form 
                      key={isSignUp ? 'signup' : 'login'}
                      onSubmit={handleSubmit} 
                      className="space-y-4 mt-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      
                      {/* --- COMMON LOGIN FIELDS (Email/Password) --- */}
                      
                      <div className="relative group">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--royal-maroon)]/50 group-focus-within:text-[var(--royal-maroon)] transition-colors" />
                        <Input
                          type="email"
                          placeholder="Email Address"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="pl-10 h-12 bg-white border-2 border-[var(--royal-maroon)]/20 focus:border-[var(--royal-gold)] text-gray-900"
                          required
                        />
                      </div>
                      
                      <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--royal-maroon)]/50 group-focus-within:text-[var(--royal-maroon)] transition-colors" />
                        <Input
                          type="password"
                          placeholder="Password"
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          className="pl-10 h-12 bg-white border-2 border-[var(--royal-maroon)]/20 focus:border-[var(--royal-gold)] text-gray-900"
                          required
                        />
                      </div>


                      {/* --- SIGNUP FIELDS (CONDITIONAL) --- */}
                      {isSignUp && (
                        <motion.div
                          className="space-y-4"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          
                          {/* 1. Full Name (CustomerProfile: name) */}
                          <div className="relative group">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--royal-maroon)]/50 group-focus-within:text-[var(--royal-maroon)] transition-colors" />
                            <Input
                              placeholder="Full Name (for your profile)"
                              value={formData.name}
                              onChange={(e) => handleInputChange('name', e.target.value)}
                              className="pl-10 h-12 bg-white border-2 border-[var(--royal-maroon)]/20 focus:border-[var(--royal-gold)] text-gray-900"
                              required
                            />
                          </div>
                          
                          {/* 2. Username (User: username) - CRITICAL BACKEND REQUIREMENT */}
                          <div className="relative group">
                            <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--royal-maroon)]/50 group-focus-within:text-[var(--royal-maroon)] transition-colors" />
                            <Input
                              placeholder="Username (Unique Login ID)"
                              value={formData.username}
                              onChange={(e) => handleInputChange('username', e.target.value)}
                              className="pl-10 h-12 bg-white border-2 border-[var(--royal-maroon)]/20 focus:border-[var(--royal-gold)] text-gray-900"
                              required
                            />
                          </div>

                          {/* 3. Location (CustomerProfile/VendorProfile: location) - CRITICAL BACKEND REQUIREMENT */}
                          <div className="relative group">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--royal-maroon)]/50 group-focus-within:text-[var(--royal-maroon)] transition-colors" />
                            <Input
                              placeholder="City / Primary Location"
                              value={formData.location}
                              onChange={(e) => handleInputChange('location', e.target.value)}
                              className="pl-10 h-12 bg-white border-2 border-[var(--royal-maroon)]/20 focus:border-[var(--royal-gold)] text-gray-900"
                              required
                            />
                          </div>
                          
                          {/* 4. Phone Number (CustomerProfile: phone) */}
                          <div className="relative group">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--royal-maroon)]/50 group-focus-within:text-[var(--royal-maroon)] transition-colors" />
                            <Input
                              placeholder="Phone Number"
                              value={formData.phone}
                              onChange={(e) => handleInputChange('phone', e.target.value)}
                              className="pl-10 h-12 bg-white border-2 border-[var(--royal-maroon)]/20 focus:border-[var(--royal-gold)] text-gray-900"
                              required
                            />
                          </div>
                          
                          {/* --- VENDOR SPECIFIC FIELDS --- */}
                          {userType === 'vendor' && (
                            <motion.div
                                className="space-y-4"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                {/* 5. Business Name (VendorProfile: businessName) */}
                                <div className="relative group">
                                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--royal-maroon)]/50 group-focus-within:text-[var(--royal-maroon)] transition-colors" />
                                  <Input
                                    placeholder="Business Name"
                                    value={formData.businessName}
                                    onChange={(e) => handleInputChange('businessName', e.target.value)}
                                    className="pl-10 h-12 bg-white border-2 border-[var(--royal-maroon)]/20 focus:border-[var(--royal-gold)] text-gray-900"
                                    required
                                  />
                                </div>
                                
                                {/* 6. Category Selector (VendorProfile: category) - CRITICAL BACKEND REQUIREMENT */}
                                <div className="relative group">
                                    <ListTodo className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--royal-maroon)]/50 group-focus-within:text-[var(--royal-maroon)] transition-colors" />
                                    <select
                                        value={formData.category}
                                        onChange={(e) => handleInputChange('category', e.target.value)}
                                        className="pl-10 pr-4 h-12 w-full bg-white border-2 border-[var(--royal-maroon)]/20 focus:border-[var(--royal-gold)] text-gray-900 rounded-lg appearance-none"
                                        required
                                    >
                                        {VENDOR_CATEGORIES.map(cat => (
                                            <option key={cat} value={cat}>
                                                {cat}
                                            </option>
                                        ))}
                                    </select>
                                    {/* Small visual indicator for dropdown */}
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--royal-maroon)]/80">▼</div>
                                </div>
                            </motion.div>
                          )}
                        </motion.div>
                      )}
                      
                      {/* --- SUBMIT BUTTON --- */}
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button 
                          type="submit" 
                          disabled={loading} // <-- DISABLE BUTTON WHEN LOADING
                          className="w-full h-12 bg-gradient-to-r from-[var(--royal-maroon)] to-[var(--royal-copper)] hover:from-[var(--royal-copper)] hover:to-[var(--royal-maroon)] text-white shadow-xl border-2 border-[var(--royal-gold)]"
                        >
                           {loading ? (
                            <span className="flex items-center">
                              <Sparkles className="mr-2 h-5 w-5 animate-spin" />
                              Processing...
                            </span>
                          ) : (
                            <>
                              <Sparkles className="mr-2 h-5 w-5" />
                              {isSignUp ? 'Create Account' : 'Sign In'}
                              <Sparkles className="ml-2 h-5 w-5" />
                            </>
                          )}
                        </Button>
                      </motion.div>
                    </motion.form>
                  </AnimatePresence>
                </Tabs>
                
                <div className="text-center space-y-3">
                  <motion.button
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-[var(--royal-maroon)] hover:text-[var(--royal-gold)] underline transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                  </motion.button>

                  <div className="pt-4 border-t border-[var(--royal-gold)]/20">
                    <p className="text-sm text-gray-600 mb-2">Quick Demo Access</p>
                    <p className="text-xs text-[var(--royal-gold)]">
                      Use any email and password to explore
                    </p>
                  </div>
                </div>
              </CardContent>

              {/* Decorative footer gradient */}
              <div className="h-2 bg-gradient-to-r from-[var(--royal-maroon)] via-[var(--royal-gold)] to-[var(--royal-orange)]" />
            </Card>
          </motion.div>

          {/* Trust indicators below card */}
          <motion.div
            className="mt-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="flex items-center justify-center space-x-6 text-white/80">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-[var(--royal-gold)]" />
                <span className="text-sm">Secure Login</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-[var(--royal-gold)] fill-current" />
                <span className="text-sm">Trusted Platform</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}