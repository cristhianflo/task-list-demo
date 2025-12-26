import { deleteTask } from "../taskService";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { eq, and } from "drizzle-orm";

const deleteChain = {
  where: jest.fn(),
};

jest.mock("@/db", () => ({
  db: {
    delete: jest.fn(() => deleteChain),
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

describe("deleteTask", () => {
  const mockTaskId = "task-uuid-delete";
  const mockUserId = "user-uuid-owner";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns true when the task is successfully deleted by the owner", async () => {
    (deleteChain.where as jest.Mock).mockResolvedValue([{ affectedRows: 1 }]);

    const result = await deleteTask(mockTaskId, mockUserId);

    expect(db.delete).toHaveBeenCalledWith(tasks);
    expect(and).toHaveBeenCalled();
    expect(eq).toHaveBeenCalledWith(tasks.id, mockTaskId);
    expect(eq).toHaveBeenCalledWith(tasks.userId, mockUserId);

    expect(result).toBe(true);
  });

  it("returns false when the task does not exist or belongs to another user", async () => {
    (deleteChain.where as jest.Mock).mockResolvedValue([{ affectedRows: 0 }]);

    const result = await deleteTask(mockTaskId, mockUserId);

    expect(result).toBe(false);
    expect(deleteChain.where).toHaveBeenCalled();
  });
});
