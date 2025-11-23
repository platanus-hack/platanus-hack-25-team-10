"use server";

import { stripe } from "@/modules/shared/lib/stripe";

const CARDHOLDER_ID: string | null = null;
const LAST_CARD_ID: string | null = "ich_tu_id_verificado_aqui";

export async function getCardDetails(cardId: string) {
  try {
    // IMPORTANTE: Necesitamos expand: ['number', 'cvc'] para obtener los datos sensibles
    const card = await stripe.issuing.cards.retrieve(cardId, {
      expand: ["number", "cvc"],
    });

    console.log("✅ Card details retrieved:", cardId);
    console.log("   Number available:", !!card.number);
    console.log("   CVC available:", !!card.cvc);

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
    console.error("❌ Error retrieving details:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getCurrentCardholderId() {
  return CARDHOLDER_ID;
}

export async function getLastCardId() {
  return LAST_CARD_ID;
}
