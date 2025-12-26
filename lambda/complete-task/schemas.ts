import { z } from "zod/v3";

// Schema for the Lambda Payload (Next.js -> AWS Lambda)
export const LambdaCompleteTaskPayloadSchema = z.object({
  taskId: z.string().uuid(),
  userId: z.string().uuid(),
});

export type LambdaCompleteTaskPayload = z.infer<
  typeof LambdaCompleteTaskPayloadSchema
>;
