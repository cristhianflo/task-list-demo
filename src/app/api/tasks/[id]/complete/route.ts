import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import { setTaskPending } from "@/services/taskService";
import { CompleteTaskParamsSchema } from "@/schemas/task";

const lambdaClient = new LambdaClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(
  req: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> },
) {
  const session = await auth();

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = await context.params;
  const taskId = params.id;
  const validation = CompleteTaskParamsSchema.safeParse({ taskId });

  if (!validation.success) {
    return NextResponse.json({ error: "Invalid Task ID" }, { status: 400 });
  }
  try {
    await setTaskPending(taskId, session.user.id);

    const command = new InvokeCommand({
      FunctionName: process.env.AWS_LAMBDA_COMPLETE_TASK,
      InvocationType: "Event",
      Payload: JSON.stringify({
        taskId: taskId,
        userId: session.user.id,
      }),
    });

    await lambdaClient.send(command);

    return NextResponse.json({ success: true, status: "PENDING" });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
