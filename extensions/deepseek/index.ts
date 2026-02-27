import {
  emptyPluginConfigSchema,
  type OpenClawPluginApi,
  type ProviderAuthContext,
  type ProviderAuthResult,
} from "openclaw/plugin-sdk";

const PROVIDER_ID = "deepseek";
const PROVIDER_LABEL = "DeepSeek";
const DEFAULT_MODEL = "deepseek/deepseek-chat";
const BASE_URL = "https://api.deepseek.com/v1";

const MODELS = [
  {
    id: "deepseek-chat",
    name: "DeepSeek V3",
    reasoning: false,
    input: ["text"] as Array<"text" | "image">,
    cost: { input: 0.27, output: 1.1, cacheRead: 0.07, cacheWrite: 0.27 },
    contextWindow: 65536,
    maxTokens: 8192,
  },
  {
    id: "deepseek-reasoner",
    name: "DeepSeek R1",
    reasoning: true,
    input: ["text"] as Array<"text" | "image">,
    cost: { input: 0.55, output: 2.19, cacheRead: 0.14, cacheWrite: 0.55 },
    contextWindow: 65536,
    maxTokens: 8192,
  },
];

const deepseekPlugin = {
  id: "deepseek",
  name: "DeepSeek",
  description: "DeepSeek V3 and R1 models via API key",
  configSchema: emptyPluginConfigSchema(),
  register(api: OpenClawPluginApi) {
    api.registerProvider({
      id: PROVIDER_ID,
      label: PROVIDER_LABEL,
      docsPath: "/providers/deepseek",
      aliases: ["deepseek"],
      envVars: ["DEEPSEEK_API_KEY"],
      models: {
        baseUrl: BASE_URL,
        api: "openai-completions",
        models: MODELS,
      },
      auth: [
        {
          id: "api-key",
          label: "DeepSeek API Key",
          hint: "V3 + R1",
          kind: "api_key",
          async run(ctx: ProviderAuthContext): Promise<ProviderAuthResult> {
            const key = await ctx.prompter.text({
              message: "Enter DeepSeek API key",
              validate: (v) => (v.trim() ? undefined : "API key is required"),
            });
            if (!key) throw new Error("No API key provided");

            const profileId = `${PROVIDER_ID}:default`;
            await ctx.prompter.note(
              [
                "DeepSeek provides DeepSeek V3 and DeepSeek R1 models.",
                "Get your API key at: https://platform.deepseek.com/api_keys",
              ].join("\n"),
              "DeepSeek",
            );

            return {
              profiles: [
                {
                  profileId,
                  credential: {
                    type: "api_key",
                    provider: PROVIDER_ID,
                    apiKey: String(key),
                  },
                },
              ],
              configPatch: {
                agents: {
                  defaults: {
                    models: {
                      [DEFAULT_MODEL]: {
                        alias: "DeepSeek",
                      },
                    },
                  },
                },
                models: {
                  providers: {
                    [PROVIDER_ID]: {
                      baseUrl: BASE_URL,
                      api: "openai-completions",
                      models: MODELS,
                    },
                  },
                },
              } as Record<string, unknown>,
              defaultModel: DEFAULT_MODEL,
              notes: [
                "DeepSeek provides DeepSeek V3 and DeepSeek R1 models.",
                "Get your API key at: https://platform.deepseek.com/api_keys",
              ],
            };
          },
        },
      ],
    });
  },
};

export default deepseekPlugin;
