<div align="center">

# Kaizen

**AI-powered task management, on desktop and web.**

Kaizen is a productivity app that combines task management, expense tracking, and an AI assistant — Hiro — that turns natural language into organized task lists. Built with React and Electron, it works both in the browser and as a native desktop app.

![React](https://img.shields.io/badge/React-TypeScript-61DAFB?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-Build_Tool-646CFF?style=flat-square&logo=vite)
![Electron](https://img.shields.io/badge/Electron-Desktop-47848F?style=flat-square&logo=electron)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=flat-square&logo=supabase)
![OpenAI](https://img.shields.io/badge/GPT--3.5-Hiro_AI-412991?style=flat-square&logo=openai)

> Work in progress — features and docs subject to change.

</div>

---

## Features

- **Task Management** — Create, organize, and manage tasks efficiently
- **Task Lists** — Group tasks into custom lists
- **Smart Task Creation** — Describe what you need in plain language; Hiro builds the list
- **Expense Tracking** — Track expenses alongside tasks in one place
- **Hiro — AI Assistant** — Powered by OpenAI GPT-3.5 Turbo
- **Dark Mode** — Full dark mode support
- **Secure Auth** — Supabase Auth

---

## Hiro — AI Assistant

Tell Hiro what you want to accomplish and it generates organized task lists automatically.

**Example prompts:**
- `"Create a list for planning a birthday party."`
- `"Help me plan a vacation to Japan."`
- `"Make a grocery shopping list."`
- `"I need to prepare for a job interview."`

See [AI_ASSISTANT_README.md](./AI_ASSISTANT_README.md) for full details.

---

## Tech Stack

| | |
|---|---|
| Framework | React + TypeScript |
| Build | Vite |
| UI | shadcn/ui + Radix UI + Tailwind CSS |
| Backend | Supabase (Database + Auth) |
| AI | OpenAI GPT-3.5 Turbo |
| Desktop | Electron |

---

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/          # Page components
├── services/       # API services and business logic
├── hooks/          # Custom React hooks
├── context/        # React context providers
├── types/          # TypeScript type definitions
└── lib/            # Utility functions
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- OpenAI API key — [get one here](https://platform.openai.com/api-keys)
- Supabase account and project

### Installation

```bash
# Clone the repo
git clone <your-repo-url>
cd Kaizen

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# → Add VITE_OPENAI_API and Supabase credentials to .env

# Start dev server (web)
npm run dev

# Start dev server (Electron desktop)
npm run electron:dev
```

---

## License

[Your License Here]

---

<div align="center">
  <sub>Built by <a href="https://github.com/Akai771">Akai</a></sub>
</div>
