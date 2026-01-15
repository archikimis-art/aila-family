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

// Static HTML pages for legal pages (crawlers can read these)
const staticPages = {
  'privacy': {
    title: 'Politique de Confidentialité - AILA Famille | Protection des Données RGPD',
    description: 'Politique de confidentialité AILA Famille. Découvrez comment nous protégeons vos données personnelles et généalogiques conformément au RGPD.',
    h1: 'Politique de Confidentialité AILA Famille',
    content: `
      <article>
        <p><em>Dernière mise à jour : Janvier 2025</em></p>
        
        <h2>1. Introduction</h2>
        <p>Bienvenue sur AÏLA Famille ("nous", "notre", "nos"). Nous nous engageons à protéger votre vie privée et vos données personnelles. Cette politique de confidentialité explique comment nous collectons, utilisons, stockons et protégeons vos informations lorsque vous utilisez notre application de gestion d'arbre généalogique.</p>
        
        <h2>2. Responsable du Traitement</h2>
        <p><strong>AILA Famille</strong><br>
        Site web : <a href="https://www.aila.family">www.aila.family</a><br>
        Email : contact@aila.family</p>
        
        <h2>3. Données Collectées</h2>
        <h3>Données de compte :</h3>
        <ul>
          <li>Nom et prénom</li>
          <li>Adresse email</li>
          <li>Mot de passe (crypté avec bcrypt)</li>
        </ul>
        <h3>Données généalogiques :</h3>
        <ul>
          <li>Informations sur les membres de la famille (noms, dates de naissance, lieux)</li>
          <li>Relations familiales</li>
          <li>Photos de famille (optionnel)</li>
        </ul>
        <h3>Données d'utilisation :</h3>
        <ul>
          <li>Statistiques d'utilisation de l'application</li>
          <li>Préférences et paramètres</li>
        </ul>
        
        <h2>4. Finalités du Traitement</h2>
        <p>Vos données sont utilisées pour :</p>
        <ul>
          <li>Créer et gérer votre compte utilisateur</li>
          <li>Construire et afficher votre arbre généalogique</li>
          <li>Vous envoyer des notifications importantes (anniversaires, événements)</li>
          <li>Améliorer nos services et votre expérience utilisateur</li>
          <li>Assurer la sécurité de votre compte</li>
        </ul>
        
        <h2>5. Base Juridique (RGPD)</h2>
        <p>Le traitement de vos données repose sur :</p>
        <ul>
          <li><strong>Exécution du contrat :</strong> Pour fournir nos services</li>
          <li><strong>Consentement :</strong> Pour les communications marketing</li>
          <li><strong>Intérêt légitime :</strong> Pour améliorer nos services</li>
        </ul>
        
        <h2>6. Stockage et Sécurité</h2>
        <p>Vos données sont stockées de manière sécurisée :</p>
        <ul>
          <li>Serveurs sécurisés avec cryptage SSL/TLS</li>
          <li>Mots de passe hashés avec bcrypt</li>
          <li>Accès restreint aux données personnelles</li>
          <li>Sauvegardes régulières et sécurisées</li>
          <li>Hébergement : MongoDB Atlas (certifié SOC 2, GDPR compliant)</li>
        </ul>
        
        <h2>7. Partage des Données</h2>
        <p><strong>Nous ne vendons jamais vos données personnelles.</strong></p>
        <p>Vos données peuvent être partagées uniquement :</p>
        <ul>
          <li>Avec les membres de votre famille que vous avez explicitement invités</li>
          <li>Avec nos prestataires techniques sous contrat de confidentialité</li>
          <li>Si requis par la loi ou une autorité judiciaire</li>
        </ul>
        
        <h2>8. Vos Droits (RGPD)</h2>
        <p>Conformément au RGPD, vous disposez des droits suivants :</p>
        <ul>
          <li><strong>Droit d'accès :</strong> Obtenir une copie de vos données</li>
          <li><strong>Droit de rectification :</strong> Corriger vos données inexactes</li>
          <li><strong>Droit à l'effacement :</strong> Supprimer votre compte et vos données</li>
          <li><strong>Droit à la portabilité :</strong> Exporter vos données (format JSON/GEDCOM)</li>
          <li><strong>Droit d'opposition :</strong> Vous opposer au traitement de vos données</li>
          <li><strong>Droit de retirer votre consentement</strong> à tout moment</li>
        </ul>
        <p>Pour exercer ces droits : <a href="mailto:privacy@aila.family">privacy@aila.family</a></p>
        
        <h2>9. Cookies</h2>
        <p>Notre application utilise :</p>
        <ul>
          <li><strong>Cookies techniques :</strong> Nécessaires au fonctionnement (session, authentification)</li>
          <li><strong>Google Analytics :</strong> Pour comprendre l'utilisation de notre service</li>
          <li><strong>Google AdSense :</strong> Pour afficher des publicités (désactivable avec Premium)</li>
        </ul>
        
        <h2>10. Conservation des Données</h2>
        <p>Vos données sont conservées tant que votre compte est actif. En cas de suppression de compte, vos données sont définitivement effacées dans un délai de 30 jours, sauf obligation légale de conservation.</p>
        
        <h2>11. Transferts Internationaux</h2>
        <p>Vos données peuvent être traitées par des sous-traitants situés hors de l'UE (ex: MongoDB Atlas - USA). Ces transferts sont encadrés par des clauses contractuelles types approuvées par la Commission européenne.</p>
        
        <h2>12. Contact et Réclamations</h2>
        <p>Pour toute question : <a href="mailto:privacy@aila.family">privacy@aila.family</a></p>
        <p>En cas de litige, vous pouvez déposer une réclamation auprès de la CNIL : <a href="https://www.cnil.fr" target="_blank">www.cnil.fr</a></p>
      </article>
    `
  },
  'terms': {
    title: 'Conditions Générales d\'Utilisation - AILA Famille | CGU',
    description: 'Conditions générales d\'utilisation de AILA Famille. Règles d\'utilisation de l\'application d\'arbre généalogique.',
    h1: 'Conditions Générales d\'Utilisation AILA Famille',
    content: `
      <article>
        <p><em>Dernière mise à jour : Janvier 2025</em></p>
        
        <h2>1. Objet</h2>
        <p>Les présentes Conditions Générales d'Utilisation (CGU) régissent l'utilisation de l'application AILA Famille, accessible sur <a href="https://www.aila.family">www.aila.family</a> et via les applications mobiles iOS et Android.</p>
        
        <h2>2. Acceptation des CGU</h2>
        <p>En créant un compte sur AILA Famille, vous acceptez sans réserve les présentes CGU. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.</p>
        
        <h2>3. Description du Service</h2>
        <p>AILA Famille propose :</p>
        <ul>
          <li>Création et gestion d'arbres généalogiques</li>
          <li>Partage et collaboration familiale</li>
          <li>Rappels d'anniversaires et événements</li>
          <li>Export de données (JSON, GEDCOM)</li>
          <li>Discussion en famille</li>
        </ul>
        
        <h2>4. Inscription</h2>
        <p>Pour utiliser AILA Famille, vous devez :</p>
        <ul>
          <li>Avoir au moins 16 ans</li>
          <li>Fournir des informations exactes</li>
          <li>Maintenir la confidentialité de votre mot de passe</li>
        </ul>
        
        <h2>5. Utilisation du Service</h2>
        <p>Vous vous engagez à :</p>
        <ul>
          <li>Ne pas publier de contenu illégal ou offensant</li>
          <li>Respecter la vie privée des autres utilisateurs</li>
          <li>Ne pas utiliser le service à des fins commerciales non autorisées</li>
          <li>Ne pas tenter de pirater ou perturber le service</li>
        </ul>
        
        <h2>6. Propriété Intellectuelle</h2>
        <p>L'application AILA Famille, son design, son code et son contenu sont protégés par le droit d'auteur. Vos données généalogiques restent votre propriété.</p>
        
        <h2>7. Abonnement Premium</h2>
        <p>L'offre Premium offre des fonctionnalités supplémentaires moyennant un abonnement payant. Les conditions de paiement et de résiliation sont précisées lors de la souscription.</p>
        
        <h2>8. Responsabilité</h2>
        <p>AILA Famille s'efforce de maintenir le service disponible et sécurisé, mais ne peut garantir une disponibilité continue. Nous ne sommes pas responsables des dommages indirects liés à l'utilisation du service.</p>
        
        <h2>9. Modification des CGU</h2>
        <p>Nous nous réservons le droit de modifier ces CGU. Les utilisateurs seront informés des changements significatifs par email ou notification dans l'application.</p>
        
        <h2>10. Résiliation</h2>
        <p>Vous pouvez supprimer votre compte à tout moment depuis les paramètres de l'application. Nous nous réservons le droit de suspendre ou supprimer un compte en cas de violation des CGU.</p>
        
        <h2>11. Droit Applicable</h2>
        <p>Les présentes CGU sont régies par le droit français. Tout litige sera soumis aux tribunaux compétents de Paris, France.</p>
        
        <h2>12. Contact</h2>
        <p>Pour toute question : <a href="mailto:contact@aila.family">contact@aila.family</a></p>
      </article>
    `
  },
  'about': {
    title: 'À Propos de AILA Famille - Notre Histoire et Mission | Généalogie',
    description: 'Découvrez AILA Famille, l\'application gratuite de généalogie. Notre mission : aider les familles à créer, partager et préserver leur histoire familiale.',
    h1: 'À Propos de AILA Famille',
    content: `
      <article>
        <h2>Notre Mission</h2>
        <p><strong>AILA Famille</strong> (AÏLA) est née d'une conviction simple : chaque famille mérite de préserver et transmettre son histoire. Notre mission est de rendre la généalogie accessible à tous, gratuitement et simplement.</p>
        
        <p>Dans un monde de plus en plus connecté mais paradoxalement déconnecté de ses racines, nous croyons que connaître son histoire familiale est essentiel pour construire son identité et renforcer les liens intergénérationnels.</p>
        
        <h2>Pourquoi AILA ?</h2>
        <p>Le nom <strong>AÏLA</strong> évoque à la fois "aïeul" (ancêtre) et "aile" (protection familiale). C'est un hommage à nos ancêtres qui nous ont transmis leur histoire et leurs valeurs.</p>
        
        <h2>Ce Qui Nous Différencie</h2>
        
        <h3>🌳 Simplicité</h3>
        <p>Créer votre arbre généalogique ne devrait pas être compliqué. Notre interface intuitive permet à tous, même sans connaissances techniques, de construire leur arbre en quelques minutes.</p>
        
        <h3>👨‍👩‍👧‍👦 Collaboration Familiale</h3>
        <p>La généalogie est une affaire de famille ! Invitez vos proches à enrichir l'arbre ensemble. Chaque membre peut ajouter des informations, des photos et des souvenirs.</p>
        
        <h3>🔒 Confidentialité</h3>
        <p>Vos données familiales sont précieuses et sensibles. Nous les protégeons avec les plus hauts standards de sécurité et ne les partageons jamais avec des tiers.</p>
        
        <h3>💰 Gratuité</h3>
        <p>Les fonctionnalités essentielles sont et resteront gratuites. Nous croyons que préserver son histoire familiale ne devrait pas être un luxe.</p>
        
        <h2>Nos Fonctionnalités</h2>
        <ul>
          <li><strong>Arbre généalogique visuel</strong> - Visualisez votre famille sur une interface moderne et interactive</li>
          <li><strong>Fiches détaillées</strong> - Ajoutez photos, dates, lieux et anecdotes pour chaque membre</li>
          <li><strong>Rappels d'anniversaires</strong> - Ne manquez plus jamais une date importante</li>
          <li><strong>Discussion familiale</strong> - Partagez des souvenirs et histoires avec vos proches</li>
          <li><strong>Export GEDCOM</strong> - Exportez vos données au format standard de généalogie</li>
          <li><strong>Multi-plateforme</strong> - Accédez à votre arbre sur web, iOS et Android</li>
        </ul>
        
        <h2>Notre Équipe</h2>
        <p>AILA Famille est développée par une équipe passionnée de généalogie et de technologie, basée en France. Nous travaillons chaque jour pour améliorer l'application et ajouter de nouvelles fonctionnalités.</p>
        
        <h2>Nous Contacter</h2>
        <p>Une question, une suggestion, un partenariat ?<br>
        Email : <a href="mailto:contact@aila.family">contact@aila.family</a><br>
        Site web : <a href="https://www.aila.family">www.aila.family</a></p>
        
        <h2>Rejoignez la Communauté AILA</h2>
        <p>Des milliers de familles utilisent déjà AILA pour préserver leur histoire. Rejoignez-les et commencez à créer votre arbre généalogique gratuitement dès aujourd'hui !</p>
        
        <p style="text-align: center; margin-top: 30px;">
          <a href="/(auth)/register" style="background: #D4AF37; color: #0A1628; padding: 15px 30px; border-radius: 25px; text-decoration: none; font-weight: bold;">✨ Créer mon arbre gratuit</a>
        </p>
      </article>
    `
  },
  'faq': {
    title: 'FAQ - Questions Fréquentes sur AILA Famille | Aide Généalogie',
    description: 'Toutes les réponses à vos questions sur AILA Famille : création d\'arbre généalogique, fonctionnalités, tarifs, sécurité des données et plus.',
    h1: 'Questions Fréquentes (FAQ)',
    content: `
      <article>
        <h2>🌳 Général</h2>
        
        <h3>Qu'est-ce que AILA Famille ?</h3>
        <p>AILA Famille (aussi appelé AÏLA) est une application gratuite permettant de créer, visualiser et partager votre arbre généalogique familial. Disponible sur web, iOS et Android.</p>
        
        <h3>AILA Famille est-il vraiment gratuit ?</h3>
        <p><strong>Oui !</strong> La version gratuite inclut toutes les fonctionnalités essentielles : création d'arbre, ajout de membres illimités, photos, partage familial. Une version Premium existe pour des fonctionnalités avancées comme l'export GEDCOM et la suppression des publicités.</p>
        
        <h3>Comment créer mon arbre généalogique ?</h3>
        <p>C'est simple :<br>
        1. Créez un compte gratuit sur <a href="https://www.aila.family">www.aila.family</a><br>
        2. Ajoutez-vous comme premier membre<br>
        3. Ajoutez vos parents, grands-parents, enfants...<br>
        4. Votre arbre se construit automatiquement !</p>
        
        <h3>Puis-je essayer sans créer de compte ?</h3>
        <p>Oui ! Vous pouvez tester l'application en mode "aperçu" sans inscription. Cependant, vos données ne seront pas sauvegardées. Pour conserver votre arbre, créez un compte gratuit.</p>
        
        <h2>👨‍👩‍👧‍👦 Partage et Collaboration</h2>
        
        <h3>Comment inviter ma famille à collaborer ?</h3>
        <p>Depuis votre arbre, vous pouvez inviter des membres par email. Ils recevront un lien pour rejoindre votre arbre et pourront ajouter des informations ou consulter l'arbre selon les permissions que vous définissez.</p>
        
        <h3>Qui peut voir mon arbre généalogique ?</h3>
        <p>Par défaut, votre arbre est <strong>privé</strong>. Seules les personnes que vous invitez peuvent le voir. Vous gardez le contrôle total sur les permissions d'accès.</p>
        
        <h3>Peut-on avoir plusieurs arbres ?</h3>
        <p>En version gratuite, vous pouvez gérer un arbre principal. La version Premium permet de créer plusieurs arbres distincts (famille maternelle, paternelle, etc.).</p>
        
        <h2>📱 Utilisation</h2>
        
        <h3>L'application fonctionne-t-elle sur mobile ?</h3>
        <p>Oui ! AILA Famille est disponible sur :<br>
        • <strong>Web</strong> : www.aila.family (tous navigateurs)<br>
        • <strong>iOS</strong> : iPhone et iPad<br>
        • <strong>Android</strong> : Smartphones et tablettes<br>
        Votre arbre est synchronisé automatiquement entre tous vos appareils.</p>
        
        <h3>Puis-je ajouter des photos ?</h3>
        <p>Absolument ! Vous pouvez ajouter une photo pour chaque membre de votre arbre. Les photos sont stockées de manière sécurisée sur nos serveurs.</p>
        
        <h3>Comment exporter mon arbre ?</h3>
        <p>La version Premium permet d'exporter votre arbre au format GEDCOM (standard de généalogie) et JSON. Vous pouvez ainsi sauvegarder vos données ou les importer dans d'autres logiciels.</p>
        
        <h2>🔒 Sécurité et Confidentialité</h2>
        
        <h3>Mes données sont-elles sécurisées ?</h3>
        <p>Oui, la sécurité est notre priorité :<br>
        • Chiffrement SSL/TLS pour toutes les communications<br>
        • Mots de passe hashés avec bcrypt<br>
        • Serveurs sécurisés et sauvegardes régulières<br>
        • Conformité RGPD</p>
        
        <h3>Vendez-vous mes données ?</h3>
        <p><strong>Non, jamais.</strong> Vos données généalogiques sont personnelles et sensibles. Nous ne les vendons ni ne les partageons avec des tiers. Consultez notre <a href="/privacy">Politique de Confidentialité</a>.</p>
        
        <h3>Comment supprimer mon compte ?</h3>
        <p>Vous pouvez supprimer votre compte à tout moment depuis les paramètres de l'application. Toutes vos données seront définitivement effacées sous 30 jours.</p>
        
        <h2>💳 Tarifs et Premium</h2>
        
        <h3>Quels sont les avantages Premium ?</h3>
        <p>L'abonnement Premium offre :<br>
        • Aucune publicité<br>
        • Export GEDCOM et JSON<br>
        • Arbres illimités<br>
        • Collaborateurs illimités<br>
        • Événements familiaux<br>
        • Support prioritaire</p>
        
        <h3>Combien coûte l'abonnement Premium ?</h3>
        <p>• <strong>Mensuel</strong> : 2,99€/mois<br>
        • <strong>Annuel</strong> : 24,99€/an (économie de 11,89€)</p>
        
        <h3>Puis-je annuler mon abonnement ?</h3>
        <p>Oui, vous pouvez annuler à tout moment. Votre accès Premium reste actif jusqu'à la fin de la période payée.</p>
        
        <h2>📞 Support</h2>
        
        <h3>Comment contacter le support ?</h3>
        <p>Email : <a href="mailto:support@aila.family">support@aila.family</a><br>
        Nous répondons généralement sous 24-48h.</p>
        
        <h3>J'ai trouvé un bug, que faire ?</h3>
        <p>Merci de nous aider à améliorer AILA ! Envoyez-nous un email à <a href="mailto:support@aila.family">support@aila.family</a> en décrivant le problème et les étapes pour le reproduire.</p>
      </article>
    `
  }
};

