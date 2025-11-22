"use client";

import { useState } from "react";
import CardOverview from "@/modules/cards/components/card-overview";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";
import { Copy, CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  createCardholder,
  createVirtualCard,
  getCardDetails,
} from "@/actions/stripe-actions";

export default function Page() {
  const [loading, setLoading] = useState(false);
  const [cardholderId, setCardholderId] = useState<string | null>(null);
  const [cardId, setCardId] = useState<string | null>(null);
  const [cardDetails, setCardDetails] = useState<any>(null);

  const handleCreateCardholder = async () => {
    setLoading(true);
    try {
      const result = await createCardholder();
      if (result.success) {
        setCardholderId(result.cardholderId ?? null);
        toast.success("¡Cardholder creado exitosamente!");
      } else {
        toast.error(result.error || "Error creando cardholder");
      }
    } catch (error) {
      toast.error("Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCard = async () => {
    if (!cardholderId) {
      toast.error("Primero crea un cardholder");
      return;
    }

    setLoading(true);
    try {
      const result = await createVirtualCard();
      if (result.success) {
        setCardId(result.cardId ?? null);
        toast.success("¡Tarjeta virtual creada exitosamente!");
      } else {
        toast.error(result.error || "Error creando tarjeta");
      }
    } catch (error) {
      toast.error("Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  const handleShowDetails = async () => {
    if (!cardId) return;

    setLoading(true);
    try {
      const result = await getCardDetails(cardId);
      if (result.success) {
        setCardDetails(result.card);
        toast.success("Detalles cargados");
      } else {
        toast.error(result.error || "Error obteniendo detalles");
      }
    } catch (error) {
      toast.error("Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado`);
  };

  const formatCardNumber = (number: string | undefined) => {
    if (!number) return "";
    return number.match(/.{1,4}/g)?.join(" ") || number;
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">
            POC - Stripe Issuing
          </h1>
          <p className="text-muted-foreground">
            Prueba de concepto para crear tarjetas virtuales
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Paso 1: Crear Cardholder */}
          <Card>
            <CardHeader>
              <CardTitle>1. Crear Cardholder</CardTitle>
              <CardDescription>
                Primero necesitas un cardholder en Stripe
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleCreateCardholder}
                disabled={loading || !!cardholderId}
                className="w-full"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {cardholderId ? "✓ Cardholder Creado" : "Crear Cardholder"}
              </Button>
              {cardholderId && (
                <div className="p-3 bg-muted rounded-md text-sm font-mono break-all">
                  {cardholderId}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Paso 2: Crear Tarjeta */}
          <Card>
            <CardHeader>
              <CardTitle>2. Crear Tarjeta Virtual</CardTitle>
              <CardDescription>
                Crea una tarjeta virtual asociada al cardholder
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleCreateCard}
                disabled={loading || !cardholderId || !!cardId}
                className="w-full"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {cardId ? "✓ Tarjeta Creada" : "Crear Tarjeta"}
              </Button>
              {cardId && (
                <div className="space-y-2">
                  <div className="p-3 bg-muted rounded-md text-sm font-mono break-all">
                    {cardId}
                  </div>
                  <Button
                    onClick={handleShowDetails}
                    disabled={loading}
                    variant="outline"
                    className="w-full"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Ver Detalles Completos
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detalles de la Tarjeta */}
        {cardDetails && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Detalles de la Tarjeta</CardTitle>
                <Badge>{cardDetails.status}</Badge>
              </div>
              <CardDescription>
                Usa estos datos para probar transacciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Número de Tarjeta */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Número de Tarjeta</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(cardDetails.number, "Número")
                    }
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="p-4 bg-muted rounded-md font-mono text-lg">
                  {formatCardNumber(cardDetails.number)}
                </div>
              </div>

              {/* Expiry y CVC */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-sm font-medium">Fecha de Expiración</span>
                  <div className="p-4 bg-muted rounded-md font-mono text-lg">
                    {String(cardDetails.exp_month).padStart(2, "0")}/
                    {String(cardDetails.exp_year).slice(-2)}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">CVC</span>
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

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  💡 <strong>Próximo paso:</strong> Usa esta tarjeta en un sitio de prueba.
                  Configura el webhook para ver la aprobación en tiempo real.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instrucciones */}
        <Card>
          <CardHeader>
            <CardTitle>🚀 Instrucciones de Prueba</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <strong>1. Configura el webhook:</strong>
              <code className="block mt-1 p-2 bg-muted rounded text-xs">
                stripe listen --forward-to localhost:3000/api/webhooks/stripe
              </code>
            </div>
            <div>
              <strong>2. Usa la tarjeta:</strong> Copia los datos y prueba en un
              sitio de test (o usa el simulador de Stripe Dashboard)
            </div>
            <div>
              <strong>3. Ve los logs:</strong> Revisa la terminal para ver el webhook
              en acción
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
