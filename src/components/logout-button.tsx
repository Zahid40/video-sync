import { Button } from "@/components/ui/button";
import { Logout } from "iconsax-reactjs";
import { logoutUser } from "@/action/user/user.action";
import { cn } from "@/lib/utils";

export function LogoutButton(props: { className?: string }) {
  return (
    <Button
      variant="ghost"
      className={cn("justify-start", props.className)}
      onClick={logoutUser}
    >
      <Logout />
      Logout
    </Button>
  );
}