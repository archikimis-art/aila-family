import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAds } from '@/context/AdsContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Google AdSense Publisher ID (Web)
const ADSENSE_CLIENT = 'ca-pub-8309745338282834';

// Pages à contenu éditorial : annonces AdSense uniquement ici (conformité politique Google)
const WEB_CONTENT_ROUTES = [
  '/about', '/pricing', '/faq', '/blog', '/privacy', '/terms',
  '/genealogie-debutant-guide', '/arbre-genealogique-gratuit', '/ecrire-histoire-famille',
  '/traditions-familiales', '/organiser-cousinade', '/questions-grands-parents',
  '/arbre-genealogique-famille-recomposee', '/retrouver-ancetres-gratuitement',
  '/preserver-histoire-famille', '/rappel-anniversaires-famille', '/pourquoi-aila', '/community',
];

interface AdBannerProps {
  style?: object;
}

// Slot AdSense (optionnel) : créer une unité "Display" dans AdSense et mettre l'ID ici, sinon "auto"
const ADSENSE_SLOT = typeof process !== 'undefined' && process.env.EXPO_PUBLIC_ADSENSE_SLOT_BANNER
  ? process.env.EXPO_PUBLIC_ADSENSE_SLOT_BANNER
  : 'auto';

// Web AdSense Banner Component - bloc publicitaire réel
const WebAdBanner = ({ onRemoveAds }: { onRemoveAds: () => void }) => {
  const [adError, setAdError] = useState(false);
  const [insReady, setInsReady] = useState(false);
  const pushedRef = React.useRef(false);

  // Charger le script AdSense si pas déjà présent
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const existing = document.querySelector('script[src*="pagead2.googlesyndication.com"]');
    if (!existing) {
      const s = document.createElement('script');
      s.async = true;
      s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
      s.crossOrigin = 'anonymous';
      document.head.appendChild(s);
    }
    (window as any).adsbygoogle = (window as any).adsbygoogle || [];
  }, []);

  // Pousser l'annonce une fois l'élément <ins> monté
  useEffect(() => {
    if (typeof window === 'undefined' || !insReady || pushedRef.current) return;
    try {
      (window as any).adsbygoogle.push({});
      pushedRef.current = true;
    } catch (e) {
      console.warn('[AdSense] push error:', e);
      setAdError(true);
    }
  }, [insReady]);

  if (adError) {
    return (
      <div style={webStyles.container}>
        <div style={webStyles.adContainer}>
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
  }

  return (
    <div style={webStyles.container}>
      <div style={webStyles.adContainer}>
        <ins
          ref={(el) => { if (el) setInsReady(true); }}
          className="adsbygoogle"
          style={{
            display: 'block',
            minHeight: 50,
            width: '100%',
            maxWidth: 728,
            margin: '0 auto',
          }}
          data-ad-client={ADSENSE_CLIENT}
          data-ad-slot={ADSENSE_SLOT}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
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
  const { showAds, isPremium, bannerId } = useAds();
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!showAds || isPremium) {
    return null;
  }

  if (!isClient && Platform.OS === 'web') {
    return null;
  }

  const handleRemoveAds = () => {
    router.push('/pricing');
  };

  // Web : n'afficher le bloc AdSense réel que sur les pages à contenu (conformité AdSense)
  if (Platform.OS === 'web') {
    const path = (pathname || '').replace(/\?.*$/, '');
    const isContentPage = WEB_CONTENT_ROUTES.some((r) => path === r || path.startsWith(r + '/'));
    if (isContentPage) {
      return <WebAdBanner onRemoveAds={handleRemoveAds} />;
    }
    // Sinon placeholder uniquement (pas d'annonce Google sur arbre / membres / profil / chat)
    return (
      <div style={webStyles.container}>
        <div style={webStyles.adContainer}>
          <div style={webStyles.placeholder}>
            <span style={webStyles.placeholderIcon}>📢</span>
            <span style={webStyles.placeholderText}>Espace publicitaire</span>
          </div>
        </div>
        <button onClick={handleRemoveAds} style={webStyles.premiumButton}>
          <span style={webStyles.premiumIcon}>⭐</span>
          <span style={webStyles.premiumText}>Premium</span>
        </button>
      </div>
    );
  }

  // Mobile : bandeau (placeholder ; bannerId disponible pour futur composant AdMob)
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
    height: 40,
    marginBottom: 0,
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
