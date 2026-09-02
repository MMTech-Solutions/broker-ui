"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon, KeyRoundIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type BrokerRequestCredentialsProps = {
  accessToken: string | null;
  userinfo: string | null;
};

function CredentialValue({ label, value }: { label: string; value: string | null }) {
  const [copied, setCopied] = useState(false);

  async function copyValue() {
    if (!value) return;

    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2_000);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium">{label}</p>
        <Button
          variant="outline"
          size="sm"
          disabled={!value}
          onClick={() => void copyValue()}
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
          {copied ? "Copiado" : "Copiar"}
        </Button>
      </div>
      <pre className="max-h-36 overflow-auto whitespace-pre-wrap break-all rounded-md border bg-muted p-3 text-xs">
        {value ?? "No hay una sesión de cliente activa."}
      </pre>
    </div>
  );
}

export function BrokerRequestCredentials({
  accessToken,
  userinfo,
}: BrokerRequestCredentialsProps) {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" />}>
        <KeyRoundIcon />
        Credenciales API
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Credenciales para pruebas de Broker API</DialogTitle>
          <DialogDescription>
            Estas credenciales pertenecen a tu sesión actual. Trátalas como una
            contraseña y revócalas cerrando sesión cuando termines las pruebas.
          </DialogDescription>
        </DialogHeader>
        <CredentialValue label="Authorization: Bearer" value={accessToken} />
        <CredentialValue label="X-Userinfo" value={userinfo} />
      </DialogContent>
    </Dialog>
  );
}
