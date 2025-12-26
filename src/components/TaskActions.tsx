"use client";

import {
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle"; // New Icon
import { useState, useTransition } from "react";
import { Task } from "@/schemas/task";
import { useRouter } from "next/navigation";
import { useToast } from "./ToastProvider";

type Props = {
  task: Task;
};

export function TaskActions({ task }: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();
  const router = useRouter();

  const isProcessing = task.status === "PENDING" || isPending;
  const isDone = task.status === "DONE";

  const handleMarkAsDone = () => {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/tasks/${task.id}/complete`, {
          method: "POST",
        });

        if (res.ok) {
          showToast({
            message: "Task is being processed by cloud worker...",
            type: "success",
          });
          router.refresh();
        } else {
          const errorData = await res.json();
          showToast({
            message: errorData.error || "Failed to trigger completion",
            type: "error",
          });
        }
      } catch (err) {
        showToast({ message: "Network error occurred", type: "error" });
      }
    });
  };

  const handleEdit = () => {
    startTransition(async () => {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });

      if (res.ok) {
        showToast({ message: "Task updated successfully", type: "success" });
        setEditOpen(false);
        router.refresh();
      } else {
        showToast({ message: "Failed to update task", type: "error" });
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "DELETE",
      });

      if (res.status === 204) {
        showToast({ message: "Task deleted successfully", type: "success" });
        setDeleteOpen(false);
        router.refresh();
      } else {
        showToast({ message: "Failed to delete task", type: "error" });
      }
    });
  };

  return (
    <>
      <Stack direction="row" spacing={1} alignItems="center">
        <Tooltip title={isDone ? "Completed" : "Mark as Done"}>
          <span>
            {" "}
            <IconButton
              aria-label="Complete task"
              size="small"
              color="success"
              onClick={handleMarkAsDone}
              disabled={isProcessing || isDone}
            >
              {isProcessing ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <CheckCircleIcon
                  fontSize="small"
                  color={isDone ? "success" : "disabled"}
                />
              )}
            </IconButton>
          </span>
        </Tooltip>

        <IconButton
          aria-label="Edit task"
          size="small"
          onClick={() => setEditOpen(true)}
          disabled={isProcessing}
        >
          <EditIcon fontSize="small" />
        </IconButton>

        <IconButton
          aria-label="Delete task"
          size="small"
          onClick={() => setDeleteOpen(true)}
          disabled={isProcessing}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Stack>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth>
        <DialogTitle>Edit Task</DialogTitle>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleEdit();
          }}
        >
          <DialogContent className="space-y-4">
            <TextField
              label="Title"
              fullWidth
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <TextField
              label="Description"
              fullWidth
              multiline
              minRows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={!title || isPending}
            >
              Save
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Delete Task</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this task?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleDelete}
            disabled={isPending}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
