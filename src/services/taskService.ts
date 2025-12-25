import { db } from "@/db";
import { tasks } from "@/db/schema";
import { CreateTask, Task, TaskList, UpdateTask } from "@/schemas/task";
import { and, eq } from "drizzle-orm";

export async function getTasksByUserId(userId: string): Promise<TaskList> {
  const taskList = await db
    .select()
    .from(tasks)
    .where(eq(tasks.userId, userId));

  return taskList;
}

export async function getTaskById(taskId: string): Promise<TaskList[0] | null> {
  const taskList = await db
    .select()
    .from(tasks)
    .where(eq(tasks.id, taskId))
    .limit(1);

  return taskList.length > 0 ? taskList[0] : null;
}

export async function createTask(taskData: CreateTask, userId: string): Promise<Task> {
  const [result] = await db
    .insert(tasks)
    .values({
      userId: userId,
      title: taskData.title,
      description: taskData.description,
    })
    .$returningId();

  const [newTask] = await db
    .select()
    .from(tasks)
    .where(eq(tasks.id, result.id))
    .limit(1);

  return newTask;
}

export async function updateTask(taskId: string, userId: string, data: UpdateTask): Promise<Task | null> {
  const result = await db
    .update(tasks)
    .set(data)
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));

  if (result[0].affectedRows === 0) {
    return null;
  }

  const [updatedTask] = await db
    .select()
    .from(tasks)
    .where(eq(tasks.id, taskId))
    .limit(1);

  return updatedTask;
}
