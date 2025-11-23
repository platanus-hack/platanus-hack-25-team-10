# Shadow

**Current project logo:** logo-black.png

<img src="./public/logo-dark.png" alt="Project Logo" width="200" />

## ¿Qué es Shadow?

Shadow es un servicio que protege la privacidad de los usuarios en sus compras en línea mediante tarjetas virtuales. Las compras están respaldadas por la tarjeta personal del usuario, sin exponer sus datos reales.

## ¿Cómo funciona?

Shadow genera tarjetas virtuales únicas para cada compra en internet. Estas tarjetas están vinculadas a tu tarjeta personal, pero tus datos nunca se exponen a los comercios.

## Beneficios

- **Privacidad total**: Tus datos nunca se exponen a los comercios
- **Menor riesgo**: Minimiza el impacto de robos o leaks de información
- **Flexibilidad**: Si cambias de tarjeta personal, solo conéctala a Shadow y todos tus servicios siguen funcionando sin cambios

## Características técnicas

- Integración con provider de issuing de tarjetas
- Método de cobro just-in-time para evitar saldos prepagados y reducir fricción en la experiencia del usuario

## Stack tecnológico

### Frontend & Backend
- **Next.js 16** con Turbopack - Framework React con App Router y optimizaciones de build
- **React 19** - Biblioteca UI con las últimas características
- **TypeScript** - Tipado estático para mayor seguridad en el código
- **shadcn/ui** + **Radix UI** - Componentes accesibles y personalizables
- **Tailwind CSS 4** - Estilos utility-first

### Base de datos & ORM
- **PostgreSQL 16** - Base de datos relacional
- **Drizzle ORM** - ORM type-safe con migraciones

### Autenticación
- **Better Auth** - Sistema de autenticación moderno con adaptador Drizzle

### Pagos & Issuing
- **Stripe** - Procesamiento de pagos y gestión de clientes
- **Stripe Issuing** - Emisión de tarjetas virtuales
- **Stripe Webhooks** - Eventos en tiempo real para just-in-time funding

### Infraestructura
- **Turbo** - Monorepo con build caching y ejecución paralela
- **pnpm** - Gestión eficiente de paquetes con workspaces
- **Docker Compose** - Contenedorización de PostgreSQL
- **Biome** - Linter y formatter rápido

### Arquitectura
- **Monorepo** con workspaces separados: `web`, `database`, `ui`, `typescript-config`
- **Just-in-time funding** mediante webhooks de Stripe para cobrar solo cuando se realiza una transacción

---

**Submission Deadline:** 23rd Nov, 9:00 AM, Chile time.

**Track:** 🛡️ fintech + digital security

**Team:**

- Franco Jalil ([@francojalil7](https://github.com/francojalil7))
- Guido Irigoyen ([@Warcod](https://github.com/Warcod))
- Decker Urbano ([@decker-dev](https://github.com/decker-dev))
