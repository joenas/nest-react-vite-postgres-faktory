# Boilerplate Frontend

This is a minimal frontend (login + authenticated landing page) built with Vite, React, and TypeScript.

## Development

### Setup

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

The frontend will be available at `http://localhost:3001` and will proxy API requests to the backend at `http://localhost:3000`.

**Note**: Make sure your NestJS backend is running on port 3000 for the proxy to work.

### Running Both Frontend and Backend

From the project root:

```bash
# Terminal 1: Start backend
npm run start:dev

# Terminal 2: Start frontend
npm run start:dev:frontend
```

## Production

### Building

To build for production:

```bash
npm run build
```

The built files will be in the `dist` directory.

### Serving in Production

In production, the frontend is served directly by the NestJS backend. After building:

1. Build both frontend and backend:

```bash
# From project root
npm run build
npm run build:frontend
```

2. Start the production server:

```bash
node dist/main.js
```

The application will serve:

- Frontend at `http://localhost:3000` (or your configured port)
- API at `http://localhost:3000/api/*`

The NestJS server will automatically serve the built frontend files and handle SPA routing.

## Preview Production Build Locally

To preview the production build locally (without NestJS):

```bash
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable components
│   ├── pages/          # Page components
│   ├── App.tsx         # Main app component with routing
│   ├── main.tsx        # Entry point
│   └── index.css       # Global styles
├── public/             # Static assets
├── index.html          # HTML template
├── vite.config.ts      # Vite configuration
└── tsconfig.json       # TypeScript configuration
```

## Adding Components

Once you're ready to add your components, you can:

1. Add them to `src/components/`
2. Create new pages in `src/pages/`
3. Add routes in `src/App.tsx`
