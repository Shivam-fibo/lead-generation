# Lead Platform

A modern lead management system built with Next.js, Tailwind-CSS, ShadCn-UI. Powered by Websockets for Realtime Lead Updates. Type Safety from TypeScript. 

## Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/Phlexibit/lead-generation.git
   cd lead-generation
   ```

2. **Install dependencies**
    - Note : Using --force is necessary to avoid the date-fns errors [ This is a required package, but it has dependecy conflicts with Node js versions. However, it wont create any problems]

   ```bash
   npm install --force
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory and add necessary environment variables:

   ```env
   NEXT_PUBLIC_API_BASE_URL = your_api_url
   NEXT_PUBLIC_API_PYTHON_URL = your_python_url
   NEXT_PUBLIC_API_BASE_LOCAL_URL = localhost_api_url
   NEXT_PUBLIC_API_WS_BASE_URL= your_api_url_with_websocket
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## Project Structure

```
lead-platform/
├── app/                    # Next.js app directory containing all routes and pages
│   ├── admin/             # Admin section for company and user management
│   ├── dashboard/         # Main dashboard views
│   ├── leads/            # Lead management module with real-time updates
│   ├── site-visits/      # Site visit scheduling and tracking
│   └── signup/           # User signup flows
├── components/           # Reusable React components
│   ├── ui/              # Shadcn UI components and custom UI elements
│   └── forms/           # Form components for various features
├── hooks/               # Custom React hooks for state and logic
├── lib/                 # Utility functions and API handlers
├── providers/          # React context providers
├── public/             # Serves all the static assets
├── stores/             # State management stores
└── styles/             # Global styles and CSS modules
```

### Key Files

- `lib/api.ts`: All the API call functions are defined here
- `lib/websocket.ts`: WebSocket connection handler for real-time updates
- `hooks/use-leads.ts`: Lead management custom hook
- `stores/auth-store.ts`: Authentication state management
- `app/leads/page.tsx`: Main lead management interface with real-time WebSocket integration
- `components/lead-form.tsx`: Lead creation and editing form

## Requirements

### Core Dependencies

- Node.js >= 16.x 
- npm (Package Manager)
- Next.js 13+ (App Router)
- TypeScript
- TailwindCSS
- Shadcn UI

## Complex Flows and Code Structure

Understanding the key business logic flows in the frontend application:

### Authentication Flow

1. Form Submission
   ```
   login-form.tsx (Component) 
   -> useAuth.ts (Custom Hook) 
   -> auth-store.ts (Zustand Store) 
   -> api.ts (API Call) 
   -> Response -> auth-store.ts (State Update)
   ```

   When a user logs in:
   - `login-form.tsx` captures credentials and calls `login` from `useAuth` hook
   - `useAuth.ts` uses TanStack Query's `useMutation` to manage API state
   - API call is made through `api.ts`
   - Response updates Zustand store (`auth-store.ts`)
   - Auth state is persisted in localStorage

### Lead Management Flow

1. Creating/Updating Leads
   ```
   lead-form.tsx (Component) 
   -> use-leads.ts (Custom Hook) 
   -> api.ts (API Call) 
   -> WebSocket Update 
   -> lead-store.ts (State Update)
   ```

   When creating/updating leads:
   - Form data is collected in `lead-form.tsx`
   - `use-leads.ts` hook handles API interaction using TanStack Query
   - Real-time updates through WebSocket connection
   - State is managed in Zustand store with TanStack Query cache

2. Real-time Lead Updates [`websocket.ts`]
   ```
   WebSocket Connection 
   -> useWebSocket (Custom Hook) 
   -> QueryClient Invalidation 
   -> UI Update
   ```

   - WebSocket connection listens for lead updates
   - New lead data triggers cache invalidation
   - UI automatically re-renders with fresh data

### Key Files to Understand

1. **State Management**
   - `stores/auth-store.ts`: Central authentication state
   - `stores/dashboard-store.ts`: Dashboard-related state
   - `hooks/use-leads.ts`: Lead management logic

2. **API Integration**
   - `lib/api.ts`: API endpoint definitions and fetch wrapper
   - `lib/websocket.ts`: WebSocket connection handler

3. **Components**
   - `components/lead-form.tsx`: Lead creation/editing
   - `components/data-table.tsx`: Reusable table component
   - `app/leads/page.tsx`: Main lead management page

### Architecture Highlights

- Uses **Zustand** for global state management
- **TanStack Query** for API state and caching
- **WebSocket** integration for real-time updates
- **Component-based** architecture with shared UI components
- **Custom hooks** for business logic separation
