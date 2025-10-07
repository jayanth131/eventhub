// src/utils/authUtils.js
import { jwtDecode } from 'jwt-decode';

/**
 * Checks localStorage for a token and decodes the basic user data.
 * @returns {object | null} - User object {id, role} or null.
 */
export const getStoredTokenPayload = () => {
    const token = localStorage.getItem('authToken');
    if (!token) return null;

    try {
        const decoded = jwtDecode(token);
        
        // Check for token expiration
        if (decoded.exp * 1000 < Date.now()) {
            localStorage.removeItem('authToken');
            return null;
        }

        // Return the core data needed for the profile fetch
        return {
            id: decoded.id,
            role: decoded.role,
            token: token // Return token for use in fetchMyProfile
        };

    } catch (error) {
        console.error("Failed to decode token:", error);
        localStorage.removeItem('authToken'); 
        return null;
    }
};