import { desc, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { user, virtualCard } from "@/db/schema";

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

// GET /api/extension/cards - Listar tarjetas del usuario
export async function GET(request: NextRequest) {
  try {
    // Obtener token del header Authorization
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: "Token required" },
        { status: 401, headers: corsHeaders },
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

    // Obtener tarjetas del usuario
    const cards = await db.query.virtualCard.findMany({
      where: eq(virtualCard.userId, currentUser.id),
      orderBy: [desc(virtualCard.createdAt)],
    });

    return NextResponse.json(
      {
        success: true,
        cards: cards.map((card) => ({
          id: card.id,
          stripeCardId: card.stripeCardId,
          name: card.name,
          last4: card.last4,
          status: card.status,
          createdAt: card.createdAt,
        })),
      },
      { headers: corsHeaders },
    );
  } catch (error) {
    console.error("Extension cards list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch cards" },
      { status: 500, headers: corsHeaders },
    );
  }
}
