# AI Agent Instructions & Project Context

This document serves as the system prompt and technical guide for AI agents interacting with this repository. It defines the architecture, standards, and constraints to ensure code consistency and maintainability.

## 🛠 Tech Stack
- **Framework:** Next.js 15+ (App Router)
- **Language:** TypeScript (Strict Mode)
- **Styling:** Tailwind CSS v4 (CSS-first configuration)
- **Theme:** "Tactical Earth" (Deep Dark / Enterprise-Rugged)

## 🎨 Global Theme & Design System (Tactical Earth)
AI agents MUST adhere to this specific color palette and atmospheric style. Do not use default Tailwind colors (e.g., blue-500) for primary actions. Use the defined CSS variables.

| Category | CSS Variable | Hex Code | Usage |
| :--- | :--- | :--- | :--- |
| **Background** | `--color-background` | `#0D1111` | Main app background (Obsidian Iron). |
| **Surface** | `--color-surface` | `#1A1F1F` | Cards, modals, sidebars (Gunmetal). |
| **Primary** | `--color-brand-primary` | `#2E4D3E` | Key actions, active states (Pathania Green). |
| **Secondary** | `--color-brand-secondary` | `#4A6367` | Accents, secondary icons (Glacier Slate). |
| **Action** | `--color-brand-accent` | `#8B4513` | Special highlights, warnings (Rust Ember). |
| **Text** | `--color-text-main` | `#E2E8E4` | All primary body and heading text (Parchment). |

## 🏗 Project Architecture
- `src/app/`: File-based routing, layouts, and error boundaries.
- `src/components/`: Reusable UI components. Use `Client Components` only when necessary.
- `src/lib/`: Shared utilities, API clients, and business logic.
- `src/types/`: Shared TypeScript interfaces.

## 📜 Development Guidelines

### 1. Component Rules
- **Server First:** Default to React Server Components (RSC).
- **Styling:** Use Tailwind v4 classes. Prefer semantic variables (e.g., `bg-background` or `text-brand-primary`) over arbitrary hex codes.
- **Atmospheric Feel:** When creating layouts, maintain the "Atmospheric" feel using subtle radial gradients or low-opacity glows using `--color-brand-primary`.

### 2. TypeScript Standards
- **No `any`:** Use explicit types.
- **Strict Null Checks:** Handle potential `null` or `undefined`.

### 3. Tailwind CSS v4 Usage
- Configuration is strictly in `src/app/globals.css`.
- Use the `@theme` block for all design tokens.

## 🤖 AI Instructions for Modifications
- **Visual Consistency:** Ensure every new component uses the `Tactical Earth` palette. Text must always be `--color-text-main` for high readability.
- **No Flashy UI:** Avoid bright neons, vibrant blues, or "poking" colors. All tones must be muted, grounded, and professional.
- **Step-by-Step:** 1. Analyze Imports (@/ alias) -> 2. Check Theme Variables -> 3. Implement RSC -> 4. Add Loading/Error states.

## 🚀 Future Upgradability
Keep dependencies updated to LTS. This project is built for longevity and professional-grade performance.