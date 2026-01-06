import { Platform } from 'react-native';

// AdMob Interstitial - Stub for Web, real implementation only on native builds
// The actual AdMob implementation will be added during native build process

// Configuration
const AD_CONFIG = {
  MIN_INTERVAL_SECONDS: 60,
  PAGE_CHANGES_BEFORE_AD: 3,
};

let lastAdTime = 0;
let pageChangeCount = 0;

// Initialize ads - stub for web
export const initializeAds = async () => {
  if (Platform.OS === 'web') {
    console.log('[Ads] Web platform - AdSense is used instead of AdMob');
    return;
  }
  console.log('[AdMob] Native ads will be initialized on native build');
};

// On page change - stub for web  
export const onPageChange = async (pageName?: string) => {
  if (Platform.OS === 'web') {
    return;
  }
  pageChangeCount++;
  console.log(`[AdMob] Page change: ${pageName} (count: ${pageChangeCount})`);
};

// Show interstitial - stub for web
export const showInterstitialAd = async (): Promise<boolean> => {
  if (Platform.OS === 'web') {
    return false;
  }
  console.log('[AdMob] Interstitial ads available only on native build');
  return false;
};

// Preload interstitial - stub for web
export const preloadInterstitialAd = async () => {
  if (Platform.OS === 'web') {
    return;
  }
  console.log('[AdMob] Preload available only on native build');
};

// Reset counters
export const resetAdCounters = () => {
  lastAdTime = 0;
  pageChangeCount = 0;
};

// Get stats
export const getAdStats = () => ({
  pageChangeCount,
  lastAdTime,
  config: AD_CONFIG,
});

export default {
  initializeAds,
  onPageChange,
  showInterstitialAd,
  preloadInterstitialAd,
  resetAdCounters,
  getAdStats,
};
