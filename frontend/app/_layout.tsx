import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@/context/AuthContext';
import { AdsProvider } from '@/context/AdsContext';
import { ConversionProvider } from '@/context/ConversionContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform } from 'react-native';

// SEO Meta Tags and Structured Data
const initSEO = () => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    // Title
    document.title = 'AÏLA - Arbre Généalogique Collaboratif Gratuit | Créez votre Histoire Familiale';
    
    // Meta Description
    const metaDesc = document.createElement('meta');
    metaDesc.name = 'description';
    metaDesc.content = 'AÏLA est une application gratuite pour créer, visualiser et partager votre arbre généalogique familial. Collaborez avec votre famille, préservez vos souvenirs, découvrez vos ancêtres. Commencez gratuitement !';
    document.head.appendChild(metaDesc);
    
    // Google AdSense Verification Meta Tag
    const metaAdsense = document.createElement('meta');
    metaAdsense.name = 'google-adsense-account';
    metaAdsense.content = 'ca-pub-8309745338282834';
    document.head.appendChild(metaAdsense);
    
    // Keywords
    const metaKeywords = document.createElement('meta');
    metaKeywords.name = 'keywords';
    metaKeywords.content = 'arbre généalogique, généalogie, arbre familial, histoire familiale, ancêtres, famille, généalogie gratuite, créer arbre généalogique, application généalogie, logiciel généalogie, recherche généalogique, arbre généalogique en ligne, généalogie collaborative, partager arbre familial, AÏLA, aila family, descendants, ascendants, lignée familiale, héritage familial, racines familiales, origine famille, généalogie française, arbre généalogique gratuit en ligne, faire son arbre généalogique, généalogie en ligne, site généalogie, outil généalogie';
    document.head.appendChild(metaKeywords);
    
    // Author
    const metaAuthor = document.createElement('meta');
    metaAuthor.name = 'author';
    metaAuthor.content = 'AÏLA - Arbre Généalogique';
    document.head.appendChild(metaAuthor);
    
    // Robots
    const metaRobots = document.createElement('meta');
    metaRobots.name = 'robots';
    metaRobots.content = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
    document.head.appendChild(metaRobots);
    
    // Canonical URL
    const linkCanonical = document.createElement('link');
    linkCanonical.rel = 'canonical';
    linkCanonical.href = 'https://www.aila.family/';
    document.head.appendChild(linkCanonical);
    
    // Open Graph (Facebook, LinkedIn)
    const ogTags = [
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: 'https://www.aila.family/' },
      { property: 'og:title', content: 'AÏLA - Arbre Généalogique Collaboratif Gratuit' },
      { property: 'og:description', content: 'Créez, visualisez et partagez votre arbre généalogique familial gratuitement. Collaborez avec votre famille et préservez votre histoire.' },
      { property: 'og:site_name', content: 'AÏLA' },
      { property: 'og:locale', content: 'fr_FR' },
    ];
    ogTags.forEach(tag => {
      const meta = document.createElement('meta');
      meta.setAttribute('property', tag.property);
      meta.content = tag.content;
      document.head.appendChild(meta);
    });
    
    // Twitter Card
    const twitterTags = [
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:url', content: 'https://www.aila.family/' },
      { name: 'twitter:title', content: 'AÏLA - Arbre Généalogique Collaboratif' },
      { name: 'twitter:description', content: 'Créez votre arbre généalogique gratuitement et partagez-le avec votre famille.' },
    ];
    twitterTags.forEach(tag => {
      const meta = document.createElement('meta');
      meta.name = tag.name;
      meta.content = tag.content;
      document.head.appendChild(meta);
    });
    
    // Language
    document.documentElement.lang = 'fr';
    
    // Structured Data (JSON-LD) for Rich Snippets
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "AÏLA",
      "alternateName": "AÏLA Arbre Généalogique",
      "url": "https://www.aila.family",
      "description": "Application gratuite pour créer et partager votre arbre généalogique familial",
      "applicationCategory": "LifestyleApplication",
      "operatingSystem": "Web, iOS, Android",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "EUR",
        "description": "Version gratuite disponible"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "150"
      },
      "featureList": [
        "Création d'arbre généalogique",
        "Collaboration familiale",
        "Export GEDCOM",
        "Notifications d'anniversaires",
        "Interface en français"
      ]
    };
    
    const scriptLD = document.createElement('script');
    scriptLD.type = 'application/ld+json';
    scriptLD.innerHTML = JSON.stringify(structuredData);
    document.head.appendChild(scriptLD);
    
    // Organization Schema
    const orgData = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "AÏLA",
      "url": "https://www.aila.family",
      "description": "Application de généalogie collaborative"
    };
    
    const scriptOrg = document.createElement('script');
    scriptOrg.type = 'application/ld+json';
    scriptOrg.innerHTML = JSON.stringify(orgData);
    document.head.appendChild(scriptOrg);
    
    console.log('SEO initialized');
  }
};

