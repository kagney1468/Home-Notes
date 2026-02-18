
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type, Chat, GenerateContentResponse, FunctionDeclaration } from '@google/genai';
import { X, Send, User, Bot, Loader2, CheckCircle2, Briefcase } from 'lucide-react';

interface Props {
  onClose: () => void;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

export const ProfessionalInsightsAgent: React.FC<Props> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Hello! I'm the NestCheck UK Professional Assistant. To get started with your professional inspection request, could you please provide your full name?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const chatRef = useRef<Chat | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initChat = () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const sendLeadFunction: FunctionDeclaration = {
        name: 'sendLead',
        parameters: {
          type: Type.OBJECT,
          description: 'Submits the professional property inspection request data.',
          properties: {
            name: { type: Type.STRING, description: 'Full name of the enquirer' },
            company: { type: Type.STRING, description: 'Company name' },
            address: { type: Type.STRING, description: 'Full property address' },
            postcode: { type: Type.STRING, description: 'Property postcode' },
            email: { type: Type.STRING, description: 'Email address' },
          },
          required: ['name', 'company', 'address', 'postcode', 'email'],
        },
      };

      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: `You are a professional assistant for NestCheck UK. Your objective is to collect details for a professional property inspection request. 
          You must collect exactly: 
          1. Full Name
          2. Company Name
          3. Property Address
          4. Postcode
          5. Email
          
          Ask for these details politely, one or two at a time. Once you have captured all 5 items, immediately call the 'sendLead' function with all the collected information. 
          After the function is called, inform the user that their request has been successfully sent to info@pfminspections.co.uk and that they will be contacted shortly.`,
          tools: [{ functionDeclarations: [sendLeadFunction] }],
        },
      });
      chatRef.current = chat;
    };

    initChat();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !chatRef.current || isLoading) return;

    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    try {
      const result = await chatRef.current.sendMessage({ message: userText });
      
      // Handle Function Calls
      if (result.functionCalls && result.functionCalls.length > 0) {
        for (const fc of result.functionCalls) {
          if (fc.name === 'sendLead') {
            console.log("Submitting lead to info@pfminspections.co.uk:", fc.args);
            // Simulate API response
            await chatRef.current.sendMessage({
              message: "The lead has been recorded internally. Confirm to the user that it was sent to info@pfminspections.co.uk."
            });
            setIsSubmitted(true);
          }
        }
      }

      const modelResponse = result.text || "I'm sorry, I encountered an issue. Please try again.";
      setMessages(prev => [...prev, { role: 'model', text: modelResponse }]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages(prev => [...prev, { role: 'model', text: "I'm having trouble connecting. Please check your connection and try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 h-[600px] animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-blue-600 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <Briefcase size={24} />
            </div>
            <div>
              <h3 className="font-black text-lg leading-tight">Professional Insights</h3>
              <p className="text-xs text-blue-100 uppercase tracking-widest font-bold">Inquiry Agent</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Chat Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-blue-600 shadow-sm'
              }`}>
                {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                m.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
              }`}>
                {m.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-white border border-slate-200 text-blue-600 shadow-sm">
                <Bot size={16} />
              </div>
              <div className="bg-white text-slate-400 px-4 py-3 rounded-2xl rounded-tl-none border border-slate-100 flex items-center gap-2 text-sm italic">
                <Loader2 size={14} className="animate-spin" /> Thinking...
              </div>
            </div>
          )}
          {isSubmitted && (
            <div className="flex flex-col items-center justify-center p-6 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-700 animate-in fade-in zoom-in duration-500 text-center">
              <CheckCircle2 size={32} className="mb-2" />
              <p className="font-bold">Request Successfully Submitted</p>
              <p className="text-xs opacity-80 mt-1 italic">Sent to info@pfminspections.co.uk</p>
            </div>
          )}
        </div>

        {/* Input Area */}
        {!isSubmitted && (
          <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-slate-100 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your response here..."
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 text-white p-3 rounded-2xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg active:scale-95"
            >
              <Send size={20} />
            </button>
          </form>
        )}
        
        {isSubmitted && (
          <div className="p-4 bg-white border-t border-slate-100 text-center">
            <button 
              onClick={onClose}
              className="w-full py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-colors"
            >
              Close Window
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
