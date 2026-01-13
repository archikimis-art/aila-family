#!/usr/bin/env node

/**
 * Post-build script to inject SEO content into Expo-generated index.html
 * This ensures crawlers (Google, ChatGPT, etc.) see content without JavaScript
 */

const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, '..', 'dist');
const indexPath = path.join(distPath, 'index.html');

// SEO content to inject (visible to crawlers, hidden when JS loads)
const seoContent = `
<!-- SEO Meta Tags -->
<title>AILA Famille - Arbre Généalogique Gratuit en Ligne | AÏLA Family App</title>
<meta name="description" content="AILA Famille : créez votre arbre généalogique gratuitement en ligne. Application collaborative pour visualiser, partager et préserver votre histoire familiale. Rejoignez la communauté AILA !" />
<meta name="keywords" content="AILA famille, AILA family, aila.family, AÏLA famille, arbre généalogique AILA, application AILA, généalogie AILA, arbre familial AILA, AILA généalogie gratuit, créer arbre AILA, arbre généalogique gratuit, généalogie en ligne" />
<meta name="author" content="AILA Famille" />
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
<meta name="googlebot" content="index, follow" />
<link rel="canonical" href="https://www.aila.family/" />

<!-- Google AdSense & Verification -->
<meta name="google-adsense-account" content="ca-pub-8309745338282834" />
<meta name="google-site-verification" content="google672554d9d4721846" />

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website" />
<meta property="og:url" content="https://www.aila.family/" />
<meta property="og:title" content="AILA Famille - Arbre Généalogique Gratuit" />
<meta property="og:description" content="AILA Famille : créez et partagez votre arbre généalogique gratuitement. Application famille collaborative." />
<meta property="og:site_name" content="AILA Famille" />
<meta property="og:locale" content="fr_FR" />
<meta property="og:image" content="https://www.aila.family/og-image.svg" />

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="@aila_family" />
<meta name="twitter:title" content="AILA Famille - Arbre Généalogique Gratuit" />
<meta name="twitter:description" content="AILA Famille : créez votre arbre généalogique gratuitement et partagez-le avec votre famille." />
<meta name="twitter:image" content="https://www.aila.family/og-image.svg" />

<!-- Structured Data -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "AILA Famille",
  "alternateName": ["AILA FAMILLE", "AÏLA Famille", "Aila Family", "AILA", "aila.family", "AÏLA"],
  "url": "https://www.aila.family",
  "description": "AILA Famille - Application gratuite pour créer et partager votre arbre généalogique familial",
  "inLanguage": "fr-FR"
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "AILA Famille",
  "alternateName": "AÏLA",
  "applicationCategory": "LifestyleApplication",
  "operatingSystem": "Web, iOS, Android",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "EUR"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "150"
  }
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Qu'est-ce que AILA Famille ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "AILA Famille (AÏLA) est une application gratuite pour créer, visualiser et partager votre arbre généalogique familial."
      }
    },
    {
      "@type": "Question",
      "name": "AILA Famille est-il gratuit ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Oui, AILA Famille propose une version gratuite complète permettant de créer votre arbre généalogique."
      }
    }
  ]
}
</script>

<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-C2MS83P8ZW"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-C2MS83P8ZW');</script>

<!-- Google AdSense -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8309745338282834" crossorigin="anonymous"></script>

<!-- PWA -->
<link rel="icon" href="/icons/icon.svg" type="image/svg+xml" />
<link rel="apple-touch-icon" href="/icons/icon.svg" />
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#D4AF37" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-title" content="AILA Famille" />

<style>
  .seo-fallback {
    background: #0A1628;
    color: #fff;
    padding: 40px 20px;
    max-width: 800px;
    margin: 0 auto;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
  .seo-fallback h1 { color: #D4AF37; font-size: 2em; margin-bottom: 10px; }
  .seo-fallback h2 { font-size: 1.2em; font-weight: normal; color: #8BA1B7; margin-bottom: 30px; }
  .seo-fallback p { color: #B8C5D6; line-height: 1.8; margin-bottom: 20px; }
  .seo-fallback ul { color: #B8C5D6; line-height: 2; padding-left: 20px; }
  .seo-fallback a { color: #D4AF37; }
  .seo-fallback .cta { background: #D4AF37; color: #0A1628; padding: 15px 30px; border-radius: 10px; text-decoration: none; font-weight: bold; display: inline-block; margin: 10px 5px; }
  .seo-fallback .cta-outline { border: 2px solid #D4AF37; background: transparent; color: #D4AF37; }
  .seo-fallback footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #2A3F5A; font-size: 0.9em; color: #6B7C93; }
</style>
`;

