// stores/ai-session-store.ts
import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { aiSessionApi, aiAssistantApi } from "@/lib/api"

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  sessionId: string;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

interface SessionState {
  // Current session data
  currentSessionId: string | null;
  currentSession: {} | null;
  currentMessages: ChatMessage[];
  sessions: ChatSession[];
  
  // Loading states
  isLoading: boolean;
  isSessionLoading: boolean;
  isSessionsLoading: boolean;
  
  // Actions
  createNewSession: (title?: string) => Promise<string>;
  loadSession: (sessionId: string) => Promise<void>;
  // sendMessage: (content: string) => Promise<void>;
  loadAllSessions: () => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  updateSessionTitle: (sessionId: string, title: string) => Promise<void>;
  
  // Setters
  setLoading: (isLoading: boolean) => void;
  setMessagesLoading: (isLoading: boolean) => void;
  setSessionsLoading: (isLoading: boolean) => void;
  clearCurrentSession: () => void;
}

export const useSessionStore = create<SessionState>()(
  devtools(
    (set, get) => ({
      // Initial state
      currentSessionId: null,
      currentMessages: [],
      sessions: [],
      isLoading: false,
      isMessagesLoading: false,
      isSessionsLoading: false,

      // Create new session
      createNewSession: async (title = "New Chat") => {
        try {
          set({ isLoading: true });
          
          // Call backend to create session
          const newSession = await aiSessionApi.createAISession(title);

          console.log("newSession", newSession);
          
          // Add to sessions list
          const currentSessions = get().sessions;
          set({ 
            sessions: [newSession, ...currentSessions],
            currentSessionId: newSession._id,
            currentMessages: [],
            isLoading: false 
          });
          
          return newSession.id;
        } catch (error) {
          console.error('Failed to create session:', error);
          set({ isLoading: false });
          throw error;
        }
      },
      
      loadSession: async (sessionId: string) => {
        try {
          set({ isSessionLoading: true });
          
          const messages = await aiSessionApi.getSession(sessionId);
          set({ 
            currentSessionId: sessionId,
            currentMessages: messages,
            isSessionLoading: false 
          });
        } catch (error) {
          console.error('Failed to load session:', error);
          set({ isSessionLoading: false });
          throw error;
        }
      },

      // Send message in current session
      // sendMessage: async (content: string) => {
      //   const { currentSessionId, currentMessages } = get();
        
      //   if (!currentSessionId) {
      //     throw new Error('No active session');
      //   }

      //   try {
      //     set({ isLoading: true });

      //     // Add user message optimistically
      //     const userMessage: ChatMessage = {
      //       id: Date.now().toString(),
      //       content,
      //       role: 'user',
      //       timestamp: new Date().toISOString(),
      //       sessionId: currentSessionId
      //     };

      //     set({ 
      //       currentMessages: [...currentMessages, userMessage]
      //     });

      //     // Send to backend
      //     // const response = await aiAssistantApi.chatWithAI({
      //     //   message: content,
      //     //   sessionId: currentSessionId
      //     // });

      //     // Add AI response
      //     // const aiMessage: ChatMessage = {
      //     //   id: response.id,
      //     //   content: response.content,
      //     //   role: 'assistant',
      //     //   timestamp: response.timestamp,
      //     //   sessionId: currentSessionId
      //     // };

      //     set({ 
      //       // currentMessages: [...get().currentMessages, aiMessage],
      //       isLoading: false 
      //     });

      //   } catch (error) {
      //     console.error('Failed to send message:', error);
      //     set({ isLoading: false });
      //     throw error;
      //   }
      // },

      // Load all user sessions
      loadAllSessions: async () => {
        try {
          set({ isSessionsLoading: true });
          
          const sessions = await aiSessionApi.getAllSessions();
          
          set({ 
            sessions,
            isSessionsLoading: false 
          });
        } catch (error) {
          console.error('Failed to load sessions:', error);
          set({ isSessionsLoading: false });
          throw error;
        }
      },

      // Delete session
      deleteSession: async (sessionId: string) => {
        try {
          await aiSessionApi.deleteSession(sessionId);
          
          const currentSessions = get().sessions;
          const updatedSessions = currentSessions.filter(s => s.id !== sessionId);
          
          set({ 
            sessions: updatedSessions,
            ...(get().currentSessionId === sessionId && {
              currentSessionId: null,
              currentMessages: []
            })
          });
        } catch (error) {
          console.error('Failed to delete session:', error);
          throw error;
        }
      },

      // Update session title
      updateSessionTitle: async (sessionId: string, title: string) => {
        try {
          await aiSessionApi.updateSessionTitle(sessionId, title);
          
          const currentSessions = get().sessions;
          const updatedSessions = currentSessions.map(session =>
            session.id === sessionId ? { ...session, title } : session
          );
          
          set({ sessions: updatedSessions });
        } catch (error) {
          console.error('Failed to update session title:', error);
          throw error;
        }
      },

      // Utility setters
      setLoading: (isLoading: boolean) => set({ isLoading }),
      setMessagesLoading: (isMessagesLoading: boolean) => set({ isMessagesLoading }),
      setSessionsLoading: (isSessionsLoading: boolean) => set({ isSessionsLoading }),
      clearCurrentSession: () => set({ currentSessionId: null, currentMessages: [] }),
    }),
    {
      name: "session-store",
    }
  )
);