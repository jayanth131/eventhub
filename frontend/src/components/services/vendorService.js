const VENDOR_API_URL = 'http://localhost:5000/api/vendors';
const BOOKING_API_URL = 'http://localhost:5000/api/bookings'; // New URL for clarity

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

    const response = await fetch(url, config);

    if (response.status === 204) return { success: true };

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || `API call failed with status: ${response.status}`);
    }
    return data;
};

/**
 * 1. Fetches the initial list of vendors for the search results (fast load).
 * @param {string} category 
 * @param {string} location 
 * @returns {Promise<{id, businessName, location, totalCost, averageRating, imageUrls, description}[]>}
 */
export const fetchVendorList = async (category, location) => {
    // FIX: Include both category and location in the URLSearchParams
    const params = new URLSearchParams({});
    if (category) params.append('category', category);
    if (location) params.append('location', location);

    const endpoint = `${VENDOR_API_URL}?${params.toString()}`;
    console.log("API URL sent:", endpoint);

    // NOTE: This endpoint is PUBLIC, no token needed
    const response = await fetch(endpoint);

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `List fetch failed with status: ${response.status}`);
    }
    const data = await response.json();

    return data.data;
};

/**
 * 2. Fetches all slots, pricing, and contact info for a single vendor (on card click/expansion).
 * @param {string} vendorId 
 * @param {string} selectedDate - YYYY-MM-DD format
 * @returns {Promise<{id, totalCost, advancePaymentAmount, availability, contactEmail}>}
 */
export const fetchVendorDetailsForCard = async (vendorId,selectedDate) => {
    // const selectedDate = "2024-10-05"; // Example date for testing
    // CRITICAL FIX: Append the date to the query string
    console.log("Selected date for details fetch:", selectedDate);
    const dateQuery = selectedDate ? `?date=${selectedDate}` : '';
    const endpoint = `${VENDOR_API_URL}/${vendorId}/details/card${dateQuery}`;

    // This endpoint is PROTECTED
    const response = await fetchAuthenticated(endpoint);
    console.log("Vendor details fetched:", response);
    return response;
};

/**
 * 3. Handles the final booking submission.
 * @param {object} bookingData 
 */
export const submitBooking = async (bookingData) => {
    const endpoint = 'http://localhost:5000/api/bookings';
    // This endpoint is PROTECTED
    return fetchAuthenticated(endpoint, 'POST', bookingData);
};
export const fetchCustomerBookings = async () => {
    const endpoint = `${BOOKING_API_URL}/me`;
    const response = await fetchAuthenticated(endpoint);
    return response.data; // Return the array of transformed bookings
};