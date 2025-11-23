"use client";

import { ListChecks, Power, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import type { VirtualCard } from "@/db/schema";
import {
  activateCard,
  cancelCard,
  pauseCard,
} from "@/modules/shared/actions/card-actions";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/modules/shared/components/ui/alert-dialog";
import { Button } from "@/modules/shared/components/ui/button";
import { Input } from "@/modules/shared/components/ui/input";

interface CardActionsProps {
  card: VirtualCard;
}

export function CardActions({ card }: CardActionsProps) {
  const router = useRouter();
  const [status, setStatus] = useState(card.status);
  const [loading, setLoading] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelConfirmText, setCancelConfirmText] = useState("");

  const handleToggleStatus = async () => {
    if (status === "canceled") return;

    setLoading(true);
    try {
      if (status === "active") {
        await pauseCard(card.stripeCardId);
        setStatus("inactive");
        toast.success("Card paused", {
          description: "The card has been paused successfully",
        });
      } else {
        await activateCard(card.stripeCardId);
        setStatus("active");
        toast.success("Card activated", {
          description: "The card has been activated successfully",
        });
      }
      router.refresh();
    } catch (error) {
      console.error("Failed to toggle card status:", error);
      toast.error("Error", {
        description:
          error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelCard = async () => {
    if (cancelConfirmText !== "CANCEL") {
      toast.error("Incorrect confirmation", {
        description: 'Type "CANCEL" to confirm',
      });
      return;
    }

    setLoading(true);
    try {
      await cancelCard(card.stripeCardId);
      setStatus("canceled");
      toast.success("Card canceled", {
        description: "The card has been permanently canceled",
      });
      setShowCancelDialog(false);
      setCancelConfirmText("");
      router.refresh();
    } catch (error) {
      console.error("Failed to cancel card:", error);
      toast.error("Error canceling card", {
        description:
          error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div>
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            className="flex items-center gap-2 w-1/2"
            onClick={handleToggleStatus}
            disabled={loading || status === "canceled"}
          >
            <Power className="w-4 h-4" />
            {status === "active" ? "Pause" : "Activate"}
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2 w-1/2"
            onClick={() => setShowCancelDialog(true)}
            disabled={loading || status === "canceled"}
          >
            <Trash2 className="w-4 h-4" />
            Cancel
          </Button>
        </div>
        <Button
          variant="outline"
          className="w-full border-t-0"
          onClick={() => router.push(`/transactions?cardId=${card.id}`)}
        >
          <ListChecks className="w-4 h-4" />
          Transactions
        </Button>
      </div>
      {/* Cancel Dialog */}
      <AlertDialog
        open={showCancelDialog}
        onOpenChange={(open) => {
          setShowCancelDialog(open);
          if (!open) setCancelConfirmText("");
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">
              ⚠️ Cancel card permanently
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p className="font-semibold">
                This action is{" "}
                <span className="text-destructive">IRREVERSIBLE</span>.
              </p>
              <p>
                The card will be permanently canceled and you will not be able
                to use it again. All pending transactions will be rejected.
              </p>
              <div className="pt-2">
                <label
                  htmlFor="cancel-confirm"
                  className="text-sm font-medium text-foreground"
                >
                  Type <span className="font-bold">CANCEL</span> to confirm:
                </label>
                <Input
                  id="cancel-confirm"
                  value={cancelConfirmText}
                  onChange={(e) => setCancelConfirmText(e.target.value)}
                  placeholder="CANCEL"
                  className="mt-2"
                  disabled={loading}
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>
              No, keep card
            </AlertDialogCancel>
            <Button
              onClick={handleCancelCard}
              disabled={loading || cancelConfirmText !== "CANCEL"}
              variant="destructive"
            >
              {loading ? "Canceling..." : "Yes, cancel card"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
