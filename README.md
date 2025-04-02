# Nuxt Auth Boilerplate

A clean, production-ready Nuxt 3 boilerplate with authentication functionality.

## Features

- ✅ **Authentication System**
  - User registration and login
  - JWT token management with refresh tokens
  - Password reset functionality
  - Protected routes with middleware
  - Persistent authentication state

- ✅ **Modern Stack**
  - Nuxt 3 with TypeScript
  - Vue 3 Composition API
  - Nuxt UI for components
  - Tailwind CSS for styling
  - ESLint for code quality

- ✅ **Production Ready**
  - SPA build configuration
  - Cookie-based token storage
  - Automatic token refresh
  - Error handling
  - Responsive design

## Getting Started

### Prerequisites

- Node.js >= 23
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure your environment:
   - Set `API_BASE_URL` in your environment or use the default `http://localhost:9000`

4. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
├── components/
│   ├── App/
│   │   └── NavBar.vue          # Main navigation sidebar
│   └── Auth/                   # Authentication components
│       ├── ForgotPasswordForm.vue
│       ├── ResetPasswordForm.vue
│       ├── SigninForm.vue
│       └── SignupForm.vue
├── composables/
│   ├── useAuth.ts              # Authentication state management
│   └── useFormatter.ts         # Utility functions for formatting
├── layouts/
│   ├── default.vue             # Main layout with sidebar
│   └── empty.vue               # Clean layout for auth pages
├── middleware/
│   └── auth.ts                 # Route protection middleware
├── pages/
│   ├── auth/                   # Authentication pages
│   ├── settings/               # User settings
│   └── index.vue               # Dashboard homepage
├── plugins/
│   ├── api.ts                  # API client with token management
│   └── i18n.ts                 # Internationalization setup
└── types/
    └── auth.ts                 # Authentication type definitions
```

## Authentication Flow

### Login Process
1. User submits credentials via `SigninForm`
2. API returns user data and tokens
3. Tokens are stored in secure cookies
4. User is redirected to dashboard

### Token Management
- Access tokens are automatically attached to API requests
- Refresh tokens are used to renew expired access tokens
- Failed refresh attempts trigger automatic logout

### Route Protection
- Add `middleware: ['auth']` and `requiresAuth: true` to page meta
- Unauthenticated users are redirected to login
- Authenticated users are redirected away from login page

## API Integration

The boilerplate expects a backend API with these endpoints:

- `POST /auth/login` - User authentication
- `POST /auth/register` - User registration
- `POST /auth/refresh` - Token refresh
- `POST /auth/forgot-password` - Password reset request
- `POST /auth/reset-password` - Password reset
- `GET /users/me` - Get current user data

### API Client Usage

```typescript
// In your components
const { $api } = useNuxtApp()

// Authenticated request (default)
const userData = await $api<User>('/users/me')

// Public request (no auth header)
const publicData = await $api('/public/data', {}, false)
```

## Customization

### Styling
- Modify Tailwind configuration in `nuxt.config.ts`
- Update component styles in individual `.vue` files
- Customize the UI theme via Nuxt UI configuration

### Authentication
- Extend the `User` interface in `types/auth.ts`
- Add new auth-related composables as needed
- Modify token storage strategy in `useAuth.ts`

### Navigation
- Update `NavBar.vue` to add/remove navigation items
- Modify layouts for different page structures

## Build & Deployment

```bash
# Build for production
npm run build

# Generate static files
npm run generate

# Preview production build
npm run preview
```

The project is configured as a SPA by default. Modify `nuxt.config.ts` for different deployment strategies.

## Environment Variables

- `API_BASE_URL` - Backend API base URL (default: http://localhost:9000)
- `NODE_ENV` - Environment mode (affects cookie security settings)

## License

This boilerplate is provided as-is for development use.