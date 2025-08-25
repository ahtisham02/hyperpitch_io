import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';

const CREDITS_KEY = 'user_credits';
export const CAMPAIGN_COST = 10;

// Get dynamic credits from user profile
export const getDynamicCredits = () => {
  try {
    // Try to get from localStorage first (fallback)
    const storedCredits = localStorage.getItem(CREDITS_KEY);
    if (storedCredits !== null) {
      return parseInt(storedCredits, 10);
    }
    return 1000; // Default fallback
  } catch (e) {
    return 1000; // Default fallback
  }
};

// Get total credits from user profile
export const getTotalCredits = () => {
  try {
    // Try to get from localStorage first (fallback)
    const storedTotal = localStorage.getItem('total_credits');
    if (storedTotal !== null) {
      return parseInt(storedTotal, 10);
    }
    return 1000; // Default fallback
  } catch (e) {
    return 1000; // Default fallback
  }
};

const dispatchCreditUpdate = () => {
  window.dispatchEvent(new Event('creditsUpdated'));
};

export const useCredits = () => {
  const userInfo = useSelector((state) => state.auth.userInfo);
  
  // Get credits from user profile or fallback to localStorage
  const getCurrentCredits = () => {
    if (userInfo?.remainingCredits !== undefined) {
      return userInfo.remainingCredits;
    }
    return getDynamicCredits();
  };

  const getCurrentTotalCredits = () => {
    if (userInfo?.totalCredits !== undefined) {
      return userInfo.totalCredits;
    }
    return getTotalCredits();
  };

  const [credits, setCreditsState] = useState(getCurrentCredits);
  const [totalCredits, setTotalCreditsState] = useState(getCurrentTotalCredits);

  // Update credits when userInfo changes
  useEffect(() => {
    const newCredits = getCurrentCredits();
    const newTotalCredits = getCurrentTotalCredits();
    
    setCreditsState(newCredits);
    setTotalCreditsState(newTotalCredits);
    
    // Update localStorage for fallback
    localStorage.setItem(CREDITS_KEY, newCredits.toString());
    localStorage.setItem('total_credits', newTotalCredits.toString());
  }, [userInfo]);

  const setCredits = useCallback((amount) => {
    const newAmount = Math.max(0, amount);
    localStorage.setItem(CREDITS_KEY, newAmount.toString());
    setCreditsState(newAmount);
    dispatchCreditUpdate();
  }, []);

  const deductCredits = useCallback((amount) => {
    const currentCredits = getCurrentCredits();
    if (currentCredits >= amount) {
      const newCredits = currentCredits - amount;
      setCredits(newCredits);
      return true;
    }
    return false;
  }, [setCredits]);

  const resetCredits = useCallback(() => {
    const total = getCurrentTotalCredits();
    setCredits(total);
  }, [setCredits]);

  useEffect(() => {
    const handleCreditUpdate = () => {
      const updatedCredits = localStorage.getItem(CREDITS_KEY);
      if (updatedCredits !== null) {
        setCreditsState(parseInt(updatedCredits, 10));
      }
    };

    window.addEventListener('creditsUpdated', handleCreditUpdate);
    window.addEventListener('storage', (e) => {
      if (e.key === CREDITS_KEY) {
        handleCreditUpdate();
      }
    });

    return () => {
      window.removeEventListener('creditsUpdated', handleCreditUpdate);
      window.removeEventListener('storage', (e) => {
        if (e.key === CREDITS_KEY) handleCreditUpdate();
      });
    };
  }, []);

  return { 
    credits, 
    deductCredits, 
    setCredits, 
    resetCredits, 
    CAMPAIGN_COST, 
    TOTAL_CREDITS: totalCredits 
  };
};

export const getCredits = () => {
  return getDynamicCredits();
};