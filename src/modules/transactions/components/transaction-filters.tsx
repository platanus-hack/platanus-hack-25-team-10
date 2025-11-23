"use client";

import { parseAsString, useQueryState } from "nuqs";
import type { VirtualCard } from "@/db/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/modules/shared/components/ui/select";

interface TransactionFiltersProps {
  cards: VirtualCard[];
}

export function TransactionFilters({ cards }: TransactionFiltersProps) {
  const [cardId, setCardId] = useQueryState(
    "cardId",
    parseAsString.withDefault("all").withOptions({ shallow: false }),
  );

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <label htmlFor="card-filter" className="text-sm font-medium">
          Filter by card:
        </label>
        <Select value={cardId} onValueChange={setCardId}>
          <SelectTrigger id="card-filter" className="w-[280px]">
            <SelectValue placeholder="All cards" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All cards</SelectItem>
            {cards.map((card) => (
              <SelectItem key={card.id} value={card.id}>
                {card.name} (••••{card.last4})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
