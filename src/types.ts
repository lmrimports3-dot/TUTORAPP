export interface Persona {
  id: string;
  name: string;
  role: string;
  description: string;
  avatar: string;
  systemInstruction: string;
  color: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  hasCompletedOnboarding: boolean;
}

export type AppState = 'splash' | 'login' | 'onboarding' | 'tutor-selection' | 'chat';
