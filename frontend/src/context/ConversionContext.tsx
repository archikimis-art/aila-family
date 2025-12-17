import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/context/AuthContext';

interface ConversionContextType {
  // Action tracking
  actionsCount: number;
  exportsCount: number;
  personsCount: number;
  
  // Triggers
  shouldShowPremiumPrompt: boolean;
  promptType: 'export' | 'tree_size' | 'welcome' | 'time_limited' | null;
  
  // Methods
  trackAction: (action: 'add_person' | 'export' | 'view_tree') => void;
  setPersonsCount: (count: number) => void;
  dismissPrompt: () => void;
  
  // Welcome offer
  hasSeenWelcomeOffer: boolean;
  welcomeOfferExpiry: Date | null;
  isWelcomeOfferValid: boolean;
  
  // Referral
  referralCode: string | null;
  generateReferralCode: () => string;
}

const ConversionContext = createContext<ConversionContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ACTIONS_COUNT: 'aila_actions_count',
  EXPORTS_COUNT: 'aila_exports_count',
  WELCOME_SEEN: 'aila_welcome_seen',
  WELCOME_EXPIRY: 'aila_welcome_expiry',
  LAST_PROMPT_DATE: 'aila_last_prompt',
  REFERRAL_CODE: 'aila_referral_code',
};

export function ConversionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  
  const [actionsCount, setActionsCount] = useState(0);
  const [exportsCount, setExportsCount] = useState(0);
  const [personsCount, setPersonsCountState] = useState(0);
  const [shouldShowPremiumPrompt, setShouldShowPremiumPrompt] = useState(false);
  const [promptType, setPromptType] = useState<'export' | 'tree_size' | 'welcome' | 'time_limited' | null>(null);
  const [hasSeenWelcomeOffer, setHasSeenWelcomeOffer] = useState(true);
  const [welcomeOfferExpiry, setWelcomeOfferExpiry] = useState<Date | null>(null);
  const [referralCode, setReferralCode] = useState<string | null>(null);

  // Load saved data on mount
  useEffect(() => {
    loadSavedData();
  }, [user]);

  const loadSavedData = async () => {
    try {
      const [actions, exports, welcomeSeen, welcomeExp, refCode] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.ACTIONS_COUNT),
        AsyncStorage.getItem(STORAGE_KEYS.EXPORTS_COUNT),
        AsyncStorage.getItem(STORAGE_KEYS.WELCOME_SEEN),
        AsyncStorage.getItem(STORAGE_KEYS.WELCOME_EXPIRY),
        AsyncStorage.getItem(STORAGE_KEYS.REFERRAL_CODE),
      ]);

      if (actions) setActionsCount(parseInt(actions, 10));
      if (exports) setExportsCount(parseInt(exports, 10));
      if (welcomeSeen) setHasSeenWelcomeOffer(welcomeSeen === 'true');
      if (welcomeExp) setWelcomeOfferExpiry(new Date(welcomeExp));
      if (refCode) setReferralCode(refCode);

      // Check if new user should see welcome offer
      if (!welcomeSeen && user) {
        showWelcomeOffer();
      }
    } catch (error) {
      console.log('Error loading conversion data:', error);
    }
  };

  const showWelcomeOffer = async () => {
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 24); // 24 hour offer
    
    setWelcomeOfferExpiry(expiry);
    setHasSeenWelcomeOffer(false);
    setShouldShowPremiumPrompt(true);
    setPromptType('welcome');
    
    await AsyncStorage.setItem(STORAGE_KEYS.WELCOME_EXPIRY, expiry.toISOString());
  };

  const trackAction = async (action: 'add_person' | 'export' | 'view_tree') => {
    const newCount = actionsCount + 1;
    setActionsCount(newCount);
    await AsyncStorage.setItem(STORAGE_KEYS.ACTIONS_COUNT, newCount.toString());

    if (action === 'export') {
      const newExports = exportsCount + 1;
      setExportsCount(newExports);
      await AsyncStorage.setItem(STORAGE_KEYS.EXPORTS_COUNT, newExports.toString());
      
      // Show premium prompt after export
      triggerPrompt('export');
    }

    // Check for tree size trigger (every 5 persons added after 10)
    if (action === 'add_person' && personsCount > 0 && personsCount % 5 === 0 && personsCount >= 10) {
      triggerPrompt('tree_size');
    }
  };

  const setPersonsCount = (count: number) => {
    setPersonsCountState(count);
    
    // Trigger on first reaching 10 persons
    if (count === 10) {
      triggerPrompt('tree_size');
    }
  };

  const triggerPrompt = async (type: 'export' | 'tree_size' | 'welcome' | 'time_limited') => {
    // Check if we've shown a prompt recently (within 24 hours)
    const lastPrompt = await AsyncStorage.getItem(STORAGE_KEYS.LAST_PROMPT_DATE);
    if (lastPrompt) {
      const lastDate = new Date(lastPrompt);
      const hoursSince = (Date.now() - lastDate.getTime()) / (1000 * 60 * 60);
      if (hoursSince < 24 && type !== 'welcome') {
        return; // Don't show too many prompts
      }
    }

    setShouldShowPremiumPrompt(true);
    setPromptType(type);
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_PROMPT_DATE, new Date().toISOString());
  };

  const dismissPrompt = async () => {
    setShouldShowPremiumPrompt(false);
    setPromptType(null);
    
    if (!hasSeenWelcomeOffer) {
      setHasSeenWelcomeOffer(true);
      await AsyncStorage.setItem(STORAGE_KEYS.WELCOME_SEEN, 'true');
    }
  };

  const generateReferralCode = (): string => {
    if (referralCode) return referralCode;
    
    // Generate a unique code based on user id or random
    const code = `AILA${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    setReferralCode(code);
    AsyncStorage.setItem(STORAGE_KEYS.REFERRAL_CODE, code);
    return code;
  };

  const isWelcomeOfferValid = welcomeOfferExpiry ? new Date() < welcomeOfferExpiry : false;

  return (
    <ConversionContext.Provider
      value={{
        actionsCount,
        exportsCount,
        personsCount,
        shouldShowPremiumPrompt,
        promptType,
        trackAction,
        setPersonsCount,
        dismissPrompt,
        hasSeenWelcomeOffer,
        welcomeOfferExpiry,
        isWelcomeOfferValid,
        referralCode,
        generateReferralCode,
      }}
    >
      {children}
    </ConversionContext.Provider>
  );
}

export function useConversion() {
  const context = useContext(ConversionContext);
  if (context === undefined) {
    throw new Error('useConversion must be used within a ConversionProvider');
  }
  return context;
}
