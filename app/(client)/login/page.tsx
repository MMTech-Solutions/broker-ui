import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ClientLoginPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-4 md:p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Iniciar sesión</CardTitle>
            <CardDescription>
              Formulario de acceso para el área de cliente. Se conectará al
              flujo de autenticación cuando esté disponible.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Placeholder: aquí irá el login del trader (Keycloak / IAM).
            </p>
          </CardContent>
        </Card>
      </div>
  );
}
