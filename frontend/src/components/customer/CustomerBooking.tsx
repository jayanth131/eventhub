import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Calendar } from '../ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Slider } from '../ui/slider';
import {
  ArrowLeft, MapPin, Star, Clock, Phone, Mail,
  Calendar as CalendarIcon, CreditCard, CheckCircle, LogOut, Crown, Sparkles, Filter, Search, DollarSign, Plus, X
} from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { toast } from 'sonner@2.0.3';
// --- API IMPORTS ---
import { fetchVendorList, fetchVendorDetailsForCard, submitBooking } from '../services/vendorService';


// --- INTERFACES ALIGNED WITH BACKEND API RESPONSE ---
interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'vendor';
}

interface TimeSlot {
  time: string;
  status: 'available' | 'booked' | 'manual_block';
  price: number; // New price field for each slot
}

interface VendorProfile {
  _id: string; // VendorProfile ID (used as vendorId in booking)
  serviceName: string; // maps to businessName
  category: string;
  averageRating: number;
  reviewCount: number;
  location: string;
  totalCost: number; // The new total cost field
  imageUrls: string[];
  description: string;

  // DETAILS (Only present after detail fetch)
  advancePaymentAmount?: number; // Fetched via /details/card
  contactEmail?: string; // Fetched via /details/card
  availability?: TimeSlot[]; // Fetched via /details/card
}

interface CustomerBookingProps {
  user: User;
  category: string | null;
  onNavigateHome: () => void;
  onLogout: () => void;
  onNavigateToMyBookings?: () => void;
}

// NOTE: TimeSlot interface must be simplified for the local state update when booking
interface LocalTimeSlot {
  id: string;
  time: string;
  available: boolean;
  price: number;
}

// Hardcoded locations for filter display
const locations = [
  'All Locations',
  'Hyderabad',
  'Mumbai',
  'Delhi',
  'Vizag'
];

// Helper function to extract price from vendor (using actual number field now)
const getMinPrice = (vendor: VendorProfile): number => {
  return vendor.totalCost || 0;
};

// Helper function to simulate distance for sorting (Remove once geo-data is implemented)
const getDistance = (vendor: VendorProfile): number => {
  if (vendor.location.includes('Hyderabad')) return 1;
  if (vendor.location.includes('Mumbai')) return 50;
  return 999;
};

const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Rating: High to Low' },
  { value: 'distance', label: 'Distance: Nearest First' },
];


