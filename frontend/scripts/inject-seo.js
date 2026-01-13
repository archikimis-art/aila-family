#!/usr/bin/env node

/**
 * CRITICAL SEO INJECTION SCRIPT
 * 
 * This script injects SEO content into Expo-generated HTML files.
 * Without this, crawlers (Google, ChatGPT, etc.) see an empty page.
 * 
 * Run after: npx expo export -p web
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 SEO Injection Script Starting...');
console.log('   Working directory:', process.cwd());

const distPath = path.join(process.cwd(), 'dist');
console.log('   Looking for dist at:', distPath);

if (!fs.existsSync(distPath)) {
  console.error('❌ ERROR: dist folder not found!');
  console.log('   Make sure to run: npx expo export -p web');
  process.exit(1);
}

// SEO Meta Tags to inject in <head>
const seoMetaTags = `
<!-- ==================== AILA FAMILLE SEO ==================== -->
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

<!-- Structured Data - Website -->
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

<!-- Structured Data - Software Application -->
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

<!-- Google Analytics (deferred) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-C2MS83P8ZW"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-C2MS83P8ZW');</script>

<!-- PWA -->
<link rel="icon" href="/icons/icon.svg" type="image/svg+xml" />
<link rel="apple-touch-icon" href="/icons/icon.svg" />
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#D4AF37" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-title" content="AILA Famille" />
<!-- ==================== END AILA SEO ==================== -->
`;

// Noscript fallback content for crawlers
const noscriptContent = `
<noscript>
<style>
  .seo-fallback {
    background: linear-gradient(135deg, #0A1628 0%, #1A2F4A 50%, #0A1628 100%);
    color: #fff;
    padding: 40px 20px;
    min-height: 100vh;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  }
  .seo-container {
    max-width: 800px;
    margin: 0 auto;
  }
  .seo-fallback h1 { 
    color: #D4AF37; 
    font-size: 2.5em; 
    margin-bottom: 10px; 
    text-align: center;
  }
  .seo-fallback h2 { 
    font-size: 1.3em; 
    font-weight: normal; 
    color: #8BA1B7; 
    margin-bottom: 30px; 
    text-align: center;
  }
  .seo-fallback h3 {
    color: #D4AF37;
    margin-top: 30px;
    margin-bottom: 15px;
  }
  .seo-fallback p { 
    color: #B8C5D6; 
    line-height: 1.8; 
    margin-bottom: 20px; 
  }
  .seo-fallback ul { 
    color: #B8C5D6; 
    line-height: 2; 
    padding-left: 20px;
    margin-bottom: 20px;
  }
  .seo-fallback a { 
    color: #D4AF37; 
    text-decoration: none;
  }
  .seo-fallback a:hover {
    text-decoration: underline;
  }
  .cta-container {
    text-align: center;
    margin: 30px 0;
  }
  .seo-fallback .cta { 
    background: linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%);
    color: #0A1628; 
    padding: 15px 30px; 
    border-radius: 25px; 
    text-decoration: none; 
    font-weight: bold; 
    display: inline-block; 
    margin: 10px 5px;
    box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
  }
  .seo-fallback .cta-outline { 
    border: 2px solid #D4AF37; 
    background: transparent; 
    color: #D4AF37;
    box-shadow: none;
  }
  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin: 30px 0;
  }
  .feature-card {
    background: rgba(212, 175, 55, 0.1);
    border: 1px solid rgba(212, 175, 55, 0.2);
    border-radius: 12px;
    padding: 20px;
  }
  .feature-card h4 {
    color: #D4AF37;
    margin-bottom: 10px;
  }
  .seo-fallback footer { 
    margin-top: 50px; 
    padding-top: 20px; 
    border-top: 1px solid #2A3F5A; 
    font-size: 0.9em; 
    color: #6B7C93;
    text-align: center;
  }
  .footer-links {
    margin-bottom: 15px;
  }
  .footer-links a {
    margin: 0 10px;
  }
</style>
<div class="seo-fallback">
  <div class="seo-container">
    <h1>🌳 AILA Famille</h1>
    <h2>L'arbre généalogique qui connecte votre famille</h2>
    
    <p>
      <strong>AILA Famille</strong> (aussi appelé <strong>AÏLA</strong>) est l'application gratuite de référence pour créer, 
      visualiser et partager votre arbre généalogique familial. Rejoignez des milliers de familles qui utilisent 
      AILA pour préserver et transmettre leur histoire.
    </p>
    
    <div class="cta-container">
      <a href="/(auth)/register" class="cta">✨ Créer mon arbre gratuit</a>
      <a href="/(auth)/login" class="cta cta-outline">Se connecter</a>
    </div>

    <h3>✨ Pourquoi choisir AILA Famille ?</h3>
    
    <div class="features-grid">
      <div class="feature-card">
        <h4>📊 Arbre généalogique visuel</h4>
        <p>Créez et visualisez votre arbre familial de manière intuitive avec notre interface moderne.</p>
      </div>
      <div class="feature-card">
        <h4>👨‍👩‍👧‍👦 Collaboration familiale</h4>
        <p>Invitez vos proches à enrichir l'arbre ensemble et partagez vos découvertes.</p>
      </div>
      <div class="feature-card">
        <h4>📅 Rappels d'anniversaires</h4>
        <p>Ne manquez plus jamais une date importante avec les notifications automatiques.</p>
      </div>
      <div class="feature-card">
        <h4>💬 Discussion en famille</h4>
        <p>Partagez des souvenirs, des histoires et des photos avec tous vos proches.</p>
      </div>
      <div class="feature-card">
        <h4>📤 Export GEDCOM</h4>
        <p>Exportez vos données au format standard pour compatibilité avec d'autres logiciels.</p>
      </div>
      <div class="feature-card">
        <h4>🔒 Données sécurisées</h4>
        <p>Vos informations familiales sont protégées et restent privées.</p>
      </div>
    </div>

    <h3>❓ Questions fréquentes sur AILA Famille</h3>
    
    <p><strong>Qu'est-ce que AILA Famille ?</strong><br>
    AILA Famille (également connu sous le nom AÏLA) est une application web et mobile gratuite permettant de créer 
    et gérer votre arbre généalogique familial de manière collaborative.</p>
    
    <p><strong>AILA Famille est-il vraiment gratuit ?</strong><br>
    Oui ! AILA Famille offre une version gratuite complète avec toutes les fonctionnalités essentielles. 
    Une version Premium existe pour des fonctionnalités avancées.</p>
    
    <p><strong>Comment commencer avec AILA Famille ?</strong><br>
    C'est simple : créez un compte gratuit sur <a href="https://www.aila.family">www.aila.family</a>, 
    puis commencez à ajouter les membres de votre famille pour construire votre arbre.</p>
    
    <p><strong>Puis-je utiliser AILA Famille sur mobile ?</strong><br>
    Oui, AILA Famille est disponible sur web, iOS et Android. Votre arbre est synchronisé sur tous vos appareils.</p>
    
    <p><strong>Mes données sont-elles sécurisées ?</strong><br>
    Absolument. AILA Famille utilise des protocoles de sécurité modernes pour protéger vos informations familiales.</p>

    <footer>
      <div class="footer-links">
        <a href="/about">À propos</a>
        <a href="/blog">Blog</a>
        <a href="/faq">FAQ</a>
        <a href="/privacy">Confidentialité</a>
        <a href="/terms">CGU</a>
      </div>
      <p>© 2024 AILA Famille - Application de généalogie collaborative</p>
      <p>Visitez <a href="https://www.aila.family">www.aila.family</a> pour créer votre arbre généalogique gratuit.</p>
    </footer>
  </div>
</div>
</noscript>
`;

function injectIntoHTML(filePath) {
  try {
    let html = fs.readFileSync(filePath, 'utf8');
    
    // Skip if already injected
    if (html.includes('AILA FAMILLE SEO')) {
      console.log(`   ⏭️  Skipping ${path.basename(filePath)} (already injected)`);
      return false;
    }
    
    // Change lang to French
    html = html.replace(/lang="en"/g, 'lang="fr"');
    
    // Remove empty title if present
    html = html.replace(/<title[^>]*><\/title>/g, '');
    
    // Inject SEO meta tags before </head>
    html = html.replace('</head>', seoMetaTags + '</head>');
    
    // Inject noscript content after <body> (or after first <body...>)
    html = html.replace(/<body([^>]*)>/, '<body$1>' + noscriptContent);
    
    fs.writeFileSync(filePath, html, 'utf8');
    return true;
  } catch (error) {
    console.error(`   ❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function processAllHTMLFiles(dir) {
  let processed = 0;
  let skipped = 0;
  
  function walkDir(currentDir) {
    const files = fs.readdirSync(currentDir);
    
    for (const file of files) {
      const filePath = path.join(currentDir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        walkDir(filePath);
      } else if (file.endsWith('.html')) {
        if (injectIntoHTML(filePath)) {
          console.log(`   ✅ Injected SEO into ${path.relative(distPath, filePath)}`);
          processed++;
        } else {
          skipped++;
        }
      }
    }
  }
  
  walkDir(dir);
  return { processed, skipped };
}

// Main execution
console.log('📁 Processing HTML files in dist/...');
const result = processAllHTMLFiles(distPath);

console.log('');
console.log('🎉 SEO Injection Complete!');
console.log(`   ✅ Files processed: ${result.processed}`);
console.log(`   ⏭️  Files skipped: ${result.skipped}`);
console.log('');
console.log('📋 Injected content:');
console.log('   - Meta tags: title, description, keywords, robots');
console.log('   - Open Graph tags for social sharing');
console.log('   - Twitter Card tags');
console.log('   - Structured Data (JSON-LD)');
console.log('   - Noscript fallback content for crawlers');
console.log('   - Google Analytics');
console.log('   - PWA meta tags');
// SEO Fix 1768284719
