/**
 * Après N changements d'onglet : affiche une pub interstitielle AdMob (natif) si disponible,
 * puis une modal "Passer en Premium". Uniquement pour les utilisateurs non premium.
 */
import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'expo-router';
import { useAds } from '@/context/AdsContext';
import { usePreview } from '@/context/PreviewContext';
import PremiumPrompt from './PremiumPrompt';

let showInterstitialAd: () => Promise<boolean> = async () => false;
try {
  const AdMob = require('@/services/AdMobInterstitial');
  showInterstitialAd = AdMob.showInterstitialAd || showInterstitialAd;
} catch {
  // Web ou module absent
}

export default function PremiumInterstitialTrigger() {
  const pathname = usePathname();
  const { isPreviewMode } = usePreview();
  const { isPremium, incrementAction, shouldShowInterstitial } = useAds();
  const [showPrompt, setShowPrompt] = useState(false);
  const [promptType, setPromptType] = useState<'time_limited' | null>(null);
  const prevPathname = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || isPremium || isPreviewMode) return;
    if (prevPathname.current !== null && prevPathname.current !== pathname) {
      incrementAction();
      if (shouldShowInterstitial()) {
        // Tenter d'afficher une interstitielle AdMob (natif) ; sinon / en plus, modal Premium
        showInterstitialAd().catch(() => {});
        setPromptType('time_limited');
        setShowPrompt(true);
      }
    }
    prevPathname.current = pathname;
  }, [pathname, isPremium, incrementAction, shouldShowInterstitial]);

  return (
    <PremiumPrompt
      visible={showPrompt}
      type={promptType}
      onDismiss={() => {
        setShowPrompt(false);
        setPromptType(null);
      }}
    />
  );
}
