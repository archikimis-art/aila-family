import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Platform,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ShareButtonsProps {
  title: string;
  url?: string;
  message?: string;
}

export default function ShareButtons({ title, url = 'https://www.aila.family', message }: ShareButtonsProps) {
  const shareMessage = message || `Découvrez "${title}" sur AÏLA - L'arbre généalogique qui connecte votre famille`;
  
  const shareNative = async () => {
    try {
      await Share.share({
        message: `${shareMessage}\n\n${url}`,
        title: title,
        url: url,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const shareWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareMessage}\n\n${url}`)}`;
    Linking.openURL(whatsappUrl);
  };

  const shareFacebook = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(shareMessage)}`;
    Linking.openURL(fbUrl);
  };

  const shareTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}&url=${encodeURIComponent(url)}`;
    Linking.openURL(twitterUrl);
  };

  const shareEmail = () => {
    const subject = encodeURIComponent(title);
    const body = encodeURIComponent(`${shareMessage}\n\n${url}`);
    Linking.openURL(`mailto:?subject=${subject}&body=${body}`);
  };

  const copyLink = async () => {
    if (Platform.OS === 'web') {
      try {
        await navigator.clipboard.writeText(url);
        alert('Lien copié !');
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Partager</Text>
      <View style={styles.buttonsRow}>
        <TouchableOpacity style={[styles.shareButton, styles.whatsapp]} onPress={shareWhatsApp}>
          <Ionicons name="logo-whatsapp" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.shareButton, styles.facebook]} onPress={shareFacebook}>
          <Ionicons name="logo-facebook" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.shareButton, styles.twitter]} onPress={shareTwitter}>
          <Ionicons name="logo-twitter" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.shareButton, styles.email]} onPress={shareEmail}>
          <Ionicons name="mail" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        {Platform.OS !== 'web' && (
          <TouchableOpacity style={[styles.shareButton, styles.more]} onPress={shareNative}>
            <Ionicons name="share-outline" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        )}

        {Platform.OS === 'web' && (
          <TouchableOpacity style={[styles.shareButton, styles.copy]} onPress={copyLink}>
            <Ionicons name="copy-outline" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    padding: 16,
    backgroundColor: '#1E3A5F',
    borderRadius: 12,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  shareButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  whatsapp: {
    backgroundColor: '#25D366',
  },
  facebook: {
    backgroundColor: '#1877F2',
  },
  twitter: {
    backgroundColor: '#1DA1F2',
  },
  email: {
    backgroundColor: '#EA4335',
  },
  more: {
    backgroundColor: '#D4AF37',
  },
  copy: {
    backgroundColor: '#6B7C93',
  },
});
