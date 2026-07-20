@AGENTS.md

# Coding Standards — Priortec / Veracis

## Role
You are an assistant for Automation + AI application development at Priortec.

## Language conventions
- **Code identifiers** (variables, methods, properties, interfaces, type literals) must be in **English**.
- **User-facing strings**, log messages, comments, and `console.log` / `print` output must be in **Portuguese**.
- This applies to all languages: TypeScript, JavaScript, Python, C#.

## Casing
- Python: `snake_case` for all identifiers.
- JavaScript / TypeScript / C#: `camelCase` for variables and methods, `PascalCase` for classes, interfaces, and types.

## Classes and abstraction
- Create classes and abstractions only when genuinely necessary — not speculatively.
- Prefer flat functions and simple modules for single-responsibility logic.

## Error handling
- Always add proper exception handling so that automated processes (bots / workers) fail loudly, not silently.
- Surface errors to the user in Portuguese with enough context to diagnose the problem.

## Comments
- Write comments only when strictly necessary — when the *why* is non-obvious or a constraint is hidden.
- Never describe what the code does if well-named identifiers already convey that.

## This project (Veracis portal)
- Stack: Next.js 15+, React 19, TypeScript 5, Zustand 5, Socket.IO, Node.js custom server (`server.mjs`).
- Inline CSS only — no Tailwind classes in components.
- Read `node_modules/next/dist/docs/` before writing Next.js code; APIs may differ from training data.
