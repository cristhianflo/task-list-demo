import { setTaskPending } from "../taskService";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { eq, and } from "drizzle-orm";

const updateChain = {
  set: jest.fn().mockReturnThis(),
  where: jest.fn().mockResolvedValue([{ affectedRows: 1 }]),
};

jest.mock("@/db", () => ({
  db: {
    update: jest.fn(() => updateChain),
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

describe("setTaskPending", () => {
  const mockTaskId = "task-uuid-123";
  const mockUserId = "user-uuid-456";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("sets the task status to PENDING and verifies user ownership", async () => {
    await setTaskPending(mockTaskId, mockUserId);

    expect(db.update).toHaveBeenCalledWith(tasks);

    expect(updateChain.set).toHaveBeenCalledWith({ status: "PENDING" });

    expect(and).toHaveBeenCalled();
    expect(eq).toHaveBeenCalledWith(tasks.id, mockTaskId);
    expect(eq).toHaveBeenCalledWith(tasks.userId, mockUserId);

    expect(updateChain.where).toHaveBeenCalled();
  });

  it("completes even if no rows are affected (idempotency)", async () => {
    (updateChain.where as jest.Mock).mockResolvedValue([{ affectedRows: 0 }]);

    await expect(setTaskPending(mockTaskId, mockUserId)).resolves.not.toThrow();

    expect(updateChain.where).toHaveBeenCalled();
  });
});
