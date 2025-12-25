import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createTask } from "@/services/taskService";
import { CreateTaskSchema } from "@/schemas/task";
import { ZodError } from "zod";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const payload = CreateTaskSchema.parse(body);

    const task = await createTask({
      title: payload.title,
      description: payload.description,
    }, session.user.id);

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.flatten() },
        { status: 400 },
      );
    }

    console.error("Create task failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
