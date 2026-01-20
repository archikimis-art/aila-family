import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Message {
  id: string;
  content: string;
  author_name: string;
  author_country: string;
  created_at: string;
  likes: number;
  topic: string;
}

const MESSAGES_STORAGE_KEY = 'aila_community_messages';

const topics = [
  { id: 'all', label: 'Tout', icon: 'chatbubbles-outline' },
  { id: 'origins', label: 'Origines', icon: 'earth-outline' },
  { id: 'help', label: 'Entraide', icon: 'help-circle-outline' },
  { id: 'tips', label: 'Astuces', icon: 'bulb-outline' },
  { id: 'stories', label: 'Histoires', icon: 'book-outline' },
];

export default function CommunityScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('all');
  
  // Form fields
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [authorCountry, setAuthorCountry] = useState('');
  const [messageTopic, setMessageTopic] = useState('origins');

  useEffect(() => {
    loadMessages();
    loadAuthorInfo();
  }, []);

  const loadAuthorInfo = async () => {
    try {
      const name = await AsyncStorage.getItem('aila_author_name');
      const country = await AsyncStorage.getItem('aila_author_country');
      if (name) setAuthorName(name);
      if (country) setAuthorCountry(country);
    } catch (e) {}
  };

  const loadMessages = async () => {
    try {
      const stored = await AsyncStorage.getItem(MESSAGES_STORAGE_KEY);
      if (stored) {
        setMessages(JSON.parse(stored));
      } else {
        // Messages de démonstration
        const demoMessages: Message[] = [
          {
            id: '1',
            content: "Bonjour à tous ! Je recherche des informations sur ma famille originaire de Bretagne. Mes arrière-grands-parents vivaient à Quimper. Quelqu'un connaît les archives de cette région ?",
            author_name: "Marie L.",
            author_country: "France 🇫🇷",
            created_at: new Date(Date.now() - 86400000).toISOString(),
            likes: 3,
            topic: "help"
          },
          {
            id: '2',
            content: "Ma famille vient du Sénégal, région de Dakar. Chez nous, la tradition du thé est très importante - on le prépare en 3 services qui représentent la vie : amer comme la mort, doux comme la vie, sucré comme l'amour.",
            author_name: "Amadou D.",
            author_country: "Sénégal 🇸🇳",
            created_at: new Date(Date.now() - 172800000).toISOString(),
            likes: 8,
            topic: "origins"
          },
          {
            id: '3',
            content: "Astuce : Pour retrouver vos ancêtres italiens, le site Antenati.san.beniculturali.it propose des millions de registres numérisés gratuitement !",
            author_name: "Giuseppe M.",
            author_country: "Italie 🇮🇹",
            created_at: new Date(Date.now() - 259200000).toISOString(),
            likes: 12,
            topic: "tips"
          },
        ];
        setMessages(demoMessages);
        await AsyncStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(demoMessages));
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitMessage = async () => {
    if (!content.trim() || !authorName.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir votre nom et votre message');
      return;
    }

    setSubmitting(true);
    try {
      const newMessage: Message = {
        id: Date.now().toString(),
        content: content.trim(),
        author_name: authorName.trim(),
        author_country: authorCountry.trim() || 'Non précisé',
        created_at: new Date().toISOString(),
        likes: 0,
        topic: messageTopic,
      };

      const updatedMessages = [newMessage, ...messages];
      await AsyncStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(updatedMessages));
      await AsyncStorage.setItem('aila_author_name', authorName);
      await AsyncStorage.setItem('aila_author_country', authorCountry);
      
      setMessages(updatedMessages);
      setContent('');
      setShowForm(false);
      
      Alert.alert('Merci !', 'Votre message a été publié.');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de publier le message');
    } finally {
      setSubmitting(false);
    }
  };

  const likeMessage = async (messageId: string) => {
    const updated = messages.map(m => 
      m.id === messageId ? { ...m, likes: m.likes + 1 } : m
    );
    setMessages(updated);
    await AsyncStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(updated));
  };

  const filteredMessages = selectedTopic === 'all' 
    ? messages 
    : messages.filter(m => m.topic === selectedTopic);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffHours < 1) return "À l'instant";
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#D4AF37" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Communauté AÏLA</Text>
        <TouchableOpacity onPress={() => setShowForm(true)}>
          <Ionicons name="create-outline" size={24} color="#D4AF37" />
        </TouchableOpacity>
      </View>

      {/* Topics Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.topicsContainer}
        contentContainerStyle={styles.topicsContent}
      >
        {topics.map(topic => (
          <TouchableOpacity
            key={topic.id}
            style={[
              styles.topicChip,
              selectedTopic === topic.id && styles.topicChipActive
            ]}
            onPress={() => setSelectedTopic(topic.id)}
          >
            <Ionicons 
              name={topic.icon as any} 
              size={16} 
              color={selectedTopic === topic.id ? '#0A1628' : '#D4AF37'} 
            />
            <Text style={[
              styles.topicChipText,
              selectedTopic === topic.id && styles.topicChipTextActive
            ]}>
              {topic.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Write Button (visible when form is hidden) */}
      {!showForm && (
        <TouchableOpacity style={styles.writeButton} onPress={() => setShowForm(true)}>
          <Ionicons name="chatbubble-ellipses" size={20} color="#0A1628" />
          <Text style={styles.writeButtonText}>Écrire un message</Text>
        </TouchableOpacity>
      )}

      {/* Write Form */}
      {showForm && (
        <View style={styles.formContainer}>
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>Nouveau message</Text>
            <TouchableOpacity onPress={() => setShowForm(false)}>
              <Ionicons name="close" size={24} color="#6B7C93" />
            </TouchableOpacity>
          </View>

          <View style={styles.formRow}>
            <View style={styles.formField}>
              <Text style={styles.label}>Votre nom *</Text>
              <TextInput
                style={styles.input}
                placeholder="Prénom N."
                placeholderTextColor="#6B7C93"
                value={authorName}
                onChangeText={setAuthorName}
              />
            </View>
            <View style={styles.formField}>
              <Text style={styles.label}>Pays / Région</Text>
              <TextInput
                style={styles.input}
                placeholder="France 🇫🇷"
                placeholderTextColor="#6B7C93"
                value={authorCountry}
                onChangeText={setAuthorCountry}
              />
            </View>
          </View>

          <Text style={styles.label}>Sujet</Text>
          <View style={styles.topicSelector}>
            {topics.filter(t => t.id !== 'all').map(topic => (
              <TouchableOpacity
                key={topic.id}
                style={[
                  styles.topicOption,
                  messageTopic === topic.id && styles.topicOptionActive
                ]}
                onPress={() => setMessageTopic(topic.id)}
              >
                <Text style={[
                  styles.topicOptionText,
                  messageTopic === topic.id && styles.topicOptionTextActive
                ]}>
                  {topic.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Votre message *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Partagez vos origines, posez une question, donnez un conseil..."
            placeholderTextColor="#6B7C93"
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={4}
          />

          <TouchableOpacity 
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={submitMessage}
            disabled={submitting}
          >
            <Text style={styles.submitButtonText}>
              {submitting ? 'Publication...' : 'Publier'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Messages List */}
      <ScrollView style={styles.messagesList} showsVerticalScrollIndicator={false}>
        {filteredMessages.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={48} color="#6B7C93" />
            <Text style={styles.emptyText}>Aucun message dans cette catégorie</Text>
            <Text style={styles.emptySubtext}>Soyez le premier à partager !</Text>
          </View>
        ) : (
          filteredMessages.map(message => (
            <View key={message.id} style={styles.messageCard}>
              <View style={styles.messageHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {message.author_name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.authorInfo}>
                  <Text style={styles.authorName}>{message.author_name}</Text>
                  <Text style={styles.authorCountry}>{message.author_country}</Text>
                </View>
                <Text style={styles.messageDate}>{formatDate(message.created_at)}</Text>
              </View>
              
              <Text style={styles.messageContent}>{message.content}</Text>
              
              <View style={styles.messageFooter}>
                <View style={styles.topicBadge}>
                  <Text style={styles.topicBadgeText}>
                    {topics.find(t => t.id === message.topic)?.label || 'Général'}
                  </Text>
                </View>
                <TouchableOpacity 
                  style={styles.likeButton}
                  onPress={() => likeMessage(message.id)}
                >
                  <Ionicons name="heart-outline" size={18} color="#D4AF37" />
                  <Text style={styles.likeCount}>{message.likes}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
        
        <View style={styles.bottomPadding} />
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
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  topicsContainer: {
    maxHeight: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#1E3A5F',
  },
  topicsContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    flexDirection: 'row',
  },
  topicChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    gap: 6,
  },
  topicChipActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  topicChipText: {
    color: '#D4AF37',
    fontSize: 13,
    fontWeight: '500',
  },
  topicChipTextActive: {
    color: '#0A1628',
  },
  writeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D4AF37',
    margin: 16,
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  writeButtonText: {
    color: '#0A1628',
    fontSize: 16,
    fontWeight: '600',
  },
  formContainer: {
    backgroundColor: '#1E3A5F',
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  formTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  formField: {
    flex: 1,
  },
  label: {
    color: '#B8C5D6',
    fontSize: 13,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#0A1628',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 15,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  topicSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  topicOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
  },
  topicOptionActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  topicOptionText: {
    color: '#D4AF37',
    fontSize: 13,
  },
  topicOptionTextActive: {
    color: '#0A1628',
  },
  submitButton: {
    backgroundColor: '#D4AF37',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#0A1628',
    fontSize: 16,
    fontWeight: '600',
  },
  messagesList: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#B8C5D6',
    fontSize: 16,
    marginTop: 12,
  },
  emptySubtext: {
    color: '#6B7C93',
    fontSize: 14,
    marginTop: 4,
  },
  messageCard: {
    backgroundColor: '#1E3A5F',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#0A1628',
    fontSize: 18,
    fontWeight: 'bold',
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  authorCountry: {
    color: '#6B7C93',
    fontSize: 13,
  },
  messageDate: {
    color: '#6B7C93',
    fontSize: 12,
  },
  messageContent: {
    color: '#B8C5D6',
    fontSize: 15,
    lineHeight: 22,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  topicBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  topicBadgeText: {
    color: '#D4AF37',
    fontSize: 12,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  likeCount: {
    color: '#D4AF37',
    fontSize: 14,
  },
  bottomPadding: {
    height: 40,
  },
});
