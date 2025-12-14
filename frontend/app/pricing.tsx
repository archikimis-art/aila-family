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
    price: '4,99 €',
    period: '/mois',
    description: 'Idéal pour découvrir',
    features: [
      'Arbre illimité',
      'Collaborateurs illimités',
      'Export JSON & GEDCOM',
      'Événements familiaux',
      'Animations festives',
    ],
    popular: false,
  },
  {
    id: 'yearly',
    name: 'Annuel',
    price: '39,99 €',
    period: '/an',
    description: '2 mois gratuits !',
    features: [
      'Tout le plan mensuel',
      'Économisez 20%',
      'Support prioritaire',
    ],
    popular: true,
  },
  {
    id: 'lifetime',
    name: 'À vie',
    price: '99 €',
    period: 'paiement unique',
    description: 'Accès permanent',
    features: [
      'Tout le plan annuel',
      'Accès à vie',
      'Mises à jour gratuites',
      'Pas d\'abonnement',
    ],
    popular: false,
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
          <Text style={styles.title}>Passez à Premium</Text>
          <Text style={styles.subtitle}>
            Débloquez toutes les fonctionnalités pour enrichir votre arbre généalogique
          </Text>
        </View>

        {/* Current Status */}
        {user && (
          <View style={styles.statusCard}>
            <Ionicons 
              name={isPremium ? "checkmark-circle" : "information-circle"} 
              size={24} 
              color={isPremium ? "#48BB78" : "#D4AF37"} 
            />
            <Text style={styles.statusText}>
              {isPremium 
                ? `Vous êtes Premium (${subscriptionStatus?.plan || 'actif'})` 
                : 'Version gratuite - 10 personnes max'}
            </Text>
          </View>
        )}

        {/* Plans */}
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
                  <Text style={styles.popularBadgeText}>POPULAIRE</Text>
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

        {/* Free Plan Info */}
        <View style={styles.freeInfo}>
          <Text style={styles.freeTitle}>🆓 Version Gratuite</Text>
          <Text style={styles.freeText}>
            • Jusqu'à 10 personnes dans l'arbre{'\n'}
            • 1 collaborateur maximum{'\n'}
            • Fonctionnalités de base
          </Text>
        </View>

        {/* Guarantee */}
        <View style={styles.guarantee}>
          <Ionicons name="shield-checkmark" size={24} color="#D4AF37" />
          <Text style={styles.guaranteeText}>
            Paiement sécurisé par Stripe. Annulez à tout moment.
          </Text>
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
    borderBottomColor: '#1A2F4A',
  },
  backButton: {
    padding: 8,
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#B8C5D6',
    textAlign: 'center',
    maxWidth: 300,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A2F4A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  statusText: {
    fontSize: 14,
    color: '#FFFFFF',
    flex: 1,
  },
  plansContainer: {
    gap: 16,
    marginBottom: 24,
  },
  planCard: {
    backgroundColor: '#1A2F4A',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#2A3F5A',
  },
  popularCard: {
    borderColor: '#D4AF37',
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    backgroundColor: '#D4AF37',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0A1628',
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    marginTop: 8,
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
    fontSize: 14,
    color: '#B8C5D6',
    marginLeft: 4,
  },
  planDescription: {
    fontSize: 14,
    color: '#48BB78',
    marginBottom: 16,
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
    color: '#B8C5D6',
  },
  selectButton: {
    backgroundColor: '#2A3F5A',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  popularButton: {
    backgroundColor: '#D4AF37',
  },
  disabledButton: {
    opacity: 0.5,
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  popularButtonText: {
    color: '#0A1628',
  },
  freeInfo: {
    backgroundColor: '#1A2F4A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  freeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  freeText: {
    fontSize: 14,
    color: '#B8C5D6',
    lineHeight: 22,
  },
  guarantee: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 16,
  },
  guaranteeText: {
    fontSize: 12,
    color: '#6B7C93',
    textAlign: 'center',
  },
});
