import { auth } from "@/auth";
import { UpdateTaskSchema } from "@/schemas/task";
import { deleteTask, updateTask } from "@/services/taskService";
import { NextResponse } from "next/server";
import { ZodError } from "zod/v3";

export async function PATCH(
  req: Request,
  context: { params: { id: string } | Promise<{ id: string }> },
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = await context.params;
  const taskId = params.id;

  try {
    const body = await req.json();
    const payload = UpdateTaskSchema.parse(body);

    const updatedTask = await updateTask(taskId, session.user.id, payload);

    if (!updatedTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(updatedTask);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.flatten() },
        { status: 400 },
      );
    }

    console.error("Update task failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  context: { params: { id: string } | Promise<{ id: string }> },
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = await context.params;
  const taskId = params.id;

  try {
    const deleted = await deleteTask(taskId, session.user.id);

    if (!deleted) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.flatten() },
        { status: 400 },
      );
    }

    console.error("Delete task failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
