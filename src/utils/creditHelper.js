import { useState, useEffect, useCallback } from 'react';

const CREDITS_KEY = 'user_credits';
export const TOTAL_CREDITS = 100;
export const CAMPAIGN_COST = 10;

const dispatchCreditUpdate = () => {
  window.dispatchEvent(new Event('creditsUpdated'));
};

export const useCredits = () => {
  const [credits, setCreditsState] = useState(() => {
    const storedCredits = localStorage.getItem(CREDITS_KEY);
    // On first load, set to the total credits
    return storedCredits == null ? TOTAL_CREDITS : parseInt(storedCredits, 10);
  });

  const setCredits = useCallback((amount) => {
    const newAmount = Math.max(0, amount);
    localStorage.setItem(CREDITS_KEY, newAmount.toString());
    setCreditsState(newAmount);
    dispatchCreditUpdate();
  }, []);

  const deductCredits = useCallback((amount) => {
    const currentCredits = parseInt(localStorage.getItem(CREDITS_KEY) || '0', 10);
    if (currentCredits >= amount) {
      const newCredits = currentCredits - amount;
      setCredits(newCredits);
      return true;
    }
    return false;
  }, [setCredits]);
  
  const resetCredits = useCallback(() => {
    setCredits(TOTAL_CREDITS);
  }, [setCredits]);

  useEffect(() => {
    const handleCreditUpdate = () => {
      const updatedCredits = localStorage.getItem(CREDITS_KEY);
      if (updatedCredits !== null) {
        setCreditsState(parseInt(updatedCredits, 10));
      } else {
        // If no credits are in storage, initialize them
        setCreditsState(TOTAL_CREDITS);
        localStorage.setItem(CREDITS_KEY, TOTAL_CREDITS.toString());
      }
    };

    window.addEventListener('creditsUpdated', handleCreditUpdate);
    window.addEventListener('storage', (e) => {
      if (e.key === CREDITS_KEY) {
        handleCreditUpdate();
      }
    });

    handleCreditUpdate();

    return () => {
      window.removeEventListener('creditsUpdated', handleCreditUpdate);
      window.removeEventListener('storage', (e) => {
        if (e.key === CREDITS_KEY) handleCreditUpdate();
      });
    };
  }, []);

  return { credits, deductCredits, setCredits, resetCredits, CAMPAIGN_COST, TOTAL_CREDITS };
};

export const getCredits = () => {
    const storedCredits = localStorage.getItem(CREDITS_KEY);
    return storedCredits == null ? TOTAL_CREDITS : parseInt(storedCredits, 10);
};