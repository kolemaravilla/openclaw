# Channel architecture & governance boundary

OpenClaw owns the full messaging channel stack — 8 core channels plus 30+ plugin extensions. If you're building a personality layer, operational playbook, or governance system on top of openclaw (like [lobsterBucket](SETUP.md#directory-layout-after-setup)), here's where the boundary sits:

| Layer | Owned by | Examples |
|-------|----------|----------|
| Channel adapters & message delivery | **openclaw** (`src/discord/`, `src/telegram/`, `extensions/`) | Bot connections, message formatting, threading, reactions, media pipeline |
| Model providers & failover | **openclaw** (`configs/model_config.json`, `src/agents/model-selection.ts`) | Provider definitions, API endpoints, fallback chains, model aliases |
| DM pairing & security defaults | **openclaw** (`dmPolicy`, `allowFrom`, per-channel security) | Who can message the bot, pairing codes, group allowlists |
| **Usage policy & governance** | **External playbook** (e.g. lobsterBucket) | "Don't auto-reply in group chats", "Use local model for routine tasks", cost budgets |
| **Personality & identity** | **Workspace** (`~/.openclaw/workspace/SOUL.md`) | Character, voice, opinions, behavioral rules |
| **Operational authority** | **External playbook** | Approval chains, credential access rules, job filters, automation triggers |

**Key principle:** Don't duplicate channel adapter code in your governance layer. openclaw handles *how* messages are sent. Your playbook governs *whether* and *when*.

For model routing strategy (which providers, failover, costs): see [CLOUD_STRATEGY.md](CLOUD_STRATEGY.md).
For personality setup: see [docs/personality/brock/](docs/personality/brock/).
For full Mac Mini setup with all tiers: see [SETUP.md](SETUP.md).
