# POC - Stripe Issuing

Prueba de concepto ultra-simple para validar la creación de tarjetas virtuales con Stripe Issuing.

## 🚀 Setup Rápido

### 1. Instalar dependencias

```bash
pnpm install
```

### 2. Configurar variables de entorno

Edita `apps/web/.env.local` y agrega tus keys de Stripe:

```env
STRIPE_SECRET_KEY=sk_test_tu_key_aqui
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_tu_key_aqui
STRIPE_WEBHOOK_SECRET=whsec_lo_obtendras_del_cli
```

### 3. Iniciar el servidor de desarrollo

```bash
pnpm dev
```

### 4. Configurar el webhook (en otra terminal)

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

**Importante:** Copia el webhook secret que aparece y actualízalo en `.env.local`

## 🎯 Cómo Probar

1. **Abre el navegador:** http://localhost:3000

2. **Paso 1 - Crear Cardholder:**
   - Click en "Crear Cardholder"
   - Espera confirmación ✓

3. **Paso 2 - Crear Tarjeta:**
   - Click en "Crear Tarjeta"
   - Espera confirmación ✓

4. **Paso 3 - Ver Detalles:**
   - Click en "Ver Detalles Completos"
   - Copia el número, expiry y CVC

5. **Paso 4 - Probar la Tarjeta:**
   - Ve al [Stripe Dashboard → Test Mode → Issuing → Transactions](https://dashboard.stripe.com/test/issuing/simulations)
   - O usa cualquier sitio de test que acepte tarjetas
   - Ingresa los datos de la tarjeta
   - Observa la terminal donde corre `stripe listen`

## 📋 Lo que verás en la consola

Cuando hagas una transacción, en la terminal verás:

```
🔔 Webhook recibido: issuing_authorization.request
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💳 SOLICITUD DE AUTORIZACIÓN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ID: iauth_xxxxx
Monto: $10.00 USD
Comerciante: Test Merchant
Tarjeta: ic_xxxxx
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ AUTORIZACIÓN APROBADA (POC - auto-aprobar)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 🏗️ Estructura del POC

```
apps/web/
├── actions/
│   └── stripe-actions.ts       # Server Actions para Stripe
├── app/
│   ├── page.tsx                # UI principal del POC
│   └── api/webhooks/stripe/
│       └── route.ts            # Webhook handler
└── lib/
    └── stripe.ts               # Cliente de Stripe
```

## ✨ Features

- ✅ Crear Cardholder (hardcoded, sin DB)
- ✅ Crear Tarjeta Virtual
- ✅ Ver número completo, CVC, expiry
- ✅ Copiar al portapapeles
- ✅ Webhook que auto-aprueba transacciones
- ✅ Logs en consola para debugging

## 🔧 Próximos Pasos (si quieres expandir)

1. **Agregar JIT Funding real:**
   - En el webhook, cargar una tarjeta real del usuario
   - Aprobar/rechazar según el resultado

2. **Agregar persistencia:**
   - Guardar cardholders y tarjetas en una DB
   - Permitir múltiples tarjetas por usuario

3. **Agregar autenticación:**
   - Asociar tarjetas a usuarios reales
   - Proteger las rutas

## ⚠️ Notas Importantes

- Este es un **POC para testing**, no para producción
- Las transacciones se auto-aprueban sin verificación
- Los IDs se guardan en memoria (se pierden al reiniciar)
- Usa **test mode** de Stripe siempre

## 🆘 Troubleshooting

**Error: "STRIPE_SECRET_KEY no está configurada"**
- Verifica que `.env.local` existe y tiene las keys correctas
- Reinicia el servidor de desarrollo

**Webhook no recibe eventos:**
- Verifica que `stripe listen` está corriendo
- Copia el webhook secret actualizado a `.env.local`
- Reinicia el servidor después de cambiar `.env.local`

**Error al crear cardholder:**
- Verifica que tu cuenta de Stripe tiene Issuing habilitado
- Algunas cuentas necesitan activación manual de Issuing

## 📚 Recursos

- [Stripe Issuing Docs](https://stripe.com/docs/issuing)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)
- [Issuing Test Cards](https://stripe.com/docs/issuing/testing)

