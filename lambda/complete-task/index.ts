import { Handler } from "aws-lambda";
import { db } from "./db";
import { tasks } from "./db/schema";
import { eq, and } from "drizzle-orm";
import { LambdaCompleteTaskPayloadSchema } from "./schemas";

export const handler: Handler = async (event) => {
  console.log("Received event:", JSON.stringify(event, null, 2));

  const parseResult = LambdaCompleteTaskPayloadSchema.safeParse(event);

  if (!parseResult.success) {
    console.error("Invalid Payload", parseResult.error);
    throw new Error("Invalid Payload");
  }

  const { taskId, userId } = parseResult.data;

  try {
    await db
      .update(tasks)
      .set({
        status: "DONE",
        completedAt: new Date(),
      })
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));

    console.log(`Task ${taskId} marked as done for user ${userId}`);
    return { statusCode: 200, body: "Success" };
  } catch (error) {
    console.error("Database Update Failed", error);
    throw error;
  }
};
