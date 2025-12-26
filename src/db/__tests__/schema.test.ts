import { TASK_STATUS } from "../schema";
import { TaskSchema } from "@/schemas/task";

describe("Database Schema Consistency", () => {
  it("should have matching status enums between Drizzle and Zod", () => {
    const zodEnumValues = TaskSchema.shape.status.options;

    expect(zodEnumValues).toEqual(TASK_STATUS);
  });

  it("should have correct lengths defined for varchar fields", () => {
    const titleLimit = TaskSchema.shape.title._def.checks.find(
      (c) => c.kind === "max",
    )?.value;

    expect(titleLimit).toBe(255);
  });
});
