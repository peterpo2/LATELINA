import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { ChatMessage } from "../types";

interface ChatContextType {
  messages: ChatMessage[];
  isOpen: boolean;
  isLoading: boolean;
  addMessage: (content: string, isUser: boolean, productId?: number) => void;
  toggleChat: () => void;
  setIsOpen: (open: boolean) => void;
  askAssistant: (question: string, productId?: number) => Promise<void>;
  clearChat: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// 🔑 Get API base from environment
const RAW_API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_URL_DOCKER ||
  "http://localhost:8080/api";

const API_BASE = RAW_API_BASE.replace(/\/+$/, "");

const buildUrl = (path: string) => `${API_BASE}/${path.replace(/^\/+/, "")}`;

export const ChatProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      content:
        "Здравейте! Аз съм вашият AI асистент за лекарства. Как мога да ви помогна днес?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load history when chat is opened
  useEffect(() => {
    if (isOpen) {
      (async () => {
        try {
          const res = await fetch(buildUrl("assistant/history"));
          if (!res.ok) return;
          const history: ChatMessage[] = await res.json();
          if (history.length > 0) {
            setMessages(history);
          }
        } catch (err) {
          console.error("⚠️ Failed to load chat history", err);
        }
      })();
    }
  }, [isOpen]);

  const addMessage = (
    content: string,
    isUser: boolean,
    productId?: number
  ) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      isUser,
      timestamp: new Date(),
      productId,
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const askAssistant = async (question: string, productId?: number) => {
    setIsLoading(true);
    addMessage(question, true, productId);

    try {
      const res = await fetch(buildUrl("assistant/ask"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          productId ? { question, productId } : { question }
        ),
      });

      if (!res.ok) throw new Error("❌ Failed to contact AI service");

      const data = await res.json();
      addMessage(
        data.answer ?? "⚠️ AI did not return an answer.",
        false,
        productId
      );
    } catch (err) {
      console.error("Assistant error:", err);
      addMessage(
        "⚠️ Error: Could not connect to assistant.",
        false,
        productId
      );
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = async () => {
    try {
      await fetch(buildUrl("assistant/history"), { method: "DELETE" });
      setMessages([
        {
          id: "welcome",
          content:
            "Историята беше изчистена. Здравейте! Как мога да ви помогна днес?",
          isUser: false,
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
      console.error("⚠️ Failed to clear chat history", err);
    }
  };

  const toggleChat = () => setIsOpen((prev) => !prev);

  return (
    <ChatContext.Provider
      value={{
        messages,
        isOpen,
        isLoading,
        addMessage,
        toggleChat,
        setIsOpen,
        askAssistant,
        clearChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

// ✅ Named export for hook
export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
