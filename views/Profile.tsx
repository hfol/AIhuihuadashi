import React, { useState } from 'react';
import { User, Settings, Crown, Zap, ChevronRight, LogOut, Heart, HelpCircle, Shield } from 'lucide-react';
import { SettingsModal } from '../components/SettingsModal';

export const Profile: React.FC = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="pb-24 animate-fade-in max-w-3xl mx-auto w-full">
       <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

       {/* Header with Avatar */}
       <div className="relative pt-12 pb-6 px-6 bg-gradient-to-b from-purple-900/30 to-transparent rounded-b-3xl">
          <div className="flex items-center gap-5">
             <div className="w-20 h-20 rounded-full p-[3px] bg-gradient-to-tr from-purple-500 via-pink-500 to-blue-500 shadow-xl shadow-purple-900/40">
                <img 
                    src="https://picsum.photos/id/64/200/200" 
                    alt="User" 
                    className="w-full h-full rounded-full object-cover border-4 border-slate-900" 
                />
             </div>
             <div>
                <h1 className="text-2xl font-bold text-white mb-1 drop-shadow-md">AI 艺术家</h1>
                <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded bg-gradient-to-r from-amber-200 to-yellow-400 text-yellow-900 font-bold flex items-center gap-1 shadow-lg shadow-amber-500/20">
                        <Crown className="w-3 h-3" />
                        Pro 会员
                    </span>
                    <span className="text-xs text-slate-300 bg-white/10 px-2 py-0.5 rounded border border-white/10 backdrop-blur-sm">ID: 883921</span>
                </div>
             </div>
          </div>
       </div>

       {/* Stats */}
       <div className="px-6 mb-8 -mt-2">
           <div className="flex bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xl divide-x divide-white/10 shadow-2xl">
               <div className="flex-1 text-center">
                   <div className="text-lg font-bold text-white">124</div>
                   <div className="text-xs text-slate-400">生成张数</div>
               </div>
               <div className="flex-1 text-center">
                   <div className="text-lg font-bold text-white">12</div>
                   <div className="text-xs text-slate-400">收藏</div>
               </div>
               <div className="flex-1 text-center">
                   <div className="text-lg font-bold text-emerald-400 flex items-center justify-center gap-1">
                      <Zap className="w-3 h-3 fill-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.8)]" />
                      50
                   </div>
                   <div className="text-xs text-slate-400">剩余积分</div>
               </div>
           </div>
       </div>

       {/* Menu List */}
       <div className="px-6 space-y-3">
           <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">通用</h3>
           
           <button 
                onClick={() => setIsSettingsOpen(true)}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-xl p-4 flex items-center justify-between transition-all group backdrop-blur-sm shadow-sm hover:shadow-md"
           >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors border border-blue-500/20 group-hover:border-blue-500">
                        <Settings className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-slate-200">API 设置</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
           </button>

           <button className="w-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-xl p-4 flex items-center justify-between transition-all group backdrop-blur-sm shadow-sm hover:shadow-md">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-pink-500/10 rounded-lg text-pink-400 group-hover:bg-pink-500 group-hover:text-white transition-colors border border-pink-500/20 group-hover:border-pink-500">
                        <Heart className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-slate-200">我的收藏</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
           </button>

           <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1 mt-6">关于</h3>

           <button className="w-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-xl p-4 flex items-center justify-between transition-all group backdrop-blur-sm shadow-sm hover:shadow-md">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors border border-emerald-500/20 group-hover:border-emerald-500">
                        <HelpCircle className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-slate-200">帮助与反馈</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
           </button>

           <button className="w-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-xl p-4 flex items-center justify-between transition-all group backdrop-blur-sm shadow-sm hover:shadow-md">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-500/10 rounded-lg text-slate-400 group-hover:bg-slate-500 group-hover:text-white transition-colors border border-slate-500/20 group-hover:border-slate-500">
                        <Shield className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-slate-200">隐私政策</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
           </button>
           
           <button className="w-full mt-6 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 rounded-xl p-4 flex items-center justify-center gap-2 text-red-400 hover:text-red-300 transition-colors backdrop-blur-sm">
                <LogOut className="w-5 h-5" />
                退出登录
           </button>
           
           <p className="text-center text-[10px] text-slate-600 pt-4">Version 1.1.0 (Glass Edition)</p>
       </div>
    </div>
  );
};