function createStaticPage(pageName, pageData) {
  const pageDir = path.join(distPath, pageName);
  const pageFile = path.join(pageDir, 'index.html');
  
  // Create directory if needed
  if (!fs.existsSync(pageDir)) {
    fs.mkdirSync(pageDir, { recursive: true });
  }
  
  const staticHTML = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <!-- ==================== AILA FAMILLE SEO - ${pageName.toUpperCase()} ==================== -->
  <title>${pageData.title}</title>
  <meta name="description" content="${pageData.description}" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="https://www.aila.family/${pageName}" />
  
  <!-- Open Graph -->
  <meta property="og:type" content="article" />
  <meta property="og:url" content="https://www.aila.family/${pageName}" />
  <meta property="og:title" content="${pageData.title}" />
  <meta property="og:description" content="${pageData.description}" />
  <meta property="og:site_name" content="AILA Famille" />
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="${pageData.title}" />
  <meta name="twitter:description" content="${pageData.description}" />
  
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: linear-gradient(135deg, #0A1628 0%, #1A2F4A 50%, #0A1628 100%);
      color: #E2E8F0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.7;
      min-height: 100vh;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 1px solid #2A3F5A;
    }
    .logo { color: #D4AF37; font-size: 2em; margin-bottom: 10px; }
    h1 {
      color: #D4AF37;
      font-size: 1.8em;
      margin-bottom: 10px;
    }
    h2 {
      color: #D4AF37;
      font-size: 1.3em;
      margin-top: 30px;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 1px solid #2A3F5A;
    }
    h3 {
      color: #B8C5D6;
      font-size: 1.1em;
      margin-top: 20px;
      margin-bottom: 10px;
    }
    p {
      margin-bottom: 15px;
      color: #B8C5D6;
    }
    ul {
      margin-bottom: 15px;
      padding-left: 25px;
    }
    li {
      margin-bottom: 8px;
      color: #B8C5D6;
    }
    a {
      color: #D4AF37;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    strong {
      color: #FFFFFF;
    }
    em {
      color: #6B7C93;
    }
    .back-link {
      display: inline-block;
      margin-bottom: 20px;
      padding: 10px 20px;
      background: rgba(212, 175, 55, 0.1);
      border: 1px solid #D4AF37;
      border-radius: 8px;
    }
    footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid #2A3F5A;
      text-align: center;
      color: #6B7C93;
      font-size: 0.9em;
    }
    .footer-links a {
      margin: 0 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="logo">🌳 AILA Famille</div>
      <a href="/" class="back-link">← Retour à l'accueil</a>
    </header>
    
    <main>
      <h1>${pageData.h1}</h1>
      ${pageData.content}
    </main>
    
    <footer>
      <div class="footer-links">
        <a href="/">Accueil</a>
        <a href="/privacy">Confidentialité</a>
        <a href="/terms">CGU</a>
        <a href="/about">À propos</a>
        <a href="/faq">FAQ</a>
      </div>
      <p style="margin-top: 15px;">© 2025 AILA Famille - Application de généalogie</p>
    </footer>
  </div>
</body>
</html>`;
  
  fs.writeFileSync(pageFile, staticHTML, 'utf8');
  return true;
}

// Main execution
console.log('📁 Processing HTML files in dist/...');
const result = processAllHTMLFiles(distPath);

// Create static legal pages
console.log('');
console.log('📄 Creating static legal pages...');
for (const [pageName, pageData] of Object.entries(staticPages)) {
  if (createStaticPage(pageName, pageData)) {
    console.log(`   ✅ Created static page: /${pageName}`);
  }
}

console.log('');
console.log('🎉 SEO Injection Complete!');
console.log(`   ✅ Files processed: ${result.processed}`);
console.log(`   ⏭️  Files skipped: ${result.skipped}`);
console.log(`   📄 Static pages created: ${Object.keys(staticPages).length}`);
console.log('');
console.log('📋 Injected content:');
console.log('   - Meta tags: title, description, keywords, robots');
console.log('   - Open Graph tags for social sharing');
console.log('   - Twitter Card tags');
console.log('   - Structured Data (JSON-LD)');
console.log('   - Noscript fallback content for crawlers');
console.log('   - Google Analytics');
console.log('   - PWA meta tags');
console.log('   - Static legal pages (Privacy, Terms)');
