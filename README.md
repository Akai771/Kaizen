# Kaizen

> **Note:** This project is a work in progress. Features and documentation are subject to change.

## Features

- ✅ **Task Management**: Create, organize, and manage your tasks efficiently
- 🤖 **AI-Powered Assistant**: Meet Hiro, your intelligent task helper powered by OpenAI GPT-3.5
- 📋 **Task Lists**: Organize tasks into custom lists
- 🎯 **Smart Task Creation**: Use natural language to create tasks automatically
- 💰 **Expense Management**: Track your expenses alongside tasks
- 🌙 **Dark Mode**: Easy on the eyes with full dark mode support
- 🔒 **Secure Authentication**: Powered by Supabase Auth

## Quick Start

### Prerequisites

- Node.js 18+ installed
- An OpenAI API key ([Get one here](https://platform.openai.com/api-keys))
- A Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd Kaizen
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Add your OpenAI API key to `VITE_OPENAI_API`
   - Add your Supabase credentials

4. Start the development server:
```bash
npm run dev
```

5. For Electron app:
```bash
npm run electron:dev
```

## AI Assistant (Hiro)

Hiro is an intelligent AI assistant that helps you create and manage tasks using natural language. Simply tell Hiro what you want to accomplish, and it will automatically create organized task lists for you.

**Example commands:**
- "Create a list for planning a birthday party"
- "Help me plan a vacation to Japan"
- "Make a grocery shopping list"
- "I need to prepare for a job interview"

For detailed information about the AI assistant, see [AI_ASSISTANT_README.md](./AI_ASSISTANT_README.md).

## Technologies

- **Frontend**: React + TypeScript + Vite
- **UI Components**: shadcn/ui + Radix UI + Tailwind CSS
- **Backend**: Supabase (Database + Auth)
- **AI**: OpenAI GPT-3.5 Turbo
- **Desktop**: Electron

## Project Structure

```
src/
├── components/        # Reusable UI components
├── pages/            # Page components
├── services/         # API services and business logic
├── hooks/            # Custom React hooks
├── context/          # React context providers
├── types/            # TypeScript type definitions
└── lib/              # Utility functions
```

## License

[Your License Here]
