---
summary: "Use DeepSeek models (V3, R1) with OpenClaw"
read_when:
  - You want DeepSeek V3 or DeepSeek R1 in OpenClaw
  - You need a simple DEEPSEEK_API_KEY setup
title: "DeepSeek"
---

# DeepSeek

DeepSeek is the API platform for **DeepSeek V3** and **DeepSeek R1** models. It provides
OpenAI-compatible REST APIs and uses API keys for authentication. Create your API key in the
DeepSeek console. OpenClaw uses the `deepseek` provider with a DeepSeek API key.

## CLI setup

```bash
openclaw onboard --auth-choice deepseek-api-key
# or non-interactive
openclaw onboard --deepseek-api-key "$DEEPSEEK_API_KEY"
```

## Config snippet

```json5
{
  env: { DEEPSEEK_API_KEY: "sk-..." },
  agents: { defaults: { model: { primary: "deepseek/deepseek-chat" } } },
}
```

## Available models

- `deepseek/deepseek-chat` — DeepSeek V3 (general-purpose)
- `deepseek/deepseek-reasoner` — DeepSeek R1 (reasoning)

## Notes

- DeepSeek uses Bearer auth with your API key.
- Get your API key at [platform.deepseek.com/api_keys](https://platform.deepseek.com/api_keys).
- The API is OpenAI-compatible at `https://api.deepseek.com/v1`.
