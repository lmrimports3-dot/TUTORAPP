/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppState, User, Persona } from '../types';

interface AppContextType {
  state: AppState;
  setState: (state: AppState) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  selectedPersona: Persona | null;
  setSelectedPersona: (persona: Persona | null) => void;
}

export const AppContext = React.createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = React.useState<AppState>('splash');
  const [user, setUser] = React.useState<User | null>(null);
  const [selectedPersona, setSelectedPersona] = React.useState<Persona | null>(null);

  return (
    <AppContext.Provider value={{ state, setState, user, setUser, selectedPersona, setSelectedPersona }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = React.useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
