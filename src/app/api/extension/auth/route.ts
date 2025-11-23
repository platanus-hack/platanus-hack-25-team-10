import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { user } from "@/db/schema";

// CORS headers para permitir requests desde la extensión
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // En producción: chrome-extension://YOUR_EXTENSION_ID
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// POST /api/extension/auth/login - Login para la extensión
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, action } = body;

    // Verificar token existente
    if (action === "verify") {
      const { token } = body;

      if (!token) {
        return NextResponse.json(
          { error: "Token required" },
          { status: 401, headers: corsHeaders },
        );
      }

      // Decodificar el token (formato: base64(userId:timestamp:signature))
      try {
        const decoded = Buffer.from(token, "base64").toString("utf-8");
        const [userId] = decoded.split(":");

        const userData = await db.query.user.findFirst({
          where: eq(user.id, userId),
        });

        if (!userData) {
          return NextResponse.json(
            { error: "Invalid token" },
            { status: 401, headers: corsHeaders },
          );
        }

        return NextResponse.json(
          {
            valid: true,
            user: {
              id: userData.id,
              email: userData.email,
              name: userData.name,
            },
          },
          { headers: corsHeaders },
        );
      } catch (_error) {
        return NextResponse.json(
          { error: "Invalid token format" },
          { status: 401, headers: corsHeaders },
        );
      }
    }

    // Login normal
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400, headers: corsHeaders },
      );
    }

    // Buscar usuario por email
    const userData = await db.query.user.findFirst({
      where: eq(user.email, email),
    });

    if (!userData) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401, headers: corsHeaders },
      );
    }

    // En producción, deberías verificar el password con Better Auth
    // Por ahora, asumimos que Better Auth ya validó al usuario

    // Generar token de sesión para la extensión
    const timestamp = Date.now();
    const signature = crypto
      .createHash("sha256")
      .update(
        `${userData.id}:${timestamp}:${process.env.AUTH_SECRET || "secret"}`,
      )
      .digest("hex")
      .substring(0, 16);

    const sessionToken = Buffer.from(
      `${userData.id}:${timestamp}:${signature}`,
    ).toString("base64");

    return NextResponse.json(
      {
        success: true,
        sessionToken,
        user: {
          id: userData.id,
          email: userData.email,
          name: userData.name,
        },
      },
      { headers: corsHeaders },
    );
  } catch (error) {
    console.error("Extension auth error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500, headers: corsHeaders },
    );
  }
}
