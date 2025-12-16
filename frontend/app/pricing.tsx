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

// Subscription Plans (without lifetime)
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

// Microtransactions - One-time purchases
const EXTRAS = [
  {
    id: 'pdf_export',
    name: 'Export PDF',
    price: '0,99 €',
    icon: 'document-text',
    description: 'Téléchargez votre arbre en PDF haute qualité',
    color: '#4A90D9',
  },
  {
    id: 'theme_gold',
    name: 'Thème Or Royal',
    price: '1,99 €',
    icon: 'color-palette',
    description: 'Thème élégant avec bordures dorées',
    color: '#D4AF37',
  },
  {
    id: 'theme_nature',
    name: 'Thème Nature',
    price: '1,99 €',
    icon: 'leaf',
    description: 'Design naturel avec tons verts',
    color: '#48BB78',
  },
  {
    id: 'theme_vintage',
    name: 'Thème Vintage',
    price: '1,99 €',
    icon: 'time',
    description: 'Style rétro sépia classique',
    color: '#8B7355',
  },
];

export default function PricingScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'subscription' | 'extras'>('subscription');

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

  const handlePurchaseExtra = async (extraId: string) => {
    if (!user) {
      if (Platform.OS === 'web') {
        window.alert('Veuillez vous connecter pour effectuer un achat.');
      }
      router.push('/(auth)/login');
      return;
    }

    setLoading(extraId);
    try {
      const response = await api.post('/stripe/create-checkout-session', {
        plan: extraId,
        success_url: `${window.location.origin}/(tabs)/profile?purchase=success&item=${extraId}`,
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
        <Text style={styles.headerTitle}>Boutique</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Title */}
        <View style={styles.titleSection}>
          <View style={styles.crownIcon}>
            <Ionicons name="diamond" size={40} color="#D4AF37" />
          </View>
          <Text style={styles.title}>Passez Premium</Text>
          <Text style={styles.subtitle}>
            Profitez d'AÏLA sans publicité et débloquez des fonctionnalités exclusives
          </Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'subscription' && styles.activeTab]}
            onPress={() => setActiveTab('subscription')}
          >
            <Ionicons 
              name="card" 
              size={18} 
              color={activeTab === 'subscription' ? '#D4AF37' : '#A0AEC0'} 
            />
            <Text style={[styles.tabText, activeTab === 'subscription' && styles.activeTabText]}>
              Abonnements
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'extras' && styles.activeTab]}
            onPress={() => setActiveTab('extras')}
          >
            <Ionicons 
              name="gift" 
              size={18} 
              color={activeTab === 'extras' ? '#D4AF37' : '#A0AEC0'} 
            />
            <Text style={[styles.tabText, activeTab === 'extras' && styles.activeTabText]}>
              Extras
            </Text>
          </TouchableOpacity>
        </View>

        {/* Current Status */}
        {user && (
          <View style={[styles.statusCard, isPremium && styles.premiumStatusCard]}>
            <Ionicons 
              name={isPremium ? "checkmark-circle" : "information-circle"} 
              size={24} 
              color={isPremium ? "#48BB78" : "#D4AF37"} 
            />
            <Text style={styles.statusText}>
              {isPremium 
                ? `Vous êtes Premium - Sans publicités` 
                : 'Version gratuite avec publicités'}
            </Text>
          </View>
        )}

        {/* Subscription Plans */}
        {activeTab === 'subscription' && (
          <View style={styles.plansContainer}>
            {PLANS.map((plan) => (
              <View 
                key={plan.id} 
                style={[
                  styles.planCard,
                  plan.popular && styles.popularCard,
                ]}
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
                <Text style={styles.planDescription}>{plan.description}</Text>
                
                <View style={styles.featuresContainer}>
                  {plan.features.map((feature, index) => (
                    <View key={index} style={styles.featureRow}>
                      <Ionicons name="checkmark-circle" size={18} color="#48BB78" />
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
                    <Text style={[
                      styles.selectButtonText,
                      plan.popular && styles.popularButtonText,
                    ]}>
                      {isPremium ? 'Déjà Premium' : 'Choisir'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Extras / Microtransactions */}
        {activeTab === 'extras' && (
          <View style={styles.extrasContainer}>
            <Text style={styles.extrasTitle}>🎨 Personnalisez votre expérience</Text>
            <Text style={styles.extrasSubtitle}>Achats uniques - pas d'abonnement</Text>
            
            {EXTRAS.map((extra) => (
              <View key={extra.id} style={styles.extraCard}>
                <View style={[styles.extraIcon, { backgroundColor: extra.color + '20' }]}>
                  <Ionicons name={extra.icon as any} size={28} color={extra.color} />
                </View>
                <View style={styles.extraInfo}>
                  <Text style={styles.extraName}>{extra.name}</Text>
                  <Text style={styles.extraDescription}>{extra.description}</Text>
                </View>
                <TouchableOpacity
                  style={styles.extraButton}
                  onPress={() => handlePurchaseExtra(extra.id)}
                  disabled={loading !== null}
                >
                  {loading === extra.id ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.extraButtonText}>{extra.price}</Text>
                  )}
                </TouchableOpacity>
              </View>
            ))}

            {/* Coming Soon */}
            <View style={styles.comingSoonSection}>
              <Text style={styles.comingSoonTitle}>🚀 Bientôt disponible</Text>
              <View style={styles.comingSoonItem}>
                <Ionicons name="print" size={20} color="#A0AEC0" />
                <Text style={styles.comingSoonText}>Impression poster de votre arbre</Text>
              </View>
              <View style={styles.comingSoonItem}>
                <Ionicons name="book" size={20} color="#A0AEC0" />
                <Text style={styles.comingSoonText}>Livre photo familial personnalisé</Text>
              </View>
            </View>
          </View>
        )}

        {/* FAQ */}
        <View style={styles.faqSection}>
          <Text style={styles.faqTitle}>Questions fréquentes</Text>
          
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Puis-je annuler à tout moment ?</Text>
            <Text style={styles.faqAnswer}>
              Oui, vous pouvez annuler votre abonnement à tout moment. 
              Vous garderez l'accès premium jusqu'à la fin de la période payée.
            </Text>
          </View>
          
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Les achats "Extras" sont-ils permanents ?</Text>
            <Text style={styles.faqAnswer}>
              Oui ! Une fois achetés, les thèmes et exports PDF restent disponibles pour toujours sur votre compte.
            </Text>
          </View>
        </View>
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
    paddingBottom: 40,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  crownIcon: {
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#A0AEC0',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1E3A5F',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  activeTab: {
    backgroundColor: '#2D4A6F',
  },
  tabText: {
    fontSize: 14,
    color: '#A0AEC0',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#D4AF37',
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
    backgroundColor: 'rgba(72, 187, 120, 0.2)',
    borderWidth: 1,
    borderColor: '#48BB78',
  },
  statusText: {
    fontSize: 15,
    color: '#FFFFFF',
    flex: 1,
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
    marginBottom: 4,
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
    marginBottom: 8,
  },
  savingsText: {
    fontSize: 12,
    color: '#48BB78',
    fontWeight: '600',
  },
  planDescription: {
    fontSize: 14,
    color: '#A0AEC0',
    marginBottom: 16,
  },
  featuresContainer: {
    marginBottom: 20,
    gap: 10,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
  extrasContainer: {
    gap: 12,
  },
  extrasTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  extrasSubtitle: {
    fontSize: 14,
    color: '#A0AEC0',
    textAlign: 'center',
    marginBottom: 16,
  },
  extraCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E3A5F',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  extraIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  extraInfo: {
    flex: 1,
  },
  extraName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  extraDescription: {
    fontSize: 13,
    color: '#A0AEC0',
  },
  extraButton: {
    backgroundColor: '#4A90D9',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  extraButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  comingSoonSection: {
    backgroundColor: '#1E3A5F',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    opacity: 0.7,
  },
  comingSoonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D4AF37',
    marginBottom: 12,
  },
  comingSoonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  comingSoonText: {
    fontSize: 14,
    color: '#A0AEC0',
  },
  faqSection: {
    marginTop: 32,
  },
  faqTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  faqItem: {
    marginBottom: 16,
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '600',
    color: '#D4AF37',
    marginBottom: 6,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#A0AEC0',
    lineHeight: 20,
  },
});
