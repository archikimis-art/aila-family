import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { useTranslation } from 'react-i18next';
import AdBanner from '@/components/AdBanner';

export default function PricingScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);

  // Subscription Plans
  const PLANS = [
    {
      id: 'monthly',
      name: t('pricing.plans.monthly.name'),
      price: '2,99 €',
      period: t('pricing.plans.monthly.period'),
      description: t('pricing.plans.monthly.description'),
      features: [
        t('pricing.features.noAds'),
        t('pricing.features.unlimitedTree'),
        t('pricing.features.unlimitedCollaborators'),
        t('pricing.features.exportJson'),
        t('pricing.features.familyEvents'),
      ],
      popular: false,
      priceValue: 2.99,
    },
    {
      id: 'yearly',
      name: t('pricing.plans.yearly.name'),
      price: '24,99 €',
      period: t('pricing.plans.yearly.period'),
      description: t('pricing.plans.yearly.description'),
      features: [
        t('pricing.features.noAds'),
        t('pricing.features.allMonthly'),
        t('pricing.features.save30'),
        t('pricing.features.prioritySupport'),
        t('pricing.features.freePdf'),
      ],
      popular: true,
      priceValue: 24.99,
      savings: '11,89 €',
    },
  ];

  // Services à la carte
  const SERVICES = [
    {
      id: 'pdf_export',
      name: t('pricing.services.pdfExport.name'),
      price: '0,99 €',
      icon: 'document-text',
      description: t('pricing.services.pdfExport.description'),
      color: '#4A90D9',
    },
    {
      id: 'theme_gold',
      name: t('pricing.services.themeGold.name'),
      price: '1,99 €',
      icon: 'color-palette',
      description: t('pricing.services.themeGold.description'),
      color: '#D4AF37',
    },
    {
      id: 'theme_nature',
      name: t('pricing.services.themeNature.name'),
      price: '1,99 €',
      icon: 'leaf',
      description: t('pricing.services.themeNature.description'),
      color: '#48BB78',
    },
    {
      id: 'theme_vintage',
      name: t('pricing.services.themeVintage.name'),
      price: '1,99 €',
      icon: 'time',
      description: t('pricing.services.themeVintage.description'),
      color: '#8B7355',
    },
  ];

  // Services à venir
  const COMING_SOON = [
    {
      icon: 'print',
      name: t('pricing.comingSoon.poster.name'),
      description: t('pricing.comingSoon.poster.description'),
    },
    {
      icon: 'book',
      name: t('pricing.comingSoon.photoBook.name'),
      description: t('pricing.comingSoon.photoBook.description'),
    },
    {
      icon: 'search',
      name: t('pricing.comingSoon.research.name'),
      description: t('pricing.comingSoon.research.description'),
    },
  ];

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

  /** Extrait un message d'erreur lisible depuis la réponse backend ou le code HTTP */
  const getPaymentErrorMessage = (error: any, fallbackKey: string): string => {
    if (!error) return t(fallbackKey);
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      if (status === 0) return t('pricing.alerts.networkError');
      if (data && typeof data === 'object') {
        const d = data.detail;
        if (typeof d === 'string') return d;
        if (Array.isArray(d) && d.length) return d.map((x: any) => x?.msg || JSON.stringify(x)).join(' ');
      }
      if (data && typeof data === 'string') return data.length > 300 ? data.slice(0, 300) + '…' : data;
      return `Erreur ${status}${error.response.statusText ? `: ${error.response.statusText}` : ''}`;
    }
    return t('pricing.alerts.networkError');
  };

  const handleSelectPlan = async (planId: string) => {
    if (!user) {
      if (Platform.OS === 'web') {
        window.alert(t('pricing.alerts.loginRequired'));
      }
      router.push('/(auth)/login');
      return;
    }

    setLoading(planId);
    try {
      const origin = getOrigin();
      const response = await api.post('/stripe/create-checkout-session', {
        plan: planId,
        success_url: `${origin}/(tabs)/profile?payment=success`,
        cancel_url: `${origin}/pricing?payment=cancelled`,
      });

      if (response.data.checkout_url) {
        openCheckoutUrl(response.data.checkout_url);
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      if (error.response) {
        console.error('[Pricing] Backend response:', error.response.status, error.response.data);
      } else {
        console.error('[Pricing] No response (réseau, CORS ou backend injoignable)');
      }
      const message = getPaymentErrorMessage(error, 'pricing.alerts.paymentError');
      if (Platform.OS === 'web') {
        window.alert(message);
      }
    } finally {
      setLoading(null);
    }
  };

  const handlePurchaseService = async (serviceId: string) => {
    if (!user) {
      if (Platform.OS === 'web') {
        window.alert(t('pricing.alerts.loginToPurchase'));
      }
      router.push('/(auth)/login');
      return;
    }

    setLoading(serviceId);
    try {
      const origin = getOrigin();
      const response = await api.post('/stripe/create-checkout-session', {
        plan: serviceId,
        success_url: `${origin}/(tabs)/profile?purchase=success&item=${serviceId}`,
        cancel_url: `${origin}/pricing?purchase=cancelled`,
      });

      if (response.data.checkout_url) {
        openCheckoutUrl(response.data.checkout_url);
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      if (error.response) {
        console.error('[Pricing] Purchase backend response:', error.response.status, error.response.data);
      }
      const message = getPaymentErrorMessage(error, 'pricing.alerts.purchaseError');
      if (Platform.OS === 'web') {
        window.alert(message);
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
        <Text style={styles.headerTitle}>{t('pricing.title')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroEmoji}>{t('pricing.hero.emoji')}</Text>
          <Text style={styles.heroTitle}>{t('pricing.hero.title')}</Text>
          <Text style={styles.heroSubtitle}>
            {t('pricing.hero.subtitle')}
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
                ? t('pricing.status.premium')
                : t('pricing.status.free')}
            </Text>
          </View>
        )}

        {/* Premium Plans Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="diamond" size={24} color="#D4AF37" />
            <Text style={styles.sectionTitle}>{t('pricing.subscriptions.title')}</Text>
          </View>
          <Text style={styles.sectionDescription}>
            {t('pricing.subscriptions.description')}
          </Text>

          <View style={styles.plansContainer}>
            {PLANS.map((plan) => (
              <View 
                key={plan.id} 
                style={[styles.planCard, plan.popular && styles.popularCard]}
              >
                {plan.popular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularBadgeText}>{t('pricing.subscriptions.recommended')}</Text>
                  </View>
                )}
                
                <Text style={styles.planName}>{plan.name}</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.planPrice}>{plan.price}</Text>
                  <Text style={styles.planPeriod}>{plan.period}</Text>
                </View>
                {plan.savings && (
                  <View style={styles.savingsBadge}>
                    <Text style={styles.savingsText}>{t('pricing.subscriptions.savings')} {plan.savings}</Text>
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
                      {isPremium ? t('pricing.subscriptions.current') : t('pricing.subscriptions.subscribe')}
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
            <Text style={styles.sectionTitle}>{t('pricing.services.title')}</Text>
          </View>
          <Text style={styles.sectionDescription}>
            {t('pricing.services.description')}
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
            <Text style={[styles.sectionTitle, { color: '#A0AEC0' }]}>{t('pricing.comingSoon.title')}</Text>
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
            <Text style={styles.sectionTitle}>{t('pricing.faq.title')}</Text>
          </View>

          <View style={styles.faqContainer}>
            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>{t('pricing.faq.q1')}</Text>
              <Text style={styles.faqAnswer}>
                {t('pricing.faq.a1')}
              </Text>
            </View>
            
            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>{t('pricing.faq.q2')}</Text>
              <Text style={styles.faqAnswer}>
                {t('pricing.faq.a2')}
              </Text>
            </View>

            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>{t('pricing.faq.q3')}</Text>
              <Text style={styles.faqAnswer}>
                {t('pricing.faq.a3')}
              </Text>
            </View>
          </View>
        </View>

        <AdBanner />
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
