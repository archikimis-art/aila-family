// Build: 1765552905 - SECURITY UPDATE
import React, { useEffect, useState } from 'react';
import { Tabs, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

// SECURITY: Global preview mode flag key
const PREVIEW_MODE_ACTIVE_KEY = 'preview_mode_active';

// Détecte si on est dans l'app Android (WebView) pour ajouter un padding bas à la tab bar
const isAndroidWebView = Platform.OS === 'web' && typeof navigator !== 'undefined' && /\bwv\b/.test(navigator.userAgent);

export default function TabsLayout() {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  
  // SECURITY: Track preview mode globally via AsyncStorage
  useEffect(() => {
    const checkPreviewMode = async () => {
      // If URL has preview=true, set the global flag
      if (params.preview === 'true') {
        console.log('[SECURITY] Setting global preview mode flag');
        await AsyncStorage.setItem(PREVIEW_MODE_ACTIVE_KEY, 'true');
        setIsPreviewMode(true);
      } else {
        // Check if preview mode is still active from AsyncStorage
        const previewActive = await AsyncStorage.getItem(PREVIEW_MODE_ACTIVE_KEY);
        setIsPreviewMode(previewActive === 'true');
      }
    };
    checkPreviewMode();
  }, [params.preview]);
  
  return (
    <View style={{ flex: 1 }}>
      {/* Preview mode banner - always visible when in preview */}
      {isPreviewMode && (
        <View style={styles.previewBanner}>
          <Ionicons name="eye-outline" size={14} color="#D4AF37" />
          <Text style={styles.previewText}>MODE APERÇU - Données de démonstration</Text>
        </View>
      )}
      <Tabs
        screenOptions={{
          headerShown: false,
          // Fond sombre pour toute la zone contenu (évite la bande grise sous la pub)
          sceneStyle: { backgroundColor: '#0A1628' },
          // Web/WebView : pas d'inset bas (évite la grande zone vide sous la bande pub sur l'app Google Play)
          ...(Platform.OS === 'web' && { safeAreaInsets: { top: 0, bottom: 0, left: 0, right: 0 } }),
          tabBarStyle: {
            backgroundColor: '#0A1628',
            borderTopColor: '#1A2F4A',
            borderTopWidth: 1,
            height: Platform.OS === 'ios' ? 88 : 52,
            minHeight: Platform.OS === 'web' ? 52 : undefined,
            maxHeight: Platform.OS === 'web' ? 52 : undefined,
            // En WebView Android : petit padding pour que la tab bar ne soit pas sous la barre système
            paddingBottom: isAndroidWebView ? 48 : Platform.OS === 'ios' ? 28 : 0,
            paddingTop: Platform.OS === 'ios' ? 0 : 4,
          },
          tabBarActiveTintColor: '#D4AF37',
          tabBarInactiveTintColor: '#6B7C93',
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '500',
          },
        }}
      >
        <Tabs.Screen
          name="tree"
          options={{
            title: t('navigation.tree'),
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="git-branch-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="members"
          options={{
            title: t('navigation.members'),
            tabBarIcon: ({ color, size}) => (
              <Ionicons name="people-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            title: t('navigation.chat'),
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="chatbubbles-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="share"
          options={{
            title: t('navigation.share'),
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="link-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: t('navigation.profile'),
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-outline" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  previewBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.3)',
  },
  previewText: {
    color: '#D4AF37',
    fontSize: 11,
    fontWeight: '600',
  },
});
