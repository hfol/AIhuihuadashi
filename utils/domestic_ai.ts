import { DomesticProvider, ChatMessage } from "../types";

// CORS Proxy to bypass browser restrictions for domestic APIs
// Note: In a production environment, you should route these requests through your own backend.
const CORS_PROXY = "https://corsproxy.io/?";

// Configuration for providers
const PROVIDER_CONFIG = {
  deepseek: {
    // Prepends proxy to the API URL
    url: `${CORS_PROXY}https://api.deepseek.com/chat/completions`,
    model: 'deepseek-chat', // DeepSeek-V3
    name: 'DeepSeek-V3'
  },
  moonshot: {
    url: `${CORS_PROXY}https://api.moonshot.cn/v1/chat/completions`,
    model: 'moonshot-v1-8k',
    name: 'Kimi (Moonshot)'
  },
  zhipu: {
    url: `${CORS_PROXY}https://open.bigmodel.cn/api/paas/v4/chat/completions`,
    model: 'glm-4', // GLM-4
    name: '智谱 GLM-4'
  }
};

/**
 * Call Domestic AI APIs (OpenAI Compatible)
 */
export async function chatWithDomesticAI(
  messages: ChatMessage[],
  provider: DomesticProvider,
  apiKey: string,
  systemInstruction?: string // Optional custom system prompt
): Promise<ReadableStream<Uint8Array> | null> {
  
  const config = PROVIDER_CONFIG[provider];
  
  // Format messages for OpenAI API standard
  const apiMessages = messages.map(msg => ({
    role: msg.role,
    content: msg.content
  }));

  // Add a system prompt to give the AI context
  const defaultSystemPrompt = "你是一位专业的摄影师和图像处理专家。你的任务是帮助用户优化AI绘画的提示词（Prompts），或者提供关于摄影构图、光影、后期修图的专业建议。请用简洁、友好的中文回答。";

  const systemPrompt = {
    role: "system",
    content: systemInstruction || defaultSystemPrompt
  };

  try {
    const response = await fetch(config.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [systemPrompt, ...apiMessages],
        stream: true, // Enable streaming
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API Error (${response.status}): ${errorData.error?.message || response.statusText}`);
    }

    return response.body;

  } catch (error: any) {
    console.error(`Error calling ${provider}:`, error);
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
       throw new Error("网络请求失败 (CORS)。请确保您的网络可以访问该 API，或尝试使用支持 CORS 的插件。");
    }
    throw error;
  }
}

/**
 * Helper to parse Server-Sent Events (SSE) from OpenAI compatible streams
 */
export async function* parseStream(stream: ReadableStream<Uint8Array>) {
  const reader = stream.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed === "data: [DONE]") continue;
      if (trimmed.startsWith("data: ")) {
        try {
          const data = JSON.parse(trimmed.slice(6));
          const content = data.choices?.[0]?.delta?.content;
          if (content) {
            yield content;
          }
        } catch (e) {
          console.warn("Error parsing stream chunk", e);
        }
      }
    }
  }
}