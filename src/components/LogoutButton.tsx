import { signOut } from "@/auth";
import Button from "@mui/material/Button";

export default function LogoutButton() {
  const handleSignOut = async () => {
    "use server"
    await signOut();
  };

  return (
    <Button variant="contained" color="secondary" onClick={handleSignOut}>
      Sign out
    </Button>
  );
}