// PWA initialization
const initPWA = () => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    // Add manifest link
    const manifestLink = document.createElement('link');
    manifestLink.rel = 'manifest';
    manifestLink.href = '/manifest.json';
    document.head.appendChild(manifestLink);
    
    // Add theme color
    const themeColor = document.createElement('meta');
    themeColor.name = 'theme-color';
    themeColor.content = '#D4AF37';
    document.head.appendChild(themeColor);
    
    // Add Apple touch icon
    const appleIcon = document.createElement('link');
    appleIcon.rel = 'apple-touch-icon';
    appleIcon.href = '/icons/icon.svg';
    document.head.appendChild(appleIcon);
    
    // Add Apple mobile web app meta tags
    const appleMeta1 = document.createElement('meta');
    appleMeta1.name = 'apple-mobile-web-app-capable';
    appleMeta1.content = 'yes';
    document.head.appendChild(appleMeta1);
    
    const appleMeta2 = document.createElement('meta');
    appleMeta2.name = 'apple-mobile-web-app-status-bar-style';
    appleMeta2.content = 'black-translucent';
    document.head.appendChild(appleMeta2);
    
    const appleMeta3 = document.createElement('meta');
    appleMeta3.name = 'apple-mobile-web-app-title';
    appleMeta3.content = 'AÏLA';
    document.head.appendChild(appleMeta3);
    
    // Register service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('AÏLA: Service Worker registered', registration.scope);
          })
          .catch((error) => {
            console.log('AÏLA: Service Worker registration failed', error);
          });
      });
    }
    
    console.log('PWA initialized');
  }
};

// Google Analytics initialization
const initGoogleAnalytics = () => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    // Add gtag script
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = 'https://www.googletagmanager.com/gtag/js?id=G-C2MS83P8ZW';
    document.head.appendChild(script1);

    // Add gtag config
    const script2 = document.createElement('script');
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-C2MS83P8ZW');
    `;
    document.head.appendChild(script2);
    
    console.log('Google Analytics initialized');
  }
};

// Google AdSense initialization for web ads
const initGoogleAdSense = () => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    // Check if script already exists
    const existingScript = document.querySelector('script[src*="pagead2.googlesyndication.com"]');
    if (existingScript) return;
    
    // Add AdSense script
    const adsenseScript = document.createElement('script');
    adsenseScript.async = true;
    adsenseScript.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8309745338282834';
    adsenseScript.crossOrigin = 'anonymous';
    document.head.appendChild(adsenseScript);
    
    console.log('Google AdSense initialized');
  }
};

export default function RootLayout() {
  useEffect(() => {
    initSEO();
    initPWA();
    initGoogleAnalytics();
    initGoogleAdSense();
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AdsProvider>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#0A1628' },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen 
              name="person/[id]" 
              options={{ 
                presentation: 'modal',
                animation: 'slide_from_bottom'
              }} 
            />
            <Stack.Screen 
              name="add-person" 
              options={{ 
                presentation: 'modal',
                animation: 'slide_from_bottom'
              }} 
            />
            <Stack.Screen 
              name="add-link" 
              options={{ 
                presentation: 'modal',
                animation: 'slide_from_bottom'
              }} 
            />
          </Stack>
        </AdsProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
