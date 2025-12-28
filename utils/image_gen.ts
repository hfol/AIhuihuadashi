import { processImageWithGemini } from './gemini';
import { ImageModelProvider } from '../types';

// CORS Proxy to bypass browser restrictions
const CORS_PROXY = "https://corsproxy.io/?";

/**
 * SiliconFlow API Configuration
 */
const SILICONFLOW_CONFIG = {
  url: `${CORS_PROXY}https://api.siliconflow.cn/v1/images/generations`,
  model: 'Kwai-Kolors/Kolors',
};

/**
 * Zhipu AI Configuration (BigModel)
 */
const ZHIPU_CONFIG = {
  // Zhipu's OpenAI-compatible endpoint
  url: `${CORS_PROXY}https://open.bigmodel.cn/api/paas/v4/images/generations`,
  model: 'cogview-3-plus', // High quality model
};

/**
 * Main entry point for image processing
 */
export async function processImage(
  file: File | null, 
  featureId: string, 
  provider: ImageModelProvider,
  apiKey?: string,
  stylePrompt?: string,
  userTextPrompt?: string, // New optional param for Text-to-Image
  bgColor?: string, // New optional param for ID Photo background
  targetSize?: string // New optional param for ID Photo size
): Promise<string> {
  
  if (provider === 'gemini') {
    return processImageWithGemini(file, featureId, stylePrompt, userTextPrompt, bgColor, targetSize);
  } else if (provider === 'siliconflow') {
    if (!apiKey) throw new Error("SiliconFlow API Key is required");
    return processImageWithSiliconFlow(file, featureId, apiKey, stylePrompt, userTextPrompt, bgColor, targetSize);
  } else if (provider === 'zhipu') {
    if (!apiKey) throw new Error("Zhipu API Key is required");
    return processImageWithZhipu(file, featureId, apiKey, stylePrompt, userTextPrompt, bgColor, targetSize);
  }
  
  throw new Error("Unknown provider");
}

// ... Helper to generate prompts (reuse logic) ...
function getPromptForFeature(featureId: string, stylePrompt?: string, userTextPrompt?: string, bgColor?: string, targetSize?: string): string {
  if (featureId === 'txt2img') {
     let p = userTextPrompt || "A beautiful landscape";
     if (stylePrompt) p += `, ${stylePrompt}`;
     return p;
  }
  
  if (featureId === 'stylize' && stylePrompt) {
      return stylePrompt;
  }

  const basePrompt = "High quality, 8k resolution, photorealistic, masterpiece. ";
  switch (featureId) {
    case 'face-restore':
      return basePrompt + "A perfect professional portrait, sharp focus, detailed skin texture, perfect lighting, clear facial features.";
    case 'upscale':
      return basePrompt + "Ultra high resolution version of this image, extreme detail, 4k, clean lines, no blur.";
    case 'cutout':
       return "The main object from the image on a clean white background. Product photography, sharp edges, no background.";
    case 'stylize':
      // Fallback if no stylePrompt is provided
      return "A 3D Disney Pixar style character portrait, cute, big eyes, soft studio lighting, 3d render, vibrant colors.";
    case 'colorize':
      return basePrompt + "A colorized vintage photo, historical accuracy, natural skin tones, vibrant environment.";
    case 'beauty':
      return basePrompt + "Beauty portrait, smooth skin, professional makeup, soft lighting, magazine cover quality.";
    case 'id-photo':
      const bg = bgColor || "white";
      const sizeInfo = targetSize ? ` ${targetSize}.` : "";
      return `Professional ID photo, headshot, ${bg} background, business attire, even lighting, front facing.${sizeInfo}`;
    default:
      return basePrompt + "Enhanced photography.";
  }
}

/**
 * Process image using SiliconFlow (Kolors)
 */
async function processImageWithSiliconFlow(
  file: File | null, 
  featureId: string, 
  apiKey: string, 
  stylePrompt?: string,
  userTextPrompt?: string,
  bgColor?: string,
  targetSize?: string
): Promise<string> {
  const prompt = getPromptForFeature(featureId, stylePrompt, userTextPrompt, bgColor, targetSize);

  // Note: Kolors is primarily Txt2Img. 
  // For Img2Img features, we might need to assume the user wants Txt2Img generation based on description if file is missing,
  // OR we need to use a different endpoint for Img2Img if SiliconFlow supports it (usually different URL/params).
  // For simplicity in this demo, we treat everything as prompt-based generation.
  // Real implementation would need Image-to-Image support for SiliconFlow.
  
  // If file exists and we are doing restore/stylize, SiliconFlow API for Img2Img is needed.
  // Since we are using the basic 'images/generations' endpoint which is typically Txt2Img:
  if (file && featureId !== 'txt2img') {
     console.warn("SiliconFlow implementation in this demo currently supports Text-to-Image best. Image inputs might be ignored by this specific endpoint configuration.");
  }

  try {
    const response = await fetch(SILICONFLOW_CONFIG.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: SILICONFLOW_CONFIG.model,
        prompt: prompt,
        image_size: "1024x1024",
        num_inference_steps: 25,
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`SiliconFlow API Error: ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    if (data.data && data.data.length > 0 && data.data[0].url) {
        return data.data[0].url;
    }
    throw new Error("No image URL returned from SiliconFlow");
  } catch (error: any) {
    console.error("SiliconFlow Error:", error);
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
       throw new Error("连接失败 (CORS)。请检查 API Key 或网络设置。");
    }
    throw error;
  }
}

/**
 * Process image using Zhipu AI (CogView-3)
 */
async function processImageWithZhipu(
    file: File | null, 
    featureId: string, 
    apiKey: string, 
    stylePrompt?: string,
    userTextPrompt?: string,
    bgColor?: string,
    targetSize?: string
): Promise<string> {
  const prompt = getPromptForFeature(featureId, stylePrompt, userTextPrompt, bgColor, targetSize);

  try {
    const response = await fetch(ZHIPU_CONFIG.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}` 
      },
      body: JSON.stringify({
        model: ZHIPU_CONFIG.model,
        prompt: prompt,
        size: "1024x1024"
      })
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        if (err.error?.code === '1301' || (err.error?.message && err.error.message.includes("余额不足"))) {
           throw new Error("智谱AI账户余额不足。请充值或切换到其他模型。");
        }
        throw new Error(`Zhipu API Error: ${err.error?.message || response.statusText}`);
    }

    const data = await response.json();
    if (data.data && data.data.length > 0 && data.data[0].url) {
        return data.data[0].url;
    }
    throw new Error("No image URL returned from Zhipu AI");

  } catch (e: any) {
    console.error("Zhipu AI Error:", e);
    if (e.name === 'TypeError' && e.message.includes('fetch')) {
       throw new Error("连接失败 (CORS)。请检查 API Key 或网络设置。");
    }
    throw e;
  }
}