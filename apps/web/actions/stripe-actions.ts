"use server";

import { stripe } from "@/lib/stripe";

// Variable temporal para guardar IDs en memoria (solo para POC)
// OPCIÓN: Si ya tienes un cardholder verificado, ponlo aquí directamente:
// let CARDHOLDER_ID: string | null = "ich_tu_id_verificado_aqui";
let CARDHOLDER_ID: string | null = null;
let LAST_CARD_ID: string | null = null;

export async function createCardholder() {
  try {
    const cardholder = await stripe.issuing.cardholders.create({
      name: "Demo User POC",
      email: "demo@example.com",
      phone_number: "+18008675309",
      type: "individual",
      billing: {
        address: {
          line1: "123 Demo Street",
          city: "San Francisco",
          state: "CA",
          postal_code: "94111",
          country: "US",
        },
      },
      individual: {
        first_name: "Demo",
        last_name: "User",
        dob: {
          year: 1990,
          month: 1,
          day: 1,
        },
        // ¡CLAVE! Aceptación de términos de usuario
        card_issuing: {
          user_terms_acceptance: {
            date: Math.floor(Date.now() / 1000), // Unix timestamp actual
            ip: "127.0.0.1", // IP del usuario (en producción sería la real)
          },
        },
      },
      spending_controls: {
        spending_limits: [
          {
            amount: 10000000, // Límite de $100k
            interval: "all_time",
          },
        ],
      },
      status: "active",
    });

    CARDHOLDER_ID = cardholder.id;
    
    console.log("✅ Cardholder creado:", cardholder.id);
    
    return {
      success: true,
      cardholderId: cardholder.id,
    };
  } catch (error) {
    console.error("❌ Error creando cardholder:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

export async function createVirtualCard(name: string = "Mi Tarjeta Virtual") {
  try {
    if (!CARDHOLDER_ID) {
      throw new Error("Primero debes crear un cardholder");
    }

    const card = await stripe.issuing.cards.create({
      cardholder: CARDHOLDER_ID,
      currency: "usd",
      type: "virtual",
      status: "active",
      spending_controls: {
        spending_limits: [
          {
            amount: 1000000, // $10,000 por transacción
            interval: "per_authorization",
          },
        ],
      },
    });

    LAST_CARD_ID = card.id;

    console.log("✅ Tarjeta virtual creada:", card.id);
    console.log("   Last4:", card.last4);

    return {
      success: true,
      cardId: card.id,
      last4: card.last4,
    };
  } catch (error) {
    console.error("❌ Error creando tarjeta:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

export async function getCardDetails(cardId: string) {
  try {
    // IMPORTANTE: Necesitamos expand: ['number', 'cvc'] para obtener los datos sensibles
    const card = await stripe.issuing.cards.retrieve(cardId, {
      expand: ['number', 'cvc'],
    });

    console.log("✅ Detalles de tarjeta obtenidos:", cardId);
    console.log("   Número disponible:", !!card.number);
    console.log("   CVC disponible:", !!card.cvc);

    return {
      success: true,
      card: {
        id: card.id,
        number: card.number,
        cvc: card.cvc,
        exp_month: card.exp_month,
        exp_year: card.exp_year,
        last4: card.last4,
        status: card.status,
      },
    };
  } catch (error) {
    console.error("❌ Error obteniendo detalles:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

export async function getCurrentCardholderId() {
  return CARDHOLDER_ID;
}

export async function getLastCardId() {
  return LAST_CARD_ID;
}

