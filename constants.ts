import { Wand2, User, Palette, Sparkles, IdCard, MessageSquareMore, Image as ImageIcon, Scissors, Maximize2, Video, Film, Mic, Music, MonitorUp } from 'lucide-react';
import { Feature, ShowcaseItem } from './types';

export const ID_PHOTO_COLORS = [
  { id: 'white', name: '白底', colorClass: 'bg-white', value: 'white' },
  { id: 'blue', name: '蓝底', colorClass: 'bg-blue-600', value: 'standard ID photo blue' },
  { id: 'red', name: '红底', colorClass: 'bg-red-600', value: 'standard ID photo red' },
];

export const ID_PHOTO_SIZES = [
  { id: '1inch', name: '1寸', description: '25mm × 35mm (常规证件)', prompt: 'Standard 1 inch ID photo size (25mm x 35mm), aspect ratio 5:7' },
  { id: '2inch', name: '2寸', description: '35mm × 49mm (护照/签证)', prompt: 'Standard 2 inch ID photo size (35mm x 49mm), aspect ratio 5:7' },
  { id: 'small1inch', name: '小1寸', description: '22mm × 32mm (驾照/社保)', prompt: 'Small 1 inch ID photo size (22mm x 32mm), aspect ratio 11:16' },
  { id: 'large1inch', name: '大1寸', description: '33mm × 48mm (部分签证)', prompt: 'Large 1 inch ID photo size (33mm x 48mm), aspect ratio 11:16' },
];

