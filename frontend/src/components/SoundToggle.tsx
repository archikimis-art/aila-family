import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSound } from '../context/SoundContext';
import { useTranslation } from 'react-i18next';

export default function SoundToggle() {
  const { soundEnabled, toggleSound } = useSound();
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={toggleSound}
      activeOpacity={0.7}
    >
      <Ionicons 
        name={soundEnabled ? 'volume-high' : 'volume-mute'} 
        size={18} 
        color={soundEnabled ? '#D4AF37' : '#6B7C93'} 
      />
      <Text style={[styles.text, soundEnabled && styles.textActive]}>
        {soundEnabled ? t('settings.soundOn') || 'Son activé' : t('settings.soundOff') || 'Mode calme'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    backgroundColor: 'rgba(30, 58, 95, 0.5)',
    borderRadius: 8,
  },
  text: {
    fontSize: 12,
    color: '#6B7C93',
  },
  textActive: {
    color: '#D4AF37',
  },
});
