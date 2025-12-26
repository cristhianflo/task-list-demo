import {
  TaskSchema,
  CreateTaskSchema,
  UpdateTaskSchema,
  CompleteTaskParamsSchema,
} from "../task";

describe("Task Zod Schemas", () => {
  const validUuid = "550e8400-e29b-41d4-a716-446655440000";

  describe("TaskSchema", () => {
    const validTask = {
      id: validUuid,
      userId: validUuid,
      title: "Clean the kitchen",
      description: "Mop floors and wipe counters",
      status: "TODO",
      createdAt: new Date(),
      updatedAt: new Date(),
      completedAt: null,
    };

    it("accepts a valid task object", () => {
      const result = TaskSchema.safeParse(validTask);
      expect(result.success).toBe(true);
    });

    it("rejects invalid UUIDs", () => {
      const invalidTask = { ...validTask, id: "not-a-uuid" };
      const result = TaskSchema.safeParse(invalidTask);
      expect(result.success).toBe(false);
    });

    it("rejects invalid status enums", () => {
      const invalidTask = { ...validTask, status: "IN_PROGRESS" }; // Assuming not in TASK_STATUS
      const result = TaskSchema.safeParse(invalidTask);
      expect(result.success).toBe(false);
    });
  });

  describe("CreateTaskSchema", () => {
    it("accepts valid creation data", () => {
      const payload = { title: "Buy groceries", description: null };
      expect(CreateTaskSchema.safeParse(payload).success).toBe(true);
    });

    it("rejects empty titles", () => {
      const payload = { title: "" };
      const result = CreateTaskSchema.safeParse(payload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe("too_small");
      }
    });

    it("rejects titles exceeding 255 characters", () => {
      const payload = { title: "a".repeat(256) };
      expect(CreateTaskSchema.safeParse(payload).success).toBe(false);
    });
  });

  describe("UpdateTaskSchema", () => {
    it("allows partial updates", () => {
      const payload = { title: "Updated Title" }; // Description missing but allowed
      expect(UpdateTaskSchema.safeParse(payload).success).toBe(true);
    });

    it("allows description to be explicitly null", () => {
      const payload = { description: null };
      expect(UpdateTaskSchema.safeParse(payload).success).toBe(true);
    });
  });

  describe("CompleteTaskParamsSchema", () => {
    it("accepts a valid UUID taskId", () => {
      const payload = { taskId: validUuid };
      expect(CompleteTaskParamsSchema.safeParse(payload).success).toBe(true);
    });

    it("rejects non-UUID taskId", () => {
      const payload = { taskId: "123-abc" };
      expect(CompleteTaskParamsSchema.safeParse(payload).success).toBe(false);
    });
  });
});
