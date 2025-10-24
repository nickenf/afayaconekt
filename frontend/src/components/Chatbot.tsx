import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types/index.ts';
import { getChatbotResponse } from '../services/api.ts';

const ChatIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 md:w-8 md:h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
    </svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 md:w-8 md:h-8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);


export const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'model', text: 'Hello! How can I help you plan your medical journey to India today?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages, isLoading]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', text: input.trim() };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const responseText = await getChatbotResponse(input.trim());
            const modelMessage: ChatMessage = { role: 'model', text: responseText };
            setMessages(prev => [...prev, modelMessage]);

        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage: ChatMessage = { role: 'model', text: "Sorry, I'm having trouble connecting right now. Please try again later." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-[100]">
            {isOpen && (
                <div className="bg-white w-[calc(100vw-2rem)] h-[70vh] md:w-96 md:h-[32rem] rounded-xl shadow-2xl flex flex-col transition-all duration-300 ease-in-out border border-gray-200">
                    <header className="bg-primary text-white p-4 rounded-t-xl flex justify-between items-center">
                        <h3 className="font-bold text-lg">AfyaConnect Assistant</h3>
                    </header>
                    <div className="flex-grow p-4 overflow-y-auto bg-gray-50">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-4 chat-message`}>
                                <div className={`max-w-xs px-4 py-2 rounded-2xl shadow-sm ${msg.role === 'user' ? 'bg-secondary text-white rounded-br-none' : 'bg-white text-dark rounded-bl-none'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                             <div className="flex justify-start mb-3 chat-message">
                                 <div className="max-w-xs px-4 py-3 rounded-2xl rounded-bl-none bg-white text-dark shadow-sm">
                                     <div className="flex items-center space-x-2">
                                         <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse-dot"></span>
                                         <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse-dot" style={{animationDelay: '0.2s'}}></span>
                                         <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse-dot" style={{animationDelay: '0.4s'}}></span>
                                     </div>
                                 </div>
                             </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <form onSubmit={handleSend} className="p-4 border-t bg-white rounded-b-xl">
                        <div className="flex">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask a question..."
                                className="flex-grow border rounded-l-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                disabled={isLoading}
                                aria-label="Chat input"
                            />
                            <button type="submit" className="bg-primary text-white font-bold px-4 rounded-r-lg hover:bg-blue-800 transition disabled:bg-gray-400" disabled={isLoading || !input.trim()}>
                                Send
                            </button>
                        </div>
                    </form>
                </div>
            )}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-primary text-white w-14 h-14 md:w-16 md:h-16 rounded-full shadow-lg flex items-center justify-center hover:bg-blue-800 transition transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-300"
                aria-label="Toggle chat"
            >
                {isOpen ? <CloseIcon /> : <ChatIcon />}
            </button>
        </div>
    );
};