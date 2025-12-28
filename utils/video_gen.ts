import { GoogleGenAI } from "@google/genai";

// CORS Proxy to bypass browser restrictions
const CORS_PROXY = "https://corsproxy.io/?";

/**
 * Helper to convert File object to Base64 string (raw)
 */
const fileToRawBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the "data:image/xxx;base64," prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Main Entry Point for Video Generation
 */
export async function generateVideo(
  provider: 'gemini' | 'zhipu' | 'siliconflow',
  apiKey: string,
  prompt: string,
  imageFile: File | null,
  featureId?: string,
  stylePrompt?: string,
  aspectRatio: '16:9' | '9:16' = '16:9'
): Promise<string> {
  
  if (provider === 'gemini') {
    return generateVideoWithVeo(apiKey, prompt, imageFile, featureId, stylePrompt, aspectRatio);
  } else if (provider === 'zhipu') {
    return generateVideoWithZhipu(apiKey, prompt, imageFile, featureId, stylePrompt, aspectRatio);
  } else {
    throw new Error(`Video provider ${provider} is not supported yet.`);
  }
}

/**
 * Process video generation using Google Gemini Veo model
 */
export async function generateVideoWithVeo(
  apiKey: string,
  prompt: string,
  imageFile: File | null,
  featureId?: string,
  stylePrompt?: string,
  aspectRatio: '16:9' | '9:16' = '16:9'
): Promise<string> {
  // Always use a fresh client instance with the provided key
  const ai = new GoogleGenAI({ apiKey: apiKey });

  let operation;
  let finalPrompt = prompt;

  // Auto-enhance prompt based on feature type
  if (featureId) {
      if (featureId === 'img2talk') {
          finalPrompt = `A close-up, high-quality video of this person talking expressively. Natural lip movements, eye contact, and head gestures. ${prompt}`;
      } else if (featureId === 'img2sing') {
          finalPrompt = `A music video style shot of this person singing emotionally. Dynamic lighting, expressive facial movements, syncing with imaginary music. ${prompt}`;
      } else if (featureId === 'vid-enhance') {
          // Use style prompt if selected, otherwise fallback to general enhancement
          const baseEnhancePrompt = stylePrompt || "High fidelity, 1080p resolution, cinematic lighting, sharp details, smooth motion. Enhance the quality of this visual.";
          finalPrompt = prompt ? `${baseEnhancePrompt} Content: ${prompt}` : baseEnhancePrompt;
      }
  }
  
  // Default fallback if finalPrompt is empty (Veo requires a prompt)
  if (!finalPrompt || finalPrompt.trim() === "") {
      finalPrompt = "High quality video.";
  }
  
  if (imageFile) {
    // Image-to-Video
    const base64Data = await fileToRawBase64(imageFile);
    
    operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview', // Using fast preview model
      prompt: finalPrompt,
      image: {
        imageBytes: base64Data,
        mimeType: imageFile.type,
      },
      config: {
        numberOfVideos: 1,
        // Use 1080p for enhancement feature, 720p for others for speed
        resolution: featureId === 'vid-enhance' ? '1080p' : '720p', 
        aspectRatio: aspectRatio
      }
    });
  } else {
    // Text-to-Video
    operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: finalPrompt,
      config: {
        numberOfVideos: 1,
        resolution: '1080p',
        aspectRatio: aspectRatio
      }
    });
  }

  // Polling loop
  // Video generation takes time, we must poll the operation status
  console.log("Video generation started, polling for results...");
  
  while (!operation.done) {
    // Wait 5 seconds between polls to avoid hitting rate limits too aggressively
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
    console.log("Polling video status...");
  }

  // Check for success
  const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
  
  if (!videoUri) {
     if (operation.error) {
         throw new Error(`Video generation failed: ${operation.error.message || 'Unknown error'}`);
     }
     throw new Error("Video generation completed but no video URI was returned.");
  }

  // The URI requires the API Key appended to fetch the actual binary content
  const authenticatedUrl = `${videoUri}&key=${apiKey}`;
  
  // Fetch the video blob to create a local object URL (so it plays reliably in browser)
  try {
      const response = await fetch(authenticatedUrl);
      if (!response.ok) {
          throw new Error(`Failed to download video: ${response.statusText}`);
      }
      const blob = await response.blob();
      return URL.createObjectURL(blob);
  } catch (e) {
      console.error("Error fetching video blob:", e);
      // Fallback to the authenticated URL if blob fetch fails (though might have CORS issues)
      return authenticatedUrl;
  }
}

