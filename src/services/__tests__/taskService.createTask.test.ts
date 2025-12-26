import { createTask } from "../taskService";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { eq } from "drizzle-orm";

const insertChain = {
  values: jest.fn().mockReturnThis(),
  $returningId: jest.fn().mockResolvedValue([{ id: "new-task-uuid" }]),
};

const selectChain = {
  from: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(), // Added limit to the chain
};

jest.mock("@/db", () => ({
  db: {
    insert: jest.fn(() => insertChain),
    select: jest.fn(() => selectChain),
  },
}));

jest.mock("@/db/schema", () => ({
  tasks: {
    id: "tasks_id_column",
    userId: "tasks_userId_column",
  },
}));

jest.mock("drizzle-orm", () => ({
  eq: jest.fn(),
}));

describe("createTask", () => {
  const mockUserId = "internal-user-uuid";
  const payload = {
    title: "Test task",
    description: "Test description",
  };

  const mockCreatedTask = {
    id: "new-task-uuid",
    userId: mockUserId,
    ...payload,
    status: "TODO",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates a task and verifies selection logic", async () => {
    (selectChain.limit as jest.Mock).mockResolvedValue([mockCreatedTask]);

    const result = await createTask(payload, mockUserId);

    expect(db.insert).toHaveBeenCalledWith(tasks);
    expect(insertChain.values).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: mockUserId,
        title: payload.title,
      }),
    );

    expect(db.select).toHaveBeenCalled();
    expect(selectChain.from).toHaveBeenCalledWith(tasks);

    expect(eq).toHaveBeenCalledWith(tasks.id, "new-task-uuid");

    expect(selectChain.limit).toHaveBeenCalledWith(1);

    expect(result).toEqual(mockCreatedTask);
  });
});
