// App.tsx (FULL + STRIPE INTEGRATED)

import React, { useState, lazy, Suspense, useCallback, useEffect } from 'react';
import LoginPage from './components/auth/LoginPage';
import { Toaster } from './components/ui/sonner';
import ErrorBoundary from './components/ErrorBoundary';
import AdminDashboard from './admin/AdminDashboard.jsx'

// New Imports
import { getStoredTokenPayload } from './components/utils/authUtils.js';
import { fetchMyProfile } from "./components/services/authService.js";
import VendorDashboard from './components/vendor/VendorDashboardAnimated.js';
import Dashboard from './components/Dashboard.js';
import MyBookings from './components/customer/MyBookings.js';
import CustomerBooking from './components/customer/CustomerBooking.js';
import ManageServices from './components/vendor/ManageServices.js';

// ⭐ STRIPE IMPORTS — NEW ⭐
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
const stripePromise = loadStripe("pk_test_51RMY3IRiXqTdx1bzJAH7ceJWOxLkpfUOLUtKZSWUyWEClZeebpEb6mvh2HQ4zctPi1G6yk2Pl0qNNpu1lGF45VOg00i6ghxtpH"); // Replace with publishable key

// Loading UX
const LoadingScreen = () => (
  <div className="min-h-screen bg-gradient-to-br from-[var(--royal-cream)] to-amber-50 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-[var(--royal-gold)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-[var(--royal-maroon)] text-xl">Loading EventHub...</p>
      <p className="text-gray-600 text-sm mt-2">Please wait while we prepare your experience</p>
    </div>
  </div>
);

type UserRole = 'customer' | 'vendor' | null;

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<'home' | 'booking' | 'dashboard' | 'myBookings' | 'manageServices'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // On Login
  const handleLogin = useCallback((user: User) => {
    setCurrentUser(user);
    if (user.role === 'vendor') {
      setCurrentPage('dashboard');
    }
    if (currentUser.role === "admin") {
  return <AdminDashboard onLogout={handleLogout} />;
}

    
    else {
      setCurrentPage('home');
    }
  }, []);

  // Logout Logic
  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    setCurrentPage('home');
    setSelectedCategory(null);
    localStorage.removeItem('authToken');
  }, []);

  const handleNavigateToBooking = useCallback((category?: string) => {
    setSelectedCategory(category || null);
    setCurrentPage('booking');
  }, []);

  // -------------------------------------
  // AUTH HYDRATION LOGIC
  // -------------------------------------
  useEffect(() => {
    const hydrateAuth = async () => {
      const storedPayload = getStoredTokenPayload();

      if (storedPayload) {
        try {
          const profileData = await fetchMyProfile();
          setCurrentUser(profileData as User);

          if (profileData.role === 'vendor') {
            setCurrentPage('dashboard');
          } else {
            setCurrentPage('home');
          }

        } catch (error) {
          console.error("Profile fetch failed, logging out:", error);
          handleLogout();
        }
      }

      setIsCheckingAuth(false);
    };

    hydrateAuth();
  }, [handleLogout]);

  // Show loading during auth check
  if (isCheckingAuth) {
    return <LoadingScreen />;
  }

  // If not logged in → show login page
  if (!currentUser) {
    return (
      <ErrorBoundary>
        <LoginPage onLogin={handleLogin} />
        <Toaster richColors position="top-right" />
      </ErrorBoundary>
    );
  }

 // ---------------------------
// ⭐ APP WITH STRIPE WRAPPER ⭐
// ---------------------------
return (
  <Elements stripe={stripePromise}>
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <Suspense fallback={<LoadingScreen />}>

          {/* ⭐ ADMIN VIEW ⭐ */}
          {currentUser.role === "admin" ? (
            <AdminDashboard
              user={currentUser}
              onLogout={handleLogout}
            />
          ) : currentUser.role === "vendor" ? (
            /* ⭐ VENDOR VIEW ⭐ */
            currentPage === 'manageServices' ? (
              <ManageServices
                user={currentUser}
                onBack={() => setCurrentPage('dashboard')}
              />
            ) : (
              <VendorDashboard
                user={currentUser}
                onLogout={handleLogout}
                onNavigateToManageServices={() => setCurrentPage('manageServices')}
              />
            )
          ) : (
            /* ⭐ CUSTOMER VIEW ⭐ */
            <>
              {currentPage === 'home' && (
                <Dashboard
                  user={currentUser}
                  onLogout={handleLogout}
                  onNavigateToBooking={handleNavigateToBooking}
                  onNavigateHome={() => setCurrentPage('home')}
                  onNavigateToMyBookings={() => setCurrentPage('myBookings')}
                />
              )}

              {currentPage === 'booking' && (
                <CustomerBooking
                  user={currentUser}
                  category={selectedCategory}
                  onNavigateHome={() => setCurrentPage('home')}
                  onLogout={handleLogout}
                  onNavigateToMyBookings={() => setCurrentPage('myBookings')}
                />
              )}

              {currentPage === 'myBookings' && (
                <MyBookings
                  user={currentUser}
                  onNavigateHome={() => setCurrentPage('home')}
                  onLogout={handleLogout}
                />
              )}
            </>
          )}

        </Suspense>
      </div>

      <Toaster richColors position="top-right" />
    </ErrorBoundary>
  </Elements>
);
}
