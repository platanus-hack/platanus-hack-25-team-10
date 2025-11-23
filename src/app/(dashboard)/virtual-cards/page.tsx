import { AddCardButton } from "@/modules/dashboard/components/add-card-button";
import { listVirtualCards } from "@/modules/shared/actions/card-actions";
import { AdminContainer } from "@/modules/shared/components/admin-container";
import { Card, CardContent } from "@/modules/shared/components/ui/card";
import { CardAdministrator } from "@/modules/virtual-cards/components/card-administrator";

export default async function VirtualCardsPage() {
  const cards = await listVirtualCards();

  return (
    <AdminContainer
      breadcrumbItems={[{ href: "/virtual-cards", label: "Virtual Cards" }]}
      className="space-y-8"
    >
      <div className="space-y-2 flex flex-row justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold">Your Cards</h1>
        </div>
        <AddCardButton />
      </div>
      {cards.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No virtual cards yet. Create your first card to get started!
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cards.map((card) => (
            <CardAdministrator key={card.id} card={card} />
          ))}
        </div>
      )}
    </AdminContainer>
  );
}
