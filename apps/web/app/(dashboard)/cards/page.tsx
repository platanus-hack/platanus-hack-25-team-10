"use client";

import { useState, useEffect } from "react";
import { listVirtualCards, getCardDetails, createVirtualCard } from "@/actions/card-actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/dialog";
import { Copy, CreditCard, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

type VirtualCard = {
  id: string;
  userId: string;
  stripeCardId: string;
  name: string;
  last4: string;
  status: string;
  createdAt: Date;
};

type CardDetails = {
  number: string;
  cvc: string;
  exp_month: number;
  exp_year: number;
  last4: string;
};

export default function CardsPage() {
  const [cards, setCards] = useState<VirtualCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [cardName, setCardName] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [cardDetails, setCardDetails] = useState<CardDetails | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      const result = await listVirtualCards();
      setCards(result);
    } catch (error) {
      toast.error("Failed to load cards");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCard = async () => {
    if (!cardName.trim()) {
      toast.error("Please enter a card name");
      return;
    }

    setCreating(true);
    try {
      await createVirtualCard(cardName);
      toast.success("Virtual card created successfully!");
      setCardName("");
      setOpen(false);
      await loadCards();
    } catch (error) {
      toast.error("Failed to create card");
    } finally {
      setCreating(false);
    }
  };

  const handleViewDetails = async (cardId: string) => {
    setSelectedCard(cardId);
    setShowDetails(true);
    try {
      const details = await getCardDetails(cardId);
      setCardDetails(details as CardDetails);
    } catch (error) { 
      toast.error("Failed to load card details");
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const formatCardNumber = (number: string) => {
    return number.match(/.{1,4}/g)?.join(" ") || number;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Virtual Cards</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <CreditCard className="mr-2 h-4 w-4" />
              Create Card
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Virtual Card</DialogTitle>
              <DialogDescription>
                Create a new virtual card for secure online purchases
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Card Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Shopping Card"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                />
              </div>
              <Button
                onClick={handleCreateCard}
                disabled={creating}
                className="w-full"
              >
                {creating ? "Creating..." : "Create Card"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {cards.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No virtual cards yet. Create your first card to get started!
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <Card key={card.id}>
              <CardHeader>
                <CardTitle>{card.name}</CardTitle>
                <CardDescription>**** {card.last4}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Status:</span>
                    <span className="font-medium capitalize">{card.status}</span>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleViewDetails(card.stripeCardId)}
                  >
                    {showDetails && selectedCard === card.stripeCardId ? (
                      <EyeOff className="mr-2 h-4 w-4" />
                    ) : (
                      <Eye className="mr-2 h-4 w-4" />
                    )}
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showDetails && cardDetails && (
        <Card>
          <CardHeader>
            <CardTitle>Card Details</CardTitle>
            <CardDescription>Full card information - keep secure</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Card Number</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(cardDetails.number, "Card number")
                  }
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-4 bg-muted rounded-md font-mono text-lg">
                {formatCardNumber(cardDetails.number)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Expiry</Label>
                <div className="p-4 bg-muted rounded-md font-mono text-lg">
                  {String(cardDetails.exp_month).padStart(2, "0")}/
                  {String(cardDetails.exp_year).slice(-2)}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>CVC</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(cardDetails.cvc, "CVC")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="p-4 bg-muted rounded-md font-mono text-lg">
                  {cardDetails.cvc}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

