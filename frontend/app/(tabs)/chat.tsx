import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { chatAPI } from '@/services/api';
import AdBanner from '@/components/AdBanner';

interface ChatMessage {
  id: string;
  user_id: string;
  user_name: string;
  message: string;
  mentioned_person_id?: string;
  mentioned_person_name?: string;
  created_at: string;
}

export default function ChatScreen() {
  const { user } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadMessages();
    }
  }, [user]);

  const loadMessages = async () => {
    try {
      const response = await chatAPI.getMessages(50, 0);
      setMessages(response.data || []);
      
      // Scroll to bottom after loading
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      await chatAPI.sendMessage({ message: newMessage.trim() });
      setNewMessage('');
      await loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Erreur', 'Impossible d\'envoyer le message.');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    console.log('=== DELETE MESSAGE TRIGGERED ===');
    console.log('Message ID:', messageId);
    console.log('Message ID type:', typeof messageId);
    
    if (!messageId) {
      console.error('No message ID provided');
      if (Platform.OS === 'web') {
        window.alert('Erreur: ID du message manquant.');
      } else {
        Alert.alert('Erreur', 'ID du message manquant.');
      }
      return;
    }
    
    // Use window.confirm on web for better compatibility
    const confirmDelete = Platform.OS === 'web' 
      ? window.confirm('Êtes-vous sûr de vouloir supprimer ce message ?')
      : await new Promise<boolean>((resolve) => {
          Alert.alert(
            'Supprimer le message',
            'Êtes-vous sûr de vouloir supprimer ce message ?',
            [
              { text: 'Annuler', style: 'cancel', onPress: () => resolve(false) },
              { text: 'Supprimer', style: 'destructive', onPress: () => resolve(true) },
            ]
          );
        });
    
    if (!confirmDelete) {
      console.log('Delete cancelled by user');
      return;
    }
    
    try {
      console.log('Calling API to delete message:', messageId);
      const response = await chatAPI.deleteMessage(messageId);
      console.log('Delete API response:', response);
      console.log('Delete API response status:', response.status);
      console.log('Delete API response data:', response.data);
      
      // Reload messages after successful deletion
      await loadMessages();
      console.log('Messages reloaded successfully after delete');
      
    } catch (error: any) {
      console.error('=== DELETE ERROR ===');
      console.error('Error object:', error);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      
      const errorMessage = error.response?.data?.detail || 'Impossible de supprimer le message.';
      
      if (Platform.OS === 'web') {
        window.alert('Erreur: ' + errorMessage);
      } else {
        Alert.alert('Erreur', errorMessage);
      }
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadMessages();
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Ionicons name="chatbubbles-outline" size={80} color="#2A3F5A" />
          <Text style={styles.emptyTitle}>Discussion collaborative</Text>
          <Text style={styles.emptySubtitle}>
            Connectez-vous pour discuter avec les autres membres de l'arbre familial
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D4AF37" />
          <Text style={styles.loadingText}>Chargement des messages...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="chatbubbles" size={24} color="#D4AF37" />
            <Text style={styles.headerTitle}>Discussion</Text>
          </View>
          <TouchableOpacity onPress={onRefresh}>
            <Ionicons name="refresh" size={22} color="#B8C5D6" />
          </TouchableOpacity>
        </View>

        {/* Messages List */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D4AF37" />
          }
        >
          {messages.length === 0 ? (
            <View style={styles.emptyMessages}>
              <Ionicons name="chatbubble-ellipses-outline" size={60} color="#2A3F5A" />
              <Text style={styles.emptyMessagesText}>Aucun message pour le moment</Text>
              <Text style={styles.emptyMessagesSubtext}>
                Soyez le premier à démarrer la conversation !
              </Text>
            </View>
          ) : (
            messages.map((msg) => {
              const isMyMessage = msg.user_id === user.id;
              return (
                <View
                  key={msg.id}
                  style={[
                    styles.messageContainer,
                    isMyMessage && styles.myMessageContainer,
                  ]}
                >
                  <View style={[styles.messageBubble, isMyMessage && styles.myMessageBubble]}>
                    {!isMyMessage && (
                      <Text style={styles.senderName}>{msg.user_name}</Text>
                    )}
                    <Text style={[styles.messageText, isMyMessage && styles.myMessageText]}>
                      {msg.message}
                    </Text>
                    {msg.mentioned_person_name && (
                      <View style={styles.mentionBadge}>
                        <Ionicons name="person" size={12} color="#D4AF37" />
                        <Text style={styles.mentionText}>{msg.mentioned_person_name}</Text>
                      </View>
                    )}
                    <View style={styles.messageFooter}>
                      <Text style={[styles.messageTime, isMyMessage && styles.myMessageTime]}>
                        {formatTime(msg.created_at)}
                      </Text>
                      {isMyMessage && (
                        <TouchableOpacity onPress={() => handleDeleteMessage(msg.id)}>
                          <Ionicons name="trash-outline" size={14} color="#B8C5D6" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Écrivez un message..."
              placeholderTextColor="#6B7C93"
              value={newMessage}
              onChangeText={setNewMessage}
              multiline
              maxLength={500}
              editable={!sending}
            />
            <TouchableOpacity
              style={[styles.sendButton, (!newMessage.trim() || sending) && styles.sendButtonDisabled]}
              onPress={handleSendMessage}
              disabled={!newMessage.trim() || sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#0A1628" />
              ) : (
                <Ionicons name="send" size={20} color="#0A1628" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1628',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#D4AF37',
    fontSize: 16,
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A2F4A',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 20,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#6B7C93',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  emptyMessages: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyMessagesText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#B8C5D6',
    marginTop: 16,
  },
  emptyMessagesSubtext: {
    fontSize: 14,
    color: '#6B7C93',
    marginTop: 8,
    textAlign: 'center',
  },
  messageContainer: {
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  myMessageContainer: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    backgroundColor: '#1A2F4A',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    maxWidth: '80%',
  },
  myMessageBubble: {
    backgroundColor: '#D4AF37',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 4,
  },
  senderName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#D4AF37',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  myMessageText: {
    color: '#0A1628',
  },
  mentionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  mentionText: {
    fontSize: 12,
    color: '#D4AF37',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    gap: 8,
  },
  messageTime: {
    fontSize: 11,
    color: '#6B7C93',
  },
  myMessageTime: {
    color: '#1A2F4A',
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: '#1A2F4A',
    padding: 12,
    backgroundColor: '#0F1F2F',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#1A2F4A',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 12,
    color: '#FFFFFF',
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
