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

const PLANS = [
  {
    id: 'monthly',
    name: 'Mensuel',
    price: '2,99 €',
    period: '/mois',
    description: 'Sans publicités',
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
    ],
    popular: true,
    priceValue: 24.99,
  },
  {
    id: 'lifetime',
    name: 'À vie',
    price: '49,99 €',
    period: 'paiement unique',
    description: 'Accès permanent',
    features: [
      'Aucune publicité à vie',
      'Toutes les fonctionnalités',
      'Mises à jour gratuites',
      'Pas d\'abonnement',
    ],
    popular: false,
    priceValue: 49.99,
  },
];

export default function PricingScreen() {
  const router = useRouter();
  const { user } = useAuth();
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
      // Redirect to login
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
        // Redirect to Stripe Checkout
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

  const isPremium = subscriptionStatus?.is_premium;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tarifs</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Title */}
        <View style={styles.titleSection}>
          <View style={styles.crownIcon}>
            <Ionicons name="diamond" size={40} color="#D4AF37" />
          </View>
          <Text style={styles.title}>Supprimez les publicités</Text>
          <Text style={styles.subtitle}>
            Profitez d'AÏLA sans interruption publicitaire
          </Text>
        </View>

        {/* Free Plan Info */}
        <View style={styles.freeCard}>
          <View style={styles.freeHeader}>
            <Ionicons name="gift-outline" size={24} color="#4A90D9" />
            <Text style={styles.freeTitle}>Version Gratuite</Text>
          </View>
          <View style={styles.freeFeatures}>
            <View style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={18} color="#48BB78" />
              <Text style={styles.featureText}>Toutes les fonctionnalités</Text>
            </View>
            <View style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={18} color="#48BB78" />
              <Text style={styles.featureText}>Arbre illimité</Text>
            </View>
            <View style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={18} color="#48BB78" />
              <Text style={styles.featureText}>Collaborateurs illimités</Text>
            </View>
            <View style={styles.featureRow}>
              <Ionicons name="information-circle" size={18} color="#D4AF37" />
              <Text style={styles.featureText}>Avec publicités</Text>
            </View>
          </View>
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

        {/* Premium Plans */}
        <Text style={styles.sectionTitle}>Passez sans publicités</Text>
        
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
                  <Text style={styles.popularBadgeText}>MEILLEURE OFFRE</Text>
                </View>
              )}
              
              <Text style={styles.planName}>{plan.name}</Text>
              <View style={styles.priceRow}>
                <Text style={styles.planPrice}>{plan.price}</Text>
                <Text style={styles.planPeriod}>{plan.period}</Text>
              </View>
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

        {/* FAQ */}
        <View style={styles.faqSection}>
          <Text style={styles.faqTitle}>Questions fréquentes</Text>
          
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>La version gratuite a-t-elle des limitations ?</Text>
            <Text style={styles.faqAnswer}>
              Non ! Toutes les fonctionnalités sont disponibles gratuitement. 
              Seule différence : les publicités sont affichées.
            </Text>
          </View>
          
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Puis-je annuler à tout moment ?</Text>
            <Text style={styles.faqAnswer}>
              Oui, vous pouvez annuler votre abonnement à tout moment. 
              Vous garderez l'accès premium jusqu'à la fin de la période payée.
            </Text>
          </View>
          
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Le paiement "À vie" est-il vraiment définitif ?</Text>
            <Text style={styles.faqAnswer}>
              Oui ! Un seul paiement de 49,99€ et vous n'aurez plus jamais de publicités.
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
    fontSize: 16,
    color: '#A0AEC0',
    textAlign: 'center',
    marginTop: 8,
  },
  freeCard: {
    backgroundColor: '#1E3A5F',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#4A90D9',
  },
  freeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  freeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 10,
  },
  freeFeatures: {
    gap: 10,
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 16,
    textAlign: 'center',
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