/**
 * Process video generation using Zhipu AI (CogVideoX)
 * API Docs: https://open.bigmodel.cn/dev/api#videogeneration
 */
export async function generateVideoWithZhipu(
  apiKey: string,
  prompt: string,
  imageFile: File | null,
  featureId?: string,
  stylePrompt?: string,
  aspectRatio: '16:9' | '9:16' = '16:9'
): Promise<string> {
  if (!apiKey) throw new Error("Zhipu API Key is required.");

  let finalPrompt = prompt;

  // Enhance prompts for CogVideoX to simulate talking/singing behavior
  if (featureId) {
      if (featureId === 'img2talk') {
          finalPrompt = `人物特写镜头，这个人正在自然地说话，口型生动，眼神有交流感。高清画质。${prompt}`;
      } else if (featureId === 'img2sing') {
          finalPrompt = `人物特写镜头，这个人正在深情地唱歌，表情丰富，光影富有音乐感。MV风格。${prompt}`;
      } else if (featureId === 'vid-enhance') {
          finalPrompt = `4k高清画质，电影级光影，细节清晰，画面流畅。${prompt}`;
      }
  }

  if (!finalPrompt || finalPrompt.trim() === "") {
      finalPrompt = "High quality cinematic video.";
  }

  // Zhipu CogVideoX currently supports Text-to-Video via API V4.
  // Image-to-Video via API often requires a public URL for the image, which we don't have in this frontend-only app.
  // We will try to pass the image if supported by the specific endpoint variant, otherwise fallback to Text-to-Video with a warning if image is present.
  
  if (imageFile) {
     console.warn("Zhipu CogVideoX API in this demo mode primarily supports Text-to-Video. Image-to-Video requires a hosted image URL.");
     // In a real production app, upload `imageFile` to OSS/S3 here, then pass the URL.
     // For this demo, we proceed with the text prompt describing the scene.
     finalPrompt += " (Note: Generate video based on this description)";
  }

  const url = `${CORS_PROXY}https://open.bigmodel.cn/api/paas/v4/videos/generations`;
  
  // 1. Submit Task
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "cogvideox",
      prompt: finalPrompt,
      quality: "quality", // or "speed"
      with_audio: true, // Generate audio if possible
      size: "1920x1080", // Zhipu supports specific sizes
      fps: 30
    })
  });

  if (!response.ok) {
     const err = await response.json().catch(() => ({}));
     throw new Error(`Zhipu API Error: ${err.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const taskId = data.id;

  if (!taskId) throw new Error("Failed to start Zhipu video generation task.");

  // 2. Poll for Results
  console.log(`Zhipu Task ID: ${taskId}, polling...`);
  
  let attempts = 0;
  const maxAttempts = 60; // 5 minutes (5s * 60)

  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const statusUrl = `${CORS_PROXY}https://open.bigmodel.cn/api/paas/v4/async-result/${taskId}`;
    const statusRes = await fetch(statusUrl, {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    
    if (statusRes.ok) {
        const statusData = await statusRes.json();
        
        if (statusData.task_status === 'SUCCESS') {
            const videoUrl = statusData.video_result?.[0]?.url;
            if (videoUrl) return videoUrl;
            throw new Error("Zhipu task succeeded but no video URL found.");
        } else if (statusData.task_status === 'FAIL') {
            throw new Error(`Zhipu generation failed: ${JSON.stringify(statusData)}`);
        }
        
        console.log(`Zhipu Status: ${statusData.task_status}`);
    }
    attempts++;
  }

  throw new Error("Zhipu video generation timed out.");
}