import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { useTranslation } from 'react-i18next';

// Subscription Plans
const PLANS = [
  {
    id: 'monthly',
    name: 'Mensuel',
    price: '2,99 €',
    period: '/mois',
    description: 'Flexibilité maximale',
    features: [
      'Aucune publicité',
      'Arbre illimité',
      'Collaborateurs illimités',
      'Export JSON & GEDCOM',
      'Événements familiaux',
    ],
    popular: false,
    priceValue: 2.99,
  },
  {
    id: 'yearly',
    name: 'Annuel',
    price: '24,99 €',
    period: '/an',
    description: 'Économisez 30% !',
    features: [
      'Aucune publicité',
      'Tout le plan mensuel',
      'Économisez 30%',
      'Support prioritaire',
      '2 exports PDF offerts',
    ],
    popular: true,
    priceValue: 24.99,
    savings: '11,89 €',
  },
];

// Services à la carte - Achats uniques
const SERVICES = [
  {
    id: 'pdf_export',
    name: 'Export PDF Premium',
    price: '0,99 €',
    icon: 'document-text',
    description: 'Téléchargez votre arbre généalogique en PDF haute qualité, prêt à imprimer ou partager.',
    color: '#4A90D9',
  },
  {
    id: 'theme_gold',
    name: 'Thème Or Royal',
    price: '1,99 €',
    icon: 'color-palette',
    description: 'Sublimez votre arbre avec un thème élégant aux bordures dorées et finitions luxueuses.',
    color: '#D4AF37',
  },
  {
    id: 'theme_nature',
    name: 'Thème Nature',
    price: '1,99 €',
    icon: 'leaf',
    description: 'Un design inspiré de la nature avec des tons verts apaisants et des motifs floraux.',
    color: '#48BB78',
  },
  {
    id: 'theme_vintage',
    name: 'Thème Vintage',
    price: '1,99 €',
    icon: 'time',
    description: 'Plongez dans le passé avec ce style rétro sépia, parfait pour une touche nostalgique.',
    color: '#8B7355',
  },
];

// Services à venir
const COMING_SOON = [
  {
    icon: 'print',
    name: 'Impression Poster',
    description: 'Faites imprimer votre arbre en grand format sur papier premium ou canvas.',
  },
  {
    icon: 'book',
    name: 'Livre Photo Familial',
    description: 'Créez un magnifique livre retraçant l\'histoire de votre famille.',
  },
  {
    icon: 'search',
    name: 'Recherche Généalogique',
    description: 'Confiez vos recherches à des experts pour découvrir vos ancêtres.',
  },
];

