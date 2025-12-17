import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useConversion } from '@/context/ConversionContext';

const { width } = Dimensions.get('window');

interface PremiumPromptProps {
  visible: boolean;
  type: 'export' | 'tree_size' | 'welcome' | 'time_limited' | null;
  onDismiss: () => void;
}

const PROMPT_CONTENT = {
  welcome: {
    icon: '🎉',
    title: 'Bienvenue sur AÏLA !',
    subtitle: 'Offre spéciale nouveaux utilisateurs',
    description: 'Profitez de -30% sur l\'abonnement annuel pendant les prochaines 24 heures !',
    highlight: '17,49€ au lieu de 24,99€',
    buttonText: 'Profiter de l\'offre',
    secondaryText: 'Plus tard',
  },
  export: {
    icon: '📄',
    title: 'Export réussi !',
    subtitle: 'Voulez-vous un export PDF ?',
    description: 'Obtenez votre arbre en format PDF haute qualité, parfait pour l\'impression.',
    highlight: 'Seulement 0,99€',
    buttonText: 'Exporter en PDF',
    secondaryText: 'Non merci',
  },
  tree_size: {
    icon: '🌳',
    title: 'Votre arbre grandit !',
    subtitle: 'Passez à la vitesse supérieure',
    description: 'Avec plus de 10 personnes, profitez des fonctionnalités avancées pour gérer votre généalogie.',
    highlight: 'À partir de 2,99€/mois',
    buttonText: 'Voir les options',
    secondaryText: 'Continuer gratuitement',
  },
  time_limited: {
    icon: '⏰',
    title: 'Offre limitée !',
    subtitle: 'Ne manquez pas cette occasion',
    description: 'Dernière chance de profiter de notre offre spéciale sur l\'abonnement Premium.',
    highlight: '-30% aujourd\'hui seulement',
    buttonText: 'En profiter',
    secondaryText: 'Passer',
  },
};

export default function PremiumPrompt({ visible, type, onDismiss }: PremiumPromptProps) {
  const router = useRouter();
  const { isWelcomeOfferValid, welcomeOfferExpiry } = useConversion();
  const [scaleAnim] = useState(new Animated.Value(0));
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible]);

  // Countdown timer for welcome offer
  useEffect(() => {
    if (type === 'welcome' && welcomeOfferExpiry) {
      const timer = setInterval(() => {
        const now = new Date();
        const diff = welcomeOfferExpiry.getTime() - now.getTime();
        
        if (diff <= 0) {
          setCountdown('Expirée');
          clearInterval(timer);
        } else {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          setCountdown(`${hours}h ${minutes}min restantes`);
        }
      }, 60000);
      
      // Initial calculation
      const now = new Date();
      const diff = welcomeOfferExpiry.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setCountdown(`${hours}h ${minutes}min restantes`);
      
      return () => clearInterval(timer);
    }
  }, [type, welcomeOfferExpiry]);

  if (!visible || !type) return null;

  const content = PROMPT_CONTENT[type];

  const handlePrimaryAction = () => {
    onDismiss();
    if (type === 'export') {
      router.push('/pricing');
    } else {
      router.push('/pricing');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          {/* Close button */}
          <TouchableOpacity style={styles.closeButton} onPress={onDismiss}>
            <Ionicons name="close" size={24} color="#A0AEC0" />
          </TouchableOpacity>

          {/* Icon */}
          <Text style={styles.icon}>{content.icon}</Text>

          {/* Title */}
          <Text style={styles.title}>{content.title}</Text>
          <Text style={styles.subtitle}>{content.subtitle}</Text>

          {/* Countdown for welcome offer */}
          {type === 'welcome' && countdown && (
            <View style={styles.countdownBadge}>
              <Ionicons name="time-outline" size={16} color="#D4AF37" />
              <Text style={styles.countdownText}>{countdown}</Text>
            </View>
          )}

          {/* Description */}
          <Text style={styles.description}>{content.description}</Text>

          {/* Highlight */}
          <View style={styles.highlightBox}>
            <Text style={styles.highlightText}>{content.highlight}</Text>
          </View>

          {/* Primary Button */}
          <TouchableOpacity style={styles.primaryButton} onPress={handlePrimaryAction}>
            <Text style={styles.primaryButtonText}>{content.buttonText}</Text>
            <Ionicons name="arrow-forward" size={18} color="#0A1628" />
          </TouchableOpacity>

          {/* Secondary Button */}
          <TouchableOpacity style={styles.secondaryButton} onPress={onDismiss}>
            <Text style={styles.secondaryButtonText}>{content.secondaryText}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#1E3A5F',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 8,
  },
  icon: {
    fontSize: 60,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#D4AF37',
    textAlign: 'center',
    marginBottom: 16,
  },
  countdownBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    marginBottom: 16,
  },
  countdownText: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '600',
  },
  description: {
    fontSize: 15,
    color: '#A0AEC0',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  highlightBox: {
    backgroundColor: 'rgba(72, 187, 120, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 24,
  },
  highlightText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#48BB78',
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    justifyContent: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#0A1628',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    padding: 12,
  },
  secondaryButtonText: {
    color: '#A0AEC0',
    fontSize: 14,
  },
});
