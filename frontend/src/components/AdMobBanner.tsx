import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';

// AdMob IDs
const ADMOB_IDS = {
  android: {
    appId: 'ca-app-pub-8309745338282834~6476050996',
    banner: 'ca-app-pub-8309745338282834/9092823082',
  },
  ios: {
    appId: 'ca-app-pub-8309745338282834~5153578079',
    banner1: 'ca-app-pub-8309745338282834/8092384991',
    banner2: 'ca-app-pub-8309745338282834/8765520025',
  },
};

// Get the appropriate Ad Unit ID based on platform
const getBannerAdUnitId = () => {
  if (Platform.OS === 'android') {
    return ADMOB_IDS.android.banner;
  } else if (Platform.OS === 'ios') {
    return ADMOB_IDS.ios.banner1;
  }
  return null;
};

interface AdMobBannerProps {
  style?: any;
}

// AdMob Banner Component for Native Apps
export const AdMobBanner: React.FC<AdMobBannerProps> = ({ style }) => {
  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const [BannerAd, setBannerAd] = useState<any>(null);
  const [BannerAdSize, setBannerAdSize] = useState<any>(null);

  useEffect(() => {
    // Only load AdMob on native platforms (not web)
    if (Platform.OS !== 'web') {
      loadAdMob();
    }
  }, []);

  const loadAdMob = async () => {
    try {
      // Dynamic import for native only
      const mobileAds = await import('react-native-google-mobile-ads');
      const { BannerAd: Banner, BannerAdSize: AdSize, TestIds } = mobileAds;
      
      setBannerAd(() => Banner);
      setBannerAdSize(AdSize);
      
      // Initialize the Mobile Ads SDK
      await mobileAds.default().initialize();
      console.log('AdMob initialized successfully');
    } catch (error) {
      console.log('AdMob not available (web or error):', error);
    }
  };

  // Don't render on web
  if (Platform.OS === 'web') {
    return null;
  }

  // Don't render until AdMob is loaded
  if (!BannerAd || !BannerAdSize) {
    return null;
  }

  const adUnitId = getBannerAdUnitId();
  if (!adUnitId) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: false,
        }}
        onAdLoaded={() => {
          console.log('Banner ad loaded');
          setIsAdLoaded(true);
        }}
        onAdFailedToLoad={(error: any) => {
          console.log('Banner ad failed to load:', error);
        }}
      />
    </View>
  );
};

// Interstitial Ad Helper
export const showInterstitialAd = async () => {
  if (Platform.OS === 'web') {
    console.log('Interstitial ads not available on web');
    return;
  }

  try {
    const mobileAds = await import('react-native-google-mobile-ads');
    const { InterstitialAd, AdEventType } = mobileAds;
    
    const adUnitId = Platform.OS === 'android' 
      ? ADMOB_IDS.android.banner // Replace with interstitial ID if you have one
      : ADMOB_IDS.ios.banner2;
    
    const interstitial = InterstitialAd.createForAdRequest(adUnitId);
    
    interstitial.addAdEventListener(AdEventType.LOADED, () => {
      interstitial.show();
    });
    
    interstitial.addAdEventListener(AdEventType.ERROR, (error: any) => {
      console.log('Interstitial ad error:', error);
    });
    
    interstitial.load();
  } catch (error) {
    console.log('Interstitial ad not available:', error);
  }
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
});

export default AdMobBanner;