const CustomerBooking: React.FC<CustomerBookingProps> = ({
  user,
  category,
  onNavigateHome,
  onLogout,
  onNavigateToMyBookings
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [vendorsList, setVendorsList] = useState<VendorProfile[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [errorList, setErrorList] = useState<string | null>(null);

  const [selectedVendor, setSelectedVendor] = useState<VendorProfile | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<LocalTimeSlot | null>(null);

  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [bookingStep, setBookingStep] = useState<'details' | 'payment' | 'confirmation'>('details');
  const [selectedLocation, setSelectedLocation] = useState<string>('All Locations');
  const [budgetRange, setBudgetRange] = useState<number[]>([0, 300000]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('featured');

  // Event details states
  const [eventType, setEventType] = useState<string>('');
  const [customEventType, setCustomEventType] = useState<string>('');
  const [eventHolderNames, setEventHolderNames] = useState<string[]>(['']);


  // --- FETCH VENDOR LIST (Runs on mount and filter changes) ---
  const loadVendors = useCallback(async () => {
    console.log(`[LOG] Starting API call: GET /api/vendors for Category: ${category}, Location: ${selectedLocation}`);
    setLoadingList(true);
    setErrorList(null);
    try {
      const locationFilter = selectedLocation === 'All Locations' ? '' : selectedLocation;
      const categoryFilter = category || '';

      // API call to the fast list endpoint
      const response = await fetchVendorList(categoryFilter, locationFilter);


      // Ensure response.data exists and is an array before calling map
      const apiData = response;
      console.log(response)

      if (!Array.isArray(apiData)) {
        console.error("[ERROR] API did not return an array for vendors:", response);
        throw new Error("Invalid data format received from server.");
      }

      // Map the backend fields to the frontend profile interface names
      const mappedVendors: VendorProfile[] = apiData.map((v: any) => ({
        _id: v._id,
        serviceName: v.businessName,
        category: v.category,
        averageRating: v.averageRating,
        reviewCount: v.reviewCount,
        location: v.location,
        totalCost: v.totalCost,
        imageUrls: v.imageUrls || [],
        description: v.description,
        // Ensure availability is undefined initially for the button logic
        availability: v.availability // Should be undefined/null from the fast endpoint
      }));

      setVendorsList(mappedVendors);
      console.log(`[LOG] Successfully loaded ${mappedVendors.length} vendors for list view.`);

    } catch (err: any) {
      setErrorList(`Failed to load vendors: ${err.message}`);
      setVendorsList([]);
      console.error(`[ERROR] List fetch failed: ${err.message}`);
    } finally {
      setLoadingList(false);
    }
  }, [category, selectedLocation]);

  useEffect(() => {
    loadVendors();
  }, [loadVendors, selectedDate]);

  // --- FETCH DETAILS FOR BOOKING CARD EXPANSION (Clicking 'View Slots') ---
  // NOTE: mockSlot holds the totalCost from the initial fast fetch, used temporarily.
  const fetchDetailsAndBook = async (vendorId: string, mockSlot: LocalTimeSlot) => {
    setSelectedVendor(null);
    console.log(`[LOG] Starting protected API call: GET /api/vendors/${vendorId}/details/card`);
    toast.loading("Fetching secure details...");
    try {
      // API call to the protected detail endpoint
      const detailsResponse = await fetchVendorDetailsForCard(vendorId, selectedDate);
      toast.dismiss();
      console.log("[LOG] Detail fetch successful. Merging data...");

      const vendorWithDetails = vendorsList.find(v => v._id === vendorId);

      if (vendorWithDetails) {
        const fullVendorData: VendorProfile = {
          ...vendorWithDetails,
          ...detailsResponse.data,
          contactEmail: detailsResponse.data.contactEmail,
        };

        // CRITICAL: Update the vendor in the main list state so the UI rerenders with slots/contact.
        setVendorsList(prevList => prevList.map(v =>
          v._id === vendorId ? fullVendorData : v
        ));

        // Set for dialog state in case the user immediately clicks a slot
        setSelectedVendor(fullVendorData);
        setSelectedSlot(mockSlot);
        console.log("[LOG] Vendor card successfully expanded with full details.");
        console.log(fullVendorData);
      }
    } catch (err: any) {
      toast.dismiss();
      toast.error(`Error fetching booking data: ${err.message}`);
      console.error(`[ERROR] Detail fetch failed: ${err.message}`);
    }
  };


  // MODIFIED: handleBookSlot is now ONLY used to open the dialog 
  // after the full data has been merged (via the slot button click).
  const handleBookSlot = (vendor: VendorProfile, slot: LocalTimeSlot) => {
    if (!slot.available) return;

    // Set the necessary states and open the dialog
    setSelectedVendor(vendor);
    setSelectedSlot(slot);
    setShowBookingDialog(true);
    setBookingStep('details');
    setEventType('');
    setCustomEventType('');
    setEventHolderNames(['']);
    console.log(`[LOG] Opening booking dialog for Vendor: ${vendor.serviceName}, Slot: ${slot.time}`);
    console.log(selectedDate)
  };

  // MODIFIED: handlePayment now submits to backend API
  const handlePayment = async () => {
    if (!selectedVendor || !selectedSlot || !selectedDate) {
      toast.error("Missing booking data. Please select date and slot.");
      return;
    }
    // Check for required advance amount before payment attempt
    if (selectedVendor.advancePaymentAmount === undefined || selectedVendor.advancePaymentAmount === null) {
      toast.error("Vendor advance amount missing. Cannot proceed.");
      return;
    }


    setBookingStep('payment');
    toast.loading("Processing payment and reserving slot...");

    const bookingPayload = {
      // Required foreign key
      vendorId: selectedVendor._id,
      vendorName: selectedVendor.serviceName, // Redundant but useful for records
      vendorLocation: selectedVendor.location, // Redundant but useful for records
      // Transactional fields
      totalCost: selectedSlot.price, // CRITICAL: Price of the specific slot

      // Event Detail Fields
      eventDate: selectedDate.toISOString(), // CRITICAL: Uses ISO string for backend normalization
      eventTimeSlot: selectedSlot.time,

      // Profile/Display Fields
      eventType: eventType === 'Other' ? customEventType : eventType,
      eventHolderNames: eventHolderNames, // The array of names
    };

    console.log("[LOG] Submitting booking payload:", bookingPayload);

    try {
      await submitBooking(bookingPayload);
      toast.dismiss();

      // Success: Navigate to confirmation screen
      setBookingStep('confirmation');
      toast.success('Booking confirmed! The vendor will contact you shortly.');

      // Refresh vendor list to show the slot as booked
      loadVendors();

    } catch (err: any) {
      toast.dismiss();
      setBookingStep('details');
      toast.error(`Booking Failed: ${err.message}. Please try again.`);
      console.error(`[ERROR] Booking submission failed: ${err.message}`);
    }
  };

  // --- Utility Functions (Unchanged) ---
  const addEventHolderName = () => {
    setEventHolderNames(prev => [...prev, '']);
  };

  const removeEventHolderName = (index: number) => {
    if (eventHolderNames.length > 1) {
      setEventHolderNames(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateEventHolderName = (index: number, value: string) => {
    setEventHolderNames(prev => {
      const newNames = [...prev];
      newNames[index] = value;
      return newNames;
    });
  };
  // --- End Utility Functions ---

  // Filter and sort vendors (Uses the API data now)
  const filteredVendors = useMemo(() =>
    vendorsList
      .filter(vendor => {
        const matchesSearch = vendor.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          vendor.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          vendor.location.toLowerCase().includes(searchQuery.toLowerCase());

        const vendorMinPrice = getMinPrice(vendor);
        // FIX: Correctly check budget range bounds
        const matchesBudget = vendorMinPrice >= budgetRange[0] && vendorMinPrice <= budgetRange[1];

        return matchesSearch && matchesBudget;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'price-low':
            return getMinPrice(a) - getMinPrice(b);
          case 'price-high':
            return getMinPrice(b) - getMinPrice(a);
          case 'rating':
            return b.averageRating - a.averageRating;
          case 'distance':
            return getDistance(a) - getDistance(b);
          case 'featured':
          default:
            return b.averageRating - a.averageRating;
        }
      }),
    [vendorsList, searchQuery, budgetRange, sortBy]
  );


  // --- JSX Rendering ---
  return (
    <div className="min-h-screen bg-[var(--royal-cream)]">
      {/* Header */}
      <header className="bg-gradient-to-r from-[var(--royal-maroon)] to-[var(--royal-copper)] border-b-4 border-[var(--royal-gold)] sticky top-0 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onNavigateHome}
                className="text-[var(--royal-cream)] hover:text-white hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
              <div className="flex items-center space-x-3">
                <Crown className="h-10 w-10 text-[var(--royal-gold)] fill-current" />
                <div className="flex flex-col">
                  <span className="text-2xl text-[var(--royal-gold)]">EventHub</span>
                  {category && typeof category === 'string' && (
                    <Badge className="bg-[var(--royal-gold)] text-white mt-1">
                      {category}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-[var(--royal-cream)]">Welcome, {user.name}</span>
              {onNavigateToMyBookings && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onNavigateToMyBookings}
                  className="bg-white/10 text-[var(--royal-cream)] border-2 border-[var(--royal-gold)] hover:bg-[var(--royal-gold)] hover:text-white"
                >
                  My Bookings
                </Button>
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
      </header >
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" >
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Date Selection (Unchanged) */}
            <Card className="border-4 border-[var(--royal-gold)]/30 hover:border-[var(--royal-gold)] shadow-xl bg-white transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-center text-[var(--royal-maroon)] flex items-center justify-center">
                  <CalendarIcon className="h-5 w-5 mr-2" />
                  Select Date
                </CardTitle>
                <CardDescription className="text-center">Choose your royal wedding date</CardDescription>
              </CardHeader>
              <CardContent className="p-4 flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-lg border border-[var(--royal-gold)]/30 bg-white shadow-sm"
                  disabled={(date: any) => date < new Date()}

                />
              </CardContent>
            </Card>

            {/* Filters (Unchanged) */}
            <Card className="border-4 border-[var(--royal-gold)]/30 hover:border-[var(--royal-gold)] shadow-xl bg-white transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-[var(--royal-maroon)] flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  Filters
                </CardTitle>
                <CardDescription>Refine your search</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Budget Range Filter (Fixed Slider Warning) */}
                <div className="space-y-3">
                  <label className="text-sm flex items-center text-[var(--royal-maroon)]">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Budget Range
                  </label>
                  <div className="space-y-2">
                    <Slider
                      min={0}
                      max={300000}
                      step={5000}
                      value={budgetRange}
                      onValueChange={(value: any) => setBudgetRange(value)}
                      className="w-full"
                    />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--royal-gold)] bg-[var(--royal-maroon)]/10 px-3 py-1 rounded-full">
                        ₹{budgetRange[0].toLocaleString()}
                      </span>
                      <span className="text-gray-500">to</span>
                      <span className="text-[var(--royal-gold)] bg-[var(--royal-maroon)]/10 px-3 py-1 rounded-full">
                        ₹{budgetRange[1].toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Location Filter */}
                <div className="space-y-2">
                  <label className="text-sm flex items-center text-[var(--royal-maroon)]">
                    <MapPin className="h-4 w-4 mr-2" />
                    Location
                  </label>
                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger className="w-full border-2 border-[var(--royal-gold)]/30">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Clear Filters Button */}
                <Button
                  variant="outline"
                  className="w-full border-2 border-[var(--royal-gold)]/30 text-[var(--royal-maroon)] hover:bg-[var(--royal-gold)] hover:text-white"
                  onClick={() => {
                    setBudgetRange([0, 300000]);
                    setSelectedLocation('All Locations');
                    setSearchQuery('');
                    setSortBy('featured');
                  }}
                >
                  Clear All Filters
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="border-4 border-[var(--royal-gold)] shadow-xl bg-gradient-to-br from-[var(--royal-maroon)] to-[var(--royal-copper)]">
              <CardContent className="p-6 text-center">
                <div className="space-y-2">
                  <Crown className="h-10 w-10 text-[var(--royal-gold)] mx-auto fill-current" />
                  <h3 className="text-white">Vendors Found</h3>
                  <div className="text-5xl text-[var(--royal-gold)]">
                    {loadingList ? '...' : filteredVendors.length}
                  </div>
                  <div className="space-y-1 text-sm text-[var(--royal-cream)]">
                    {category && typeof category === 'string' && (
                      <p className="text-[var(--royal-gold)]">{category}</p>
                    )}
                    {selectedLocation !== 'All Locations' && typeof selectedLocation === 'string' && (
                      <p>near {selectedLocation}</p>
                    )}
                    <p className="text-xs">
                      Budget: ₹{(budgetRange[0] / 1000).toFixed(0)}K - ₹{(budgetRange[1] / 1000).toFixed(0)}K
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Vendors List */}
          <div className="lg:col-span-3">
            {/* Search Bar */}
            <div className="mb-6">
              <Card className="border-4 border-[var(--royal-gold)]/30 shadow-xl bg-white">
                <CardContent className="p-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[var(--royal-gold)]" />
                    <Input
                      placeholder="Search vendors by name, service, or location..."
                      value={searchQuery}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-6 border-2 border-[var(--royal-gold)]/30 focus:border-[var(--royal-gold)]"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Header with Sort */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex-1">
                <h1 className="text-3xl text-[var(--royal-maroon)] flex items-center">
                  <Sparkles className="h-8 w-8 mr-3 text-[var(--royal-gold)]" />
                  {category && typeof category === 'string' ? category : 'All Vendors'}
                </h1>
                <p className="text-gray-700 mt-1">
                  {filteredVendors.length} vendor{filteredVendors.length !== 1 ? 's' : ''} found
                </p>
              </div>

              <div className="w-full sm:w-64">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full border-2 border-[var(--royal-gold)]/30">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Vendors List */}
            <div className="space-y-6">
              {filteredVendors.map((vendor) => (
                <Card key={vendor._id} className="overflow-hidden border-4 border-[var(--royal-gold)]/20 hover:border-[var(--royal-gold)] shadow-xl bg-white">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="relative overflow-hidden">
                      <ImageWithFallback
                        // Use the first image URL from the array, or a placeholder
                        src={vendor.imageUrls?.[0] || `https://placehold.co/800x600/8B0000/FFD700?text=${vendor.serviceName}`}
                        alt={vendor.serviceName}
                        className="w-full h-64 md:h-full object-cover"
                      />

                      <div className="absolute top-4 left-4">
                        <Badge className="bg-gradient-to-r from-[var(--royal-gold)] to-[var(--royal-orange)] text-white shadow-lg border-2 border-white">
                          ⭐ Royal Choice
                          {console.log(vendor.serviceName)}
                        </Badge>
                      </div>
                    </div>

                    <div className="md:col-span-2 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-2xl text-[var(--royal-maroon)]">{vendor.serviceName}</h3>
                          <p className="text-[var(--royal-gold)]">{vendor.category}</p>
                          <div className="flex items-center space-x-4 mt-3">
                            <div className="flex items-center space-x-1">
                              <Star className="h-5 w-5 text-[var(--royal-gold)] fill-current" />
                              <span>{vendor.averageRating.toFixed(1)}</span>
                              <span className="text-sm text-gray-500">({vendor.reviewCount} reviews)</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600">{vendor.location}</span>
                            </div>
                          </div>
                        </div>
                        {/* <div className="text-right">
                          <p className="text-xl text-[var(--royal-maroon)]">₹{vendor.totalCost.toLocaleString()}</p>
                          <span className="text-sm text-gray-500">Est. Total Cost</span>
                        </div> */}
                      </div>

                      <p className="text-gray-600 mb-4">{vendor.description}</p>

                      {/* --- SLOTS, PHONE, EMAIL (Conditional Display) --- */}
                      {/* This block expands ONLY after the user clicks the 'View Slots' button and the details are fetched */}
                      {vendor.availability && (
                        <>
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-4 text-sm">
                              <div className="flex items-center space-x-1 text-gray-600">
                                <Phone className="h-4 w-4" />
                                <span>{'Contact on booking'}</span>
                              </div>
                              <div className="flex items-center space-x-1 text-gray-600">
                                <Mail className="h-4 w-4" />
                                <span>{vendor.contactEmail}</span>
                              </div>
                            </div>
                          </div>

                          {/* Time Slots */}
                          <div>
                            <h4 className="text-[var(--royal-maroon)] mb-3 flex items-center">
                              <Clock className="h-5 w-5 mr-2" />
                              Available Slots
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              {vendor.availability.map((slot, index) => (
                                <Button
                                  key={index}
                                  variant={slot.status === 'available' ? "default" : "outline"}
                                  onClick={() => {
                                    // Create a mock TimeSlot object based on API data for the dialog
                                    const mockSlot: LocalTimeSlot = { id: `${index}`, time: slot.time, available: slot.status === 'available', price: slot.price };
                                    handleBookSlot(vendor, mockSlot);
                                  }}
                                  disabled={slot.status !== 'available'}
                                  className={`w-full py-4 px-4 flex flex-col items-center justify-center min-h-[80px] transition-all duration-200 ${slot.status === 'available'
                                    ? 'bg-gradient-to-r from-[var(--royal-maroon)] to-[var(--royal-copper)] hover:from-[var(--royal-copper)] hover:to-[var(--royal-maroon)] text-white border-2 border-[var(--royal-gold)] hover:scale-105 hover:shadow-lg'
                                    : 'opacity-60 cursor-not-allowed bg-gray-100 border-2 border-gray-200 text-gray-500'
                                    }`}
                                >
                                  <span className="text-xs font-medium mb-1 ">{slot.time}</span>
                                  <span className="text-lg font-semibold">₹{slot.price.toLocaleString()}</span>
                                  {slot.status !== 'available' && (
                                    <span className="text-xs text-red-500 mt-1 font-medium bg-red-50 px-2 py-1 rounded-full">Already Booked</span>
                                  )}
                                </Button>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      {/* --- BUTTON TO LOAD DETAILS (If slots are missing) --- */}
                      {!vendor.availability && (
                        <Button
                          onClick={() => fetchDetailsAndBook(vendor._id, { id: 'default', time: 'N/A', available: true, price: vendor.totalCost })}
                          className="w-full bg-[var(--royal-gold)] hover:bg-[var(--royal-copper)] text-[var(--royal-maroon)] border border-[var(--royal-maroon)]"
                        >
                          View Slots & Contact Details
                        </Button>
                      )}

                    </div>
                  </div>
                </Card>
              ))}

              {filteredVendors.length === 0 && !loadingList && (
                <Card className="border-4 border-[var(--royal-gold)]/30 shadow-xl bg-white p-12 text-center">
                  <Sparkles className="h-16 w-16 text-[var(--royal-gold)] mx-auto mb-4" />
                  <h3 className="text-2xl text-[var(--royal-maroon)] mb-2">No vendors found"</h3>
                  <p className="text-gray-600">Try adjusting your search criteria</p>

                </Card>

              )}
            </div>
          </div>
        </div>
      </div >

      {/* Booking Dialog */}
      {
        selectedVendor && selectedSlot && (
          <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
            <DialogContent className="sm:max-w-lg border-4 border-[var(--royal-gold)] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl text-[var(--royal-maroon)] flex items-center">
                  <Crown className="h-6 w-6 mr-2 text-[var(--royal-gold)]" />
                  {bookingStep === 'confirmation' ? 'Booking Confirmed!' : 'Confirm Royal Booking'}
                </DialogTitle>
                <DialogDescription>
                  {bookingStep === 'details' && 'Review your booking details'}
                  {bookingStep === 'payment' && 'Processing secure payment...'}
                  {bookingStep === 'confirmation' && 'Your royal celebration awaits!'}
                </DialogDescription>
              </DialogHeader>

              {bookingStep === 'details' && (
                <div className="space-y-4">
                  {/* Booking Summary */}
                  <div className="space-y-2 pb-4 border-b border-[var(--royal-gold)]/30">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vendor:</span>
                      <span>{selectedVendor.serviceName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <span>{selectedVendor.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time Slot:</span>
                      <span>{selectedSlot.time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span>{selectedDate?.toDateString()}</span>
                    </div>
                  </div>

                  {/* Event Type (Unchanged) */}
                  <div className="space-y-2">
                    <label className="text-sm text-[var(--royal-maroon)]">Event Type *</label>
                    <Select value={eventType} onValueChange={setEventType}>
                      <SelectTrigger className="w-full border-2 border-[var(--royal-gold)]/30">
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="marriage">Marriage</SelectItem>
                        <SelectItem value="birthday">Birthday</SelectItem>
                        <SelectItem value="retirement">Retirement</SelectItem>
                        <SelectItem value="cooperative-party">Cooperative Party</SelectItem>
                        <SelectItem value="private-party">Private Party</SelectItem>
                        <SelectItem value="engagement">Engagement</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {eventType === 'other' && (
                      <Input
                        placeholder="Please specify event type"
                        value={customEventType}
                        onChange={(e) => setCustomEventType(e.target.value)}
                        className="border-2 border-[var(--royal-gold)]/30 focus:border-[var(--royal-gold)]"
                      />
                    )}
                  </div>

                  {/* Event Holder Names */}
                  <div className="space-y-2">
                    <label className="text-sm text-[var(--royal-maroon)]">Event Holder Name(s) *</label>
                    <div className="space-y-2">
                      {eventHolderNames.map((name, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Input
                            placeholder={index === 0 ? "e.g., Krishna Radha" : "Add another name"}
                            value={name}
                            onChange={(e) => updateEventHolderName(index, e.target.value)}
                            className="flex-1 border-2 border-[var(--royal-gold)]/30 focus:border-[var(--royal-gold)]"
                          />
                          {eventHolderNames.length > 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeEventHolderName(index)}
                              className="h-10 w-10 text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addEventHolderName}
                        className="w-full border-2 border-[var(--royal-gold)]/30 text-[var(--royal-maroon)] hover:bg-[var(--royal-gold)] hover:text-white"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Name
                      </Button>
                    </div>
                  </div>

                  {/* Payment Summary */}
                  <div className="space-y-2 pt-4 border-t border-[var(--royal-gold)]/30">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="text-xl text-[var(--royal-maroon)]">₹{selectedSlot.price.toLocaleString()}</span>
                    </div>
                    {/* {console.log("selected vendor",selectedVendor)} */}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Advance Payment:</span>
                      <span className="text-[var(--royal-gold)]">₹{selectedVendor.advancePaymentAmount?.toLocaleString()}</span>
                    </div>
                  </div>

                  <Button
                    onClick={handlePayment}
                    disabled={!eventType || (eventType === 'other' && !customEventType) || eventHolderNames.every(name => !name.trim())}
                    className="w-full bg-gradient-to-r from-[var(--royal-maroon)] to-[var(--royal-copper)] hover:from-[var(--royal-copper)] hover:to-[var(--royal-maroon)] text-white border-2 border-[var(--royal-gold)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CreditCard className="h-5 w-5 mr-2" />
                    Proceed to Payment
                  </Button>
                </div>
              )}

              {bookingStep === 'payment' && (
                <div className="py-8 text-center">
                  <div className="inline-block animate-spin">
                    <Crown className="h-16 w-16 text-[var(--royal-gold)]" />
                  </div>
                  <p className="mt-4 text-gray-600">Processing your royal booking...</p>
                </div>
              )}

              {bookingStep === 'confirmation' && (
                <div className="py-8 text-center space-y-6">
                  <div>
                    <CheckCircle className="h-20 w-20 text-green-500 mx-auto" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl text-[var(--royal-maroon)]">Booking Confirmed!</h3>
                    <p className="text-gray-600">
                      Your vendor will contact you shortly to finalize details for your royal celebration.
                    </p>
                  </div>

                  {/* Event Details Summary */}
                  <div className="bg-[var(--royal-cream)] p-4 rounded-lg space-y-2 text-left border-2 border-[var(--royal-gold)]/30">
                    <div className="flex justify-between items-start">
                      <span className="text-sm text-gray-600">Event Type:</span>
                      <span className="text-sm text-[var(--royal-maroon)] capitalize">
                        {eventType === 'other' ? customEventType : eventType.replace('-', ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-sm text-gray-600">Event Holder(s):</span>
                      <span className="text-sm text-[var(--royal-maroon)] text-right">
                        {eventHolderNames.filter(name => name.trim()).join(', ')}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[var(--royal-gold)]/30">
                    <p className="text-sm text-[var(--royal-maroon)] mb-4">
                      Would you like to view your bookings?
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      {onNavigateToMyBookings && (
                        <Button
                          onClick={() => {
                            setShowBookingDialog(false);
                            onNavigateToMyBookings();
                          }}
                          className="w-full sm:w-auto bg-gradient-to-r from-[var(--royal-maroon)] to-[var(--royal-copper)] hover:from-[var(--royal-copper)] hover:to-[var(--royal-maroon)] text-white shadow-lg border-2 border-[var(--royal-gold)]"
                        >
                          <Sparkles className="mr-2 h-4 w-4" />
                          View My Bookings
                        </Button>
                      )}
                      <Button
                        onClick={() => setShowBookingDialog(false)}
                        variant="outline"
                        className="w-full sm:w-auto border-2 border-[var(--royal-gold)] text-[var(--royal-maroon)] hover:bg-[var(--royal-gold)] hover:text-white"
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        )
      }
    </div >
  );
};

export default CustomerBooking;
