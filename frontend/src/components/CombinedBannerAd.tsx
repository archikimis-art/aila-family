import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';

// AdMob IDs for native
const ADMOB_IDS = {
  android: {
    banner: 'ca-app-pub-8309745338282834/9092823082',
  },
  ios: {
    banner: 'ca-app-pub-8309745338282834/8092384991',
  },
};

// AdSense ID for web
const ADSENSE_CLIENT = 'ca-pub-8309745338282834';

interface CombinedBannerAdProps {
  style?: any;
  position?: 'top' | 'bottom';
}

// Combined Banner Ad Component - Works on Web (AdSense) and Native (AdMob)
export const CombinedBannerAd: React.FC<CombinedBannerAdProps> = ({ style, position = 'bottom' }) => {
  const [isNativeAdLoaded, setIsNativeAdLoaded] = useState(false);
  const [NativeBannerAd, setNativeBannerAd] = useState<any>(null);
  const [NativeBannerAdSize, setNativeBannerAdSize] = useState<any>(null);
  const [webAdError, setWebAdError] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web') {
      initWebAd();
    } else {
      initNativeAd();
    }
  }, []);

  // Initialize AdSense for Web
  const initWebAd = () => {
    if (typeof window !== 'undefined') {
      try {
        // Push ad to display
        (window as any).adsbygoogle = (window as any).adsbygoogle || [];
        setTimeout(() => {
          try {
            (window as any).adsbygoogle.push({});
          } catch (e) {
            console.log('[AdSense] Error pushing ad:', e);
            setWebAdError(true);
          }
        }, 1000);
      } catch (error) {
        console.log('[AdSense] Init error:', error);
        setWebAdError(true);
      }
    }
  };

  // Initialize AdMob for Native
  const initNativeAd = async () => {
    try {
      const mobileAds = await import('react-native-google-mobile-ads');
      const { BannerAd: Banner, BannerAdSize: AdSize } = mobileAds;
      
      setNativeBannerAd(() => Banner);
      setNativeBannerAdSize(AdSize);
      
      // Initialize SDK
      await mobileAds.default().initialize();
      console.log('[AdMob] Banner initialized');
    } catch (error) {
      console.log('[AdMob] Banner not available:', error);
    }
  };

  // Web Banner (AdSense)
  if (Platform.OS === 'web') {
    if (webAdError) {
      return null;
    }
    
    return (
      <View style={[styles.webContainer, position === 'top' ? styles.topPosition : styles.bottomPosition, style]}>
        <ins
          className="adsbygoogle"
          style={{
            display: 'block',
            width: '100%',
            height: '90px',
            backgroundColor: 'transparent',
          }}
          data-ad-client={ADSENSE_CLIENT}
          data-ad-slot="auto"
          data-ad-format="horizontal"
          data-full-width-responsive="true"
        />
      </View>
    );
  }

  // Native Banner (AdMob)
  if (!NativeBannerAd || !NativeBannerAdSize) {
    return null;
  }

  const adUnitId = Platform.OS === 'android' 
    ? ADMOB_IDS.android.banner 
    : ADMOB_IDS.ios.banner;

  return (
    <View style={[styles.nativeContainer, position === 'top' ? styles.topPosition : styles.bottomPosition, style]}>
      <NativeBannerAd
        unitId={adUnitId}
        size={NativeBannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: false,
        }}
        onAdLoaded={() => {
          console.log('[AdMob] Banner loaded');
          setIsNativeAdLoaded(true);
        }}
        onAdFailedToLoad={(error: any) => {
          console.log('[AdMob] Banner failed:', error);
        }}
      />
    </View>
  );
};

// Simple banner for specific placement
export const SmallBannerAd: React.FC<{ style?: any }> = ({ style }) => {
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.smallBanner, style]}>
        <ins
          className="adsbygoogle"
          style={{
            display: 'block',
            width: '320px',
            height: '50px',
          }}
          data-ad-client={ADSENSE_CLIENT}
          data-ad-slot="auto"
          data-ad-format="auto"
        />
      </View>
    );
  }
  
  return <CombinedBannerAd style={style} />;
};

const styles = StyleSheet.create({
  webContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    minHeight: 90,
  },
  nativeContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topPosition: {
    // For top positioning if needed
  },
  bottomPosition: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  smallBanner: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
});

export default CombinedBannerAd;
