# Shadow - Privacidad Total en Tus Compras Online 🛡️

## ¿Qué es Shadow?

Shadow es un servicio innovador que protege la privacidad de los usuarios en sus compras en línea mediante tarjetas virtuales. Las compras están respaldadas por la tarjeta personal del usuario, sin exponer sus datos reales a comercios de internet.

## 🎯 El Problema

Cada vez que compras online, entregas tu información bancaria a múltiples comercios:
- Tu número de tarjeta queda almacenado en decenas de servicios
- Los leaks de datos exponen tu información financiera
- Si cambias de tarjeta, debes actualizar manualmente cada servicio
- No tienes control sobre quién tiene acceso a tus datos

## 💡 La Solución

Shadow genera **tarjetas virtuales únicas** para cada compra o servicio en internet. Estas tarjetas están vinculadas a tu tarjeta personal, pero tus datos reales nunca se exponen a los comercios.

### ¿Cómo funciona?

1. **Conecta tu tarjeta**: Vincula tu tarjeta personal a Shadow de forma segura
2. **Genera tarjetas virtuales**: Crea una nueva tarjeta virtual para cada compra o suscripción
3. **Compra con privacidad**: Usa la tarjeta virtual en el comercio online
4. **Shadow procesa el pago**: El cobro se realiza automáticamente a tu tarjeta real mediante just-in-time funding

## ✨ Beneficios Clave

### 🔒 Privacidad Total
Tus datos bancarios reales nunca se exponen a los comercios. Cada tarjeta virtual actúa como un escudo protector.

### 🛡️ Menor Riesgo
Si un comercio sufre un leak de datos, solo se compromete una tarjeta virtual específica, no tu tarjeta real.

### 🔄 Flexibilidad Máxima
¿Cambiaste de tarjeta? Solo actualízala en Shadow y todos tus servicios y suscripciones siguen funcionando automáticamente, sin necesidad de actualizar cada comercio.

### ⚡ Sin Fricción
Gracias al sistema just-in-time funding, no necesitas mantener saldos prepagados. El cobro se realiza instantáneamente desde tu tarjeta cuando haces una compra.

## 🏗️ Características Técnicas

### Arquitectura Moderna
- **Monorepo** con Next.js 16 y React 19
- **TypeScript** para seguridad de tipos en todo el código
- **PostgreSQL + Drizzle ORM** para gestión de datos type-safe

### Seguridad & Autenticación
- **Better Auth** con adaptador Drizzle para autenticación segura
- Integración completa con **Stripe Issuing** para emisión de tarjetas virtuales

### Just-in-Time Funding
- Sistema innovador mediante **Stripe Webhooks**
- Los cobros se realizan en tiempo real cuando se usa la tarjeta virtual
- Elimina la necesidad de saldos prepagados
- Reduce fricción en la experiencia del usuario

### Infraestructura Escalable
- **Turbo** para builds optimizados y ejecución paralela
- **Docker Compose** para desarrollo local consistente
- **shadcn/ui + Tailwind CSS 4** para UI moderna y accesible

## 🎯 Track: Fintech + Digital Security

Shadow combina lo mejor de fintech y seguridad digital para crear una solución que no solo facilita las compras online, sino que también protege activamente la privacidad financiera de los usuarios.

## 👥 Equipo

- **Franco Jalil** - [@francojalil7](https://github.com/francojalil7)
- **Guido Irigoyen** - [@Warcod](https://github.com/Warcod)
- **Decker Urbano** - [@decker-dev](https://github.com/decker-dev)

---

**Desarrollado para Platanus Hack 2025**

