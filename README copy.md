# Turborepo + shadcn/ui + Tailwind CSS 4

A modern, production-ready monorepo template featuring Turborepo, Next.js 15, shadcn/ui, and Tailwind CSS 4. Built with performance and developer experience in mind.

## Features

- **Monorepo Architecture**: Powered by Turborepo for efficient build caching and parallel task execution
- **Next.js 15**: Latest Next.js with Turbopack for lightning-fast development
- **React 19**: Built with the latest React features
- **Tailwind CSS 4**: Modern utility-first CSS framework
- **shadcn/ui**: High-quality, accessible UI components built with Radix UI
- **TypeScript**: Full type safety across the entire monorepo
- **Biome**: Fast linting and formatting with zero configuration
- **pnpm**: Efficient package management with workspace support
- **Shared UI Package**: Reusable component library across multiple apps

## Project Structure

```
.
├── apps
│   └── web                    # Next.js application
│       ├── app                # App router pages
│       ├── components         # App-specific components
│       └── package.json
├── packages
│   ├── ui                     # Shared UI component library
│   │   ├── src
│   │   │   ├── components     # shadcn/ui components
│   │   │   ├── hooks          # Shared React hooks
│   │   │   ├── lib            # Utility functions
│   │   │   └── styles         # Global styles
│   │   └── package.json
│   └── typescript-config      # Shared TypeScript configurations
├── biome.json                 # Biome configuration
├── turbo.json                 # Turborepo configuration
└── package.json               # Root package.json
```

## Prerequisites

- Node.js >= 20
- pnpm >= 10.4.1

## Getting Started

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd turborepo-shadcn-tailwind-4
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Start development server**

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

## Available Scripts

In the root directory, you can run:

- `pnpm dev` - Start development servers for all apps
- `pnpm build` - Build all apps and packages
- `pnpm lint` - Run linting across all workspaces
- `pnpm format-and-lint` - Check formatting and linting with Biome
- `pnpm format-and-lint:fix` - Fix formatting and linting issues automatically

## Adding shadcn/ui Components

To add new shadcn/ui components to your project:

```bash
pnpm dlx shadcn@latest add <component-name> -c apps/web
```

For example, to add a button component:

```bash
pnpm dlx shadcn@latest add button -c apps/web
```

This will automatically place the component in `packages/ui/src/components` where it can be shared across all apps in the monorepo.

## Using Components

Import components from the shared UI package in your app:

```tsx
import { Button } from "@repo/ui/components/button"
import { Card } from "@repo/ui/components/card"

export default function Page() {
  return (
    <Card>
      <Button>Click me</Button>
    </Card>
  )
}
```

## Adding New Apps

To add a new application to the monorepo:

1. Create a new directory in `apps/`
2. Add a `package.json` with the necessary dependencies
3. Include `"@repo/ui": "workspace:*"` to use the shared UI package
4. Update the app's Tailwind and PostCSS configs to reference the UI package

## Adding New Packages

To add a new shared package:

1. Create a new directory in `packages/`
2. Add a `package.json` with appropriate exports
3. Reference it in apps using `"@repo/<package-name>": "workspace:*"`

## Tech Stack

### Core

- [Turborepo](https://turbo.build/repo) - High-performance build system
- [Next.js 15](https://nextjs.org/) - React framework with Turbopack
- [React 19](https://react.dev/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type safety

### UI & Styling

- [Tailwind CSS 4](https://tailwindcss.com/) - Utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - Re-usable component collection
- [Radix UI](https://www.radix-ui.com/) - Unstyled, accessible components
- [Lucide React](https://lucide.dev/) - Beautiful icon library

### Development Tools

- [Biome](https://biomejs.dev/) - Fast linter and formatter
- [pnpm](https://pnpm.io/) - Fast, disk space efficient package manager

## Configuration

### Tailwind CSS

Tailwind is configured in the UI package (`packages/ui`). The web app automatically inherits these styles by importing the global CSS file.

### TypeScript

Shared TypeScript configurations are located in `packages/typescript-config`:
- `base.json` - Base configuration
- `nextjs.json` - Next.js specific configuration
- `react-library.json` - React library configuration

### Biome

Linting and formatting rules are configured in `biome.json` at the root level and apply to all workspaces.

## Building for Production

To create a production build:

```bash
pnpm build
```

To start the production server:

```bash
cd apps/web
pnpm start
```

## Deployment

This monorepo is optimized for deployment on [Vercel](https://vercel.com), but can be deployed to any platform that supports Next.js.

### Vercel

1. Import your repository into Vercel
2. Set the root directory to `apps/web`
3. Vercel will automatically detect and configure the build settings

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Learn More

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)