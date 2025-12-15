import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';

// AdMob Test IDs (replace with real IDs in production)
const TEST_BANNER_ID = Platform.select({
  ios: 'ca-app-pub-3940256099942544/2934735716',
  android: 'ca-app-pub-3940256099942544/6300978111',
  default: 'ca-app-pub-3940256099942544/6300978111',
});

const TEST_INTERSTITIAL_ID = Platform.select({
  ios: 'ca-app-pub-3940256099942544/4411468910',
  android: 'ca-app-pub-3940256099942544/1033173712',
  default: 'ca-app-pub-3940256099942544/1033173712',
});

interface AdsContextType {
  isPremium: boolean;
  showAds: boolean;
  bannerId: string;
  interstitialId: string;
  actionCount: number;
  incrementAction: () => void;
  shouldShowInterstitial: () => boolean;
  refreshPremiumStatus: () => Promise<void>;
  subscriptionPlan: string | null;
}

const AdsContext = createContext<AdsContextType | undefined>(undefined);

export function AdsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [subscriptionPlan, setSubscriptionPlan] = useState<string | null>(null);
  const [actionCount, setActionCount] = useState(0);

  // Determine if we should show ads
  const showAds = !isPremium;

  const refreshPremiumStatus = async () => {
    if (!user) {
      setIsPremium(false);
      setSubscriptionPlan(null);
      return;
    }

    try {
      const response = await api.get('/stripe/subscription-status');
      const data = response.data;
      
      // User is premium if they have an active subscription or lifetime purchase
      const isActive = data.status === 'active' || data.status === 'lifetime';
      setIsPremium(isActive);
      setSubscriptionPlan(data.plan || null);
    } catch (error) {
      console.log('Error checking premium status:', error);
      setIsPremium(false);
      setSubscriptionPlan(null);
    }
  };

  useEffect(() => {
    refreshPremiumStatus();
  }, [user]);

  const incrementAction = () => {
    setActionCount(prev => prev + 1);
  };

  const shouldShowInterstitial = (): boolean => {
    // Show interstitial every 5 actions for free users
    if (isPremium) return false;
    return actionCount > 0 && actionCount % 5 === 0;
  };

  return (
    <AdsContext.Provider
      value={{
        isPremium,
        showAds,
        bannerId: TEST_BANNER_ID,
        interstitialId: TEST_INTERSTITIAL_ID,
        actionCount,
        incrementAction,
        shouldShowInterstitial,
        refreshPremiumStatus,
        subscriptionPlan,
      }}
    >
      {children}
    </AdsContext.Provider>
  );
}

export function useAds() {
  const context = useContext(AdsContext);
  if (context === undefined) {
    throw new Error('useAds must be used within an AdsProvider');
  }
  return context;
}
