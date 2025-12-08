import BASE_URL from "../config/api";

// ✅ Centralized API URLs
const VENDOR_API_URL = `${BASE_URL}/api/vendors`;
const BOOKING_API_URL = `${BASE_URL}/api/bookings`;
const VENDOR_DASHBOARD_URL = `${BASE_URL}/api/vendor`;

const getToken = () => localStorage.getItem("authToken");

// ✅ Helper for authenticated requests
const fetchAuthenticated = async (url, method = "GET", body = null) => {
  const token = getToken();
  if (!token) throw new Error("Authentication required. Please log in.");

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
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
 * 1. Fetches the initial list of vendors for the search results (PUBLIC)
 */
export const fetchVendorList = async (category, location) => {
  const params = new URLSearchParams({});
  if (category) params.append("category", category);
  if (location) params.append("location", location);

  const endpoint = `${VENDOR_API_URL}?${params.toString()}`;
  console.log("API URL sent:", endpoint);

  const response = await fetch(endpoint);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `List fetch failed with status: ${response.status}`);
  }

  const data = await response.json();
  return data.data;
};

/**
 * 2. Fetch vendor details for card (PROTECTED)
 */
export const fetchVendorDetailsForCard = async (vendorId, selectedDate) => {
  console.log("Selected date for details fetch:", selectedDate);

  const dateQuery = selectedDate ? `?date=${selectedDate}` : "";
  const endpoint = `${VENDOR_API_URL}/${vendorId}/details/card${dateQuery}`;

  const response = await fetchAuthenticated(endpoint);
  console.log("Vendor details fetched:", response);
  return response;
};

/**
 * 3. Submit final booking (PROTECTED)
 */
export const submitBooking = async (bookingData) => {
  const endpoint = `${BOOKING_API_URL}`;
  return fetchAuthenticated(endpoint, "POST", bookingData);
};

/**
 * 4. Fetch customer bookings (PROTECTED)
 */
export const fetchCustomerBookings = async () => {
  const endpoint = `${BOOKING_API_URL}/me`;
  const response = await fetchAuthenticated(endpoint);
  return response.data;
};

/**
 * 5. Fetch vendor dashboard summary (PROTECTED)
 */
export const fetchVendorDashboardSummary = async () => {
  const endpoint = `${VENDOR_DASHBOARD_URL}/summary`;
  const response = await fetchAuthenticated(endpoint);
  return response.data;
};

/**
 * 6. Mark booking as completed (PROTECTED)
 */
export const markBookingAsCompleted = async (bookingId) => {
  const endpoint = `${BOOKING_API_URL}/complete/${bookingId}`;
  const response = await fetchAuthenticated(endpoint, "PUT");
  return response.data;
};

/**
 * 7. Update vendor active status (PROTECTED)
 */
export const updateVendorActiveStatusAPI = async (vendorId, newStatus) => {
  const endpoint = `${VENDOR_API_URL}/${vendorId}/active-status`;
  const body = { ActiveStatus: newStatus };
  const response = await fetchAuthenticated(endpoint, "PUT", body);
  return response;
};

/**
 * 8. Update vendor slots (PROTECTED)
 */
export const updateVendorSlotsAPI = async (vendorId, slots, date) => {
  const token = localStorage.getItem("authToken");

  const res = await fetch(`${VENDOR_DASHBOARD_URL}/update-slots`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ vendorId, slots, date }),
  });

  return res.json();
};
