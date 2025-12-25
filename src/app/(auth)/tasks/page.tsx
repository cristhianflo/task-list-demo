import { auth } from "@/auth";
import { CreateTaskDialog } from "@/components/CreateTaskDialog";
import { TaskActions } from "@/components/TaskActions";
import { getTasksByUserId } from "@/services/taskService";
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  Box,
  Paper,
} from "@mui/material";

export default async function TasksPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <Container maxWidth="sm">
        <Typography variant="h6">Not authenticated</Typography>
      </Container>
    );
  }

  const tasks = await getTasksByUserId(session.user.id);

  return (
    <Container maxWidth="md" className="mt-8">
      <Box className="flex items-center justify-between mb-4">
        <Typography variant="h4">My Tasks</Typography>
        <CreateTaskDialog />
      </Box>

      {tasks.length === 0 ? (
        <Typography color="textSecondary">You have no tasks yet.</Typography>
      ) : (
        <Paper elevation={1}>
          <List>
            {tasks.map((task) => (
              <ListItem
                key={task.id}
                divider
                secondaryAction={<TaskActions task={task} />}
              >
                <ListItemText
                  primary={task.title}
                  secondary={
                    task.description === ""
                      ? "No description"
                      : task.description
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Container>
  );
}
