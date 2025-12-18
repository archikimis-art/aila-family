// Build: 1765552905
import React from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, TouchableOpacity, View, Text } from 'react-native';

export default function TabsLayout() {
  const router = useRouter();

  const BackButton = () => (
    <TouchableOpacity 
      onPress={() => router.back()}
      style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingLeft: 16,
        paddingVertical: 8,
      }}
    >
      <Ionicons name="chevron-back" size={24} color="#D4AF37" />
      <Text style={{ color: '#D4AF37', fontSize: 16, marginLeft: 4 }}>Retour</Text>
    </TouchableOpacity>
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: false, // Masquer le header par défaut
        tabBarStyle: {
          backgroundColor: '#0A1628',
          borderTopColor: '#1A2F4A',
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
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
          title: 'Arbre',
          headerShown: false, // Pas de header sur l'arbre
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="git-branch-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="members"
        options={{
          title: 'Membres',
          tabBarIcon: ({ color, size}) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Discussion',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="share"
        options={{
          title: 'Liens',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="link-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
