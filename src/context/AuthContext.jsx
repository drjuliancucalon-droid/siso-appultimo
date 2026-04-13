import React, { createContext, useContext, useState, useEffect } from 'react';
import { _verifyPassword, _sha256 } from '../shared/lib/crypto';
import { supabase } from '../shared/lib/supabase';
// Import any needed security functions from '../shared/lib/security' if applicable
// import * as security from '../shared/lib/security';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [loginBlockedUntil, setLoginBlockedUntil] = useState(null);
  const [privacidadAceptada, setPrivacidadAceptada] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage or initial session
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (session?.user) {
          setCurrentUser(session.user);
        }
      } catch (err) {
        console.error("Error checking session:", err);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  const login = async (user, pass) => {
    // Check if blocked
    if (loginBlockedUntil && new Date() < new Date(loginBlockedUntil)) {
      throw new Error("Login temporarily blocked due to too many failed attempts.");
    }

    try {
      // Example integration with supabase and crypto
      // In a real scenario, you'd fetch the user hash and verify
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', user)
        .single();

      if (error || !data) {
        handleFailedAttempt();
        throw new Error("Invalid credentials");
      }

      const isValid = await _verifyPassword(pass, data.password_hash);
      if (!isValid) {
        handleFailedAttempt();
        throw new Error("Invalid credentials");
      }

      // Reset attempts on success
      setLoginAttempts(0);
      setLoginBlockedUntil(null);
      setCurrentUser(data);
      
      return data;
    } catch (err) {
      throw err;
    }
  };

  const handleFailedAttempt = () => {
    const newAttempts = loginAttempts + 1;
    setLoginAttempts(newAttempts);
    if (newAttempts >= 3) { // Example threshold
      const blockTime = new Date(new Date().getTime() + 15 * 60000); // 15 mins
      setLoginBlockedUntil(blockTime.toISOString());
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setPrivacidadAceptada(false);
  };

  const acceptPrivacy = () => {
    setPrivacidadAceptada(true);
  };

  const value = {
    currentUser,
    loginAttempts,
    loginBlockedUntil,
    privacidadAceptada,
    login,
    logout,
    acceptPrivacy
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
