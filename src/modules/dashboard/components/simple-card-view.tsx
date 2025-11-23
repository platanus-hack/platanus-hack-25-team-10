import {
  getEnrichedCardData,
  listVirtualCards,
} from "@/modules/shared/actions/card-actions";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/modules/shared/components/ui/card";
import { CardVisa } from "@/modules/virtual-cards/components/card-visa";
import { AddCardButton } from "./add-card-button";

export default async function SimpleCardView() {
  const cards = await listVirtualCards();

  const enrichedCards = await Promise.all(
    cards.map(async (card) => {
      const enrichedData = await getEnrichedCardData(card.stripeCardId);
      return { card, enrichedData };
    }),
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-row justify-between items-center">
          <p className="text-2xl">Your Cards</p>
          <AddCardButton />
        </div>
      </CardHeader>
      <CardContent>
        {/* Cards List */}
        {cards.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No virtual cards yet. Create your first card to get started!
          </div>
        ) : (
          <div className="flex gap-6 overflow-x-auto">
            {enrichedCards.map(({ card, enrichedData }) => (
              <div key={card.id} className="shrink-0">
                <CardVisa
                  stripeCardId={card.stripeCardId}
                  last4={card.last4}
                  expiryMonth={enrichedData.expiryMonth}
                  expiryYear={enrichedData.expiryYear}
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
