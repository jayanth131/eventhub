// App.tsx (Modified)

import React, { useState, lazy, Suspense, useCallback, useEffect } from 'react'; // <-- ADDED useEffect
import LoginPage from './components/auth/LoginPage';
import { Toaster } from './components/ui/sonner';
import ErrorBoundary from './components/ErrorBoundary';

// --- NEW IMPORTS ---
import { getStoredTokenPayload } from './components/utils/authUtils.js'; 
import { fetchMyProfile } from "./components/services/authService.js"; 
import VendorDashboard from './components/vendor/VendorDashboardAnimated.js';
import Dashboard from './components/Dashboard.js';
import MyBookings from './components/customer/MyBookings.js';4
import CustomerBooking from './components/customer/CustomerBooking.js';
import ManageServices from './components/vendor/ManageServices.js';
// --------------------
// Lazy load heavy components with retry logic (Unchanged)
// ...

// Loading component (Unchanged)
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
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); // <-- NEW STATE: Prevent content flash

  // MODIFIED: handleLogin now directly receives the profile data (though we will trust the hydration is robust)
  const handleLogin = useCallback((user: User) => {
    setCurrentUser(user);
    if (user.role === 'vendor') {
      setCurrentPage('dashboard');
    } else {
      setCurrentPage('home');
    }
  }, []);

  // MODIFIED: handleLogout clears localStorage token
  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    setCurrentPage('home');
    setSelectedCategory(null);
    localStorage.removeItem('authToken'); // <-- CRITICAL: Clear token
  }, []);

  const handleNavigateToBooking = useCallback((category?: string) => {
    setSelectedCategory(category || null);
    setCurrentPage('booking');
  }, []);

  // ----------------------------------------------------
  // AUTH HYDRATION LOGIC (Runs once on mount)
  // ----------------------------------------------------
  useEffect(() => {
    const hydrateAuth = async () => {
        const storedPayload = getStoredTokenPayload();
        
        if (storedPayload) {
            try {
                // Fetch the full profile data using the stored token
                const profileData = await fetchMyProfile();
                
                // Set the state with the accurate, fetched name
                setCurrentUser(profileData as User); 
                
                // Navigate based on fetched role
                if (profileData.role === 'vendor') {
                    setCurrentPage('dashboard');
                } else {
                    setCurrentPage('home');
                }

            } catch (error) {
                // If profile fetch fails (e.g., token expired/invalid), log out
                console.error("Profile fetch failed, logging out:", error);
                handleLogout(); // Clears local storage and state
            }
        }
        setIsCheckingAuth(false); // Finished checking regardless of result
    };

    hydrateAuth();
  }, [handleLogout]); // Dependency on handleLogout for clean logouts
  // ----------------------------------------------------

  // NEW CHECK: Show a minimal loading screen while checking auth
  if (isCheckingAuth) {
    return <LoadingScreen />;
  }
  
  // ORIGINAL LOGIN CHECK
  if (!currentUser) {
    return (
      <ErrorBoundary>
        <LoginPage onLogin={handleLogin} />
        <Toaster richColors position="top-right" />
      </ErrorBoundary>
    );
  }

  // ... rest of the existing rendering logic ...
  if (currentUser.role === 'vendor') {
    if (currentPage === 'manageServices') {
      return (
        <ErrorBoundary>
          <Suspense fallback={<LoadingScreen />}>
            <ManageServices 
              user={currentUser} 
              onBack={() => setCurrentPage('dashboard')}
            />
            <Toaster richColors position="top-right" />
          </Suspense>
        </ErrorBoundary>
      );
    }
    return (
      <ErrorBoundary>
        <Suspense fallback={<LoadingScreen />}>
          <VendorDashboard 
            user={currentUser} 
            onLogout={handleLogout}
            onNavigateToManageServices={() => setCurrentPage('manageServices')}
          />
          <Toaster richColors position="top-right" />
        </Suspense>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <Suspense fallback={<LoadingScreen />}>
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
        </Suspense>
      </div>
      <Toaster richColors position="top-right" />
    </ErrorBoundary>
  );
}