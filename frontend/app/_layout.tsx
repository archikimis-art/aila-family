import React, { useEffect } from 'react';
import { Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@/context/AuthContext';
import { AdsProvider } from '@/context/AdsContext';
import { ConversionProvider } from '@/context/ConversionContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import { initializeAds, onPageChange } from '@/services/AdMobInterstitial';

// SEO Meta Tags and Structured Data - Optimisé pour Google & IA
const initSEO = () => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    // Éviter les doublons
    if (document.querySelector('meta[name="seo-initialized"]')) return;
    const seoMark = document.createElement('meta');
    seoMark.name = 'seo-initialized';
    seoMark.content = 'true';
    document.head.appendChild(seoMark);

    // Title optimisé - AILA FAMILLE en premier
    document.title = 'AILA Famille - Arbre Généalogique Gratuit | AÏLA Family App';
    
    // Meta Description optimisée avec AILA FAMILLE
    const metaDesc = document.createElement('meta');
    metaDesc.name = 'description';
    metaDesc.content = 'AILA Famille : créez votre arbre généalogique gratuitement. AÏLA est l\'application famille pour visualiser et partager votre histoire familiale. Rejoignez la communauté AILA !';
    document.head.appendChild(metaDesc);
    
    // Google AdSense Verification
    const metaAdsense = document.createElement('meta');
    metaAdsense.name = 'google-adsense-account';
    metaAdsense.content = 'ca-pub-8309745338282834';
    document.head.appendChild(metaAdsense);
    
    // Google Site Verification
    const metaGoogleVerify = document.createElement('meta');
    metaGoogleVerify.name = 'google-site-verification';
    metaGoogleVerify.content = 'google672554d9d4721846';
    document.head.appendChild(metaGoogleVerify);
    
    // Keywords optimisés - AILA FAMILLE en priorité
    const metaKeywords = document.createElement('meta');
    metaKeywords.name = 'keywords';
    metaKeywords.content = 'AILA famille, AILA family, aila.family, AÏLA famille, arbre généalogique AILA, application AILA, généalogie AILA, arbre familial AILA, AILA généalogie gratuit, créer arbre AILA, AILA arbre famille';
    document.head.appendChild(metaKeywords);
    
    // Author
    const metaAuthor = document.createElement('meta');
    metaAuthor.name = 'author';
    metaAuthor.content = 'AÏLA';
    document.head.appendChild(metaAuthor);
    
    // Robots - Optimisé pour visibilité maximale
    const metaRobots = document.createElement('meta');
    metaRobots.name = 'robots';
    metaRobots.content = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
    document.head.appendChild(metaRobots);
    
    // Googlebot spécifique
    const metaGooglebot = document.createElement('meta');
    metaGooglebot.name = 'googlebot';
    metaGooglebot.content = 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1';
    document.head.appendChild(metaGooglebot);
    
    // Bingbot spécifique
    const metaBingbot = document.createElement('meta');
    metaBingbot.name = 'bingbot';
    metaBingbot.content = 'index, follow';
    document.head.appendChild(metaBingbot);
    
    // Canonical URL dynamique
    const linkCanonical = document.createElement('link');
    linkCanonical.rel = 'canonical';
    linkCanonical.href = window.location.href.split('?')[0].replace(/\/$/, '') || 'https://www.aila.family';
    document.head.appendChild(linkCanonical);
    
    // Alternate hreflang pour SEO international
    const linkHreflang = document.createElement('link');
    linkHreflang.rel = 'alternate';
    linkHreflang.hreflang = 'fr';
    linkHreflang.href = 'https://www.aila.family/';
    document.head.appendChild(linkHreflang);
    
    // Open Graph optimisé - AILA FAMILLE
    const ogTags = [
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: 'https://www.aila.family/' },
      { property: 'og:title', content: 'AILA Famille - Arbre Généalogique Gratuit' },
      { property: 'og:description', content: 'AILA Famille : créez et partagez votre arbre généalogique gratuitement. Application famille collaborative.' },
      { property: 'og:site_name', content: 'AILA Famille' },
      { property: 'og:locale', content: 'fr_FR' },
      { property: 'og:image', content: 'https://www.aila.family/icons/icon.svg' },
      { property: 'og:image:alt', content: 'AILA Famille - Arbre Généalogique' },
    ];
    ogTags.forEach(tag => {
      const meta = document.createElement('meta');
      meta.setAttribute('property', tag.property);
      meta.content = tag.content;
      document.head.appendChild(meta);
    });
    
    // Twitter Card optimisé - AILA FAMILLE
    const twitterTags = [
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:site', content: '@aila_family' },
      { name: 'twitter:title', content: 'AILA Famille - Arbre Généalogique' },
      { name: 'twitter:description', content: 'AILA Famille : créez votre arbre généalogique gratuitement et partagez-le avec votre famille.' },
      { name: 'twitter:image', content: 'https://www.aila.family/icons/icon.svg' },
    ];
    twitterTags.forEach(tag => {
      const meta = document.createElement('meta');
      meta.name = tag.name;
      meta.content = tag.content;
      document.head.appendChild(meta);
    });
    
    // Language
    document.documentElement.lang = 'fr';
    
    // ========================================
    // STRUCTURED DATA (JSON-LD) - AILA FAMILLE
    // ========================================
    
    // 1. WebSite Schema avec SearchAction - AILA FAMILLE
    const websiteSchema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "AILA Famille",
      "alternateName": ["AILA FAMILLE", "AÏLA Famille", "Aila Family", "AILA", "aila.family"],
      "url": "https://www.aila.family",
      "description": "AILA Famille - Application gratuite pour créer et partager votre arbre généalogique familial",
      "inLanguage": "fr-FR",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://www.aila.family/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    };
    const scriptWebsite = document.createElement('script');
    scriptWebsite.type = 'application/ld+json';
    scriptWebsite.innerHTML = JSON.stringify(websiteSchema);
    document.head.appendChild(scriptWebsite);
    
    // 2. SoftwareApplication Schema
    const appSchema = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "AÏLA - Arbre Généalogique",
      "applicationCategory": "LifestyleApplication",
      "applicationSubCategory": "Généalogie",
      "operatingSystem": "Web, iOS, Android",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "EUR",
        "availability": "https://schema.org/InStock"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "150",
        "bestRating": "5",
        "worstRating": "1"
      },
      "featureList": [
        "Création d'arbre généalogique illimitée",
        "Collaboration familiale en temps réel",
        "Export au format GEDCOM",
        "Rappels d'anniversaires automatiques",
        "Interface 100% en français",
        "Fonctionne sur mobile et ordinateur"
      ],
      "screenshot": "https://www.aila.family/screenshots/tree-view.png",
      "softwareVersion": "1.0.0"
    };
    const scriptApp = document.createElement('script');
    scriptApp.type = 'application/ld+json';
    scriptApp.innerHTML = JSON.stringify(appSchema);
    document.head.appendChild(scriptApp);
    
    // 3. Organization Schema amélioré
    const orgSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "AÏLA",
      "legalName": "AÏLA - Arbre Généalogique Familial",
      "url": "https://www.aila.family",
      "logo": "https://www.aila.family/icons/icon.svg",
      "description": "Application de généalogie collaborative gratuite",
      "foundingDate": "2024",
      "sameAs": [
        "https://www.facebook.com/aila.family",
        "https://twitter.com/aila_family"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer support",
        "availableLanguage": "French"
      }
    };
    const scriptOrg = document.createElement('script');
    scriptOrg.type = 'application/ld+json';
    scriptOrg.innerHTML = JSON.stringify(orgSchema);
    document.head.appendChild(scriptOrg);
    
    // 4. FAQ Schema pour Featured Snippets
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Comment créer un arbre généalogique gratuitement ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Avec AÏLA, créez votre arbre généalogique gratuitement en 3 étapes : 1) Inscrivez-vous sur aila.family, 2) Ajoutez vos premiers membres de famille, 3) Connectez-les par leurs liens familiaux. L'application est 100% gratuite et fonctionne sur mobile et ordinateur."
          }
        },
        {
          "@type": "Question",
          "name": "Qu'est-ce qu'un arbre généalogique ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Un arbre généalogique est une représentation visuelle de votre famille sur plusieurs générations. Il montre les liens entre parents, enfants, grands-parents et ancêtres. AÏLA vous permet de créer et visualiser votre arbre facilement."
          }
        },
        {
          "@type": "Question",
          "name": "AÏLA est-il vraiment gratuit ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Oui, AÏLA propose une version gratuite complète permettant de créer votre arbre généalogique, ajouter des membres illimités et collaborer avec votre famille. Une version Premium existe pour des fonctionnalités avancées."
          }
        },
        {
          "@type": "Question",
          "name": "Puis-je partager mon arbre généalogique avec ma famille ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Absolument ! AÏLA est conçu pour la collaboration familiale. Vous pouvez inviter vos proches à consulter et enrichir l'arbre ensemble. Chaque membre peut ajouter des informations, photos et souvenirs."
          }
        },
        {
          "@type": "Question",
          "name": "Comment exporter mon arbre généalogique ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "AÏLA permet d'exporter votre arbre au format GEDCOM, le standard universel de la généalogie. Vous pouvez ainsi sauvegarder vos données ou les importer dans d'autres logiciels de généalogie."
          }
        }
      ]
    };
    const scriptFaq = document.createElement('script');
    scriptFaq.type = 'application/ld+json';
    scriptFaq.innerHTML = JSON.stringify(faqSchema);
    document.head.appendChild(scriptFaq);
    
    // 5. BreadcrumbList pour navigation
    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Accueil",
          "item": "https://www.aila.family/"
        }
      ]
    };
    const scriptBreadcrumb = document.createElement('script');
    scriptBreadcrumb.type = 'application/ld+json';
    scriptBreadcrumb.innerHTML = JSON.stringify(breadcrumbSchema);
    document.head.appendChild(scriptBreadcrumb);
    
    console.log('SEO optimisé initialisé');
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
  const pathname = usePathname();

  useEffect(() => {
    initSEO();
    initPWA();
    initGoogleAnalytics();
    initGoogleAdSense();
    
    // Initialize AdMob for native apps
    if (Platform.OS !== 'web') {
      initializeAds();
    }
  }, []);

  // Track page changes for interstitial ads
  useEffect(() => {
    if (Platform.OS !== 'web' && pathname) {
      onPageChange(pathname);
    }
  }, [pathname]);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AdsProvider>
          <ConversionProvider>
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
          </ConversionProvider>
        </AdsProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
