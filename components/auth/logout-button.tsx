import { logoutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import type { AuthArea } from "@/lib/auth/types";

type LogoutButtonProps = {
  area: AuthArea;
};

export function LogoutButton({ area }: LogoutButtonProps) {
  return (
    <form action={logoutAction}>
      <input type="hidden" name="area" value={area} />
      <Button type="submit" variant="outline" size="sm">
        Salir
      </Button>
    </form>
  );
}
