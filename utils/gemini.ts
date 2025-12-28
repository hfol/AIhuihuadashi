import { GoogleGenAI } from "@google/genai";

// Initialize Gemini Client
// Note: process.env.API_KEY is expected to be configured in the environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
 * Process image using Gemini 2.5 Flash Image model (Nano Banana)
 * Can now handle both Image-to-Image and Text-to-Image requests
 */
export async function processImageWithGemini(
  imageFile: File | null, 
  featureId: string, 
  stylePrompt?: string,
  userTextPrompt?: string,
  bgColor?: string,
  targetSize?: string
): Promise<string> {
  
  let base64Data = "";
  if (imageFile) {
    base64Data = await fileToRawBase64(imageFile);
  }
  
  let prompt = "";
  
  // Optimized prompts for gemini-2.5-flash-image
  // IMPORTANT: The model often refuses "edit" commands like "restore this". 
  // We must frame prompts as "Generate a [description] based on this image".
  switch (featureId) {
    case 'txt2img':
      // Combine user text prompt with selected style if available
      prompt = `Generate a high-quality image based on this description: "${userTextPrompt}". `;
      if (stylePrompt) prompt += ` Style: ${stylePrompt}.`;
      break;
    case 'face-restore':
      prompt = "Generate a high-quality, sharp, and crystal clear portrait based on the input image. Reconstruct facial details, remove blur, and improve skin texture while maintaining the original identity. Photorealistic quality.";
      break;
    case 'upscale':
      prompt = "Generate a high-resolution, sharp, and detailed version of this image. Increase clarity, refine textures, and reduce noise while strictly maintaining the original composition and content. 4k resolution.";
      break;
    case 'cutout':
      prompt = "Generate an image of the main subject from the input image, but place it on a clean pure white background. The subject should be perfectly isolated (cutout) with sharp edges. Product photography style.";
      break;
    case 'stylize':
      prompt = stylePrompt || "Generate a 3D Pixar style character portrait based on the person in the input image. Cute, big eyes, soft studio lighting, 3d render, vibrant colors.";
      break;
    case 'colorize':
      prompt = "Generate a natural color version of this black and white photo. Accurately colorize the skin tones, clothing, and background environment based on the visual context.";
      break;
    case 'beauty':
      prompt = "Generate a professional beauty portrait based on the input image. Smooth skin naturally, enhance lighting, and apply subtle professional makeup look. Magazine cover quality.";
      break;
    case 'id-photo':
      // Use the provided bgColor or default to white
      const backgroundDesc = bgColor || "white";
      const sizeDesc = targetSize ? ` ${targetSize}.` : "";
      prompt = `Generate a professional ID photo based on the person in this image. Crop to a standard headshot composition${sizeDesc}. Use a clean ${backgroundDesc} background. Ensure even, professional lighting and formal appearance.`;
      break;
    default:
      prompt = "Generate an enhanced, high-quality version of this image.";
  }

  try {
    const parts: any[] = [];
    
    // If we have an image, add it to parts
    if (imageFile && base64Data) {
      parts.push({
        inlineData: {
          data: base64Data,
          mimeType: imageFile.type,
        },
      });
    }

    // Add the text prompt
    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', // Supports both text-only and multimodal input
      contents: {
        parts: parts,
      },
    });

    const candidate = response.candidates?.[0];

    if (!candidate) {
      throw new Error("未能获取 AI 响应 (No candidate).");
    }

    // Check if the generation was blocked by safety settings
    // Includes standard SAFETY and specific IMAGE_SAFETY codes
    if (
      candidate.finishReason === 'SAFETY' || 
      (candidate.finishReason as string) === 'IMAGE_SAFETY' ||
      (candidate.finishReason as string) === 'BLOCK_LOW_AND_ABOVE' ||
      (candidate.finishReason as string) === 'BLOCK_MEDIUM_AND_ABOVE'
    ) {
      throw new Error("图片内容触发了 AI 安全审查（Safety Filter），无法生成。请尝试更换一张照片或避免包含敏感内容。");
    }

    // Check if the generation stopped for other reasons without content
    if (!candidate.content && candidate.finishReason) {
         throw new Error(`图片生成失败。原因: ${candidate.finishReason}`);
    }
    
    // Iterate through parts to find the image part
    const partsRes = candidate.content?.parts;
    let textOutput = '';

    if (partsRes) {
      for (const part of partsRes) {
        if (part.inlineData) {
          // Use the dynamic mimeType returned by the model
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
        if (part.text) {
          textOutput += part.text;
        }
      }
    }

    // If we found text but no image, the model likely refused or failed to generate an image
    if (textOutput) {
       console.warn("Gemini Text Output:", textOutput);
       // Check for refusal language
       if (textOutput.includes("cannot") || textOutput.includes("sorry") || textOutput.includes("unable")) {
         throw new Error(`AI 拒绝处理该图片: "${textOutput.substring(0, 100)}..."`);
       }
       throw new Error(`AI 返回了文本而非图片: "${textOutput.substring(0, 50)}..."`);
    }

    // If absolutely no parts or unknown structure
    console.error("Full Candidate Object:", JSON.stringify(candidate, null, 2));
    throw new Error("AI 未返回有效的图片数据。请重试。");
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    // Preserve the specific error message if it's one we constructed
    throw error;
  }
}