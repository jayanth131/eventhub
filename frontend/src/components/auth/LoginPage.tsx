import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

import {
  Heart, Users, MapPin, Crown, Sparkles, Star, Flower2, Mail,
  Lock, User, Phone, Building, CheckCircle, ListTodo
} from 'lucide-react';

import { ImageWithFallback } from '../figma/ImageWithFallback';

import { loginUser, registerUser } from '../services/authService';
import { adminLogin } from "../../admin/adminService.js";

// Vendor categories
const VENDOR_CATEGORIES = [
  'Function Hall', 'Music', 'Decoration', 'Car', 'Catering', 'Pandit'
];

// Floating particles
const FloatingParticle = ({ delay = 0, position = 0 }) => (
  <motion.div
    className="absolute"
    style={{ left: `${position}%`, bottom: -20 }}
    animate={{ y: [-20, -800], opacity: [0, 1, 1, 0] }}
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

export default function LoginPage({ onLogin }) {

  
  const [isSignUp, setIsSignUp] = useState(false);
  const [userType, setUserType] = useState("customer");
  const [isAdminLogin, setIsAdminLogin] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // CUSTOMER + VENDOR form
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    phone: "",
    businessName: "",
    location: "",
    category: VENDOR_CATEGORIES[0],
  });



  // ADMIN form
  const [adminData, setAdminData] = useState({
    email: "",
    password: ""
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // -----------------------
  // 🔥 Submit Handler
  // -----------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // =======================
      // 🔥 ADMIN LOGIN
      // =======================
      if (isAdminLogin) {
        const data = await adminLogin(adminData.email, adminData.password);

        if (!data.success) throw new Error(data.message);

        // Store admin token
        localStorage.setItem("authToken", data.token);

        onLogin({
          id: data.userId,
          name: "Administrator",
          email: adminData.email,
          role: "admin",
        });

        setLoading(false);
        return;
      }

      // =======================
      // CUSTOMER / VENDOR LOGIN
      // =======================
      let response;

      if (isSignUp) {
        const payload = {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          name: formData.name,
          phone: formData.phone,
          location: formData.location,
        };

        if (userType === "vendor") {
          payload.businessName = formData.businessName;
          payload.category = formData.category;
        }

        response = await registerUser(payload, userType);
      } else {
        response = await loginUser(formData.email, formData.password);
      }

      if (!response.success) throw new Error(response.message);

      localStorage.setItem("authToken", response.token);

      onLogin({
        id: response.userId,
        name: formData.name || formData.username || formData.email,
        email: formData.email,
        role: response.role,
        profileId: response.profileId,
      });

    } catch (err) {
      setError(err.message || "Login failed.");
    }

    setLoading(false);
  };

  // Decorative features
  const features = [
    { icon: Crown, text: 'Premium Vendors', color: 'from-[var(--royal-maroon)] to-[var(--royal-copper)]' },
    { icon: Star, text: 'Verified Quality', color: 'from-[var(--royal-gold)] to-[var(--royal-orange)]' },
    { icon: CheckCircle, text: 'Trusted by 10,000+', color: 'from-[var(--royal-emerald)] to-green-500' },
    { icon: MapPin, text: '50+ Cities', color: 'from-purple-600 to-pink-600' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--royal-maroon)] via-[var(--royal-copper)] to-[var(--royal-orange)] flex items-center justify-center p-4 relative overflow-hidden">

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <FloatingParticle key={i} delay={i * 0.8} position={10 + i * 10} />
        ))}
      </div>

      <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-12 items-center relative z-10">

        {/* LEFT SIDE DESIGN (UNCHANGED) */}
        <motion.div
          className="hidden lg:block space-y-10"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="flex items-center space-x-4">
            <Crown className="h-16 w-16 text-[var(--royal-gold)]" />
            <h1 className="text-6xl text-white drop-shadow-2xl">EventHub</h1>
          </div>

          <p className="text-xl text-white/90">India's most trusted royal booking platform.</p>

          <div className="grid grid-cols-2 gap-4">
            {features.map((f, i) => (
              <div key={i} className="p-5 bg-white/10 rounded-xl border border-white/20">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${f.color} flex items-center justify-center text-white`}>
                  <f.icon className="h-6 w-6" />
                </div>
                <p className="text-white mt-3">{f.text}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* RIGHT SIDE — LOGIN CARD */}
        <motion.div
          className="w-full max-w-md mx-auto"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="border-4 border-[var(--royal-gold)] shadow-2xl bg-white/95">

            <CardHeader className="text-center pt-8">
              <CardTitle className="text-3xl text-[var(--royal-maroon)]">
                {isAdminLogin ? "Admin Login" : isSignUp ? "Create Your Account" : "Welcome Back"}
              </CardTitle>
            </CardHeader>

            {/* ERROR */}
            {error && (
              <div className="mx-6 p-3 bg-red-600 text-black rounded-lg text-center">
                {error}
              </div>
            )}

            <CardContent className="px-8 pb-8">

              {/* ░░░░░░░░░░░░░ ADMIN LOGIN MODE ░░░░░░░░░░░░░ */}
              {isAdminLogin && (
                <form onSubmit={handleSubmit} className="space-y-4 mt-6">

                  <Input
                    placeholder="Admin Email"
                    value={adminData.email}
                    onChange={(e) => setAdminData({ ...adminData, email: e.target.value })}
                    className="h-12"
                  />

                  <Input
                    type="password"
                    placeholder="Password"
                    value={adminData.password}
                    onChange={(e) => setAdminData({ ...adminData, password: e.target.value })}
                    className="h-12"
                  />

                  <Button
                    type="submit"
                    className="w-full h-12 bg-[var(--royal-maroon)] text-white"
                  >
                    {loading ? "Checking…" : "Login"}
                  </Button>

                  <button
                    type="button"
                    onClick={() => setIsAdminLogin(false)}
                    className="text-[var(--royal-gold)] underline w-full text-center"
                  >
                    ← Back to User Login
                  </button>

                </form>
              )}

              {/* ░░░░░░░░░░ CUSTOMER / VENDOR UI (unchanged) ░░░░░░░░░░ */}
              {!isAdminLogin && (
                <>
                  <Tabs value={userType} onValueChange={setUserType} className="mt-6">
<TabsList className="grid grid-cols-2 bg-white p-1 rounded-xl shadow-sm border border-[var(--royal-gold)]/30">

  <TabsTrigger
    value="customer"
    className="
      text-[var(--royal-maroon)]
      transition-all duration-300
      data-[state=active]:bg-gradient-to-r
      data-[state=active]:from-[var(--royal-maroon)]
      data-[state=active]:to-[var(--royal-copper)]
      data-[state=active]:text-white
      rounded-lg
    "
  >
    Customer
  </TabsTrigger>

  <TabsTrigger
    value="vendor"
    className="
      text-[var(--royal-maroon)]
      transition-all duration-300
      data-[state=active]:bg-gradient-to-r
      data-[state=active]:from-[var(--royal-maroon)]
      data-[state=active]:to-[var(--royal-copper)]
      data-[state=active]:text-white
      rounded-lg
    "
  >
    Vendor
  </TabsTrigger>

</TabsList>



                    <TabsContent value={userType}>
                      <form onSubmit={handleSubmit} className="space-y-4 mt-6">

                        {/* Email */}
                        <Input
                          placeholder="Email"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          className="h-12"
                          required
                        />

                        {/* Password */}
                        <Input
                          type="password"
                          placeholder="Password"
                          value={formData.password}
                          onChange={(e) => handleInputChange("password", e.target.value)}
                          className="h-12"
                          required
                        />

                        {/* Signup extra fields */}
                        {isSignUp && (
                          <div className="space-y-4">

                            <Input
                              placeholder="Full Name"
                              value={formData.name}
                              onChange={(e) => handleInputChange("name", e.target.value)}
                              className="h-12"
                              required
                            />

                            <Input
                              placeholder="Username"
                              value={formData.username}
                              onChange={(e) => handleInputChange("username", e.target.value)}
                              className="h-12"
                              required
                            />

                            <Input
                              placeholder="Location"
                              value={formData.location}
                              onChange={(e) => handleInputChange("location", e.target.value)}
                              className="h-12"
                              required
                            />

                            <Input
                              placeholder="Phone"
                              value={formData.phone}
                              onChange={(e) => handleInputChange("phone", e.target.value)}
                              className="h-12"
                              required
                            />

                            {userType === "vendor" && (
                              <>
                                <Input
                                  placeholder="Business Name"
                                  value={formData.businessName}
                                  onChange={(e) => handleInputChange("businessName", e.target.value)}
                                  className="h-12"
                                  required
                                />

                                <select
                                  value={formData.category}
                                  onChange={(e) => handleInputChange("category", e.target.value)}
                                  className="h-12 w-full border rounded-md px-3"
                                >
                                  {VENDOR_CATEGORIES.map(c => (
                                    <option key={c}>{c}</option>
                                  ))}
                                </select>
                              </>
                            )}

                          </div>
                        )}

                        <Button
                          type="submit"
                          className="w-full h-12 bg-[var(--royal-maroon)] text-white"
                        >
                          {loading ? "Processing…" : isSignUp ? "Create Account" : "Sign In"}
                        </Button>

                      </form>
                    </TabsContent>
                  </Tabs>

                  {/* Toggle SignUp / Login */}
                  <div className="mt-4 text-center">
                    <button
                      onClick={() => setIsSignUp(!isSignUp)}
                      className="text-[var(--royal-maroon)] underline"
                    >
                      {isSignUp ? "Already have an account? Login" : "No account? Sign Up"}
                    </button>
                  </div>

                  {/* ADMIN LOGIN LINK */}
                  <div className="mt-6 pt-4 border-t text-center">
                    <button
                      onClick={() => {
                        setIsAdminLogin(true);
                        setIsSignUp(false);
                      }}
                      className="text-[var(--royal-gold)] underline"
                    >
                      Login as Admin →
                    </button>
                  </div>
                </>
              )}

            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
