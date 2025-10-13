const VENDOR_API_URL = 'http://localhost:5000/api/vendors';
const BOOKING_API_URL = 'http://localhost:5000/api/bookings'; // New URL for clarity
const VENDOR_DASHBOARD_URL = 'http://localhost:5000/api/vendor'; // New URL for clarity

const getToken = () => localStorage.getItem('authToken');

// Helper for authenticated requests
const fetchAuthenticated = async (url, method = 'GET', body = null) => {
    const token = getToken();
    if (!token) throw new Error("Authentication required. Please log in.");

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    };

    const config = { method, headers };
    if (body) config.body = JSON.stringify(body);
    console.log("url:",url)
    console.log("config:",config)

    const response = await fetch(url, config);

    if (response.status === 204) return { success: true };

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || `API call failed with status: ${response.status}`);
    }
    return data;
};
/**
 * 1️⃣ Fetch vendors list (public)
 */
export const fetchVendorList = async (category, location) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (location) params.append('location', location);

    const endpoint = `${VENDOR_API_URL}?${params.toString()}`;
    const response = await fetch(endpoint); // public endpoint, no auth

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `List fetch failed with status: ${response.status}`);
    }
    const data = await response.json();
    return data.data;
};

/**
 * 2️⃣ Fetch vendor details for a single card (PROTECTED)
 */
export const fetchVendorDetailsForCard = async (vendorId, selectedDate) => {
    const dateQuery = selectedDate ? `?date=${selectedDate}` : '';
    const endpoint = `${VENDOR_API_URL}/${vendorId}/details/card${dateQuery}`;
    const response = await fetchAuthenticated(endpoint);
    return response.data;
};

/**
 * 3️⃣ Submit a new booking (PROTECTED)
 */
export const submitBooking = async (bookingData) => {
    return fetchAuthenticated(`${BOOKING_API_URL}`, 'POST', bookingData);
};

/**
 * 4️⃣ Fetch bookings for the authenticated customer (PROTECTED)
 */
export const fetchCustomerBookings = async () => {
    const endpoint = `${BOOKING_API_URL}/me`;
    const response = await fetchAuthenticated(endpoint);
    console.log("Fetched customer bookings:", response);
    return response.data; // returns array of bookings
};

/**
 * 5️⃣ Fetch vendor dashboard summary metrics (PROTECTED)
 */
export const fetchVendorDashboardSummary = async () => {
    const endpoint = `${VENDOR_DASHBOARD_URL}/summary`;
    const response = await fetchAuthenticated(endpoint);
    return response.data; // returns metrics object: totalRevenue, totalBookings, etc.
};

/**
 * 6️⃣ Cancel a booking (vendor)
 */
export const cancelBookingAPI = async (bookingId) => {
    const endpoint = `${VENDOR_DASHBOARD_URL}/booking/${bookingId}/cancel`;
    const response = await fetchAuthenticated(endpoint, 'PUT');
    return response;
};

/**
 * 7️⃣ Block a manual slot (vendor, offline booking)
 */
export const blockManualSlotAPI = async (slotData) => {
    const endpoint = `${VENDOR_DASHBOARD_URL}/availability/block`;
    const response = await fetchAuthenticated(endpoint, 'POST', slotData);
    return response;
};


export const markBookingAsCompleted = async (bookingId) => {
  const endpoint = `${BOOKING_API_URL}/complete/${bookingId}`;
  const response = await fetchAuthenticated(endpoint, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return response.data; // returns updated booking object
};
