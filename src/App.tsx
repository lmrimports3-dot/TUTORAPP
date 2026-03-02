/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  User as UserIcon, 
  ArrowRight, 
  LogOut, 
  ChevronLeft,
  Sparkles
} from 'lucide-react';
import { PERSONAS } from './constants';
import { User, Persona, Message } from './types';
import { AIService } from './services/aiService';
import { AppProvider, useApp } from './app/AppProvider';
import { ChatWindow } from './components/ChatWindow';
import { cn } from './utils';

function AppContent() {
  const { state, setState, user, setUser, selectedPersona, setSelectedPersona } = useApp();
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [isTyping, setIsTyping] = React.useState(false);

  React.useEffect(() => {
    if (state === 'splash') {
      const timer = setTimeout(() => setState('login'), 2500);
      return () => clearTimeout(timer);
    }
  }, [state, setState]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setUser({ id: '1', name: 'Student', email: 'student@example.com', hasCompletedOnboarding: false });
    setState('onboarding');
  };

  const handleSelectPersona = (persona: Persona) => {
    setSelectedPersona(persona);
    setState('chat');
    setMessages([{ id: '1', role: 'model', content: `Hi! I'm ${persona.name}, your ${persona.role}.`, timestamp: Date.now() }]);
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedPersona || isTyping) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const response = await AIService.generateResponse(selectedPersona.systemInstruction, messages, content);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', content: response, timestamp: Date.now() }]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans">
      <AnimatePresence mode="wait">
        {state === 'splash' && (
          <motion.div key="splash" exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-indigo-600 text-white">
            <BookOpen size={80} className="mb-6" />
            <h1 className="text-4xl font-bold tracking-tighter">EduAI</h1>
          </motion.div>
        )}

        {state === 'login' && (
          <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex min-h-screen items-center justify-center p-6">
            <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl">
              <UserIcon size={32} className="mx-auto mb-4 text-indigo-600" />
              <h2 className="text-3xl font-bold text-center mb-8">Welcome back</h2>
              <form onSubmit={handleLogin} className="space-y-4">
                <input type="email" placeholder="Email" className="w-full px-4 py-3 rounded-xl border" />
                <input type="password" placeholder="Password" className="w-full px-4 py-3 rounded-xl border" />
                <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold">Sign In</button>
              </form>
            </div>
          </motion.div>
        )}

        {state === 'onboarding' && (
          <motion.div key="onboarding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex min-h-screen items-center justify-center p-6 bg-indigo-50">
            <div className="max-w-2xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl flex">
              <div className="w-1/2 bg-indigo-600 p-12 text-white">
                <Sparkles size={48} className="mb-6" />
                <h2 className="text-4xl font-bold mb-4">Master any subject.</h2>
              </div>
              <div className="w-1/2 p-12">
                <button onClick={() => setState('tutor-selection')} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2">
                  Get Started <ArrowRight size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {state === 'tutor-selection' && (
          <motion.div key="tutors" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto px-6 py-12">
            <h2 className="text-4xl font-bold text-center mb-12">Choose Your Tutor</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {PERSONAS.map((p) => (
                <div key={p.id} onClick={() => handleSelectPersona(p)} className="bg-white rounded-3xl p-8 shadow-xl cursor-pointer hover:scale-105 transition-transform">
                  <img src={p.avatar} alt={p.name} className={cn("w-24 h-24 rounded-full mx-auto mb-6 p-1", p.color)} referrerPolicy="no-referrer" />
                  <h3 className="text-2xl font-bold text-center">{p.name}</h3>
                  <p className="text-indigo-600 text-center text-sm">{p.role}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {state === 'chat' && selectedPersona && (
          <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-screen">
            <header className="px-6 py-4 border-b flex items-center justify-between bg-white">
              <div className="flex items-center gap-4">
                <button onClick={() => setState('tutor-selection')}><ChevronLeft size={24} /></button>
                <h3 className="font-bold">{selectedPersona.name}</h3>
              </div>
              <button onClick={() => setState('login')}><LogOut size={20} /></button>
            </header>
            <ChatWindow 
              messages={messages} 
              isTyping={isTyping} 
              onSendMessage={handleSendMessage} 
              placeholder={`Ask ${selectedPersona.name} anything...`}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
