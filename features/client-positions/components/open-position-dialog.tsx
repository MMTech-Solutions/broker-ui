"use client";

import { useState } from "react";

import { ApiErrorAlert } from "@/components/feedback/api-error-alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { openPosition } from "@/features/client-positions/api";
import type { PositionSide } from "@/features/client-positions/types";
import { formatBrokerApiError } from "@/lib/api/errors";

type OpenPositionDialogProps = {
  accountId: string;
  onOpened: () => void;
};

export function OpenPositionDialog({
  accountId,
  onOpened,
}: OpenPositionDialogProps) {
  const [open, setOpen] = useState(false);
  const [symbol, setSymbol] = useState("EURUSD");
  const [side, setSide] = useState<PositionSide>("buy");
  const [volume, setVolume] = useState("0.01");
  const [sl, setSl] = useState("");
  const [tp, setTp] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function resetForm() {
    setSymbol("EURUSD");
    setSide("buy");
    setVolume("0.01");
    setSl("");
    setTp("");
    setComment("");
    setError(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedVolume = Number(volume);
    if (!symbol.trim() || !Number.isFinite(parsedVolume) || parsedVolume <= 0) {
      setError("Indica un símbolo y un volumen válido mayor que cero.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await openPosition(accountId, {
        symbol: symbol.trim().toUpperCase(),
        side,
        volume: parsedVolume,
        sl: sl ? Number(sl) : 0,
        tp: tp ? Number(tp) : 0,
        comment: comment.trim() || null,
      });

      resetForm();
      setOpen(false);
      onOpened();
    } catch (err) {
      setError(formatBrokerApiError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setError(null);
        }
      }}
    >
      <DialogTrigger render={<Button size="sm">Abrir posición</Button>} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Abrir posición</DialogTitle>
          <DialogDescription>
            Envía una orden de mercado a la cuenta seleccionada.
          </DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {error ? (
            <ApiErrorAlert title="No se pudo abrir la posición" message={error} />
          ) : null}

          <div className="grid gap-2">
            <Label htmlFor="open-position-symbol">Símbolo</Label>
            <Input
              id="open-position-symbol"
              value={symbol}
              onChange={(event) => setSymbol(event.target.value)}
              placeholder="EURUSD"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="open-position-side">Dirección</Label>
            <Select
              value={side}
              onValueChange={(value) => {
                if (value === "buy" || value === "sell") {
                  setSide(value);
                }
              }}
            >
              <SelectTrigger id="open-position-side">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="buy">Buy</SelectItem>
                <SelectItem value="sell">Sell</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="open-position-volume">Volumen (lotes)</Label>
            <Input
              id="open-position-volume"
              type="number"
              min="0.01"
              step="0.01"
              value={volume}
              onChange={(event) => setVolume(event.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="open-position-sl">SL</Label>
              <Input
                id="open-position-sl"
                type="number"
                min="0"
                step="any"
                value={sl}
                onChange={(event) => setSl(event.target.value)}
                placeholder="0"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="open-position-tp">TP</Label>
              <Input
                id="open-position-tp"
                type="number"
                min="0"
                step="any"
                value={tp}
                onChange={(event) => setTp(event.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="open-position-comment">Comentario</Label>
            <Input
              id="open-position-comment"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Opcional"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Abriendo…" : "Abrir"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
