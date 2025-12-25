import { AppBar, Toolbar, Typography, Box } from "@mui/material";
import LogoutButton from "./LogoutButton";
import { auth } from "@/auth";

export async function AuthHeader() {
  const session = await auth();

  if (!session?.user?.id) return null;

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar className="flex justify-between">
        <Typography variant="body1" className="font-medium">
          Logged in as {session.user.email}
        </Typography>

        <Box>
          <LogoutButton />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
