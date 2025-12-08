// src/services/authService.js

import BASE_URL from "../config/api";

/**
 * API endpoints (now using centralized BASE_URL)
 */
const API_AUTH_URL = `${BASE_URL}/api/auth`;
const API_USERS_URL = `${BASE_URL}/api/users`;

/**
 * Helper to determine the Mongoose model name based on the role.
 */
const getRoleRef = (role) => {
  return role === "customer" ? "CustomerProfile" : "VendorProfile";
};

/**
 * Handles registration for both customer and vendor roles.
 */
export const registerUser = async (userData, role) => {
  const endpoint = `${API_AUTH_URL}/signup/${role}`;

  const payload = {
    ...userData,
    roleRef: getRoleRef(role),
  };

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `Registration failed with status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Registration Error:", error.message);
    throw error;
  }
};

/**
 * Handles user login for both roles.
 */
export const loginUser = async (email, password) => {
  const endpoint = `${API_AUTH_URL}/login`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `Login failed with status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Login Error:", error.message);
    throw error;
  }
};

/**
 * Fetches the full profile details of the currently logged-in user
 */
export const fetchMyProfile = async () => {
  const token = localStorage.getItem("authToken");
  if (!token) throw new Error("Authentication token missing.");

  const endpoint = `${API_USERS_URL}/me`;

  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch user profile.");
  }

  const { data } = await response.json();
  return data;
};
