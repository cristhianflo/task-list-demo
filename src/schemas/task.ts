import { TASK_STATUS } from "@/db/schema";
import { z } from "zod/v3";

export const TaskSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  title: z.string().min(1).max(255),
  description: z.string().max(1000).nullable(),
  status: z.enum(TASK_STATUS),
  createdAt: z.date(),
  updatedAt: z.date(),
  completedAt: z.date().nullable(),
});

export type Task = z.infer<typeof TaskSchema>;

export const TaskListSchema = z.array(TaskSchema);

export type TaskList = z.infer<typeof TaskListSchema>;

export const CreateTaskSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(1000).nullable().optional(),
});

export type CreateTask = z.infer<typeof CreateTaskSchema>;

export const UpdateTaskSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).nullable().optional(),
});

export type UpdateTask = z.infer<typeof UpdateTaskSchema>;
