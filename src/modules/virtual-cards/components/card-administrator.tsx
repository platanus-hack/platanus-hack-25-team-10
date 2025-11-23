import type { VirtualCard } from "@/db/schema";
import { getEnrichedCardData } from "@/modules/shared/actions/card-actions";
import { Badge } from "@/modules/shared/components/ui/badge";
import { Card } from "@/modules/shared/components/ui/card";
import { CardActions } from "./card-actions";
import { CardVisa } from "./card-visa";

interface CardAdministratorProps {
  card: VirtualCard;
}

export async function CardAdministrator({ card }: CardAdministratorProps) {
  const enrichedData = await getEnrichedCardData(card.stripeCardId);

  const spent = enrichedData.currentSpending;
  const limitText = enrichedData.spendingLimit
    ? enrichedData.spendingLimit >= 1000
      ? `$${(enrichedData.spendingLimit / 1000).toFixed(1)}k limit`
      : `$${enrichedData.spendingLimit} limit`
    : "no limit";

  const getStatusBadge = () => {
    switch (card.status) {
      case "active":
        return (
          <Badge variant="default" className="rounded-none">
            Active
          </Badge>
        );
      case "inactive":
        return (
          <Badge variant="secondary" className="rounded-none">
            Paused
          </Badge>
        );
      case "canceled":
        return (
          <Badge variant="destructive" className="rounded-none">
            Canceled
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="max-w-sm p-6 rounded-none">
      {/* Header Section */}
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-2xl font-semibold mb-1">{card.name}</h2>
        {getStatusBadge()}
      </div>
      {/* Available Credit Info */}
      <p className="text-sm text-muted-foreground">
        ${spent.toFixed(2)} spent · {limitText}
      </p>

      <CardVisa
        stripeCardId={card.stripeCardId}
        last4={card.last4}
        expiryMonth={enrichedData.expiryMonth}
        expiryYear={enrichedData.expiryYear}
      />

      {/* Action Buttons */}
      <CardActions card={card} />
    </Card>
  );
}
