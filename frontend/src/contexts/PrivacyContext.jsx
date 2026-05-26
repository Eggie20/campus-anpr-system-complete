import React, { createContext, useContext, useState, useEffect } from 'react';

const PrivacyContext = createContext();

export const usePrivacy = () => {
  return useContext(PrivacyContext);
};

export const PrivacyProvider = ({ children }) => {
  // Try to load from localStorage to persist user preference
  const [isConfidentialMode, setIsConfidentialMode] = useState(() => {
    const saved = localStorage.getItem('anpr_confidential_mode');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('anpr_confidential_mode', isConfidentialMode);
  }, [isConfidentialMode]);

  const toggleConfidentialMode = () => {
    setIsConfidentialMode(prev => !prev);
  };

  /**
   * Helper function to anonymize a name.
   * e.g., "Arnel Mandas" -> "A**** M*****"
   * e.g., "Arnel" -> "A****"
   */
  const anonymizeName = (name) => {
    if (!isConfidentialMode) return name;
    if (!name) return name;
    
    return name.split(' ').map(word => {
      if (word.length <= 1) return word;
      return word.charAt(0) + '*'.repeat(word.length - 1);
    }).join(' ');
  };

  const anonymizePlate = (plate) => {
    return plate;
  };

  const anonymizeEmail = (email) => {
    if (!isConfidentialMode) return email;
    if (!email) return email;
    const parts = email.split('@');
    if (parts.length < 2) return '******';
    const local = parts[0];
    const domain = parts[1];
    if (local.length <= 2) return local + '***@' + domain;
    return local.charAt(0) + '*'.repeat(local.length - 2) + local.charAt(local.length - 1) + '@' + domain;
  };

  const anonymizePhone = (phone) => {
    if (!isConfidentialMode) return phone;
    if (!phone) return phone;
    const cleaned = phone.trim();
    if (cleaned.length <= 6) return '****';
    return cleaned.slice(0, 6) + '*'.repeat(cleaned.length - 6);
  };

  const anonymizeId = (id) => {
    if (!isConfidentialMode) return id;
    if (!id) return id;
    if (id.length <= 4) return '****';
    return id.slice(0, id.length - 4) + '****';
  };

  return (
    <PrivacyContext.Provider value={{ 
      isConfidentialMode, 
      toggleConfidentialMode, 
      anonymizeName,
      anonymizePlate,
      anonymizeEmail,
      anonymizePhone,
      anonymizeId
    }}>
      {children}
    </PrivacyContext.Provider>
  );
};
