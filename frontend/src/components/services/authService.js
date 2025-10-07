// src/services/authService.js

// IMPORTANT: Ensure this matches your Express server's base URL
const API_BASE_URL = 'http://localhost:5000/api/auth';
const API_USERS_URL = 'http://localhost:5000/api/users'; 

/**
 * Helper to determine the Mongoose model name based on the role.
 */
const getRoleRef = (role) => {
    // This logic ensures the required 'roleRef' field is correctly set 
    // to 'CustomerProfile' or 'VendorProfile' for Mongoose validation.
    return role === 'customer' ? 'CustomerProfile' : 'VendorProfile';
};


/**
 * Handles registration for both customer and vendor roles.
 * @param {object} userData - Form data including name, email, password, etc.
 * @param {'customer' | 'vendor'} role - The role to register as.
 * @returns {Promise<object>} - Returns { success: true, token, role, userId }
 */
export const registerUser = async (userData, role) => {
    // Correct Endpoint: /api/auth/signup/customer or /api/auth/signup/vendor
    const endpoint = `${API_BASE_URL}/signup/${role}`; 
    
    // --- CRITICAL FIX: Add the required roleRef field to the payload ---
    const payload = { 
        ...userData, 
        // Send the specific model name required by the backend schema validation
        roleRef: getRoleRef(role) 
    };
    // ------------------------------------------------------------------

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Registration failed with status: ${response.status}`);
        }

        return await response.json(); 

    } catch (error) {
        console.error('Registration Error:', error.message);
        throw error;
    }
};


/**
 * Handles user login for both roles.
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<object>} - Returns { success: true, token, role, userId }
 */
export const loginUser = async (email, password) => {
  const endpoint = `${API_BASE_URL}/login`;
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Login failed with status: ${response.status}`);
    }

    return await response.json();

  } catch (error) {
    console.error('Login Error:', error.message);
    throw error;
  }
};

/**
 * Fetches the full profile details (including the display name/business name) of 
 * the currently logged-in user using the JWT token in localStorage.
 * * @returns {Promise<{id: string, role: string, email: string, name: string}>}
 */
export const fetchMyProfile = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error("Authentication token missing.");

    // Endpoint: /api/users/me (The new protected route)
    const endpoint = `${API_USERS_URL}/me`;

    const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`, // <-- Essential for protected routes
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch user profile.');
    }

    const { data } = await response.json();
    return data; // Returns { id, role, email, name: displayName }
};