import { handler } from "./index";
import { db } from "./db";
import { tasks } from "./db/schema";
import { eq, and } from "drizzle-orm";

const updateChain = {
  set: jest.fn().mockReturnThis(),
  where: jest.fn().mockResolvedValue([{ affectedRows: 1 }]),
};

jest.mock("./db", () => ({
  db: { update: jest.fn(() => updateChain) },
}));

jest.mock("./db/schema", () => ({
  tasks: {
    id: "tasks_id_col",
    userId: "tasks_userId_col",
  },
}));

jest.mock("drizzle-orm", () => ({
  eq: jest.fn((col, val) => ({ col, val })),
  and: jest.fn((...args) => args),
}));

describe("Lambda Task Completion Handler", () => {
  const mockTaskId = "550e8400-e29b-41d4-a716-446655440000";
  const mockUserId = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  it("successfully updates task status to DONE when payload is valid", async () => {
    const event = {
      taskId: mockTaskId,
      userId: mockUserId,
    };

    const result = await handler(event, {} as any, () => {});

    expect(db.update).toHaveBeenCalledWith(tasks);
    expect(updateChain.set).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "DONE",
        completedAt: expect.any(Date),
      }),
    );
    expect(result).toEqual({ statusCode: 200, body: "Success" });
  });

  it("re-throws the error if the database update fails", async () => {
    const event = { taskId: mockTaskId, userId: mockUserId };

    (updateChain.where as jest.Mock).mockRejectedValue(
      new Error("DB Connection Lost"),
    );

    await expect(handler(event, {} as any, () => {})).rejects.toThrow(
      "DB Connection Lost",
    );
  });
});
