import React, { useState, useEffect } from 'react';
import { X, Save, Key, MessageSquare, Image } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [keys, setKeys] = useState({
    deepseek: '',
    moonshot: '',
    siliconflow: '',
    zhipu: ''
  });
  const [activeTab, setActiveTab] = useState<'chat' | 'image'>('chat');

  useEffect(() => {
    if (isOpen) {
      setKeys({
        deepseek: localStorage.getItem('apikey_deepseek') || '',
        moonshot: localStorage.getItem('apikey_moonshot') || '',
        siliconflow: localStorage.getItem('apikey_image_siliconflow') || '',
        // Unified key for Zhipu (used for both image and chat)
        zhipu: localStorage.getItem('apikey_zhipu') || localStorage.getItem('apikey_image_zhipu') || ''
      });
    }
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem('apikey_deepseek', keys.deepseek);
    localStorage.setItem('apikey_moonshot', keys.moonshot);
    localStorage.setItem('apikey_image_siliconflow', keys.siliconflow);
    // Save to unified key
    localStorage.setItem('apikey_zhipu', keys.zhipu);
    // Also update legacy key for compatibility just in case, or cleanup
    localStorage.removeItem('apikey_image_zhipu'); 
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-slate-800 rounded-2xl w-full max-w-md border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
            <h2 className="font-bold text-lg text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-purple-400" />
                API 配置中心
            </h2>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-700 transition-colors">
                <X className="w-5 h-5 text-slate-400" />
            </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700">
            <button 
                onClick={() => setActiveTab('chat')}
                className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                    activeTab === 'chat' 
                    ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-400/5' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
            >
                <MessageSquare className="w-4 h-4" />
                对话模型
            </button>
            <button 
                onClick={() => setActiveTab('image')}
                className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                    activeTab === 'image' 
                    ? 'text-orange-400 border-b-2 border-orange-400 bg-orange-400/5' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
            >
                <Image className="w-4 h-4" />
                绘画模型
            </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
            {activeTab === 'chat' && (
                <div className="space-y-5 animate-fade-in">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">DeepSeek API Key</label>
                        <input 
                            type="password" 
                            value={keys.deepseek}
                            onChange={(e) => setKeys({...keys, deepseek: e.target.value})}
                            placeholder="sk-..."
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-600"
                        />
                        <p className="text-[10px] text-slate-500 mt-2">用于 DeepSeek-V3 对话模型。</p>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Moonshot (Kimi) API Key</label>
                        <input 
                            type="password" 
                            value={keys.moonshot}
                            onChange={(e) => setKeys({...keys, moonshot: e.target.value})}
                            placeholder="sk-..."
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600"
                        />
                        <p className="text-[10px] text-slate-500 mt-2">用于 Moonshot-v1 (Kimi) 对话模型。</p>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">智谱 AI (GLM-4) Key</label>
                        <input 
                            type="password" 
                            value={keys.zhipu}
                            onChange={(e) => setKeys({...keys, zhipu: e.target.value})}
                            placeholder="请输入 Key (格式: id.secret)"
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-600"
                        />
                        <p className="text-[10px] text-slate-500 mt-2">通用 Key，支持 GLM-4 对话和 CogView 绘画。</p>
                    </div>
                </div>
            )}

            {activeTab === 'image' && (
                <div className="space-y-5 animate-fade-in">
                    
                    {/* Zhipu AI */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">智谱 AI (CogView) Key</label>
                        <input 
                            type="password" 
                            value={keys.zhipu}
                            onChange={(e) => setKeys({...keys, zhipu: e.target.value})}
                            placeholder="请输入 Key (格式: id.secret)"
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-600"
                        />
                         <p className="text-[10px] text-slate-500 mt-2">通用 Key，支持 CogView-3 模型 (bigmodel.cn)。</p>
                    </div>

                    {/* SiliconFlow */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">SiliconFlow API Key</label>
                        <input 
                            type="password" 
                            value={keys.siliconflow}
                            onChange={(e) => setKeys({...keys, siliconflow: e.target.value})}
                            placeholder="sk-..."
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all placeholder:text-slate-600"
                        />
                         <p className="text-[10px] text-slate-500 mt-2">调用 SiliconCloud (可灵 Kolors)。</p>
                    </div>
                </div>
            )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 bg-slate-900/50">
            <button 
                onClick={handleSave}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-purple-900/20 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
                <Save className="w-5 h-5" />
                保存配置
            </button>
        </div>
      </div>
    </div>
  );
};