import { askBrain, type AIHandler } from "@/lib/ai-brain";

export type AIProvider = AIHandler | "deepseek";

export interface TextGenerationRequest {
  prompt: string;
  systemPrompt?: string;
  taskType?: string;
  provider?: AIProvider;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  promptVersion?: string;
}

export interface TextGenerationResult {
  success: boolean;
  text: string | null;
  provider: AIProvider;
  resolvedProvider: string;
  model?: string;
  promptVersion: string;
  fallbackUsed: boolean;
  elapsedMs?: number;
  error?: string;
}

const providerValues: AIProvider[] = ["minimax", "copilot", "ollama", "auto", "deepseek"];

function normalizeProvider(value: string | null | undefined): AIProvider {
  if (!value) {
    return "auto";
  }

  const normalized = value.trim().toLowerCase() as AIProvider;
  return providerValues.includes(normalized) ? normalized : "auto";
}

function getDefaultProvider(): AIProvider {
  return normalizeProvider(process.env.AI_PROVIDER);
}

function getDefaultPromptVersion() {
  return process.env.AI_PROMPT_VERSION?.trim() || "health-consult-v1";
}

function extractResolvedProvider(worker: string | undefined, requestedProvider: AIProvider) {
  if (!worker) {
    return requestedProvider;
  }

  const [resolvedProvider] = worker.split(" ");
  return resolvedProvider.trim() || requestedProvider;
}

function getDeepSeekBaseUrl() {
  return (process.env.DEEPSEEK_BASE_URL?.trim() || "https://api.deepseek.com").replace(/\/$/, "");
}

function getDeepSeekModel(requestedModel: string | undefined) {
  const configuredModel = requestedModel?.trim() || process.env.DEEPSEEK_MODEL?.trim() || process.env.AI_MODEL?.trim();

  if (configuredModel?.startsWith("deepseek-")) {
    return configuredModel;
  }

  return "deepseek-v4-flash";
}

async function generateTextWithDeepSeek(
  request: TextGenerationRequest,
  promptVersion: string,
): Promise<TextGenerationResult> {
  const start = Date.now();
  const apiKey = process.env.DEEPSEEK_API_KEY?.trim();
  const model = getDeepSeekModel(request.model);

  if (!apiKey) {
    return {
      success: false,
      text: null,
      provider: "deepseek",
      resolvedProvider: "deepseek",
      model,
      promptVersion,
      fallbackUsed: false,
      elapsedMs: Date.now() - start,
      error: "DEEPSEEK_API_KEY is not configured",
    };
  }

  try {
    const messages: Array<{ role: "system" | "user"; content: string }> = [];
    if (request.systemPrompt) {
      messages.push({ role: "system", content: request.systemPrompt });
    }
    messages.push({ role: "user", content: request.prompt });

    const response = await fetch(`${getDeepSeekBaseUrl()}/chat/completions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        thinking: { type: "disabled" },
        temperature: request.temperature ?? 0.3,
        max_tokens: request.maxTokens ?? 900,
        stream: false,
      }),
      signal: AbortSignal.timeout(90_000),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`HTTP ${response.status}: ${errorText.slice(0, 240)}`);
    }

    const data = (await response.json()) as {
      model?: string;
      choices?: Array<{ message?: { content?: string | null; reasoning_content?: string | null } }>;
    };
    const text = data.choices?.[0]?.message?.content ?? null;

    return {
      success: Boolean(text),
      text,
      provider: "deepseek",
      resolvedProvider: "deepseek",
      model: data.model || model,
      promptVersion,
      fallbackUsed: false,
      elapsedMs: Date.now() - start,
      error: text ? undefined : "DeepSeek returned an empty message",
    };
  } catch (error) {
    return {
      success: false,
      text: null,
      provider: "deepseek",
      resolvedProvider: "deepseek",
      model,
      promptVersion,
      fallbackUsed: false,
      elapsedMs: Date.now() - start,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function generateTextWithProvider(
  request: TextGenerationRequest,
): Promise<TextGenerationResult> {
  const provider = request.provider ?? getDefaultProvider();
  const promptVersion = request.promptVersion ?? getDefaultPromptVersion();

  if (provider === "deepseek") {
    return generateTextWithDeepSeek(request, promptVersion);
  }

  const result = await askBrain(request.prompt, {
    handler: provider,
    taskType: request.taskType,
    model: request.model,
    system: request.systemPrompt,
    temperature: request.temperature,
    maxTokens: request.maxTokens,
  });

  return {
    success: result.success,
    text: result.content ?? null,
    provider,
    resolvedProvider: extractResolvedProvider(result.worker, provider),
    model: result.model,
    promptVersion,
    fallbackUsed: Boolean(result.worker?.includes("fallback from")),
    elapsedMs: result.elapsed,
    error: result.error,
  };
}
