import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  User, 
  BookOpen, 
  ArrowRight, 
  LogOut, 
  Send, 
  Mic, 
  ChevronLeft,
  Sparkles
} from 'lucide-react';
import { PERSONAS } from './constants';
import { AppState, User as UserType, Persona, Message } from './types';
import { getChatResponse } from './services/ai';
import { cn } from './utils';
import ReactMarkdown from 'react-markdown';

export default function App() {
  const [appState, setAppState] = React.useState<AppState>('splash');
  const [user, setUser] = React.useState<UserType | null>(null);
  const [selectedPersona, setSelectedPersona] = React.useState<Persona | null>(null);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState('');
  const [isTyping, setIsTyping] = React.useState(false);

  // Splash Screen Effect
  React.useEffect(() => {
    if (appState === 'splash') {
      const timer = setTimeout(() => {
        setAppState('login');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [appState]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const mockUser: UserType = {
      id: '1',
      name: 'Student',
      email: 'student@example.com',
      hasCompletedOnboarding: false
    };
    setUser(mockUser);
    setAppState('onboarding');
  };

  const handleOnboardingComplete = () => {
    setAppState('tutor-selection');
  };

  const handleSelectPersona = (persona: Persona) => {
    setSelectedPersona(persona);
    setAppState('chat');
    setMessages([
      {
        id: '1',
        role: 'model',
        content: `Hi! I'm ${persona.name}, your ${persona.role}. What would you like to learn today?`,
        timestamp: Date.now()
      }
    ]);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedPersona || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await getChatResponse(
        'gemini-3-flash-preview',
        selectedPersona.systemInstruction,
        messages,
        input
      );

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: response,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans selection:bg-indigo-100">
      <AnimatePresence mode="wait">
        {appState === 'splash' && (
          <motion.div
            key="splash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-indigo-600 text-white"
          >
            <motion.div
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="mb-6"
            >
              <BookOpen size={80} className="text-white" />
            </motion.div>
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-bold tracking-tighter"
            >
              EduAI
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              transition={{ delay: 0.4 }}
              className="mt-2 text-indigo-100 font-medium"
            >
              Your Personal AI Tutor
            </motion.p>
          </motion.div>
        )}

        {appState === 'login' && (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex min-h-screen items-center justify-center p-6"
          >
            <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-3xl shadow-xl shadow-indigo-100 border border-indigo-50">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 text-white mb-4">
                  <User size={32} />
                </div>
                <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
                <p className="mt-2 text-neutral-500">Sign in to continue your learning journey</p>
              </div>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                >
                  Sign In
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {appState === 'onboarding' && (
          <motion.div
            key="onboarding"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex min-h-screen items-center justify-center p-6 bg-indigo-50"
          >
            <div className="max-w-2xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
              <div className="md:w-1/2 bg-indigo-600 p-12 text-white flex flex-col justify-center">
                <Sparkles size={48} className="mb-6" />
                <h2 className="text-4xl font-bold leading-tight mb-4">Master any subject with AI.</h2>
                <p className="text-indigo-100 text-lg">Personalized tutors, real-time feedback, and a curriculum built just for you.</p>
              </div>
              <div className="md:w-1/2 p-12 flex flex-col justify-center">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 font-bold">1</div>
                    <p className="text-neutral-600 font-medium">Choose a specialized AI tutor that matches your learning style.</p>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 font-bold">2</div>
                    <p className="text-neutral-600 font-medium">Chat naturally to ask questions, solve problems, or practice skills.</p>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 font-bold">3</div>
                    <p className="text-neutral-600 font-medium">Track your progress and unlock new learning paths.</p>
                  </div>
                </div>
                <button
                  onClick={handleOnboardingComplete}
                  className="mt-12 w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 group"
                >
                  Get Started
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {appState === 'tutor-selection' && (
          <motion.div
            key="tutors"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="max-w-5xl mx-auto px-6 py-12"
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold tracking-tight mb-4">Choose Your Tutor</h2>
              <p className="text-neutral-500 text-lg">Each tutor has a unique personality and area of expertise.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {PERSONAS.map((persona) => (
                <motion.div
                  key={persona.id}
                  whileHover={{ y: -8 }}
                  className="bg-white rounded-3xl p-8 shadow-xl shadow-neutral-200/50 border border-neutral-100 flex flex-col items-center text-center cursor-pointer group"
                  onClick={() => handleSelectPersona(persona)}
                >
                  <div className={cn("w-24 h-24 rounded-full mb-6 p-1", persona.color)}>
                    <img 
                      src={persona.avatar} 
                      alt={persona.name} 
                      className="w-full h-full rounded-full object-cover border-4 border-white"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <h3 className="text-2xl font-bold mb-1">{persona.name}</h3>
                  <p className="text-indigo-600 font-semibold text-sm mb-4">{persona.role}</p>
                  <p className="text-neutral-500 text-sm leading-relaxed mb-8">{persona.description}</p>
                  <button className="mt-auto w-full py-3 rounded-xl bg-neutral-50 text-neutral-900 font-bold group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    Select {persona.name}
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {appState === 'chat' && selectedPersona && (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col h-screen bg-white"
          >
            {/* Chat Header */}
            <header className="px-6 py-4 border-bottom border-neutral-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setAppState('tutor-selection')}
                  className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                >
                  <ChevronLeft size={24} />
                </button>
                <div className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-full p-0.5", selectedPersona.color)}>
                    <img 
                      src={selectedPersona.avatar} 
                      alt={selectedPersona.name} 
                      className="w-full h-full rounded-full object-cover border-2 border-white"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold leading-none">{selectedPersona.name}</h3>
                    <p className="text-xs text-neutral-500 mt-1">{selectedPersona.role}</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setAppState('login')}
                className="p-2 text-neutral-400 hover:text-red-500 transition-colors"
              >
                <LogOut size={20} />
              </button>
            </header>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex w-full",
                    msg.role === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl p-4 shadow-sm",
                      msg.role === 'user' 
                        ? "bg-indigo-600 text-white rounded-tr-none" 
                        : "bg-neutral-100 text-neutral-800 rounded-tl-none"
                    )}
                  >
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-neutral-100 rounded-2xl rounded-tl-none p-4 flex gap-1">
                    <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-neutral-100">
              <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex gap-3">
                <div className="relative flex-1">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={`Message ${selectedPersona.name}...`}
                    className="w-full bg-neutral-100 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-neutral-400 hover:text-indigo-600 transition-colors"
                  >
                    <Mic size={20} />
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="bg-indigo-600 text-white p-4 rounded-2xl hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-100"
                >
                  <Send size={24} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