export const FEATURES: Feature[] = [
  {
    id: 'txt2img',
    title: 'AI 绘画',
    subtitle: '文字生成图片',
    icon: ImageIcon,
    color: 'from-purple-600 to-indigo-600',
    description: '输入文字描述，让 AI 为您绘制心中所想的画面。支持多种艺术风格。',
    requiresInputImage: false, // Text to Image
    styles: [
      { id: 'photorealistic', name: '写实摄影', prompt: 'Photorealistic, 8k, highly detailed, cinematic lighting' },
      { id: 'anime', name: '二次元', prompt: 'Anime style, vibrant colors, clean lines, Makoto Shinkai style' },
      { id: 'cyberpunk', name: '赛博朋克', prompt: 'Cyberpunk, neon lights, futuristic city, sci-fi' },
      { id: 'watercolor', name: '水彩画', prompt: 'Watercolor painting, soft edges, artistic, dreamy' },
      { id: 'oil', name: '油画', prompt: 'Oil painting, thick brushstrokes, textured, classical' },
    ]
  },
  {
    id: 'txt2vid',
    title: '文生视频',
    subtitle: 'Veo 模型生成',
    icon: Video,
    color: 'from-fuchsia-600 to-pink-600',
    description: '输入创意脚本，使用 Google Veo 模型生成 1080p 高清短视频。',
    requiresInputImage: false,
    isVideo: true,
  },
  {
    id: 'img2vid',
    title: '图生视频',
    subtitle: '让照片动起来',
    icon: Film,
    color: 'from-rose-500 to-orange-500',
    description: '上传一张静态图片，AI 将自动预测动态并生成视频。',
    requiresInputImage: true,
    isVideo: true,
  },
  {
    id: 'img2talk',
    title: '照片说话',
    subtitle: '人物动态演讲',
    icon: Mic,
    color: 'from-green-500 to-teal-500',
    description: '上传人像照片，让人物开口说话，神态自然生动。',
    requiresInputImage: true,
    isVideo: true,
  },
  {
    id: 'img2sing',
    title: '照片唱歌',
    subtitle: '生成 MV 效果',
    icon: Music,
    color: 'from-yellow-500 to-amber-600',
    description: '让照片中的人物动情歌唱，生成极具感染力的短视频。',
    requiresInputImage: true,
    isVideo: true,
  },
  {
    id: 'vid-enhance',
    title: '视频画质增强',
    subtitle: 'AI 重绘高清化',
    icon: MonitorUp,
    color: 'from-blue-600 to-cyan-600',
    description: '基于图像生成 1080p 高清动态视频，提升画面细节与清晰度。支持风景、人脸及老电影修复。',
    requiresInputImage: true,
    isVideo: true,
    styles: [
      { id: 'general', name: '通用增强', prompt: 'High fidelity, 1080p resolution, cinematic lighting, sharp details, smooth motion. Enhance the quality of this visual.' },
      { id: 'landscape', name: '风景增强', prompt: 'Cinematic landscape video, 4k resolution, boost vibrancy, clear sky, sharp foliage details, remove haze, wide angle majestic view.' },
      { id: 'face', name: '人脸增强', prompt: 'High-end portrait video, sharp focus on eyes and face, realistic skin texture, professional studio lighting, remove blur, restore facial details.' },
      { id: 'film', name: '电影修复', prompt: 'Restored vintage film footage, remove grain and noise, stabilize camera shake, color correction, technicolor, 4k remaster quality.' }
    ]
  },
  {
    id: 'face-restore',
    title: '人脸修复',
    subtitle: '高清 & 去模糊',
    icon: User,
    color: 'from-pink-500 to-rose-500',
    description: '使用先进AI将模糊、低分辨率的人脸照片修复为高清画质。',
    requiresInputImage: true,
    demoBeforeUrl: 'https://picsum.photos/id/1005/800/800?blur=8',
    demoAfterUrl: 'https://picsum.photos/id/1005/800/800'
  },
  {
    id: 'upscale',
    title: '超清放大',
    subtitle: '画质无损增强',
    icon: Maximize2,
    color: 'from-cyan-500 to-blue-500',
    description: '针对风景、物品等通用图片进行2x/4x超分辨率放大，提升细节清晰度。',
    requiresInputImage: true,
    demoBeforeUrl: 'https://picsum.photos/id/237/400/300',
    demoAfterUrl: 'https://picsum.photos/id/237/800/600'
  },
  {
    id: 'stylize',
    title: '人像风格化',
    subtitle: '3D & 动漫风',
    icon: Wand2,
    color: 'from-violet-500 to-purple-500',
    description: '将您的肖像转化为多种艺术风格，如3D迪士尼、日系动漫等。',
    requiresInputImage: true,
    demoBeforeUrl: 'https://picsum.photos/id/64/800/800', 
    demoAfterUrl: 'https://picsum.photos/id/64/800/800?grayscale&blur=2',
    styles: [
      { id: '3d', name: '3D 迪士尼', prompt: 'Turn this into a 3D Pixar style character. Cute, big eyes, soft studio lighting, 3d render, high detail.' },
      { id: 'anime', name: '日系动漫', prompt: 'Turn this into a Japanese Anime style illustration. Vibrant colors, clean lines, Makoto Shinkai style, high quality.' },
      { id: 'clay', name: '粘土风', prompt: 'Turn this into a cute Claymation style, plasticine texture, soft rounded edges, stop-motion look.' },
      { id: 'sketch', name: '素描手绘', prompt: 'Turn this into a pencil sketch drawing. Black and white, rough lines, artistic shading, graphite texture.' },
      { id: 'pixel', name: '像素艺术', prompt: 'Turn this into a Pixel Art style portrait. Retro game aesthetic, 16-bit, vibrant colors.' }
    ]
  },
  {
    id: 'cutout',
    title: '智能抠图',
    subtitle: '物品主体提取',
    icon: Scissors,
    color: 'from-orange-500 to-red-500',
    description: '智能识别画面主体（商品、宠物等），移除背景并生成白底图。',
    requiresInputImage: true,
    demoBeforeUrl: 'https://picsum.photos/id/1062/800/800',
    demoAfterUrl: 'https://picsum.photos/id/1062/800/800?grayscale'
  },
  {
    id: 'colorize',
    title: '照片上色',
    subtitle: '黑白转彩色',
    icon: Palette,
    color: 'from-blue-400 to-cyan-500',
    description: '通过逼真的AI上色技术，让黑白老照片重焕生机。',
    requiresInputImage: true,
    demoBeforeUrl: 'https://picsum.photos/id/1025/800/800?grayscale',
    demoAfterUrl: 'https://picsum.photos/id/1025/800/800'
  },
  {
    id: 'beauty',
    title: '一键美颜',
    subtitle: '自动焕肤',
    icon: Sparkles,
    color: 'from-amber-400 to-orange-500',
    description: '瞬间磨皮、祛斑，自然增强面部特征。',
    requiresInputImage: true,
    demoBeforeUrl: 'https://picsum.photos/id/342/800/800',
    demoAfterUrl: 'https://picsum.photos/id/342/800/800?blur=1'
  },
  {
    id: 'assistant',
    title: 'AI 灵感助手',
    subtitle: 'DeepSeek & Kimi',
    icon: MessageSquareMore,
    color: 'from-emerald-400 to-teal-500',
    description: '接入 DeepSeek 与 Moonshot 大模型，为您提供摄影建议与提示词优化。',
    isChat: true
  }
];

export const ID_PHOTO_FEATURE: Feature = {
  id: 'id-photo',
  title: '证件照制作',
  subtitle: '智能裁剪 & 换底',
  icon: IdCard,
  color: 'from-indigo-500 to-blue-600',
  description: '自动去除背景并调整为标准尺寸，生成专业证件照。',
  requiresInputImage: true,
  demoBeforeUrl: 'https://picsum.photos/id/453/800/800',
  demoAfterUrl: 'https://picsum.photos/id/453/800/800'
};

export const SHOWCASE_ITEMS: ShowcaseItem[] = [
  {
    id: '1',
    title: '老照片修复',
    beforeUrl: 'https://picsum.photos/id/1005/600/400?blur=5',
    afterUrl: 'https://picsum.photos/id/1005/600/400'
  },
  {
    id: '2',
    title: '黑白上色案例',
    beforeUrl: 'https://picsum.photos/id/1025/600/400?grayscale',
    afterUrl: 'https://picsum.photos/id/1025/600/400'
  },
  {
    id: '3',
    title: 'AI 绘画创作',
    beforeUrl: 'https://picsum.photos/id/1040/600/400?grayscale',
    afterUrl: 'https://picsum.photos/id/1040/600/400'
  }
];