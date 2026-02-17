import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAds } from '@/context/AdsContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Google AdSense Publisher ID (Web)
const ADSENSE_CLIENT = 'ca-pub-8309745338282834';

// Note: Google Mobile Ads temporarily disabled for build compatibility
// Will be re-enabled in a future update

interface AdBannerProps {
  style?: object;
}

// Web AdSense Banner Component
const WebAdBanner = ({ onRemoveAds }: { onRemoveAds: () => void }) => {
  const [adLoaded, setAdLoaded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Prevent SSR hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div style={webStyles.container}>
      <div style={webStyles.adContainer}>
        {/* Placeholder affiché en attendant l'approbation AdSense */}
        <div style={webStyles.placeholder}>
          <span style={webStyles.placeholderIcon}>📢</span>
          <span style={webStyles.placeholderText}>Espace publicitaire</span>
        </div>
      </div>
      <button onClick={onRemoveAds} style={webStyles.premiumButton}>
        <span style={webStyles.premiumIcon}>⭐</span>
        <span style={webStyles.premiumText}>Premium</span>
      </button>
    </div>
  );
};

const webStyles: { [key: string]: React.CSSProperties } = {
  container: {
    backgroundColor: '#1E3A5F',
    borderTop: '1px solid #2D4A6F',
    padding: '8px 16px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: '50px',
  },
  adContainer: {
    flex: 1,
    minHeight: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    opacity: 0.6,
  },
  placeholderIcon: {
    fontSize: '16px',
  },
  placeholderText: {
    fontSize: '12px',
    color: '#A0AEC0',
    fontStyle: 'italic',
  },
  premiumButton: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    border: '1px solid #D4AF37',
    borderRadius: '8px',
    padding: '6px 12px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '4px',
    cursor: 'pointer',
    marginLeft: '12px',
    transition: 'all 0.2s',
  },
  premiumIcon: {
    fontSize: '14px',
  },
  premiumText: {
    fontSize: '12px',
    color: '#D4AF37',
    fontWeight: '600',
  },
  removeButton: {
    backgroundColor: 'transparent',
    border: '1px solid #4A90D9',
    borderRadius: '50%',
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    marginLeft: '12px',
    transition: 'all 0.2s',
  },
  removeIcon: {
    fontSize: '14px',
    color: '#4A90D9',
  },
};

export default function AdBanner({ style }: AdBannerProps) {
  const { showAds, isPremium } = useAds();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isClient, setIsClient] = useState(false);

  // Prevent SSR hydration mismatch - only render on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Don't show ads for premium users
  if (!showAds || isPremium) {
    return null;
  }

  // Don't render anything until we're on the client (prevents hydration mismatch)
  if (!isClient && Platform.OS === 'web') {
    return null;
  }

  const handleRemoveAds = () => {
    router.push('/pricing');
  };

  // For web, show AdSense banner
  if (Platform.OS === 'web') {
    return <WebAdBanner onRemoveAds={handleRemoveAds} />;
  }

  // For mobile, show ad banner with AdMob info
  // Real AdMob ads will show when the app is compiled (APK/IPA)
  const adUnitId = Platform.OS === 'android' ? ADMOB_BANNER_ANDROID : ADMOB_BANNER_IOS;
  
  return (
    <View style={[styles.container, style]}>
      <View style={styles.adContent}>
        <Text style={styles.adIcon}>📢</Text>
        <Text style={styles.adText}>Espace publicitaire</Text>
      </View>
      <TouchableOpacity style={styles.removeButton} onPress={handleRemoveAds}>
        <Ionicons name="star" size={14} color="#D4AF37" />
        <Text style={styles.premiumText}>Premium</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E3A5F',
    borderTopWidth: 1,
    borderTopColor: '#2D4A6F',
    paddingVertical: 6,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 40, // Hauteur fixe compacte pour mobile
  },
  adContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    opacity: 0.6,
    gap: 6,
  },
  adIcon: {
    fontSize: 14,
  },
  adText: {
    color: '#A0AEC0',
    fontSize: 11,
    fontStyle: 'italic',
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: '#D4AF37',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginLeft: 8,
  },
  premiumText: {
    color: '#D4AF37',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
});
