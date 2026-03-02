// PreviewContext.tsx - SINGLE SOURCE OF TRUTH for preview mode
// This context ensures ALL components share the same preview state
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams } from 'expo-router';

// Storage keys
const PREVIEW_MODE_KEY = 'preview_mode_active';
const PREVIEW_TOKEN_KEY = 'preview_token';
const PREVIEW_PERSONS_KEY = 'preview_persons';
const PREVIEW_LINKS_KEY = 'preview_links';

interface Person {
  id: string;
  first_name: string;
  last_name: string;
  gender: string;
  birth_date?: string;
}

interface FamilyLink {
  id: string;
  person_id_1: string;
  person_id_2: string;
  link_type: string;
}

interface PreviewContextType {
  isPreviewMode: boolean;
  isLoading: boolean;
  previewPersons: Person[];
  previewLinks: FamilyLink[];
  previewToken: string | null;
  enterPreviewMode: () => Promise<void>;
  exitPreviewMode: () => Promise<void>;
  setPreviewData: (persons: Person[], links: FamilyLink[], token: string) => Promise<void>;
}

const PreviewContext = createContext<PreviewContextType | undefined>(undefined);

export function PreviewProvider({ children }: { children: ReactNode }) {
  const params = useLocalSearchParams();
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [previewPersons, setPreviewPersons] = useState<Person[]>([]);
  const [previewLinks, setPreviewLinks] = useState<FamilyLink[]>([]);
  const [previewToken, setPreviewToken] = useState<string | null>(null);

  // Check preview mode on mount and when URL params change
  useEffect(() => {
    const checkPreviewMode = async () => {
      console.log('[PreviewContext] Checking preview mode...');
      
      // URL param is the PRIMARY source of truth
      const urlPreview = params.preview === 'true';
      
      if (urlPreview) {
        // Entering preview mode via URL
        console.log('[PreviewContext] URL has preview=true → PREVIEW MODE');
        await AsyncStorage.setItem(PREVIEW_MODE_KEY, 'true');
        
        // Load existing preview data if any
        const token = await AsyncStorage.getItem(PREVIEW_TOKEN_KEY);
        const personsStr = await AsyncStorage.getItem(PREVIEW_PERSONS_KEY);
        const linksStr = await AsyncStorage.getItem(PREVIEW_LINKS_KEY);
        
        setPreviewToken(token);
        setPreviewPersons(personsStr ? JSON.parse(personsStr) : []);
        setPreviewLinks(linksStr ? JSON.parse(linksStr) : []);
        setIsPreviewMode(true);
      } else {
        // NO preview param in URL → EXIT preview mode completely
        console.log('[PreviewContext] No preview param → USER MODE, clearing preview data');
        await AsyncStorage.removeItem(PREVIEW_MODE_KEY);
        await AsyncStorage.removeItem(PREVIEW_TOKEN_KEY);
        await AsyncStorage.removeItem(PREVIEW_PERSONS_KEY);
        await AsyncStorage.removeItem(PREVIEW_LINKS_KEY);
        setIsPreviewMode(false);
        setPreviewPersons([]);
        setPreviewLinks([]);
        setPreviewToken(null);
      }
      
      setIsLoading(false);
    };
    
    checkPreviewMode();
  }, [params.preview]);

  const enterPreviewMode = useCallback(async () => {
    console.log('[PreviewContext] Entering preview mode');
    await AsyncStorage.setItem(PREVIEW_MODE_KEY, 'true');
    setIsPreviewMode(true);
  }, []);

  const exitPreviewMode = useCallback(async () => {
    console.log('[PreviewContext] Exiting preview mode - clearing ALL preview data');
    await AsyncStorage.removeItem(PREVIEW_MODE_KEY);
    await AsyncStorage.removeItem(PREVIEW_TOKEN_KEY);
    await AsyncStorage.removeItem(PREVIEW_PERSONS_KEY);
    await AsyncStorage.removeItem(PREVIEW_LINKS_KEY);
    setIsPreviewMode(false);
    setPreviewPersons([]);
    setPreviewLinks([]);
    setPreviewToken(null);
  }, []);

  const setPreviewData = useCallback(async (persons: Person[], links: FamilyLink[], token: string) => {
    console.log('[PreviewContext] Setting preview data:', persons.length, 'persons');
    await AsyncStorage.setItem(PREVIEW_TOKEN_KEY, token);
    await AsyncStorage.setItem(PREVIEW_PERSONS_KEY, JSON.stringify(persons));
    await AsyncStorage.setItem(PREVIEW_LINKS_KEY, JSON.stringify(links));
    setPreviewToken(token);
    setPreviewPersons(persons);
    setPreviewLinks(links);
  }, []);

  return (
    <PreviewContext.Provider
      value={{
        isPreviewMode,
        isLoading,
        previewPersons,
        previewLinks,
        previewToken,
        enterPreviewMode,
        exitPreviewMode,
        setPreviewData,
      }}
    >
      {children}
    </PreviewContext.Provider>
  );
}

export function usePreview() {
  const context = useContext(PreviewContext);
  if (context === undefined) {
    throw new Error('usePreview must be used within a PreviewProvider');
  }
  return context;
}

// Helper hook that returns preview persons if in preview mode, or empty array otherwise
export function usePreviewPersons(): Person[] {
  const { isPreviewMode, previewPersons } = usePreview();
  return isPreviewMode ? previewPersons : [];
}

// Helper hook that returns preview links if in preview mode, or empty array otherwise
export function usePreviewLinks(): FamilyLink[] {
  const { isPreviewMode, previewLinks } = usePreview();
  return isPreviewMode ? previewLinks : [];
}
