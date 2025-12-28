import React from 'react';
import { Feature } from '../types';
import { ChevronRight } from 'lucide-react';

interface FeatureCardProps {
  feature: Feature;
  onClick: (feature: Feature) => void;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ feature, onClick }) => {
  return (
    <button
      onClick={() => onClick(feature)}
      className="relative group overflow-hidden rounded-3xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 text-left p-5 flex flex-col justify-between h-40 md:h-48 backdrop-blur-md shadow-lg"
    >
      {/* Background Gradient Blob */}
      <div className={`absolute -right-10 -bottom-10 w-32 h-32 rounded-full blur-[60px] opacity-30 group-hover:opacity-50 transition-opacity duration-500 bg-gradient-to-br ${feature.color}`} />

      <div className="z-10 relative">
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 group-hover:shadow-purple-500/30 transition-all duration-300 border border-white/10`}>
          <feature.icon className="text-white w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-white mb-1 tracking-tight drop-shadow-sm">{feature.title}</h3>
        <p className="text-xs text-slate-300 font-medium opacity-80">{feature.subtitle}</p>
      </div>

      <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-0 translate-x-2">
        <ChevronRight className="w-5 h-5 text-white/70" />
      </div>
    </button>
  );
};