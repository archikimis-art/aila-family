import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

// FAQ item keys for translation
const faqKeys = [
  { category: 'faq.categories.gettingStarted', questionKey: 'faq.items.createTree.question', answerKey: 'faq.items.createTree.answer' },
  { category: 'faq.categories.gettingStarted', questionKey: 'faq.items.needAccount.question', answerKey: 'faq.items.needAccount.answer' },
  { category: 'faq.categories.gettingStarted', questionKey: 'faq.items.isFree.question', answerKey: 'faq.items.isFree.answer' },
  { category: 'faq.categories.treeManagement', questionKey: 'faq.items.addPerson.question', answerKey: 'faq.items.addPerson.answer' },
  { category: 'faq.categories.treeManagement', questionKey: 'faq.items.createLink.question', answerKey: 'faq.items.createLink.answer' },
  { category: 'faq.categories.treeManagement', questionKey: 'faq.items.editPerson.question', answerKey: 'faq.items.editPerson.answer' },
  { category: 'faq.categories.treeManagement', questionKey: 'faq.items.deletePerson.question', answerKey: 'faq.items.deletePerson.answer' },
  { category: 'faq.categories.navigation', questionKey: 'faq.items.mobileNav.question', answerKey: 'faq.items.mobileNav.answer' },
  { category: 'faq.categories.navigation', questionKey: 'faq.items.cardColors.question', answerKey: 'faq.items.cardColors.answer' },
  { category: 'faq.categories.sharing', questionKey: 'faq.items.shareTree.question', answerKey: 'faq.items.shareTree.answer' },
  { category: 'faq.categories.sharing', questionKey: 'faq.items.mergeTree.question', answerKey: 'faq.items.mergeTree.answer' },
  { category: 'faq.categories.chat', questionKey: 'faq.items.familyChat.question', answerKey: 'faq.items.familyChat.answer' },
  { category: 'faq.categories.privacy', questionKey: 'faq.items.dataSecure.question', answerKey: 'faq.items.dataSecure.answer' },
  { category: 'faq.categories.privacy', questionKey: 'faq.items.exportData.question', answerKey: 'faq.items.exportData.answer' },
  { category: 'faq.categories.privacy', questionKey: 'faq.items.deleteAccount.question', answerKey: 'faq.items.deleteAccount.answer' },
  { category: 'faq.categories.technical', questionKey: 'faq.items.offline.question', answerKey: 'faq.items.offline.answer' },
  { category: 'faq.categories.technical', questionKey: 'faq.items.devices.question', answerKey: 'faq.items.devices.answer' },
  { category: 'faq.categories.technical', questionKey: 'faq.items.displayIssue.question', answerKey: 'faq.items.displayIssue.answer' },
];

export default function FAQScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Build translated FAQ data
  const faqData = faqKeys.map(item => ({
    category: t(item.category),
    question: t(item.questionKey),
    answer: t(item.answerKey),
  }));

  const categoryKeys = ['all', 'faq.categories.gettingStarted', 'faq.categories.treeManagement', 'faq.categories.navigation', 'faq.categories.sharing', 'faq.categories.chat', 'faq.categories.privacy', 'faq.categories.technical'];
  const categories = categoryKeys.map(key => key === 'all' ? t('faq.categories.all') : t(key));
  
  const filteredFAQ = selectedCategory === "all" 
    ? faqData 
    : faqData.filter(item => item.category === t(selectedCategory));

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#D4AF37" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('faq.title')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Introduction */}
        <View style={styles.introSection}>
          <Ionicons name="help-circle-outline" size={48} color="#D4AF37" />
          <Text style={styles.introTitle}>{t('faq.introTitle')}</Text>
          <Text style={styles.introText}>{t('faq.introText')}</Text>
        </View>

        {/* Category Filter */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryContainer}
        >
          {categoryKeys.map((categoryKey, idx) => (
            <TouchableOpacity
              key={categoryKey}
              style={[
                styles.categoryButton,
                selectedCategory === categoryKey && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(categoryKey)}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === categoryKey && styles.categoryTextActive
              ]}>
                {categories[idx]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* FAQ Items */}
        <View style={styles.faqContainer}>
          {filteredFAQ.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.faqItem}
              onPress={() => toggleExpand(index)}
              activeOpacity={0.7}
            >
              <View style={styles.faqHeader}>
                <View style={styles.faqQuestion}>
                  <Text style={styles.categoryBadge}>{item.category}</Text>
                  <Text style={styles.questionText}>{item.question}</Text>
                </View>
                <Ionicons 
                  name={expandedIndex === index ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color="#D4AF37" 
                />
              </View>
              {expandedIndex === index && (
                <View style={styles.answerContainer}>
                  <Text style={styles.answerText}>{item.answer}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Contact Section */}
        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>{t('faq.contact.title')}</Text>
          <Text style={styles.contactText}>{t('faq.contact.text')}</Text>
          <TouchableOpacity style={styles.contactButton}>
            <Ionicons name="mail-outline" size={20} color="#0A1628" />
            <Text style={styles.contactButtonText}>{t('faq.contact.button')}</Text>
          </TouchableOpacity>
        </View>

        {/* Back to Home */}
        <TouchableOpacity 
          style={styles.homeButton}
          onPress={() => router.push('/')}
        >
          <Ionicons name="home-outline" size={20} color="#D4AF37" />
          <Text style={styles.homeButtonText}>{t('faq.backHome')}</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('faq.footer')}</Text>
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
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  introSection: {
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#1E3A5F',
  },
  introTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
    textAlign: 'center',
  },
  introText: {
    fontSize: 15,
    color: '#B8C5D6',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  categoryContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1E3A5F',
    marginRight: 10,
  },
  categoryButtonActive: {
    backgroundColor: '#D4AF37',
  },
  categoryText: {
    color: '#B8C5D6',
    fontSize: 14,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#0A1628',
  },
  faqContainer: {
    padding: 16,
  },
  faqItem: {
    backgroundColor: '#1E3A5F',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  faqQuestion: {
    flex: 1,
    marginRight: 12,
  },
  categoryBadge: {
    fontSize: 11,
    color: '#D4AF37',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  questionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 22,
  },
  answerContainer: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#2A4A6A',
  },
  answerText: {
    fontSize: 14,
    color: '#B8C5D6',
    lineHeight: 22,
    paddingTop: 12,
  },
  contactSection: {
    margin: 16,
    padding: 20,
    backgroundColor: '#1E3A5F',
    borderRadius: 12,
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  contactText: {
    fontSize: 14,
    color: '#B8C5D6',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D4AF37',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  contactButtonText: {
    color: '#0A1628',
    fontSize: 15,
    fontWeight: '600',
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginVertical: 8,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D4AF37',
    gap: 8,
  },
  homeButtonText: {
    color: '#D4AF37',
    fontSize: 15,
    fontWeight: '500',
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#6B7C93',
    textAlign: 'center',
  },
});
