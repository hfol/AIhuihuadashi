import React from 'react';
import { SHOWCASE_ITEMS } from '../constants';
import { BeforeAfterSlider } from '../components/BeforeAfterSlider';
import { Clock, Image as ImageIcon, Trash2, Edit } from 'lucide-react';

export const History: React.FC = () => {
  return (
    <div className="pb-24 animate-fade-in px-6 md:px-10 pt-10 max-w-7xl mx-auto w-full">
      <header className="mb-8">
        <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-2 drop-shadow-sm">
           创作记录
        </h1>
        <p className="text-slate-400 text-sm">
           查看您最近处理的 AI 图片作品。
        </p>
      </header>

      {/* Mock History List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SHOWCASE_ITEMS.map((item, index) => (
            <div key={item.id} className="bg-white/5 rounded-3xl overflow-hidden border border-white/10 backdrop-blur-md group hover:border-white/20 hover:bg-white/10 transition-all shadow-lg hover:shadow-xl">
                <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                    <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span className="font-medium text-slate-300 text-xs">{new Date().toLocaleDateString()}</span>
                    </div>
                    <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full border border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.1)]">
                        {item.title}
                    </span>
                </div>
                <div className="h-48 w-full relative">
                    <BeforeAfterSlider 
                        beforeUrl={item.beforeUrl} 
                        afterUrl={item.afterUrl} 
                    />
                </div>
                <div className="p-3 flex justify-end gap-3 bg-white/5">
                     <button className="text-xs text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1 px-2 py-1 rounded hover:bg-white/10">
                        <Trash2 className="w-3 h-3" />
                        删除
                     </button>
                     <button className="text-xs text-purple-400 hover:text-purple-300 font-bold transition-colors flex items-center gap-1 px-2 py-1 rounded hover:bg-white/10">
                        <Edit className="w-3 h-3" />
                        再次编辑
                     </button>
                </div>
            </div>
        ))}

        {/* Empty State Mock */}
        <div className="border-2 border-dashed border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center text-center opacity-50 min-h-[250px] bg-white/5 backdrop-blur-sm">
            <ImageIcon className="w-10 h-10 text-slate-500 mb-3" />
            <p className="text-slate-500 text-sm">更多历史记录将显示在这里</p>
        </div>
      </div>
    </div>
  );
};