import { useState } from "react";
import "@/App.css";
import { Zap, Users, Lock, Play, UserPlus, Search, Sparkles, GraduationCap, Gift, Heart, Share2, Download, Star } from "lucide-react";

const Home = () => {
  const [activeTab, setActiveTab] = useState("pourquoi");

  const tabs = [
    { id: "pourquoi", label: "Pourquoi AÏLA ?", icon: Sparkles },
    { id: "ancetres", label: "Ancêtres", icon: Search },
    { id: "debutant", label: "Débutant", icon: GraduationCap },
    { id: "traditions", label: "Traditions", icon: Gift },
    { id: "cousinade", label: "Cousinade", icon: Heart },
  ];

  return (
    <div className="app-container">
      {/* Floating Kanji Characters */}
      <div className="kanji-background">
        <span className="kanji" style={{ top: '10%', left: '5%' }}>絆</span>
        <span className="kanji" style={{ top: '25%', left: '8%' }}>根</span>
        <span className="kanji" style={{ top: '40%', left: '3%' }}>命</span>
        <span className="kanji" style={{ top: '60%', left: '10%' }}>家</span>
        <span className="kanji" style={{ top: '75%', left: '6%' }}>樹</span>
        <span className="kanji" style={{ top: '15%', right: '8%' }}>族</span>
        <span className="kanji" style={{ top: '35%', right: '5%' }}>命</span>
        <span className="kanji" style={{ top: '55%', right: '10%' }}>絆</span>
        <span className="kanji" style={{ top: '70%', right: '7%' }}>葉</span>
        <span className="kanji" style={{ top: '85%', right: '4%' }}>枝</span>
        <span className="kanji" style={{ top: '50%', left: '15%' }}>葉</span>
        <span className="kanji" style={{ top: '30%', right: '15%' }}>枝</span>
      </div>

      {/* Floating Leaves */}
      <div className="leaves-container">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i} 
            className="leaf"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${8 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <main className="main-content">
        {/* Logo */}
        <div className="logo-container">
          <div className="leaf-logo">
            <svg viewBox="0 0 60 50" className="leaf-svg">
              <path 
                d="M30 5 Q45 15 45 30 Q45 45 30 48 Q15 45 15 30 Q15 15 30 5" 
                fill="#D4A93C"
                stroke="#D4A93C"
                strokeWidth="2"
              />
              <path 
                d="M30 48 L30 15" 
                stroke="#1a2744"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="main-title">AÏLA</h1>
        <p className="subtitle">F A M I L L E</p>
        
        {/* New Tagline */}
        <p className="tagline" data-testid="main-tagline">
          AÏLA, l'application qui connecte votre famille
        </p>

        {/* Features */}
        <div className="features">
          <div className="feature">
            <Zap className="feature-icon" />
            <span>Simple & intuitif</span>
          </div>
          <div className="feature">
            <Users className="feature-icon" />
            <span>Collaborez en famille</span>
          </div>
          <div className="feature">
            <Lock className="feature-icon" />
            <span>Vos données protégées</span>
          </div>
        </div>

        {/* Primary CTA */}
        <button className="cta-primary" data-testid="try-now-btn">
          <Play className="cta-icon" />
          <div className="cta-text">
            <span className="cta-main">Essayer maintenant</span>
            <span className="cta-sub">Créez votre arbre en 5 min</span>
          </div>
        </button>

        {/* Trust badges */}
        <div className="trust-badges">
          <span className="badge"><span className="badge-dot green" /> Sans compte</span>
          <span className="badge"><span className="badge-dot green" /> Gratuit</span>
          <span className="badge"><span className="badge-dot green" /> Sans engagement</span>
        </div>

        {/* Secondary CTA */}
        <button className="cta-secondary" data-testid="create-account-btn">
          <UserPlus className="cta-icon-small" />
          <span>Créer un compte gratuit</span>
        </button>

        {/* Login Link */}
        <p className="login-link">
          Déjà inscrit ? <a href="#login" data-testid="login-link">Se connecter</a>
        </p>

        {/* Discover Section */}
        <section className="discover-section">
          <h2 className="discover-title">DÉCOUVRIR AÏLA</h2>
          
          <div className="tabs-container">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                data-testid={`tab-${tab.id}`}
              >
                <tab.icon className="tab-icon" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </section>
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <button className="nav-btn" data-testid="share-btn">
          <Share2 className="nav-icon" />
          <span>Partager</span>
        </button>
        <button className="nav-btn outline" data-testid="download-btn">
          <Download className="nav-icon" />
          <span>Télécharger</span>
        </button>
        <button className="nav-btn premium" data-testid="premium-btn">
          <Star className="nav-icon" />
          <span>Premium</span>
        </button>
      </nav>
    </div>
  );
};

function App() {
  return <Home />;
}

export default App;
