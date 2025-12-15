import React from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAds } from '@/context/AdsContext';

// Note: For web, we'll show a placeholder banner
// For mobile, you would integrate Google Mobile Ads SDK

interface AdBannerProps {
  style?: object;
}

export default function AdBanner({ style }: AdBannerProps) {
  const { showAds, isPremium } = useAds();
  const router = useRouter();

  // Don't show ads for premium users
  if (!showAds || isPremium) {
    return null;
  }

  const handleRemoveAds = () => {
    router.push('/pricing');
  };

  // For web, show a placeholder/simulation banner
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.adContent}>
          <Ionicons name="megaphone-outline" size={20} color="#666" />
          <Text style={styles.adText}>Espace publicitaire</Text>
        </View>
        <TouchableOpacity style={styles.removeButton} onPress={handleRemoveAds}>
          <Text style={styles.removeText}>Supprimer les pubs</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // For mobile, show placeholder (in production, use BannerAd from react-native-google-mobile-ads)
  return (
    <View style={[styles.container, style]}>
      <View style={styles.adContent}>
        <Ionicons name="megaphone-outline" size={20} color="#666" />
        <Text style={styles.adText}>Publicité</Text>
      </View>
      <TouchableOpacity style={styles.removeButton} onPress={handleRemoveAds}>
        <Text style={styles.removeText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0f0f0',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 50,
  },
  adContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  adText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  removeButton: {
    backgroundColor: '#4A90D9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  removeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
