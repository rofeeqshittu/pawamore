import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Loader2, Bot, User, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatStartDetail {
  message: string;
  context?: Record<string, unknown>;
}

const LiveChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [pendingStart, setPendingStart] = useState<ChatStartDetail | null>(null);
  const [guestId] = useState(() => `guest_${Date.now()}_${Math.random().toString(36).slice(2)}`);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  // Add welcome message when chat opens for first time
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: "welcome",
        role: "assistant",
        content: "👋 Welcome to PawaMore! I'm here to help you take control of your electricity.\n\nWhether you're looking to **escape the frustration of constant power cuts** or you want to start **turning your electricity bills into an investment that pays you back** — I've got you covered.\n\nHow can I help you today?\n- 💡 Find the right solar or battery solution for your home/business\n- 📦 Track an order or check delivery status\n- 🔧 Learn about installation & maintenance\n- 💰 Calculate how much you could save with solar",
        timestamp: new Date(),
      }]);
    }
  }, [isOpen, messages.length]);

  const sendMessage = useCallback(
    async (overrideMessage?: string, context?: Record<string, unknown>) => {
      const contentToSend = (overrideMessage ?? input).trim();
      if (!contentToSend || isLoading) return;

      const userMessage: Message = {
        id: `user_${Date.now()}`,
        role: "user",
        content: contentToSend,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      if (!overrideMessage) {
        setInput("");
      }
      setIsLoading(true);

      try {
        const { data, error } = await supabase.functions.invoke("ai-support-chat", {
          body: {
            message: userMessage.content,
            conversation_id: conversationId,
            guest_id: user ? null : guestId,
            context: context ?? null,
          },
        });

        if (error) throw error;

        if (data.conversation_id && !conversationId) {
          setConversationId(data.conversation_id);
        }

        const assistantMessage: Message = {
          id: `assistant_${Date.now()}`,
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (error) {
        console.error("Chat error:", error);
        setMessages((prev) => [
          ...prev,
          {
            id: `error_${Date.now()}`,
            role: "assistant",
            content:
              "I'm sorry, I'm having trouble connecting right now. Please try again or [contact our support team](/contact) directly.",
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading, conversationId, user, guestId]
  );

  useEffect(() => {
    const handleStart = (event: Event) => {
      const customEvent = event as CustomEvent<ChatStartDetail>;
      const detail = customEvent.detail;

      if (!detail?.message?.trim()) return;

      setIsOpen(true);
      setIsMinimized(false);
      setPendingStart({
        message: detail.message.trim(),
        context: detail.context,
      });
    };

    window.addEventListener("pawamore-chat:start", handleStart);
    return () => window.removeEventListener("pawamore-chat:start", handleStart);
  }, []);

  useEffect(() => {
    if (!pendingStart || isLoading || !isOpen || isMinimized) return;
    void sendMessage(pendingStart.message, pendingStart.context);
    setPendingStart(null);
  }, [pendingStart, isLoading, isOpen, isMinimized, sendMessage]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <AnimatePresence mode="wait">
        {!isOpen && (
          <motion.div
            key="chat-button"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              size="lg"
              className="rounded-full w-14 h-14 shadow-lg bg-primary hover:bg-primary/90"
            >
              <MessageCircle className="w-6 h-6" />
            </Button>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            key="chat-window"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? "auto" : "500px",
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-48px)] bg-card rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">PawaMore Support</h3>
                  <p className="text-xs text-primary-foreground/70">Typically replies instantly</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
                  onClick={() => setIsMinimized(!isMinimized)}
                >
                  <Minimize2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            {!isMinimized && (
              <>
                <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        {message.role === "assistant" && (
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Bot className="w-4 h-4 text-primary" />
                          </div>
                        )}
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-foreground"
                          }`}
                        >
                          <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-ul:my-1">
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                          </div>
                          <span className={`text-[10px] mt-1 block ${
                            message.role === "user" ? "text-primary-foreground/60" : "text-muted-foreground"
                          }`}>
                            {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        {message.role === "user" && (
                          <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-accent-foreground" />
                          </div>
                        )}
                      </motion.div>
                    ))}
                    {isLoading && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex gap-2 items-center"
                      >
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                          <Bot className="w-4 h-4 text-primary" />
                        </div>
                        <div className="bg-muted rounded-2xl px-4 py-3">
                          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        </div>
                      </motion.div>
                    )}
                  </div>
                </ScrollArea>

                {/* Input */}
                <div className="p-3 border-t border-border">
                  <div className="flex gap-2">
                    <Input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      disabled={isLoading}
                      className="flex-1"
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!input.trim() || isLoading}
                      size="icon"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground text-center mt-2">
                    Powered by AI • {user ? "Logged in" : "Guest mode"}
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LiveChat;
