import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Loader2, Trash2 } from "lucide-react";
import { useChat } from "../context/ChatContext";
//import { useLanguage } from "../context/LanguageContext";
import { ChatMessage } from "../types";

const ChatBot: React.FC = () => {
  const { messages, isOpen, isLoading, toggleChat, askAssistant, clearChat } = useChat();
  //const { t } = useLanguage();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      const question = input.trim();
      setInput("");
      await askAssistant(question);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-bounce-gentle"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <>
          {/* Mobile backdrop */}
          <div
            className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={toggleChat}
          />

          <div className="fixed bottom-0 right-0 md:bottom-6 md:right-6 z-50 w-full h-full md:w-96 md:h-[32rem] bg-white md:rounded-2xl shadow-2xl flex flex-col animate-slide-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white p-4 md:rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-semibold">AI Асистент</h3>
                  <p className="text-sm opacity-90">Винаги готов да помогне</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={clearChat}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Изчисти историята"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button
                  onClick={toggleChat}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Затвори"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message: ChatMessage) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex items-start space-x-2 max-w-[80%] ${
                      message.isUser ? "flex-row-reverse space-x-reverse" : ""
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg ${
                        message.isUser
                          ? "bg-primary-500 text-white"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {message.isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div
                      className={`p-3 rounded-2xl ${
                        message.isUser
                          ? "bg-primary-500 text-white rounded-br-lg"
                          : "bg-gray-100 text-gray-800 rounded-bl-lg"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      {!message.isUser && (
                        <p className="text-xs opacity-70 mt-2 border-t border-gray-200 pt-2">
                          ⚠️ Това е общa информация. Консултирайте се с лекар.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-2">
                    <div className="bg-gray-100 p-2 rounded-lg">
                      <Bot className="w-4 h-4 text-gray-700" />
                    </div>
                    <div className="bg-gray-100 text-gray-800 p-3 rounded-2xl rounded-bl-lg">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Обмислям отговора...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-gray-200 p-4">
              <form onSubmit={handleSubmit} className="flex space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Задайте въпрос за лекарство..."
                  className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-all duration-200"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>

              {/* Quick Questions */}
              <div className="mt-3 flex flex-wrap gap-2">
                {["Каква е дозировката?", "Какви са страничните ефекти?", "Има ли алтернативи?"].map(
                  (question) => (
                    <button
                      key={question}
                      onClick={() => !isLoading && askAssistant(question)}
                      disabled={isLoading}
                      className="text-xs bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 px-3 py-1 rounded-full transition-colors"
                    >
                      {question}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ChatBot;
