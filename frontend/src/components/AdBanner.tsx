import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAds } from '@/context/AdsContext';

// Google AdSense Publisher ID
const ADSENSE_CLIENT = 'ca-pub-8309745338282834';

interface AdBannerProps {
  style?: object;
}

// Web AdSense Banner Component
const WebAdBanner = ({ onRemoveAds }: { onRemoveAds: () => void }) => {
  const adRef = useRef<HTMLDivElement>(null);
  const adInitialized = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && adRef.current && !adInitialized.current) {
      try {
        // Create the ad element
        const ins = document.createElement('ins');
        ins.className = 'adsbygoogle';
        ins.style.display = 'block';
        ins.style.width = '100%';
        ins.style.height = '90px';
        ins.setAttribute('data-ad-client', ADSENSE_CLIENT);
        ins.setAttribute('data-ad-slot', 'auto'); // Auto ad slot
        ins.setAttribute('data-ad-format', 'horizontal');
        ins.setAttribute('data-full-width-responsive', 'true');
        
        // Clear and append
        if (adRef.current) {
          adRef.current.innerHTML = '';
          adRef.current.appendChild(ins);
        }

        // Push ad
        setTimeout(() => {
          try {
            ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
            adInitialized.current = true;
          } catch (e) {
            console.log('AdSense push error:', e);
          }
        }, 100);
      } catch (error) {
        console.log('AdSense initialization error:', error);
      }
    }
  }, []);

  return (
    <div style={webStyles.container}>
      <div ref={adRef} style={webStyles.adContainer}>
        {/* AdSense ad will be inserted here */}
        <div style={webStyles.placeholder}>
          <span style={webStyles.placeholderIcon}>📢</span>
          <span style={webStyles.placeholderText}>Espace publicitaire</span>
        </div>
      </div>
      <button onClick={onRemoveAds} style={webStyles.removeButton}>
        Supprimer les pubs
      </button>
    </div>
  );
};

const webStyles: { [key: string]: React.CSSProperties } = {
  container: {
    backgroundColor: '#f5f5f5',
    borderTop: '1px solid #ddd',
    padding: '8px 16px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: '60px',
  },
  adContainer: {
    flex: 1,
    minHeight: '50px',
    display: 'flex',
    alignItems: 'center',
  },
  placeholder: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#666',
  },
  placeholderIcon: {
    fontSize: '20px',
  },
  placeholderText: {
    fontSize: '14px',
  },
  removeButton: {
    backgroundColor: '#4A90D9',
    color: '#fff',
    border: 'none',
    borderRadius: '15px',
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    marginLeft: '16px',
  },
};

export default function AdBanner({ style }: AdBannerProps) {
  const { showAds, isPremium } = useAds();
  const router = useRouter();

  // Don't show ads for premium users
  if (!showAds || isPremium) {
    return null;
  }

  const handleRemoveAds = () => {
    router.push('/pricing');
  };

  // For web, show AdSense banner
  if (Platform.OS === 'web') {
    return <WebAdBanner onRemoveAds={handleRemoveAds} />;
  }

  // For mobile, show placeholder (real ads via AdMob in compiled app)
  return (
    <View style={[styles.container, style]}>
      <View style={styles.adContent}>
        <Ionicons name="megaphone-outline" size={20} color="#666" />
        <Text style={styles.adText}>Publicité</Text>
      </View>
      <TouchableOpacity style={styles.removeButton} onPress={handleRemoveAds}>
        <Text style={styles.removeText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0f0f0',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 50,
  },
  adContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  adText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  removeButton: {
    backgroundColor: '#4A90D9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  removeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
