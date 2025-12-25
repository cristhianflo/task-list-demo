import LogoutButton from "@/components/LogoutButton";
import { Box, Container, Paper, Typography } from "@mui/material";

export default function Tasks() {
  return (
    <Container
      maxWidth="sm"
      className="min-h-screen flex items-center justify-center"
    >
      <Paper elevation={3} className="w-full p-8 rounded-2xl">
        <Box className="flex flex-col items-center gap-6">
          <Typography variant="h4" component="h1" fontWeight={600}>
            Task List App
          </Typography>
          Logged In!
          <LogoutButton />
        </Box>
      </Paper>
    </Container>
  );
}
