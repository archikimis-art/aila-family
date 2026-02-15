// ============================================================================
// ANALYTICS SERVICE - Track visitors and conversions from social media
// ============================================================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Storage keys
const ANALYTICS_KEYS = {
  UTM_SOURCE: 'utm_source',
  UTM_MEDIUM: 'utm_medium',
  UTM_CAMPAIGN: 'utm_campaign',
  REFERRER: 'referrer',
  FIRST_VISIT: 'first_visit_timestamp',
};

export interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  referrer?: string;
}

// ============================================================================
// CAPTURE UTM PARAMS FROM URL
// ============================================================================
export const captureUTMParams = async (): Promise<UTMParams | null> => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return null;
  }

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get('utm_source');
    const utmMedium = urlParams.get('utm_medium');
    const utmCampaign = urlParams.get('utm_campaign');
    const referrer = document.referrer || '';

    // Only save if we have UTM params
    if (utmSource || utmMedium || utmCampaign || referrer.includes('tiktok')) {
      const params: UTMParams = {
        utm_source: utmSource || (referrer.includes('tiktok') ? 'tiktok' : undefined),
        utm_medium: utmMedium || 'social',
        utm_campaign: utmCampaign || 'organic',
        referrer: referrer,
      };

      // Store in AsyncStorage
      if (params.utm_source) await AsyncStorage.setItem(ANALYTICS_KEYS.UTM_SOURCE, params.utm_source);
      if (params.utm_medium) await AsyncStorage.setItem(ANALYTICS_KEYS.UTM_MEDIUM, params.utm_medium);
      if (params.utm_campaign) await AsyncStorage.setItem(ANALYTICS_KEYS.UTM_CAMPAIGN, params.utm_campaign);
      if (params.referrer) await AsyncStorage.setItem(ANALYTICS_KEYS.REFERRER, params.referrer);

      // Record first visit
      const firstVisit = await AsyncStorage.getItem(ANALYTICS_KEYS.FIRST_VISIT);
      if (!firstVisit) {
        await AsyncStorage.setItem(ANALYTICS_KEYS.FIRST_VISIT, Date.now().toString());
      }

      console.log('[ANALYTICS] UTM params captured:', params);
      return params;
    }
  } catch (error) {
    console.error('[ANALYTICS] Error capturing UTM params:', error);
  }

  return null;
};

// ============================================================================
// GET STORED UTM PARAMS
// ============================================================================
export const getStoredUTMParams = async (): Promise<UTMParams> => {
  try {
    const utm_source = await AsyncStorage.getItem(ANALYTICS_KEYS.UTM_SOURCE);
    const utm_medium = await AsyncStorage.getItem(ANALYTICS_KEYS.UTM_MEDIUM);
    const utm_campaign = await AsyncStorage.getItem(ANALYTICS_KEYS.UTM_CAMPAIGN);
    const referrer = await AsyncStorage.getItem(ANALYTICS_KEYS.REFERRER);

    return {
      utm_source: utm_source || undefined,
      utm_medium: utm_medium || undefined,
      utm_campaign: utm_campaign || undefined,
      referrer: referrer || undefined,
    };
  } catch (error) {
    console.error('[ANALYTICS] Error getting stored UTM params:', error);
    return {};
  }
};

// ============================================================================
// CHECK IF USER CAME FROM TIKTOK
// ============================================================================
export const isFromTikTok = async (): Promise<boolean> => {
  const params = await getStoredUTMParams();
  return (
    params.utm_source?.toLowerCase() === 'tiktok' ||
    params.referrer?.includes('tiktok') ||
    false
  );
};

// ============================================================================
// GENERATE TIKTOK TRACKING LINKS
// ============================================================================
export const generateTikTokLinks = (baseUrl: string = 'https://aila.family') => {
  return {
    // Link for bio
    bio: `${baseUrl}/?utm_source=tiktok&utm_medium=bio&utm_campaign=profile`,
    
    // Link for video descriptions
    video: (videoId?: string) => 
      `${baseUrl}/?utm_source=tiktok&utm_medium=video&utm_campaign=${videoId || 'organic'}`,
    
    // Link for comments
    comment: `${baseUrl}/?utm_source=tiktok&utm_medium=comment&utm_campaign=engagement`,
    
    // QR Code link
    qrCode: `${baseUrl}/?utm_source=tiktok&utm_medium=qrcode&utm_campaign=video`,
    
    // Direct landing page
    landing: `${baseUrl}/tiktok`,
  };
};

// ============================================================================
// SHARE TO TIKTOK
// ============================================================================
export const shareTikTokContent = {
  // Get share URL for TikTok web
  getShareUrl: (text: string) => {
    const encodedText = encodeURIComponent(text);
    // TikTok doesn't have a direct web share URL like Twitter, 
    // but we can open TikTok with a prompt
    return `https://www.tiktok.com/upload?description=${encodedText}`;
  },
  
  // Generate share text
  getShareText: (userName?: string) => {
    const texts = [
      `🌳 Je crée mon arbre généalogique sur AÏLA ! Rejoins-moi → aila.family #genealogie #famille #aila`,
      `📱 L'appli parfaite pour créer son arbre familial ! Testez AÏLA → aila.family #arbregenealogique #famille`,
      `👨‍👩‍👧‍👦 Ma famille sur une seule app ! Découvrez AÏLA → aila.family #famille #genealogie #histoire`,
      `🎄 Créez votre arbre de famille gratuitement sur AÏLA ! → aila.family #famille #souvenirs #genealogie`,
    ];
    return texts[Math.floor(Math.random() * texts.length)];
  },
  
  // Popular hashtags for TikTok
  hashtags: [
    '#genealogie',
    '#arbregenealogique', 
    '#famille',
    '#histoire',
    '#souvenirs',
    '#aila',
    '#familyhistory',
    '#ancestry',
    '#grandsparents',
    '#heritage',
  ],
};

// ============================================================================
// TRACK CONVERSION EVENT
// ============================================================================
export const trackConversion = async (eventType: 'signup' | 'login' | 'tree_created' | 'person_added') => {
  try {
    const params = await getStoredUTMParams();
    const timestamp = Date.now();
    
    // Store conversion event
    const conversionKey = `conversion_${eventType}_${timestamp}`;
    await AsyncStorage.setItem(conversionKey, JSON.stringify({
      event: eventType,
      timestamp,
      ...params,
    }));
    
    console.log('[ANALYTICS] Conversion tracked:', eventType, params);
    
    // In a production app, you would send this to your backend or analytics service
    // Example: await api.post('/analytics/conversion', { eventType, ...params });
    
  } catch (error) {
    console.error('[ANALYTICS] Error tracking conversion:', error);
  }
};
