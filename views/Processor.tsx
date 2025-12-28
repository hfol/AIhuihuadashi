import React, { useState, useEffect, useRef } from 'react';
import { Feature, ProcessingState, ImageModelProvider, DomesticProvider } from '../types';
import { ArrowLeft, UploadCloud, Sparkles, Download, Share2, CheckCircle2, AlertCircle, Image as ImageIcon, Settings2, Cloud, Palette, ChevronDown, RefreshCw, Check, Wand2, Video as VideoIcon, Smartphone, Monitor, Ruler, FileAudio, Music, Mic, X } from 'lucide-react';
import { BeforeAfterSlider } from '../components/BeforeAfterSlider';
import { processImage } from '../utils/image_gen';
import { generateVideo } from '../utils/video_gen';
import { ID_PHOTO_COLORS, ID_PHOTO_SIZES } from '../constants';
import { chatWithDomesticAI, parseStream } from '../utils/domestic_ai';

interface ProcessorProps {
  feature: Feature;
  onBack: () => void;
}

export const Processor: React.FC<ProcessorProps> = ({ feature, onBack }) => {
  const [state, setState] = useState<ProcessingState>({
    isProcessing: false,
    progress: 0,
    resultUrl: null,
    originalUrl: null,
    isSampleMode: false,
  });
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const [fileObject, setFileObject] = useState<File | null>(null); 
  const [audioFile, setAudioFile] = useState<File | null>(null);
  
  // Model Settings
  const [provider, setProvider] = useState<ImageModelProvider>('gemini');
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState('');
  
  // New state for dropdown menu
  const [isProviderMenuOpen, setIsProviderMenuOpen] = useState(false);

  // Style Selection State
  const [selectedStyleId, setSelectedStyleId] = useState<string | null>(null);

  // Text Prompt State (For Txt2Img / Txt2Vid)
  const [textPrompt, setTextPrompt] = useState('');
  const [isOptimizingPrompt, setIsOptimizingPrompt] = useState(false);

  // ID Photo State
  const [idPhotoBg, setIdPhotoBg] = useState<string>('white');
  const [idPhotoSize, setIdPhotoSize] = useState<string>('1inch');

  // Video Aspect Ratio State
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');

  // Update apiKey state when provider changes
  useEffect(() => {
    let key = '';
    if (provider === 'siliconflow') key = localStorage.getItem('apikey_image_siliconflow') || '';
    if (provider === 'zhipu') key = localStorage.getItem('apikey_zhipu') || ''; // Use unified key
    // For Gemini, we might use a custom key if set in localStorage, or fallback to env
    if (provider === 'gemini') {
        // We generally use process.env.API_KEY, but if we want to allow user override for Veo
        // we can check if there's a custom one. For now, assume process.env or settings.
    }
    setApiKey(key);
  }, [provider]);

  // Set default style and settings if feature changes
  useEffect(() => {
    if (feature.styles && feature.styles.length > 0) {
      setSelectedStyleId(feature.styles[0].id);
    } else {
      setSelectedStyleId(null);
    }
    // Reset BG color and Size when feature changes
    if (feature.id === 'id-photo') {
      setIdPhotoBg('white');
      setIdPhotoSize('1inch');
    }
    // Reset Prompt
    if (feature.id === 'txt2img' || feature.id === 'txt2vid') {
        setTextPrompt('');
    }
    // Reset Provider for video 
    if (feature.isVideo) {
        // Default to Gemini but allow switching
        setProvider('gemini');
        
        // Default Aspect Ratio logic
        // Talking/Singing often better in Portrait
        if (feature.id === 'img2talk' || feature.id === 'img2sing') {
            setAspectRatio('9:16');
        } else {
            setAspectRatio('16:9');
        }
    }
    // Reset Audio file
    if (feature.id !== 'img2talk' && feature.id !== 'img2sing') {
        setAudioFile(null);
    }
  }, [feature]);

  const saveApiKey = (key: string) => {
    if (provider === 'siliconflow') localStorage.setItem('apikey_image_siliconflow', key);
    if (provider === 'zhipu') localStorage.setItem('apikey_zhipu', key); // Use unified key
    setApiKey(key);
    setShowSettings(false);
  };

  // Clean up Object URLs
  useEffect(() => {
    return () => {
      if (state.originalUrl && !state.originalUrl.startsWith('http')) {
        URL.revokeObjectURL(state.originalUrl);
      }
      // Don't revoke resultUrl immediately if it's a blob for video, let browser handle it or clear on unmount
    };
  }, [state.originalUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError("请上传有效的图片文件。");
        return;
      }
      setError(null);
      const url = URL.createObjectURL(file);
      setFileObject(file);
      setState({ isProcessing: false, progress: 0, originalUrl: url, resultUrl: null, isSampleMode: false });
    }
  };

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        if (!file.type.startsWith('audio/')) {
            setError("请上传有效的音频文件 (MP3/WAV/AAC)。");
            return;
        }
        setAudioFile(file);
        setError(null);
    }
  };

  const handleUseSample = () => {
    if (feature.demoBeforeUrl && feature.demoAfterUrl) {
      setState({
        isProcessing: false, 
        progress: 0, 
        originalUrl: feature.demoBeforeUrl, 
        resultUrl: null, 
        isSampleMode: true 
      });
      setFileObject(null);
      setError(null);
    } else {
      setError("该功能暂无示例图片");
    }
  };

  const handleProviderChange = (newProvider: ImageModelProvider) => {
    if (state.isProcessing) return; // Prevent switching while processing
    
    // Allow 'zhipu' for video now
    if (feature.isVideo && newProvider !== 'gemini' && newProvider !== 'zhipu') {
        alert("目前视频生成支持 Google Gemini 和 智谱 CogVideoX。");
        return;
    }
    
    setProvider(newProvider);
    setIsProviderMenuOpen(false);
    
    // Clear result if any
    if (state.resultUrl) {
        setState(prev => ({ ...prev, resultUrl: null, progress: 0 }));
    }
    setError(null);
  };

  const handleOptimizePrompt = async () => {
      if (!textPrompt.trim()) {
          setError("请先输入一些关键词");
          return;
      }

      // Auto-detect available key for text optimization
      let textProvider: DomesticProvider = 'deepseek';
      let key = localStorage.getItem('apikey_deepseek');
      
      if (!key) {
          key = localStorage.getItem('apikey_moonshot');
          textProvider = 'moonshot';
      }
      if (!key) {
          key = localStorage.getItem('apikey_zhipu'); 
          textProvider = 'zhipu';
      }

      if (!key) {
          setShowSettings(true);
          setError("请先配置 DeepSeek 或 Moonshot 的 API Key 以使用智能润色功能");
          return;
      }

      setIsOptimizingPrompt(true);
      setError(null);
      
      try {
          const sysPrompt = "You are an expert AI Prompt Engineer. Translate the user's input to English if needed, and expand it into a detailed prompt suitable for high-quality generation. Return ONLY the raw prompt text.";
          
          const msgs = [{ id: '0', role: 'user', content: textPrompt, timestamp: Date.now() }];
          
          // @ts-ignore
          const stream = await chatWithDomesticAI(msgs, textProvider, key, sysPrompt);
          
          if (!stream) throw new Error("No stream returned");

          setTextPrompt(''); 
          
          for await (const chunk of parseStream(stream)) {
              setTextPrompt(prev => prev + chunk); 
          }
          
      } catch (e: any) {
          console.error(e);
          setError("润色失败: " + e.message);
      } finally {
          setIsOptimizingPrompt(false);
      }
  };

  const startProcessing = async () => {
    // Validation
    const isTxt2Img = feature.requiresInputImage === false;
    
    // Case 1: Sample Mode (Simulated)
    if (state.isSampleMode && !isTxt2Img) {
        simulateSampleProcessing();
        return;
    }

    // Case 2: Validation for Inputs
    if (!isTxt2Img && (!state.originalUrl || !fileObject)) {
        setError("请先上传一张图片");
        return;
    }
    
    // Text prompt is key for talk/sing if no audio, or serves as description
    if ((isTxt2Img || feature.id === 'img2vid' || feature.id === 'img2sing' || feature.id === 'img2talk' || feature.id === 'vid-enhance') && !textPrompt.trim() && !feature.isVideo) {
         if (feature.id === 'txt2vid') {
             setError("请输入视频脚本描述");
             return;
         }
         if (feature.id === 'txt2img') {
             setError("请输入画面描述");
             return;
         }
    }
    
    // Specific Validation for Text-to-Video
    if (feature.id === 'txt2vid' && !textPrompt.trim()) {
        setError("请输入视频脚本描述");
        return;
    }
    
    // Warning for talk/sing if no text provided
    if ((feature.id === 'img2talk' || feature.id === 'img2sing') && !textPrompt.trim()) {
        setError(feature.id === 'img2sing' ? "请输入歌词或歌曲风格描述" : "请输入台词或说话语气描述");
        return;
    }

    // Check API Key
    if (provider !== 'gemini' && !apiKey) {
        setShowSettings(true);
        setError(`请先配置 ${getProviderName()} 的 API Key`);
        return;
    }

    setState(prev => ({ ...prev, isProcessing: true, progress: 5 }));
    setError(null);

    // Get selected style prompt
    const activeStyle = feature.styles?.find(s => s.id === selectedStyleId);
    const stylePrompt = activeStyle?.prompt;

    // Get background color value for ID Photo
    let bgColorValue = undefined;
    if (feature.id === 'id-photo') {
      const selectedBg = ID_PHOTO_COLORS.find(c => c.id === idPhotoBg);
      bgColorValue = selectedBg?.value;
    }

    try {
      // Fake progress
      // Video takes longer, so we update the progress bar differently
      const progressInterval = setInterval(() => {
        setState(prev => {
           if (prev.progress >= 95) return prev;
           // Slower progress for video
           const increment = feature.isVideo ? (Math.random() * 0.3) : (Math.random() * 2);
           return { ...prev, progress: prev.progress + increment }; 
        });
      }, 500);

      let generatedUrl = "";

      if (feature.isVideo) {
          // Video Generation Logic
          
          // Get correct key based on provider
          let effectiveKey = apiKey;
          if (provider === 'gemini') {
              effectiveKey = process.env.API_KEY || ""; 
          }
          
          // @ts-ignore
          const isAIStudio = typeof window !== 'undefined' && window.aistudio;

          // For Project IDX / AI Studio environment support (optional check for Gemini)
          if (provider === 'gemini' && isAIStudio && window.aistudio.hasSelectedApiKey) {
               const hasKey = await window.aistudio.hasSelectedApiKey();
               if (!hasKey) {
                   await window.aistudio.openSelectKey();
               }
          }

          try {
              // Unified video generation call
              // We pass the provider to the utility function
              generatedUrl = await generateVideo(
                  provider,
                  effectiveKey, 
                  textPrompt, 
                  fileObject, 
                  feature.id, 
                  stylePrompt, 
                  aspectRatio
              );
          } catch (videoError: any) {
              const errMsg = videoError.message || JSON.stringify(videoError);
              // Handle "Requested entity was not found" error by resetting/prompting key selection in AI Studio env
              if (provider === 'gemini' && errMsg.includes("Requested entity was not found") && isAIStudio) {
                  await window.aistudio.openSelectKey();
                  throw new Error("API Key 似乎无效或过期。已弹出 API Key 选择框，请重新选择后再次点击生成。");
              }
              throw videoError;
          }
      } else {
          // Image Generation Logic
          generatedUrl = await processImage(
            fileObject, 
            feature.id, 
            provider, 
            apiKey, 
            stylePrompt, 
            isTxt2Img ? textPrompt : undefined,
            bgColorValue,
            ID_PHOTO_SIZES.find(s => s.id === idPhotoSize)?.prompt
          );
      }
      
      clearInterval(progressInterval);

      setState(prev => ({
        ...prev,
        isProcessing: false,
        progress: 100,
        resultUrl: generatedUrl
      }));

    } catch (err: any) {
      console.error(err);
      setState(prev => ({ ...prev, isProcessing: false, progress: 0 }));
      setError("AI 处理失败: " + (err.message || "未知错误"));
    }
  };

  const simulateSampleProcessing = () => {
    setState(prev => ({ ...prev, isProcessing: true, progress: 0 }));
    const steps = [5, 15, 30, 45, 60, 75, 85, 95];
    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex >= steps.length) {
        clearInterval(interval);
        setState(prev => ({
          ...prev,
          isProcessing: false,
          progress: 100,
          resultUrl: feature.demoAfterUrl || prev.originalUrl
        }));
      } else {
        setState(prev => ({ ...prev, progress: steps[stepIndex] }));
        stepIndex++;
      }
    }, 300);
  };

  const handleDownload = () => {
    if (state.resultUrl) {
      const link = document.createElement('a');
      link.href = state.resultUrl;
      link.download = `ai_generated_${feature.id}_${Date.now()}.${feature.isVideo ? 'mp4' : 'png'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleShare = async () => {
    if (!state.resultUrl) return;

    if (navigator.share) {
      try {
        const response = await fetch(state.resultUrl);
        const blob = await response.blob();
        const file = new File([blob], `ai_result_${Date.now()}.${feature.isVideo ? 'mp4' : 'png'}`, { type: feature.isVideo ? 'video/mp4' : 'image/png' });

        await navigator.share({
          title: 'AI 修图大师作品',
          text: '快来看看我用 AI 修图大师制作的作品！',
          files: [file],
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      alert('您的设备不支持直接分享，请先保存。');
    }
  };

  const getProviderName = () => {
      if (provider === 'gemini') return 'Google Gemini';
      if (provider === 'siliconflow') return 'SiliconCloud';
      if (provider === 'zhipu') return '智谱 CogView/Video';
      return '';
  };

  const getProviderColor = () => {
    if (provider === 'gemini') return 'bg-blue-500';
    if (provider === 'siliconflow') return 'bg-orange-500';
    if (provider === 'zhipu') return 'bg-indigo-500';
    return 'bg-slate-400';
  }

  // Determine if we should show the image upload interface
  const showUpload = feature.requiresInputImage !== false;
  // Determine if we have input ready (Image for Img2Img, or true for Txt2Img which doesn't need upload)
  const isInputReady = showUpload ? !!state.originalUrl : true; 
  
  // Custom Placeholder logic
  const getPlaceholder = () => {
      if (feature.id === 'img2sing') return "请输入歌词内容或歌曲风格描述 (必填)...";
      if (feature.id === 'img2talk') return "请输入想说的话或台词 (必填)...";
      if (feature.id === 'vid-enhance') return "例如：增强细节，修复色彩... (可选)";
      if (feature.isVideo) return "例如：一只猫在霓虹灯闪烁的未来城市街道上奔跑...";
      return "例如：一只戴着宇航员头盔的猫...";
  }

  // Custom Prompt Label
  const getPromptLabel = () => {
      if (feature.id === 'img2talk') return '台词内容 (Script)';
      if (feature.id === 'img2sing') return '歌词 / 歌曲描述 (Lyrics)';
      if (feature.isVideo) return '视频脚本 / 描述';
      return '画面描述';
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-white animate-fade-in relative">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/5 p-4 flex items-center justify-between shadow-lg">
        <button 
            onClick={onBack}
            className="p-2 rounded-full hover:bg-white/10 transition-colors flex items-center gap-2 text-slate-300 hover:text-white"
        >
            <ArrowLeft className="w-6 h-6" />
            <span className="hidden md:inline text-sm font-medium">返回</span>
        </button>
        
        <div className="flex flex-col items-center relative">
            <h2 className="font-semibold text-lg text-white drop-shadow-sm">{feature.title}</h2>
            
            <div className="relative">
                <button 
                    onClick={() => !state.isProcessing && setIsProviderMenuOpen(!isProviderMenuOpen)}
                    className={`flex items-center gap-1 text-[10px] px-3 py-1 mt-1 rounded-full bg-white/5 border border-white/10 hover:border-white/20 transition-all backdrop-blur-sm ${state.isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <div className={`w-1.5 h-1.5 rounded-full ${getProviderColor()} shadow-[0_0_5px_currentColor]`} />
                    <span className="font-medium text-slate-300">{getProviderName()}</span>
                    <ChevronDown className={`w-3 h-3 text-slate-400 ml-1 transition-transform duration-200 ${isProviderMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isProviderMenuOpen && (
                    <>
                        <div className="fixed inset-0 z-30" onClick={() => setIsProviderMenuOpen(false)} />
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-44 bg-slate-800/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-40 animate-fade-in flex flex-col py-1">
                             <button 
                                onClick={() => handleProviderChange('gemini')}
                                className={`flex items-center gap-3 px-4 py-3 text-xs text-left hover:bg-white/5 transition-colors ${provider === 'gemini' ? 'text-blue-400 bg-blue-500/10' : 'text-slate-300'}`}
                             >
                                <Sparkles className="w-3.5 h-3.5" />
                                Google Gemini (Veo)
                             </button>
                             
                             <button 
                                onClick={() => handleProviderChange('zhipu')}
                                className={`flex items-center gap-3 px-4 py-3 text-xs text-left hover:bg-white/5 transition-colors ${provider === 'zhipu' ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-300'}`}
                             >
                                <Palette className="w-3.5 h-3.5" />
                                智谱 (CogVideoX/View)
                             </button>

                             {/* Only show SiliconFlow if NOT video feature (SiliconFlow video integration is complex for this demo) */}
                             {!feature.isVideo && (
                                 <button 
                                    onClick={() => handleProviderChange('siliconflow')}
                                    className={`flex items-center gap-3 px-4 py-3 text-xs text-left hover:bg-white/5 transition-colors ${provider === 'siliconflow' ? 'text-orange-400 bg-orange-500/10' : 'text-slate-300'}`}
                                 >
                                    <Cloud className="w-3.5 h-3.5" />
                                    SiliconCloud
                                 </button>
                             )}
                        </div>
                    </>
                )}
            </div>
        </div>

        <button 
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
        >
            <Settings2 className="w-5 h-5 text-slate-400 hover:text-white" />
        </button>
      </div>

      <div className={`flex-1 flex flex-col p-6 max-w-7xl mx-auto w-full transition-all ${isInputReady ? 'lg:flex-row lg:gap-8 lg:items-start' : 'max-w-2xl'}`}>
        
        {/* State 1: Upload (Only for features requiring Image) */}
        {!state.originalUrl && showUpload && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-8 w-full">
            <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-2xl shadow-purple-500/20 animate-pulse ring-4 ring-white/5`}>
              <feature.icon className="w-10 h-10 text-white" />
            </div>
            
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold text-white drop-shadow-md">上传照片</h3>
              <p className="text-slate-400 max-w-xs mx-auto text-sm font-medium opacity-80">{feature.description}</p>
            </div>

            <div className="w-full space-y-4">
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-48 border-2 border-dashed border-slate-600/50 rounded-3xl flex flex-col items-center justify-center bg-white/5 hover:bg-white/10 hover:border-purple-500/50 transition-all cursor-pointer group backdrop-blur-sm"
                >
                    <div className="w-12 h-12 rounded-full bg-slate-700/50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg">
                        <UploadCloud className="w-6 h-6 text-purple-400" />
                    </div>
                    <p className="font-medium text-slate-300 group-hover:text-white transition-colors">点击选择图片</p>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleFileChange}
                    />
                </div>

                {/* Try Sample Button */}
                {feature.demoBeforeUrl && (
                    <button 
                        onClick={handleUseSample}
                        className="w-full py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-medium transition-colors flex items-center justify-center gap-2 backdrop-blur-sm"
                    >
                        <ImageIcon className="w-4 h-4" />
                        试一试示例图片
                    </button>
                )}
            </div>

            {error && (
                <div className="flex items-center gap-2 text-red-400 bg-red-500/10 px-4 py-2 rounded-xl text-sm border border-red-500/20 backdrop-blur-md">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}
          </div>
        )}

        {/* State 2 & 3: Display Area (Preview/Processing/Result) */}
        {isInputReady && (
            <>
                {/* Left: Image/Video Display Area */}
                <div className="flex-1 w-full bg-black/40 rounded-3xl border border-white/10 overflow-hidden relative shadow-2xl lg:min-h-[600px] flex items-center justify-center min-h-[400px] backdrop-blur-sm">
                    
                    {/* Empty State for Txt2Img/Txt2Vid */}
                    {!state.originalUrl && !state.resultUrl && !state.isProcessing && (
                         <div className="flex flex-col items-center text-slate-500 p-8 text-center max-w-sm">
                             <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 ring-1 ring-white/10">
                                {feature.isVideo ? <VideoIcon className="w-8 h-8 opacity-50 text-pink-400" /> : <Sparkles className="w-8 h-8 opacity-50 text-purple-400" />}
                             </div>
                             <p className="text-sm font-medium text-slate-300 mb-2">准备生成{feature.isVideo ? '视频' : '图像'}</p>
                             <p className="text-xs text-slate-500">在右侧输入描述，或点击“AI 润色”让 DeepSeek 为您生成专业提示词。</p>
                         </div>
                    )}

                    {/* Mode A: Preview Original (Only for Img2Img features) */}
                    {state.originalUrl && !state.resultUrl && (
                        <div className="relative w-full h-full min-h-[400px]">
                            <img 
                                src={state.originalUrl} 
                                alt="原图" 
                                className="w-full h-full object-contain absolute inset-0"
                            />
                        </div>
                    )}

                    {/* Processing Overlay */}
                    {state.isProcessing && (
                        <div className="absolute inset-0 bg-black/70 backdrop-blur-[5px] z-10 flex flex-col items-center justify-center">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent shadow-[0_0_15px_rgba(168,85,247,0.8)] animate-[scan_2s_ease-in-out_infinite]" />
                            <div className="relative w-24 h-24 mb-6">
                                <div className="absolute inset-0 border-4 border-slate-700/50 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-t-purple-500 border-r-purple-500 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Sparkles className="w-10 h-10 text-purple-400 animate-pulse filter drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                                </div>
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 animate-pulse drop-shadow-sm">
                                {feature.isVideo ? '视频生成中 (约1-2分钟)...' : 'AI 处理中...'}
                            </span>
                            <span className="text-sm text-slate-400 mt-2 font-mono tracking-widest">{Math.floor(state.progress)}%</span>
                        </div>
                    )}

                    {/* Mode B: Result Display */}
                    {state.resultUrl && (
                        <div className="absolute inset-0 w-full h-full">
                            {/* IF Video, Show Video Player */}
                            {feature.isVideo ? (
                                <video 
                                    src={state.resultUrl} 
                                    controls 
                                    autoPlay 
                                    loop 
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                /* IF Image */
                                state.originalUrl ? (
                                    <BeforeAfterSlider 
                                        beforeUrl={state.originalUrl} 
                                        afterUrl={state.resultUrl} 
                                    />
                                ) : (
                                    <img 
                                        src={state.resultUrl} 
                                        alt="Result" 
                                        className="w-full h-full object-contain"
                                    />
                                )
                            )}
                            
                            {state.originalUrl && !feature.isVideo && (
                                <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none z-20">
                                    <span className="bg-black/60 backdrop-blur-md text-white/90 text-xs px-4 py-2 rounded-full border border-white/10 shadow-lg">
                                        ↔ 左右拖动查看效果
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right: Controls Sidebar */}
                <div className="w-full lg:w-96 lg:shrink-0 mt-6 lg:mt-0 space-y-6">
                    
                    {/* Status Badge */}
                    {state.resultUrl && (
                        <div className="flex items-center gap-2 text-green-400 bg-green-500/10 px-4 py-3 rounded-2xl text-sm border border-green-500/20 backdrop-blur-sm shadow-sm">
                            <CheckCircle2 className="w-5 h-5" />
                            <div className="flex-1">
                                <p className="font-bold">处理完成</p>
                                <p className="text-xs opacity-70">由 {getProviderName()} 生成</p>
                            </div>
                        </div>
                    )}
                    
                    {/* Error Badge */}
                     {error && (
                        <div className="w-full flex items-center gap-3 text-red-400 bg-red-500/10 px-4 py-3 rounded-2xl text-sm border border-red-500/20 backdrop-blur-sm">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <div className="flex-1">
                                <span>{error}</span>
                            </div>
                            <button 
                                onClick={() => setShowSettings(true)}
                                className="underline text-xs font-bold hover:text-red-300 whitespace-nowrap"
                            >
                                切换模型
                            </button>
                        </div>
                    )}

                    {/* Controls */}
                    {!state.isProcessing && !state.resultUrl && (
                        <div className="space-y-4 bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-xl shadow-2xl">
                             
                             {/* Audio Upload for Talking/Singing */}
                             {(feature.id === 'img2talk' || feature.id === 'img2sing') && (
                                <div className="w-full mb-4">
                                    <label className="text-xs text-slate-400 font-bold uppercase mb-2 block tracking-wider flex items-center gap-2">
                                        {feature.id === 'img2sing' ? <Music className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                                        上传参考音频 (可选)
                                    </label>
                                    
                                    {!audioFile ? (
                                        <div 
                                            onClick={() => audioInputRef.current?.click()}
                                            className="w-full h-16 border border-dashed border-slate-600/50 rounded-xl flex items-center justify-center gap-3 bg-black/20 hover:bg-black/30 hover:border-purple-500/50 transition-all cursor-pointer group"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-slate-700/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <FileAudio className="w-4 h-4 text-slate-400 group-hover:text-purple-400" />
                                            </div>
                                            <span className="text-xs text-slate-400 font-medium group-hover:text-slate-200">点击上传 MP3 / WAV</span>
                                        </div>
                                    ) : (
                                        <div className="w-full h-16 border border-white/10 rounded-xl flex items-center justify-between px-4 bg-purple-500/10">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/30">
                                                    <Music className="w-4 h-4 text-white" />
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-xs font-bold text-white truncate">{audioFile.name}</span>
                                                    <span className="text-[10px] text-purple-300">{(audioFile.size / 1024 / 1024).toFixed(2)} MB</span>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setAudioFile(null); }}
                                                className="p-1 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                    <input 
                                        type="file" 
                                        ref={audioInputRef} 
                                        className="hidden" 
                                        accept="audio/*"
                                        onChange={handleAudioChange}
                                    />
                                </div>
                             )}

                             {/* Text Prompt Input for Txt2Img / Txt2Vid or Img2Vid (optional) */}
                             {(!showUpload || feature.id === 'img2vid' || feature.id === 'img2sing' || feature.id === 'img2talk' || feature.id === 'vid-enhance') && (
                                <div className="w-full">
                                    <label className="text-xs text-slate-400 font-bold uppercase mb-2 block tracking-wider">
                                        {getPromptLabel()}
                                    </label>
                                    <div className="relative group">
                                        <textarea
                                            value={textPrompt}
                                            onChange={(e) => setTextPrompt(e.target.value)}
                                            placeholder={getPlaceholder()}
                                            className="w-full h-32 bg-black/20 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-purple-500/50 focus:bg-black/30 outline-none resize-none placeholder:text-slate-600 pb-10 transition-all backdrop-blur-sm"
                                        />
                                        <button
                                            onClick={handleOptimizePrompt}
                                            disabled={isOptimizingPrompt || !textPrompt}
                                            className="absolute bottom-3 right-3 p-2 bg-indigo-600/80 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 backdrop-blur-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-white/10 shadow-lg"
                                            title="使用 DeepSeek/Kimi 优化提示词"
                                        >
                                            {isOptimizingPrompt ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                                            AI 润色
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-2 flex items-center gap-1 opacity-70">
                                        <Sparkles className="w-3 h-3" />
                                        提示：输入简单中文，点击“AI 润色”获取专业英文 Prompt
                                    </p>
                                </div>
                             )}

                             {/* ID Photo Background Color Selector */}
                             {feature.id === 'id-photo' && (
                                <div className="w-full">
                                   <label className="text-xs text-slate-400 font-bold uppercase mb-3 block tracking-wider flex items-center gap-2">
                                        <Palette className="w-3 h-3" />
                                        背景颜色
                                    </label>
                                    <div className="flex gap-4">
                                        {ID_PHOTO_COLORS.map(color => (
                                            <button
                                                key={color.id}
                                                onClick={() => setIdPhotoBg(color.id)}
                                                className={`flex-1 p-3 rounded-xl border transition-all flex flex-col items-center gap-2 backdrop-blur-sm ${
                                                    idPhotoBg === color.id
                                                    ? 'border-purple-500 bg-purple-500/20 text-white shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                                                    : 'border-white/5 bg-white/5 text-slate-400 hover:border-white/20 hover:bg-white/10'
                                                }`}
                                            >
                                                <div className={`w-6 h-6 rounded-full shadow-sm ${color.colorClass} ${color.id === 'white' ? 'border border-slate-300' : ''}`}>
                                                    {idPhotoBg === color.id && color.id !== 'white' && (
                                                        <Check className="w-4 h-4 text-white mx-auto mt-1" />
                                                    )}
                                                     {idPhotoBg === color.id && color.id === 'white' && (
                                                        <Check className="w-4 h-4 text-black mx-auto mt-1" />
                                                    )}
                                                </div>
                                                <span className="text-xs font-bold">{color.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                             )}

                             {/* ID Photo Size Selector */}
                             {feature.id === 'id-photo' && (
                                <div className="w-full mt-2">
                                    <label className="text-xs text-slate-400 font-bold uppercase mb-3 block tracking-wider flex items-center gap-2">
                                        <Ruler className="w-3 h-3" />
                                        选择尺寸
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {ID_PHOTO_SIZES.map(size => (
                                            <button
                                                key={size.id}
                                                onClick={() => setIdPhotoSize(size.id)}
                                                className={`p-3 rounded-xl border text-left transition-all backdrop-blur-sm ${
                                                    idPhotoSize === size.id
                                                    ? 'border-purple-500 bg-purple-500/20 text-white shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                                                    : 'border-white/5 bg-white/5 text-slate-400 hover:border-white/20 hover:bg-white/10'
                                                }`}
                                            >
                                                <div className="font-bold text-sm mb-0.5">{size.name}</div>
                                                <div className="text-[10px] opacity-70">{size.description}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                             )}
                             
                             {/* Video Aspect Ratio Selector */}
                             {feature.isVideo && (
                                <div className="w-full">
                                    <label className="text-xs text-slate-400 font-bold uppercase mb-3 block tracking-wider flex items-center gap-2">
                                        <Monitor className="w-3 h-3" />
                                        画幅比例
                                    </label>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => setAspectRatio('16:9')}
                                            className={`flex-1 p-3 rounded-xl border transition-all flex items-center justify-center gap-2 backdrop-blur-sm ${
                                                aspectRatio === '16:9' 
                                                ? 'bg-purple-600/80 text-white border-purple-500 shadow-lg shadow-purple-500/20' 
                                                : 'bg-white/5 text-slate-400 border-white/5 hover:border-white/20 hover:bg-white/10'
                                            }`}
                                        >
                                            <div className="w-5 h-3 border-2 border-current rounded-sm" />
                                            <span className="text-xs font-bold">16:9 横屏</span>
                                        </button>
                                        <button 
                                            onClick={() => setAspectRatio('9:16')}
                                            className={`flex-1 p-3 rounded-xl border transition-all flex items-center justify-center gap-2 backdrop-blur-sm ${
                                                aspectRatio === '9:16' 
                                                ? 'bg-purple-600/80 text-white border-purple-500 shadow-lg shadow-purple-500/20' 
                                                : 'bg-white/5 text-slate-400 border-white/5 hover:border-white/20 hover:bg-white/10'
                                            }`}
                                        >
                                            <div className="w-3 h-5 border-2 border-current rounded-sm" />
                                            <span className="text-xs font-bold">9:16 竖屏</span>
                                        </button>
                                    </div>
                                </div>
                             )}

                             {/* Style Selector */}
                            {feature.styles && feature.styles.length > 0 && (
                                <div className="w-full">
                                    <label className="text-xs text-slate-400 font-bold uppercase mb-3 block tracking-wider flex items-center gap-2">
                                        <Palette className="w-3 h-3" />
                                        选择风格
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {feature.styles.map(s => (
                                            <button
                                                key={s.id}
                                                onClick={() => setSelectedStyleId(s.id)}
                                                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border backdrop-blur-sm ${
                                                    selectedStyleId === s.id 
                                                    ? 'bg-purple-600/80 text-white border-purple-500 shadow-lg shadow-purple-500/20' 
                                                    : 'bg-white/5 text-slate-400 border-white/5 hover:border-white/20 hover:text-slate-200 hover:bg-white/10'
                                                }`}
                                            >
                                                {s.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="h-px bg-white/10 my-2" />

                            <button 
                                onClick={startProcessing}
                                className={`w-full py-4 rounded-xl bg-gradient-to-r ${feature.color} font-bold text-white shadow-xl shadow-purple-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 hover:brightness-110 hover:shadow-purple-500/40 border border-white/10 backdrop-blur-sm`}
                            >
                                <Sparkles className="w-5 h-5" />
                                {state.isSampleMode ? '查看演示效果' : '开始生成'}
                            </button>
                            
                            {showUpload && (
                                <button 
                                    onClick={() => setState(prev => ({...prev, originalUrl: null, isSampleMode: false}))}
                                    className="w-full py-3 text-slate-400 font-medium hover:text-white transition-colors bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl backdrop-blur-sm"
                                >
                                    更换照片
                                </button>
                            )}
                        </div>
                    )}

                    {/* Result Actions */}
                    {state.resultUrl && (
                        <div className="space-y-4 bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-xl shadow-2xl">
                            <button 
                                onClick={handleDownload}
                                className="w-full py-3 rounded-xl bg-white text-slate-900 font-bold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 shadow-lg"
                            >
                                <Download className="w-5 h-5" />
                                保存{feature.isVideo ? '视频' : '图片'}
                            </button>
                            <button 
                                onClick={handleShare}
                                className="w-full py-3 rounded-xl bg-white/5 text-white font-semibold hover:bg-white/10 transition-colors flex items-center justify-center gap-2 border border-white/10 backdrop-blur-sm"
                            >
                                <Share2 className="w-5 h-5" />
                                分享
                            </button>
                            
                            <div className="h-px bg-white/10 my-2" />

                            <button 
                                onClick={() => setState(prev => ({...prev, resultUrl: null, isSampleMode: false}))}
                                className="w-full text-slate-500 text-sm hover:text-white transition-colors py-2 flex items-center justify-center gap-2"
                            >
                                <RefreshCw className="w-4 h-4" />
                                {showUpload ? '处理下一张' : '重新生成'}
                            </button>
                            
                            {!showUpload && (
                                <button 
                                     onClick={() => {
                                         setTextPrompt('');
                                         setState(prev => ({...prev, resultUrl: null}));
                                     }}
                                     className="w-full text-slate-500 text-sm hover:text-white transition-colors py-1 flex items-center justify-center gap-2"
                                >
                                    清空描述
                                </button>
                            )}
                        </div>
                    )}

                    <div className="text-[10px] text-slate-500 text-center px-4 opacity-70">
                        AI 生成内容仅供参考，请遵守相关法律法规。
                    </div>
                </div>
            </>
        )}
      </div>
      
      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-slate-800/90 backdrop-blur-xl rounded-3xl p-6 w-full max-w-sm border border-white/10 shadow-2xl">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
              <Settings2 className="w-5 h-5 text-purple-400" />
              模型设置
            </h3>
            
            <div className="space-y-6">
              {/* Provider Selection */}
              <div>
                 <label className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-2 block">AI 提供商</label>
                 <div className="grid grid-cols-3 gap-2">
                    {/* Gemini */}
                    <button 
                      onClick={() => setProvider('gemini')}
                      className={`p-2 rounded-xl border flex flex-col items-center gap-2 transition-all backdrop-blur-sm ${
                        provider === 'gemini' 
                          ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-sm' 
                          : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/20 hover:bg-white/10'
                      }`}
                    >
                       <Sparkles className="w-5 h-5" />
                       <span className="text-[10px] font-bold text-center">Gemini</span>
                    </button>
                    
                    {/* Zhipu AI */}
                    <button 
                      onClick={() => setProvider('zhipu')}
                      className={`p-2 rounded-xl border flex flex-col items-center gap-2 transition-all backdrop-blur-sm ${
                        provider === 'zhipu' 
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400 shadow-sm' 
                          : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/20 hover:bg-white/10'
                      }`}
                    >
                       <Palette className="w-5 h-5" />
                       <span className="text-[10px] font-bold text-center">智谱 CogView</span>
                    </button>

                    {/* SiliconFlow */}
                    <button 
                      onClick={() => setProvider('siliconflow')}
                      className={`p-2 rounded-xl border flex flex-col items-center gap-2 transition-all backdrop-blur-sm ${
                        provider === 'siliconflow' 
                          ? 'bg-orange-600/20 border-orange-500 text-orange-400 shadow-sm' 
                          : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/20 hover:bg-white/10'
                      }`}
                    >
                       <Cloud className="w-5 h-5" />
                       <span className="text-[10px] font-bold text-center">SiliconCloud</span>
                    </button>
                 </div>
              </div>

              {/* API Key Input */}
              {provider === 'siliconflow' && (
                  <div className="animate-fade-in">
                    <label className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1 block">
                       SiliconFlow API Key
                    </label>
                    <input 
                      type="password" 
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="sk-..."
                      className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-purple-500 outline-none transition-colors backdrop-blur-sm"
                    />
                    <p className="text-[10px] text-slate-500 mt-2">
                       支持 Kolors (可灵) 等模型。
                    </p>
                  </div>
              )}

              {provider === 'zhipu' && (
                  <div className="animate-fade-in">
                    <label className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1 block">
                       智谱 AI Key
                    </label>
                    <input 
                      type="password" 
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="请输入 Key..."
                      className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-purple-500 outline-none transition-colors backdrop-blur-sm"
                    />
                    <p className="text-[10px] text-slate-500 mt-2">
                       通用 Key，支持 GLM-4 对话和 CogView-3 绘画。
                    </p>
                  </div>
              )}
              
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setShowSettings(false)}
                  className="flex-1 py-2 text-slate-400 hover:text-white transition-colors"
                >
                  取消
                </button>
                <button 
                  onClick={() => saveApiKey(apiKey)}
                  className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium shadow-lg shadow-purple-900/20"
                >
                  保存设置
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};