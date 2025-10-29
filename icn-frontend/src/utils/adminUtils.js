// src/utils/adminUtils.js

/**
 * Check if a user is an admin based on user data and email
 * @param {Object} userData - User data object from login/localStorage
 * @param {string} email - User's email address
 * @returns {boolean} - True if user is admin
 */
export const isAdmin = (userData, email) => {
    if (!userData) return false;
    
    // Admin if premium level is 2 OR email contains @icn
    return userData.premium === 2 || (email && email.includes('@icn'));
  };
  
  /**
   * Get current user's admin status from localStorage
   * @returns {boolean} - True if current user is admin
   */
  export const getCurrentUserAdminStatus = () => {
    try {
      const storedStatus = localStorage.getItem('isAdmin');
      return storedStatus === 'true';
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  };
  
  /**
   * Get current user data from localStorage
   * @returns {Object|null} - User data object or null
   */
  export const getCurrentUser = () => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  };
  
  /**
   * Check if current session has admin access
   * @returns {boolean} - True if admin
   */
  export const hasAdminAccess = () => {
    const user = getCurrentUser();
    if (!user) return false;
    
    return isAdmin(user, user.email);
  };
  
  /**
   * Store admin status in localStorage
   * @param {boolean} status - Admin status to store
   */
  export const setAdminStatus = (status) => {
    localStorage.setItem('isAdmin', status.toString());
  };
  
  /**
   * Clear admin status from localStorage
   */
  export const clearAdminStatus = () => {
    localStorage.removeItem('isAdmin');
  };
  
  export default {
    isAdmin,
    getCurrentUserAdminStatus,
    getCurrentUser,
    hasAdminAccess,
    setAdminStatus,
    clearAdminStatus
  };