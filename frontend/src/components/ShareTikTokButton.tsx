// ============================================================================
// SHARE TO TIKTOK BUTTON COMPONENT
// ============================================================================

import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  Platform, 
  Linking, 
  Share,
  View,
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

interface ShareTikTokButtonProps {
  style?: object;
  variant?: 'full' | 'icon' | 'compact';
  customText?: string;
  onShare?: () => void;
}

const TIKTOK_COLOR = '#000000';
const TIKTOK_ACCENT = '#FE2C55';

export default function ShareTikTokButton({ 
  style, 
  variant = 'full',
  customText,
  onShare 
}: ShareTikTokButtonProps) {
  
  const shareText = customText || `🌳 Je crée mon arbre généalogique sur AÏLA ! Rejoins-moi → aila.family/?utm_source=tiktok&utm_medium=share #genealogie #famille #aila`;

  const handleShare = async () => {
    try {
      if (Platform.OS === 'web') {
        // On web, copy text and open TikTok
        await Clipboard.setStringAsync(shareText);
        
        // Show confirmation
        if (typeof window !== 'undefined') {
          const confirmed = window.confirm(
            '✅ Texte copié !\n\nVoulez-vous ouvrir TikTok pour partager ?\n\n(Collez le texte dans la description de votre vidéo)'
          );
          
          if (confirmed) {
            window.open('https://www.tiktok.com/upload', '_blank');
          }
        }
      } else {
        // On mobile, use native share
        await Share.share({
          message: shareText,
          title: 'Partager sur TikTok',
        });
      }
      
      onShare?.();
    } catch (error) {
      console.error('Error sharing to TikTok:', error);
      Alert.alert('Erreur', 'Impossible de partager. Réessayez.');
    }
  };

  // Icon-only variant
  if (variant === 'icon') {
    return (
      <TouchableOpacity 
        onPress={handleShare} 
        style={[styles.iconButton, style]}
        accessibilityLabel="Partager sur TikTok"
      >
        <TikTokIcon size={24} color="#FFF" />
      </TouchableOpacity>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <TouchableOpacity 
        onPress={handleShare} 
        style={[styles.compactButton, style]}
        accessibilityLabel="Partager sur TikTok"
      >
        <TikTokIcon size={18} color="#FFF" />
        <Text style={styles.compactText}>TikTok</Text>
      </TouchableOpacity>
    );
  }

  // Full variant (default)
  return (
    <TouchableOpacity 
      onPress={handleShare} 
      style={[styles.fullButton, style]}
      accessibilityLabel="Partager sur TikTok"
    >
      <TikTokIcon size={22} color="#FFF" />
      <Text style={styles.fullText}>Partager sur TikTok</Text>
    </TouchableOpacity>
  );
}

// Custom TikTok Icon (since Ionicons doesn't have it)
function TikTokIcon({ size = 24, color = '#FFF' }: { size?: number; color?: string }) {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: size * 0.7, color, fontWeight: 'bold' }}>♪</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fullButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: TIKTOK_COLOR,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 25,
    gap: 10,
    shadowColor: TIKTOK_ACCENT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  fullText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  compactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: TIKTOK_COLOR,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 6,
  },
  compactText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: TIKTOK_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: TIKTOK_ACCENT,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
});
