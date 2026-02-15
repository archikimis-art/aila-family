import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { LANGUAGES, changeLanguage, getCurrentLanguageInfo } from '../i18n';

// Flag images from flagcdn.com (reliable CDN)
const FLAG_URLS: Record<string, string> = {
  fr: 'https://flagcdn.com/w40/fr.png',
  en: 'https://flagcdn.com/w40/gb.png',
  es: 'https://flagcdn.com/w40/es.png',
  pt: 'https://flagcdn.com/w40/br.png',
  de: 'https://flagcdn.com/w40/de.png',
  it: 'https://flagcdn.com/w40/it.png',
};

interface LanguageSelectorProps {
  style?: object;
  compact?: boolean;
}

// Flag component that works on both web and mobile
const FlagImage = ({ code, size = 24 }: { code: string; size?: number }) => {
  const flagUrl = FLAG_URLS[code];
  
  if (!flagUrl) {
    // Fallback to emoji if no URL
    const lang = LANGUAGES.find(l => l.code === code);
    return <Text style={{ fontSize: size * 0.8 }}>{lang?.flag || '🌐'}</Text>;
  }
  
  return (
    <Image
      source={{ uri: flagUrl }}
      style={{
        width: size * 1.4,
        height: size,
        borderRadius: 3,
        borderWidth: 0.5,
        borderColor: 'rgba(255,255,255,0.2)',
      }}
      resizeMode="cover"
    />
  );
};

export default function LanguageSelector({ style, compact = false }: LanguageSelectorProps) {
  const { t, i18n } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);
  const [currentLang, setCurrentLang] = useState(getCurrentLanguageInfo());

  useEffect(() => {
    setCurrentLang(getCurrentLanguageInfo());
  }, [i18n.language]);

  const handleSelectLanguage = async (langCode: string) => {
    await changeLanguage(langCode);
    setCurrentLang(LANGUAGES.find(l => l.code === langCode) || LANGUAGES[0]);
    setModalVisible(false);
  };

  const renderLanguageItem = ({ item }: { item: typeof LANGUAGES[0] }) => {
    const isSelected = item.code === currentLang.code;
    return (
      <TouchableOpacity
        style={[styles.languageItem, isSelected && styles.languageItemSelected]}
        onPress={() => handleSelectLanguage(item.code)}
        activeOpacity={0.7}
      >
        <View style={styles.flagContainer}>
          <FlagImage code={item.code} size={24} />
        </View>
        <View style={styles.languageInfo}>
          <Text style={[styles.languageName, isSelected && styles.languageNameSelected]}>
            {item.nativeName}
          </Text>
        </View>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={22} color="#D4AF37" />
        )}
      </TouchableOpacity>
    );
  };

  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactButton, style]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Ionicons name="globe-outline" size={14} color="#D4AF37" />
        <Text style={styles.compactLabel}>{t('common.language')}</Text>
        <FlagImage code={currentLang.code} size={14} />
        <Ionicons name="chevron-down" size={12} color="#D4AF37" />
        
        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t('common.language')}</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#6B7C93" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={LANGUAGES}
                renderItem={renderLanguageItem}
                keyExtractor={(item) => item.code}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={styles.selectorButton}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <FlagImage code={currentLang.code} size={18} />
        <Text style={styles.selectorText}>{currentLang.nativeName}</Text>
        <Ionicons name="chevron-down" size={18} color="#D4AF37" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('common.language')}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6B7C93" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={LANGUAGES}
              renderItem={renderLanguageItem}
              keyExtractor={(item) => item.code}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 8,
  },
  selectorText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  compactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 6,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  compactLabel: {
    color: '#D4AF37',
    fontSize: 11,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1E3A5F',
    borderRadius: 16,
    width: '100%',
    maxWidth: 340,
    maxHeight: '70%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  languageItemSelected: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
  },
  flagContainer: {
    marginRight: 14,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  languageNameSelected: {
    color: '#D4AF37',
  },
});
