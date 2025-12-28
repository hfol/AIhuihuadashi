import React, { useState } from 'react';
import { FEATURES, ID_PHOTO_FEATURE, SHOWCASE_ITEMS } from '../constants';
import { FeatureCard } from '../components/FeatureCard';
import { BeforeAfterSlider } from '../components/BeforeAfterSlider';
import { Feature } from '../types';
import { ChevronRight, Settings } from 'lucide-react';
import { SettingsModal } from '../components/SettingsModal';

interface HomeProps {
  onSelectFeature: (feature: Feature) => void;
}

export const Home: React.FC<HomeProps> = ({ onSelectFeature }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Separate features into categories
  const videoFeatures = FEATURES.filter(f => f.isVideo);
  const imageFeatures = FEATURES.filter(f => !f.isVideo);

  return (
    <div className="pb-24 space-y-10 animate-fade-in relative max-w-7xl mx-auto w-full">
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* Header / Hero */}
      <header className="px-6 md:px-10 pt-10 pb-4">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 md:hidden drop-shadow-sm">
                AI修图大师
            </h1>
            <div className="hidden md:block text-slate-300 text-sm font-medium tracking-wide">
                欢迎回来，开始今天的创作吧
            </div>
            
            <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-2 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors backdrop-blur-md shadow-sm"
                >
                   <Settings className="w-5 h-5" />
                </button>
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 p-[2px] md:hidden shadow-lg shadow-purple-500/20">
                    <img src="https://picsum.photos/id/64/100/100" alt="User" className="rounded-full w-full h-full object-cover border-2 border-slate-900" />
                </div>
            </div>
        </div>
        
        <div className="space-y-4 max-w-2xl">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight drop-shadow-md">
                重温 <br className="md:hidden" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                    珍贵回忆
                </span>
            </h2>
            <p className="text-slate-300/80 max-w-md text-sm md:text-base leading-relaxed">
                专业级AI工具，瞬间修复、上色并增强您的照片。支持人像修复、风格化转换及证件照制作。
            </p>
        </div>
      </header>

      {/* Video Features Grid */}
      <section className="px-6 md:px-10">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-1 h-4 bg-pink-500 rounded-full inline-block shadow-[0_0_10px_rgba(236,72,153,0.5)]"></span>
            AI 视频创作
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {videoFeatures.map((feature) => (
            <FeatureCard 
              key={feature.id} 
              feature={feature} 
              onClick={onSelectFeature} 
            />
          ))}
        </div>
      </section>

      {/* Image Features Grid */}
      <section className="px-6 md:px-10">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-1 h-4 bg-purple-500 rounded-full inline-block shadow-[0_0_10px_rgba(168,85,247,0.5)]"></span>
            AI 图像工具
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {imageFeatures.map((feature) => (
            <FeatureCard 
              key={feature.id} 
              feature={feature} 
              onClick={onSelectFeature} 
            />
          ))}
        </div>
      </section>

      {/* ID Photo Banner */}
      <section className="px-6 md:px-10">
        <button 
          onClick={() => onSelectFeature(ID_PHOTO_FEATURE)}
          className="w-full relative group overflow-hidden rounded-3xl bg-indigo-900/30 border border-indigo-500/20 p-6 md:p-8 flex items-center justify-between hover:border-indigo-500/40 hover:bg-indigo-900/40 transition-all backdrop-blur-md shadow-xl"
        >
             {/* Decorative Elements */}
             <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-indigo-500/20 to-transparent blur-2xl" />
             
             <div className="z-10 flex items-center gap-6">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform duration-300 border border-white/10">
                    <ID_PHOTO_FEATURE.icon className="text-white w-6 h-6 md:w-8 md:h-8" />
                </div>
                <div className="text-left">
                    <h3 className="text-lg md:text-xl font-bold text-white drop-shadow-sm">证件照制作</h3>
                    <p className="text-xs md:text-sm text-indigo-200 mt-1 opacity-90">智能抠图去背 / 自动裁剪标准尺寸 / 一键换底色</p>
                </div>
             </div>
             <div className="bg-white/10 p-2 rounded-full group-hover:bg-white/20 transition-colors border border-white/5">
                 <ChevronRight className="w-5 h-5 text-indigo-100" />
             </div>
        </button>
      </section>

      {/* Showcase Gallery */}
      <section className="px-6 md:px-10">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-1 h-4 bg-blue-500 rounded-full inline-block shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
            修复案例
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SHOWCASE_ITEMS.map((item) => (
            <div key={item.id} className="bg-white/5 rounded-3xl overflow-hidden border border-white/10 backdrop-blur-md hover:border-white/20 hover:bg-white/10 transition-all shadow-lg hover:shadow-xl">
                <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                    <span className="font-medium text-slate-200 text-sm">{item.title}</span>
                    <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full border border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]">成功</span>
                </div>
                <div className="h-48 md:h-64 w-full">
                    <BeforeAfterSlider 
                        beforeUrl={item.beforeUrl} 
                        afterUrl={item.afterUrl} 
                    />
                </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};