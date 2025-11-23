import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { user, virtualCard } from "@/db/schema";
import { stripe } from "@/modules/shared/lib/stripe";

// CORS headers para permitir requests desde la extensión
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // En producción: chrome-extension://YOUR_EXTENSION_ID
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// Función helper para verificar el token de la extensión
async function verifyExtensionToken(token: string) {
  if (!token) {
    return null;
  }

  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const [userId] = decoded.split(":");

    const userData = await db.query.user.findFirst({
      where: eq(user.id, userId),
    });

    return userData;
  } catch (_error) {
    return null;
  }
}

// POST /api/extension/cards/create - Crear nueva tarjeta virtual
export async function POST(request: NextRequest) {
  try {
    const { name, token } = await request.json();

    if (!name || !token) {
      return NextResponse.json(
        { error: "Name and token required" },
        { status: 400, headers: corsHeaders },
      );
    }

    // Verificar autenticación
    const currentUser = await verifyExtensionToken(token);

    if (!currentUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: corsHeaders },
      );
    }

    // Verificar que el usuario tenga onboarding completo
    if (!currentUser.stripeCardholderId) {
      return NextResponse.json(
        {
          error: "Complete onboarding first",
          needsOnboarding: true,
        },
        { status: 403, headers: corsHeaders },
      );
    }

    // Crear tarjeta virtual en Stripe
    const card = await stripe.issuing.cards.create({
      cardholder: currentUser.stripeCardholderId,
      currency: "usd",
      type: "virtual",
      status: "active",
      spending_controls: {
        spending_limits: [
          { amount: 100000, interval: "daily" }, // $1,000 diario
          { amount: 500000, interval: "monthly" }, // $5,000 mensual
        ],
      },
    });

    // Guardar en la base de datos
    await db.insert(virtualCard).values({
      userId: currentUser.id,
      stripeCardId: card.id,
      name,
      last4: card.last4,
      status: "active",
    });

    // Obtener datos completos de la tarjeta (número, CVV, etc.)
    const fullCardDetails = await stripe.issuing.cards.retrieve(card.id, {
      expand: ["number", "cvc"],
    });

    // Formatear fecha de expiración
    const expMonth = String(fullCardDetails.exp_month).padStart(2, "0");
    const expYear = String(fullCardDetails.exp_year).slice(-2);
    const expiration = `${expMonth}/${expYear}`;

    // Retornar datos para autocompletar el formulario
    return NextResponse.json(
      {
        success: true,
        card: {
          id: card.id,
          number: fullCardDetails.number,
          cvv: fullCardDetails.cvc,
          expiration,
          exp_month: fullCardDetails.exp_month,
          exp_year: fullCardDetails.exp_year,
          cardholder_name: currentUser.name || "CARD HOLDER",
          last4: card.last4,
          name,
        },
      },
      { headers: corsHeaders },
    );
  } catch (error) {
    console.error("Extension card creation error:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create card",
        details: error?.toString(),
      },
      { status: 500, headers: corsHeaders },
    );
  }
}
