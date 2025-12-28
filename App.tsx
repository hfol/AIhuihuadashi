import React, { useState } from 'react';
import { Home } from './views/Home';
import { Processor } from './views/Processor';
import { ChatAssistant } from './views/ChatAssistant';
import { History } from './views/History';
import { Profile } from './views/Profile';
import { Feature, ViewState } from './types';
import { Home as HomeIcon, User as UserIcon, LayoutGrid, Zap, LogOut } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('HOME');
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  
  // Tab state for the main view (Home / History / Profile)
  const [activeTab, setActiveTab] = useState<'home' | 'history' | 'profile'>('home');

  const handleSelectFeature = (feature: Feature) => {
    setSelectedFeature(feature);
    if (feature.isChat) {
        setCurrentView('CHAT');
    } else {
        setCurrentView('PROCESSOR');
    }
  };

  const handleBackToHome = () => {
    setSelectedFeature(null);
    setCurrentView('HOME');
  };

  const handleTabChange = (tab: 'home' | 'history' | 'profile') => {
      setActiveTab(tab);
      handleBackToHome();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-purple-500/30 flex flex-col md:flex-row relative">
      
      {/* Background ambient blobs (Fixed Position) */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] md:left-[10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]" />
      </div>

      {/* Desktop Sidebar (Visible on md+) */}
      <aside className="hidden md:flex w-64 flex-col bg-slate-900/60 border-r border-white/5 fixed h-full z-50 p-6 shadow-2xl backdrop-blur-xl">
        <div 
            className="flex items-center gap-3 mb-12 px-2 cursor-pointer group" 
            onClick={() => handleTabChange('home')}
        >
           <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform" /> 
           <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 drop-shadow-sm">AI修图大师</h1>
        </div>
        
        <nav className="space-y-2 flex-1">
             <button
               onClick={() => handleTabChange('home')}
               className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                 activeTab === 'home' && currentView === 'HOME'
                 ? 'bg-purple-500/10 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.1)] border border-purple-500/20'
                 : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
               }`}
             >
               <HomeIcon className="w-5 h-5" />
               首页
             </button>
             <button
               onClick={() => handleTabChange('history')}
               className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                 activeTab === 'history' && currentView === 'HOME'
                 ? 'bg-purple-500/10 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.1)] border border-purple-500/20'
                 : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
               }`}
             >
               <LayoutGrid className="w-5 h-5" />
               创作历史
             </button>
             <button
               onClick={() => handleTabChange('profile')}
               className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                 activeTab === 'profile' && currentView === 'HOME'
                 ? 'bg-purple-500/10 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.1)] border border-purple-500/20'
                 : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
               }`}
             >
               <UserIcon className="w-5 h-5" />
               个人中心
             </button>
        </nav>

        {/* Sidebar Footer */}
        <div className="mt-auto space-y-4">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md shadow-lg">
                <div className="flex items-center gap-2 mb-2 text-emerald-400 font-bold drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]">
                    <Zap className="w-4 h-4 fill-emerald-400" />
                    <span>50 积分</span>
                </div>
                <div className="w-full bg-slate-700/50 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-400 h-full w-2/3 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                </div>
                <p className="text-[10px] text-slate-400 mt-2">升级 Pro 解锁无限生成</p>
            </div>
            
            <button className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition-colors px-2">
                <LogOut className="w-3 h-3" />
                退出登录
            </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 min-h-screen relative overflow-x-hidden">
             
             <div className="relative z-10 w-full min-h-screen">
                {currentView === 'HOME' ? (
                  <div className="max-w-7xl mx-auto w-full">
                     {activeTab === 'home' && <Home onSelectFeature={handleSelectFeature} />}
                     {activeTab === 'history' && <History />}
                     {activeTab === 'profile' && <Profile />}
                  </div>
                ) : (
                  <>
                     {currentView === 'PROCESSOR' && selectedFeature && (
                        <Processor feature={selectedFeature} onBack={handleBackToHome} />
                     )}
                     {currentView === 'CHAT' && selectedFeature && (
                        <ChatAssistant feature={selectedFeature} onBack={handleBackToHome} />
                     )}
                  </>
                )}
             </div>
      </main>

      {/* Mobile Bottom Navigation (Hidden on md+) */}
      {currentView === 'HOME' && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-6 pb-6 pt-2 pointer-events-none">
            <div className="max-w-md mx-auto pointer-events-auto">
                <nav className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-full p-2 flex justify-around items-center shadow-2xl shadow-black/50">
                    <button 
                        onClick={() => setActiveTab('home')}
                        className={`p-3 rounded-full transition-all duration-300 ${
                            activeTab === 'home' 
                            ? 'text-white bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.1)] border border-white/10' 
                            : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <HomeIcon className="w-6 h-6" />
                    </button>
                    <button 
                        onClick={() => setActiveTab('history')}
                        className={`p-3 rounded-full transition-all duration-300 ${
                            activeTab === 'history' 
                            ? 'text-purple-400 bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.2)] border border-purple-500/20' 
                            : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <LayoutGrid className="w-6 h-6" />
                    </button>
                    <button 
                        onClick={() => setActiveTab('profile')}
                        className={`p-3 rounded-full transition-all duration-300 ${
                            activeTab === 'profile' 
                            ? 'text-blue-400 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.2)] border border-blue-500/20' 
                            : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <UserIcon className="w-6 h-6" />
                    </button>
                </nav>
            </div>
        </div>
      )}
    </div>
  );
}