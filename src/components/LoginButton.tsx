import { signIn } from "@/auth";
import Button from "@mui/material/Button";

export default function LoginButton() {
  const handleSignIn = async () => {
    "use server";
    await signIn("cognito", { redirectTo: "/tasks" });
  };

  return (
    <Button variant="contained" color="primary" onClick={handleSignIn}>
      Sign in with Cognito
    </Button>
  );
}
