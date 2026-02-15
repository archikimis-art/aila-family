import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Comment {
  id: string;
  article_id: string;
  content: string;
  author_name: string;
  created_at: string;
  likes: number;
}

interface BlogCommentsProps {
  articleId: string;
}

const COMMENTS_STORAGE_KEY = 'aila_blog_comments';

export default function BlogComments({ articleId }: BlogCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadComments();
  }, [articleId]);

  const loadComments = async () => {
    try {
      const stored = await AsyncStorage.getItem(COMMENTS_STORAGE_KEY);
      if (stored) {
        const allComments: Comment[] = JSON.parse(stored);
        const articleComments = allComments.filter(c => c.article_id === articleId);
        setComments(articleComments);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveComments = async (allComments: Comment[]) => {
    try {
      await AsyncStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(allComments));
    } catch (error) {
      console.error('Error saving comments:', error);
    }
  };

  const submitComment = async () => {
    if (!newComment.trim() || !authorName.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir votre nom et votre commentaire');
      return;
    }

    setSubmitting(true);
    try {
      const newCommentObj: Comment = {
        id: Date.now().toString(),
        article_id: articleId,
        content: newComment.trim(),
        author_name: authorName.trim(),
        created_at: new Date().toISOString(),
        likes: 0,
      };

      // Get all comments and add new one
      const stored = await AsyncStorage.getItem(COMMENTS_STORAGE_KEY);
      const allComments: Comment[] = stored ? JSON.parse(stored) : [];
      allComments.unshift(newCommentObj);
      await saveComments(allComments);

      // Update local state
      setComments([newCommentObj, ...comments]);
      setNewComment('');
      setShowForm(false);
      
      // Save author name for next time
      await AsyncStorage.setItem('aila_comment_author', authorName);
      
      Alert.alert('Merci !', 'Votre commentaire a été publié.');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de publier le commentaire');
    } finally {
      setSubmitting(false);
    }
  };

  const likeComment = async (commentId: string) => {
    try {
      const stored = await AsyncStorage.getItem(COMMENTS_STORAGE_KEY);
      if (stored) {
        const allComments: Comment[] = JSON.parse(stored);
        const updated = allComments.map(c => 
          c.id === commentId ? { ...c, likes: c.likes + 1 } : c
        );
        await saveComments(updated);
        setComments(comments.map(c => 
          c.id === commentId ? { ...c, likes: c.likes + 1 } : c
        ));
      }
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  // Load saved author name
  useEffect(() => {
    const loadAuthor = async () => {
      const saved = await AsyncStorage.getItem('aila_comment_author');
      if (saved) setAuthorName(saved);
    };
    loadAuthor();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          💬 Commentaires ({comments.length})
        </Text>
        {!showForm && (
          <TouchableOpacity style={styles.addButton} onPress={() => setShowForm(true)}>
            <Ionicons name="add" size={20} color="#0A1628" />
            <Text style={styles.addButtonText}>Commenter</Text>
          </TouchableOpacity>
        )}
      </View>

      {showForm && (
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Donner votre avis</Text>
          <TextInput
            style={styles.input}
            placeholder="Votre nom"
            placeholderTextColor="#6B7C93"
            value={authorName}
            onChangeText={setAuthorName}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Votre commentaire, votre avis, vos questions..."
            placeholderTextColor="#6B7C93"
            value={newComment}
            onChangeText={setNewComment}
            multiline
            numberOfLines={4}
          />
          <View style={styles.formButtons}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => setShowForm(false)}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.submitButton, submitting && styles.submitButtonDisabled]} 
              onPress={submitComment}
              disabled={submitting}
            >
              <Text style={styles.submitButtonText}>
                {submitting ? 'Envoi...' : 'Publier'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {comments.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="chatbubble-outline" size={40} color="#6B7C93" />
          <Text style={styles.emptyText}>Soyez le premier à donner votre avis !</Text>
          {!showForm && (
            <TouchableOpacity style={styles.firstCommentButton} onPress={() => setShowForm(true)}>
              <Text style={styles.firstCommentButtonText}>Écrire un commentaire</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={styles.commentsList}>
          {comments.map((comment) => (
            <View key={comment.id} style={styles.commentCard}>
              <View style={styles.commentHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {comment.author_name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.commentMeta}>
                  <Text style={styles.authorName}>{comment.author_name}</Text>
                  <Text style={styles.commentDate}>{formatDate(comment.created_at)}</Text>
                </View>
              </View>
              <Text style={styles.commentContent}>{comment.content}</Text>
              <TouchableOpacity 
                style={styles.likeButton}
                onPress={() => likeComment(comment.id)}
              >
                <Ionicons name="heart-outline" size={16} color="#D4AF37" />
                <Text style={styles.likeCount}>{comment.likes}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#1E3A5F',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D4AF37',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  addButtonText: {
    color: '#0A1628',
    fontWeight: '600',
    fontSize: 14,
  },
  formContainer: {
    backgroundColor: '#1E3A5F',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  formTitle: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#0A1628',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    marginBottom: 12,
    fontSize: 15,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  cancelButtonText: {
    color: '#6B7C93',
    fontSize: 15,
  },
  submitButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#0A1628',
    fontWeight: '600',
    fontSize: 15,
  },
  emptyState: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#1E3A5F',
    borderRadius: 12,
  },
  emptyText: {
    color: '#B8C5D6',
    marginTop: 12,
    fontSize: 15,
  },
  firstCommentButton: {
    marginTop: 16,
    backgroundColor: '#D4AF37',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  firstCommentButtonText: {
    color: '#0A1628',
    fontWeight: '600',
  },
  commentsList: {
    gap: 12,
  },
  commentCard: {
    backgroundColor: '#1E3A5F',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  commentMeta: {
    flex: 1,
  },
  authorName: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
  commentDate: {
    color: '#6B7C93',
    fontSize: 12,
    marginTop: 2,
  },
  commentContent: {
    color: '#B8C5D6',
    fontSize: 15,
    lineHeight: 22,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 4,
  },
  likeCount: {
    color: '#D4AF37',
    fontSize: 14,
  },
});