const noscriptContent = `
<noscript>
  <div class="seo-fallback">
    <h1>🌳 AILA Famille</h1>
    <h2>L'arbre généalogique qui connecte votre famille</h2>
    
    <p>
      <strong>AILA Famille</strong> (AÏLA) est une application gratuite pour créer, visualiser et partager votre arbre généalogique familial. 
      Rejoignez des milliers de familles qui utilisent AILA pour préserver leur histoire.
    </p>
    
    <h3 style="color: #D4AF37;">✨ Fonctionnalités AILA Famille</h3>
    <ul>
      <li>📊 <strong>Créez votre arbre généalogique</strong> - Ajoutez facilement vos ancêtres et descendants</li>
      <li>👨‍👩‍👧‍👦 <strong>Collaborez en famille</strong> - Invitez vos proches à enrichir l'arbre ensemble</li>
      <li>📅 <strong>Rappels d'anniversaires</strong> - Ne manquez plus aucune date importante</li>
      <li>💬 <strong>Discutez en famille</strong> - Partagez des souvenirs et des histoires</li>
      <li>📤 <strong>Export GEDCOM</strong> - Compatible avec les autres logiciels de généalogie</li>
      <li>🔒 <strong>Données sécurisées</strong> - Vos informations sont protégées</li>
    </ul>
    
    <h3 style="color: #D4AF37;">🚀 Commencez gratuitement</h3>
    <p>
      Créez votre compte AILA Famille gratuitement et commencez à construire votre arbre généalogique dès aujourd'hui.
    </p>
    <p>
      <a href="/(auth)/register" class="cta">Créer un compte gratuit</a>
      <a href="/(auth)/login" class="cta cta-outline">Se connecter</a>
    </p>
    
    <h3 style="color: #D4AF37;">❓ Questions fréquentes sur AILA Famille</h3>
    
    <p><strong>Qu'est-ce que AILA Famille ?</strong><br>
    AILA Famille (aussi appelé AÏLA) est une application web et mobile gratuite pour créer et gérer votre arbre généalogique familial.</p>
    
    <p><strong>AILA Famille est-il vraiment gratuit ?</strong><br>
    Oui ! AILA Famille offre une version gratuite complète. Une version Premium existe pour des fonctionnalités avancées.</p>
    
    <p><strong>Comment accéder à AILA Famille ?</strong><br>
    Rendez-vous sur <a href="https://www.aila.family">www.aila.family</a> et créez votre compte en quelques secondes.</p>
    
    <footer>
      © 2024 AILA Famille - Application de généalogie collaborative<br>
      <a href="/about">À propos</a> • <a href="/blog">Blog</a> • <a href="/faq">FAQ</a> • <a href="/privacy">Confidentialité</a> • <a href="/terms">CGU</a>
    </footer>
  </div>
</noscript>
`;

function injectSEO() {
  console.log('🔧 Injecting SEO content into index.html...');

  if (!fs.existsSync(indexPath)) {
    console.error('❌ index.html not found at:', indexPath);
    process.exit(1);
  }

  let html = fs.readFileSync(indexPath, 'utf8');

  // Change lang attribute to French
  html = html.replace('lang="en"', 'lang="fr"');

  // Inject SEO meta tags in <head>
  html = html.replace('</head>', seoContent + '</head>');

  // Inject noscript content after <body>
  html = html.replace('<body>', '<body>' + noscriptContent);

  // Write back
  fs.writeFileSync(indexPath, html, 'utf8');

  console.log('✅ SEO content injected successfully!');
  console.log('   - Meta tags added to <head>');
  console.log('   - Noscript fallback content added to <body>');
}

// Run for all HTML files in dist
function injectSEOToAllPages() {
  const files = fs.readdirSync(distPath);
  
  files.forEach(file => {
    if (file.endsWith('.html')) {
      const filePath = path.join(distPath, file);
      let html = fs.readFileSync(filePath, 'utf8');
      
      // Only inject if not already injected
      if (!html.includes('google-adsense-account')) {
        html = html.replace('lang="en"', 'lang="fr"');
        html = html.replace('</head>', seoContent + '</head>');
        fs.writeFileSync(filePath, html, 'utf8');
        console.log(`  ✅ Injected SEO into ${file}`);
      }
    }
  });
}

// Main
injectSEO();
injectSEOToAllPages();
console.log('🎉 SEO injection complete!');
// SEO fix 1768281566
