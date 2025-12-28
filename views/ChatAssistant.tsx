import React, { useState, useRef, useEffect } from 'react';
import { Feature, ChatMessage, DomesticProvider } from '../types';
import { ArrowLeft, Send, Bot, User, Settings2, Sparkles, AlertCircle } from 'lucide-react';
import { chatWithDomesticAI, parseStream } from '../utils/domestic_ai';

interface ChatAssistantProps {
  feature: Feature;
  onBack: () => void;
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({ feature, onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: '你好！我是你的 AI 灵感助手。我可以帮你生成专业的图像提示词，或者解答摄影与修图的问题。请问有什么可以帮你的？',
      timestamp: Date.now()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [provider, setProvider] = useState<DomesticProvider>('deepseek');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKey, setApiKey] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load API Key from localStorage on mount
  useEffect(() => {
    // Special handling for unified Zhipu key
    const keyName = provider === 'zhipu' ? 'apikey_zhipu' : `apikey_${provider}`;
    const storedKey = localStorage.getItem(keyName);
    
    if (storedKey) setApiKey(storedKey);
    else setApiKey(''); // Reset if not found
  }, [provider]);

  // Save API Key
  const saveApiKey = (key: string) => {
    const keyName = provider === 'zhipu' ? 'apikey_zhipu' : `apikey_${provider}`;
    localStorage.setItem(keyName, key);
    setApiKey(key);
    setShowApiKeyModal(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    
    if (!apiKey) {
      setShowApiKeyModal(true);
      return;
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const stream = await chatWithDomesticAI([...messages, userMsg], provider, apiKey);
      
      if (!stream) throw new Error("No response stream");

      const botMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, {
        id: botMsgId,
        role: 'assistant',
        content: '',
        timestamp: Date.now()
      }]);

      let fullContent = "";
      
      for await (const chunk of parseStream(stream)) {
        fullContent += chunk;
        setMessages(prev => prev.map(msg => 
          msg.id === botMsgId ? { ...msg, content: fullContent } : msg
        ));
      }

    } catch (error: any) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `❌ 请求失败: ${error.message || '请检查 API Key 是否正确'}`,
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const getProviderName = (p: DomesticProvider) => {
      switch(p) {
          case 'deepseek': return 'DeepSeek-V3';
          case 'moonshot': return 'Kimi (Moonshot)';
          case 'zhipu': return '智谱 GLM-4';
          default: return p;
      }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-white animate-fade-in relative max-w-7xl mx-auto border-x border-slate-800/50">
      
      {/* Header */}
      <div className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50 p-4 flex items-center justify-between">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-800 transition-colors flex items-center gap-2">
          <ArrowLeft className="w-6 h-6" />
          <span className="hidden md:inline text-sm">返回</span>
        </button>
        <div className="flex flex-col items-center">
          <h2 className="font-semibold text-lg">{feature.title}</h2>
          <div className="flex items-center gap-1 text-xs text-emerald-400">
             <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
             {getProviderName(provider)}
          </div>
        </div>
        <button 
          onClick={() => setShowApiKeyModal(true)}
          className="p-2 rounded-full hover:bg-slate-800 transition-colors"
        >
          <Settings2 className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 pb-24">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[85%] md:max-w-[70%] gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-indigo-500' : 'bg-emerald-600'}`}>
                {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none shadow-lg shadow-indigo-900/20' 
                  : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700 shadow-lg'
              }`}>
                {msg.content}
                {msg.role === 'assistant' && msg.content === '' && (
                  <span className="inline-block w-2 h-4 bg-emerald-400 animate-pulse ml-1" />
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="fixed bottom-0 right-0 left-0 md:left-64 p-4 bg-slate-900/90 backdrop-blur-lg border-t border-slate-800 z-40">
        <div className="max-w-4xl mx-auto relative flex items-center gap-2">
          {/* Model Switcher */}
          <div className="relative group">
             <button className="p-3 bg-slate-800 rounded-full border border-slate-700 hover:border-emerald-500 transition-colors">
                <Sparkles className="w-5 h-5 text-emerald-400" />
             </button>
             {/* Tooltip/Menu */}
             <div className="absolute bottom-full left-0 mb-2 w-40 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <button 
                  onClick={() => setProvider('deepseek')}
                  className={`w-full text-left px-4 py-3 text-xs hover:bg-slate-700 border-b border-slate-700/50 ${provider === 'deepseek' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
                >
                  DeepSeek
                </button>
                <button 
                  onClick={() => setProvider('moonshot')}
                  className={`w-full text-left px-4 py-3 text-xs hover:bg-slate-700 border-b border-slate-700/50 ${provider === 'moonshot' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
                >
                  Kimi (Moonshot)
                </button>
                <button 
                  onClick={() => setProvider('zhipu')}
                  className={`w-full text-left px-4 py-3 text-xs hover:bg-slate-700 ${provider === 'zhipu' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
                >
                  智谱 GLM-4
                </button>
             </div>
          </div>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={`问 ${getProviderName(provider)}...`}
            className="flex-1 bg-slate-800 text-white border border-slate-700 rounded-full px-5 py-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-inner"
            disabled={isLoading}
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !inputText.trim()}
            className="p-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 rounded-full transition-colors text-white shadow-lg shadow-emerald-900/20"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* API Key Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-sm border border-slate-700 shadow-2xl">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-emerald-400" />
              配置 API Key
            </h3>
            <p className="text-sm text-slate-400 mb-4">
              您当前选择了 <strong>{getProviderName(provider)}</strong> 模型。
              请输入对应的 API Key 以继续使用。
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1 block">
                   {getProviderName(provider)} API Key
                </label>
                <input 
                  type="password" 
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={provider === 'zhipu' ? "Key (格式: id.secret)" : "sk-..."}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none"
                />
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowApiKeyModal(false)}
                  className="flex-1 py-2 text-slate-400 hover:text-white"
                >
                  取消
                </button>
                <button 
                  onClick={() => saveApiKey(apiKey)}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium"
                >
                  保存
                </button>
              </div>
            </div>
            
            <div className="mt-4 flex items-start gap-2 text-xs text-slate-500 bg-slate-900/50 p-3 rounded-lg">
               <AlertCircle className="w-4 h-4 flex-shrink-0" />
               <p>Key 仅存储在您的本地浏览器中，不会发送到我们的服务器。请确保您有该服务的有效配额。</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};