export default function PricingScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadSubscriptionStatus();
    }
  }, [user]);

  const loadSubscriptionStatus = async () => {
    try {
      const response = await api.get('/stripe/subscription-status');
      setSubscriptionStatus(response.data);
    } catch (error) {
      console.log('Error loading subscription status:', error);
    }
  };

  const handleSelectPlan = async (planId: string) => {
    if (!user) {
      if (Platform.OS === 'web') {
        window.alert('Veuillez vous connecter pour souscrire à un abonnement.');
      }
      router.push('/(auth)/login');
      return;
    }

    setLoading(planId);
    try {
      const response = await api.post('/stripe/create-checkout-session', {
        plan: planId,
        success_url: `${window.location.origin}/(tabs)/profile?payment=success`,
        cancel_url: `${window.location.origin}/pricing?payment=cancelled`,
      });

      if (response.data.checkout_url) {
        window.location.href = response.data.checkout_url;
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      if (Platform.OS === 'web') {
        window.alert(error.response?.data?.detail || 'Erreur lors de la création du paiement.');
      }
    } finally {
      setLoading(null);
    }
  };

  const handlePurchaseService = async (serviceId: string) => {
    if (!user) {
      if (Platform.OS === 'web') {
        window.alert('Veuillez vous connecter pour effectuer un achat.');
      }
      router.push('/(auth)/login');
      return;
    }

    setLoading(serviceId);
    try {
      const response = await api.post('/stripe/create-checkout-session', {
        plan: serviceId,
        success_url: `${window.location.origin}/(tabs)/profile?purchase=success&item=${serviceId}`,
        cancel_url: `${window.location.origin}/pricing?purchase=cancelled`,
      });

      if (response.data.checkout_url) {
        window.location.href = response.data.checkout_url;
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      if (Platform.OS === 'web') {
        window.alert(error.response?.data?.detail || 'Erreur lors de l\'achat.');
      }
    } finally {
      setLoading(null);
    }
  };

  const isPremium = subscriptionStatus?.is_premium;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Offres & Services</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroEmoji}>🌳</Text>
          <Text style={styles.heroTitle}>Donnez vie à votre histoire familiale</Text>
          <Text style={styles.heroSubtitle}>
            Choisissez l'offre qui vous convient et personnalisez votre expérience
          </Text>
        </View>

        {/* Current Status */}
        {user && (
          <View style={[styles.statusCard, isPremium && styles.premiumStatusCard]}>
            <Ionicons 
              name={isPremium ? "checkmark-circle" : "gift-outline"} 
              size={24} 
              color={isPremium ? "#48BB78" : "#D4AF37"} 
            />
            <Text style={styles.statusText}>
              {isPremium 
                ? 'Vous êtes Premium - Profitez de tous les avantages !' 
                : 'Version gratuite - Passez Premium pour plus de fonctionnalités'}
            </Text>
          </View>
        )}

        {/* Premium Plans Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="diamond" size={24} color="#D4AF37" />
            <Text style={styles.sectionTitle}>Abonnements Premium</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Supprimez les publicités et débloquez toutes les fonctionnalités
          </Text>

          <View style={styles.plansContainer}>
            {PLANS.map((plan) => (
              <View 
                key={plan.id} 
                style={[styles.planCard, plan.popular && styles.popularCard]}
              >
                {plan.popular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularBadgeText}>RECOMMANDÉ</Text>
                  </View>
                )}
                
                <Text style={styles.planName}>{plan.name}</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.planPrice}>{plan.price}</Text>
                  <Text style={styles.planPeriod}>{plan.period}</Text>
                </View>
                {plan.savings && (
                  <View style={styles.savingsBadge}>
                    <Text style={styles.savingsText}>Économie de {plan.savings}/an</Text>
                  </View>
                )}
                
                <View style={styles.featuresContainer}>
                  {plan.features.map((feature, index) => (
                    <View key={index} style={styles.featureRow}>
                      <Ionicons name="checkmark-circle" size={16} color="#48BB78" />
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  style={[
                    styles.selectButton,
                    plan.popular && styles.popularButton,
                    isPremium && styles.disabledButton,
                  ]}
                  onPress={() => handleSelectPlan(plan.id)}
                  disabled={loading !== null || isPremium}
                >
                  {loading === plan.id ? (
                    <ActivityIndicator size="small" color="#0A1628" />
                  ) : (
                    <Text style={[styles.selectButtonText, plan.popular && styles.popularButtonText]}>
                      {isPremium ? 'Déjà Premium' : 'Choisir ce plan'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Services à la carte Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="sparkles" size={24} color="#D4AF37" />
            <Text style={styles.sectionTitle}>Personnalisation</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Enrichissez votre arbre avec ces services exclusifs (achat unique)
          </Text>

          <View style={styles.servicesContainer}>
            {SERVICES.map((service) => (
              <TouchableOpacity 
                key={service.id} 
                style={styles.serviceCard}
                onPress={() => handlePurchaseService(service.id)}
                disabled={loading !== null}
                activeOpacity={0.8}
              >
                <View style={[styles.serviceIconContainer, { backgroundColor: service.color + '20' }]}>
                  <Ionicons name={service.icon as any} size={28} color={service.color} />
                </View>
                <View style={styles.serviceContent}>
                  <View style={styles.serviceHeader}>
                    <Text style={styles.serviceName}>{service.name}</Text>
                    <View style={styles.servicePriceBadge}>
                      <Text style={styles.servicePriceText}>{service.price}</Text>
                    </View>
                  </View>
                  <Text style={styles.serviceDescription}>{service.description}</Text>
                </View>
                {loading === service.id ? (
                  <ActivityIndicator size="small" color="#D4AF37" />
                ) : (
                  <Ionicons name="chevron-forward" size={20} color="#6B7C93" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Coming Soon Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="rocket" size={24} color="#A0AEC0" />
            <Text style={[styles.sectionTitle, { color: '#A0AEC0' }]}>Bientôt disponible</Text>
          </View>

          <View style={styles.comingSoonContainer}>
            {COMING_SOON.map((item, index) => (
              <View key={index} style={styles.comingSoonCard}>
                <View style={styles.comingSoonIcon}>
                  <Ionicons name={item.icon as any} size={24} color="#6B7C93" />
                </View>
                <View style={styles.comingSoonContent}>
                  <Text style={styles.comingSoonName}>{item.name}</Text>
                  <Text style={styles.comingSoonDescription}>{item.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="help-circle" size={24} color="#D4AF37" />
            <Text style={styles.sectionTitle}>Questions fréquentes</Text>
          </View>

          <View style={styles.faqContainer}>
            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>Puis-je annuler mon abonnement ?</Text>
              <Text style={styles.faqAnswer}>
                Oui, à tout moment depuis votre profil. Vous conservez l'accès jusqu'à la fin de la période payée.
              </Text>
            </View>
            
            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>Les achats de personnalisation sont-ils définitifs ?</Text>
              <Text style={styles.faqAnswer}>
                Oui ! Une fois achetés, les thèmes et exports PDF restent disponibles à vie sur votre compte.
              </Text>
            </View>

            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>Comment fonctionne l'export PDF ?</Text>
              <Text style={styles.faqAnswer}>
                Après achat, vous pourrez télécharger votre arbre en format PDF haute résolution, parfait pour l'impression.
              </Text>
            </View>
          </View>
        </View>

        {/* Footer spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1628',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E3A5F',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 20,
  },
  heroEmoji: {
    fontSize: 50,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 15,
    color: '#A0AEC0',
    textAlign: 'center',
    lineHeight: 22,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E3A5F',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  premiumStatusCard: {
    backgroundColor: 'rgba(72, 187, 120, 0.15)',
    borderWidth: 1,
    borderColor: '#48BB78',
  },
  statusText: {
    fontSize: 14,
    color: '#FFFFFF',
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#A0AEC0',
    marginBottom: 16,
    lineHeight: 20,
  },
  plansContainer: {
    gap: 16,
  },
  planCard: {
    backgroundColor: '#1E3A5F',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2D4A6F',
  },
  popularCard: {
    borderColor: '#D4AF37',
    borderWidth: 2,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    right: 20,
    backgroundColor: '#D4AF37',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0A1628',
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  planPrice: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  planPeriod: {
    fontSize: 16,
    color: '#A0AEC0',
    marginLeft: 4,
  },
  savingsBadge: {
    backgroundColor: 'rgba(72, 187, 120, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  savingsText: {
    fontSize: 12,
    color: '#48BB78',
    fontWeight: '600',
  },
  featuresContainer: {
    marginBottom: 16,
    gap: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  selectButton: {
    backgroundColor: '#4A90D9',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  popularButton: {
    backgroundColor: '#D4AF37',
  },
  disabledButton: {
    backgroundColor: '#2D4A6F',
    opacity: 0.7,
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  popularButtonText: {
    color: '#0A1628',
  },
  servicesContainer: {
    gap: 12,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E3A5F',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  serviceIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceContent: {
    flex: 1,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  servicePriceBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  servicePriceText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#D4AF37',
  },
  serviceDescription: {
    fontSize: 13,
    color: '#A0AEC0',
    lineHeight: 18,
  },
  comingSoonContainer: {
    gap: 12,
  },
  comingSoonCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(30, 58, 95, 0.5)',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#2D4A6F',
    borderStyle: 'dashed',
  },
  comingSoonIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: 'rgba(107, 124, 147, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  comingSoonContent: {
    flex: 1,
  },
  comingSoonName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#A0AEC0',
    marginBottom: 4,
  },
  comingSoonDescription: {
    fontSize: 13,
    color: '#6B7C93',
    lineHeight: 18,
  },
  faqContainer: {
    gap: 16,
  },
  faqItem: {
    backgroundColor: '#1E3A5F',
    borderRadius: 12,
    padding: 16,
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '600',
    color: '#D4AF37',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#A0AEC0',
    lineHeight: 20,
  },
});
