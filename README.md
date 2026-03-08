# Boilerplate

## Install Tailwind

https://tailwindcss.com/docs/installation/using-vite

```bash
npm install tailwindcss @tailwindcss/vite
```

```ts
// vite.config.ts
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  plugins: [tailwindcss()],
});
```

## Shadcn/UI

Quick template

```
npx shadcn@latest init --preset a1zDJA --template vite
```

Create project: https://ui.shadcn.com/create
