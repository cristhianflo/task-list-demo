import { updateTask } from "../taskService";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { eq, and } from "drizzle-orm";

const updateChain = {
  set: jest.fn().mockReturnThis(),
  where: jest.fn().mockResolvedValue([{ affectedRows: 1 }]),
};

const selectChain = {
  from: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
};

jest.mock("@/db", () => ({
  db: {
    update: jest.fn(() => updateChain),
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
  eq: jest.fn((col, val) => ({ column: col, value: val })),
  and: jest.fn((...args) => args),
}));

describe("updateTask", () => {
  const mockTaskId = "task-uuid-123";
  const mockUserId = "user-uuid-456";
  const updatePayload = { title: "Updated Title" };

  const mockTaskResult = {
    id: mockTaskId,
    userId: mockUserId,
    title: "Updated Title",
    status: "TODO",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("updates the task successfully when ownership is verified", async () => {
    (selectChain.limit as jest.Mock).mockResolvedValue([mockTaskResult]);

    const result = await updateTask(mockTaskId, mockUserId, updatePayload);

    expect(db.update).toHaveBeenCalledWith(tasks);
    expect(updateChain.set).toHaveBeenCalledWith(updatePayload);

    expect(and).toHaveBeenCalled();
    expect(eq).toHaveBeenCalledWith(tasks.id, mockTaskId);
    expect(eq).toHaveBeenCalledWith(tasks.userId, mockUserId);

    expect(db.select).toHaveBeenCalled();
    expect(result).toEqual(mockTaskResult);
  });

  it("returns null if the task does not exist or user does not own it", async () => {
    (updateChain.where as jest.Mock).mockResolvedValue([{ affectedRows: 0 }]);

    const result = await updateTask(mockTaskId, mockUserId, updatePayload);

    expect(result).toBeNull();
    expect(db.select).not.toHaveBeenCalled();
  });
});
