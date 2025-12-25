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
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
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
      <Stack direction="row" spacing={1}>
        <IconButton
          aria-label="Edit task"
          size="small"
          onClick={() => setEditOpen(true)}
        >
          <EditIcon fontSize="small" />
        </IconButton>

        <IconButton
          aria-label="Delete task"
          size="small"
          onClick={() => setDeleteOpen(true)}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Stack>

      {/* Edit Dialog */}
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

      {/* Delete Dialog */}
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
