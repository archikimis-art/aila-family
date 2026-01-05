import { Platform } from 'react-native';

// AdMob Interstitial IDs
const INTERSTITIAL_IDS = {
  android: 'ca-app-pub-8309745338282834/9092823082', // Remplacer par un vrai ID interstitiel si disponible
  ios: 'ca-app-pub-8309745338282834/8765520025',
};

// Configuration
const AD_CONFIG = {
  // Temps minimum entre deux pubs (en secondes)
  MIN_INTERVAL_SECONDS: 60,
  // Nombre de changements de page avant d'afficher une pub
  PAGE_CHANGES_BEFORE_AD: 3,
  // Temps minimum d'affichage (géré par AdMob, mais on peut retarder la fermeture)
  MIN_DISPLAY_TIME_MS: 5000,
};

// État global pour tracker les pubs
let lastAdTime = 0;
let pageChangeCount = 0;
let isAdLoading = false;
let interstitialAd: any = null;

// Fonction pour vérifier si on peut afficher une pub
const canShowAd = (): boolean => {
  const now = Date.now();
  const timeSinceLastAd = (now - lastAdTime) / 1000;
  
  // Vérifier le temps minimum entre les pubs
  if (timeSinceLastAd < AD_CONFIG.MIN_INTERVAL_SECONDS && lastAdTime !== 0) {
    console.log(`[AdMob] Trop tôt pour une pub (${Math.round(timeSinceLastAd)}s / ${AD_CONFIG.MIN_INTERVAL_SECONDS}s)`);
    return false;
  }
  
  // Vérifier le nombre de changements de page
  if (pageChangeCount < AD_CONFIG.PAGE_CHANGES_BEFORE_AD) {
    console.log(`[AdMob] Pas assez de changements de page (${pageChangeCount} / ${AD_CONFIG.PAGE_CHANGES_BEFORE_AD})`);
    return false;
  }
  
  return true;
};

// Précharger une pub interstitielle
export const preloadInterstitialAd = async () => {
  if (Platform.OS === 'web' || isAdLoading) {
    return;
  }

  try {
    const mobileAds = await import('react-native-google-mobile-ads');
    const { InterstitialAd, AdEventType } = mobileAds;
    
    const adUnitId = Platform.OS === 'android' 
      ? INTERSTITIAL_IDS.android 
      : INTERSTITIAL_IDS.ios;
    
    isAdLoading = true;
    interstitialAd = InterstitialAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: false,
    });
    
    // Écouter les événements
    interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
      console.log('[AdMob] Interstitial préchargé');
      isAdLoading = false;
    });
    
    interstitialAd.addAdEventListener(AdEventType.ERROR, (error: any) => {
      console.log('[AdMob] Erreur interstitial:', error);
      isAdLoading = false;
      interstitialAd = null;
    });
    
    interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
      console.log('[AdMob] Interstitial fermé');
      lastAdTime = Date.now();
      pageChangeCount = 0;
      interstitialAd = null;
      // Précharger la prochaine pub
      setTimeout(() => preloadInterstitialAd(), 5000);
    });
    
    interstitialAd.load();
  } catch (error) {
    console.log('[AdMob] Interstitial non disponible:', error);
    isAdLoading = false;
  }
};

// Afficher une pub interstitielle
export const showInterstitialAd = async (): Promise<boolean> => {
  if (Platform.OS === 'web') {
    console.log('[AdMob] Interstitial non disponible sur web');
    return false;
  }

  if (!canShowAd()) {
    return false;
  }

  try {
    if (interstitialAd && interstitialAd.loaded) {
      console.log('[AdMob] Affichage interstitial...');
      await interstitialAd.show();
      return true;
    } else {
      console.log('[AdMob] Pas de pub préchargée, chargement...');
      // Charger et afficher immédiatement
      const mobileAds = await import('react-native-google-mobile-ads');
      const { InterstitialAd, AdEventType } = mobileAds;
      
      const adUnitId = Platform.OS === 'android' 
        ? INTERSTITIAL_IDS.android 
        : INTERSTITIAL_IDS.ios;
      
      const ad = InterstitialAd.createForAdRequest(adUnitId);
      
      return new Promise((resolve) => {
        ad.addAdEventListener(AdEventType.LOADED, () => {
          ad.show();
          lastAdTime = Date.now();
          pageChangeCount = 0;
          resolve(true);
        });
        
        ad.addAdEventListener(AdEventType.ERROR, () => {
          resolve(false);
        });
        
        ad.addAdEventListener(AdEventType.CLOSED, () => {
          // Précharger la prochaine
          setTimeout(() => preloadInterstitialAd(), 5000);
        });
        
        ad.load();
      });
    }
  } catch (error) {
    console.log('[AdMob] Erreur affichage interstitial:', error);
    return false;
  }
};

// Appeler cette fonction à chaque changement de page
export const onPageChange = async (pageName?: string) => {
  pageChangeCount++;
  console.log(`[AdMob] Changement de page: ${pageName || 'unknown'} (count: ${pageChangeCount})`);
  
  // Tenter d'afficher une pub si les conditions sont remplies
  if (canShowAd()) {
    await showInterstitialAd();
  }
  
  // Précharger si nécessaire
  if (!interstitialAd && !isAdLoading) {
    preloadInterstitialAd();
  }
};

// Initialiser le système de pubs
export const initializeAds = async () => {
  if (Platform.OS === 'web') {
    console.log('[AdMob] Web platform - using AdSense instead');
    return;
  }

  try {
    const mobileAds = await import('react-native-google-mobile-ads');
    await mobileAds.default().initialize();
    console.log('[AdMob] SDK initialisé');
    
    // Précharger la première pub
    preloadInterstitialAd();
  } catch (error) {
    console.log('[AdMob] Erreur initialisation:', error);
  }
};

// Réinitialiser les compteurs (utile pour les tests)
export const resetAdCounters = () => {
  lastAdTime = 0;
  pageChangeCount = 0;
};

// Obtenir les stats actuelles
export const getAdStats = () => ({
  pageChangeCount,
  lastAdTime,
  timeSinceLastAd: lastAdTime ? (Date.now() - lastAdTime) / 1000 : null,
  isAdReady: interstitialAd?.loaded || false,
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
