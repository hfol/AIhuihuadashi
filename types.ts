import { LucideIcon } from 'lucide-react';

export interface StyleOption {
  id: string;
  name: string;
  prompt: string;
}

export interface Feature {
  id: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  color: string; // Gradient class
  description: string;
  demoBeforeUrl?: string;
  demoAfterUrl?: string;
  isChat?: boolean; // New flag to distinguish chat features
  isVideo?: boolean; // New flag to distinguish video generation features
  requiresInputImage?: boolean; // If false, it's a Text-to-Image feature
  styles?: StyleOption[]; // Optional list of sub-styles
}

export interface ShowcaseItem {
  id: string;
  title: string;
  beforeUrl: string;
  afterUrl: string;
}

export type ViewState = 'HOME' | 'PROCESSOR' | 'CHAT';

export interface ProcessingState {
  isProcessing: boolean;
  progress: number;
  resultUrl: string | null;
  originalUrl: string | null;
  isSampleMode: boolean; // Track if we are using a real demo pair vs user upload simulation
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export type DomesticProvider = 'deepseek' | 'moonshot' | 'zhipu';

export type ImageModelProvider = 'gemini' | 'siliconflow' | 'zhipu';