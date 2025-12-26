import { getTasksByUserId } from "../taskService";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { eq } from "drizzle-orm";

const selectChain = {
  from: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
};

jest.mock("@/db", () => ({
  db: {
    select: jest.fn(() => selectChain),
  },
}));

jest.mock("@/db/schema", () => ({
  tasks: {
    userId: "tasks_userId_column",
  },
}));

jest.mock("drizzle-orm", () => ({
  eq: jest.fn(),
}));

describe("getTasksByUserId", () => {
  const mockUserId = "internal-user-uuid";
  const mockTasks = [
    {
      id: "task-1",
      userId: mockUserId,
      title: "Task One",
      status: "TODO",
    },
    {
      id: "task-2",
      userId: mockUserId,
      title: "Task Two",
      status: "DONE",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch tasks strictly filtered by the provided userId", async () => {
    (selectChain.where as jest.Mock).mockResolvedValue(mockTasks);

    const result = await getTasksByUserId(mockUserId);

    expect(db.select).toHaveBeenCalled();
    expect(selectChain.from).toHaveBeenCalledWith(tasks);

    expect(eq).toHaveBeenCalledWith(tasks.userId, mockUserId);
    expect(selectChain.where).toHaveBeenCalled();

    expect(result).toHaveLength(2);
    expect(result[0].userId).toBe(mockUserId);
    expect(result).toEqual(mockTasks);
  });

  it("returns an empty array if no tasks are found for the user", async () => {
    (selectChain.where as jest.Mock).mockResolvedValue([]);

    const result = await getTasksByUserId("unknown-user");

    expect(result).toEqual([]);
    expect(selectChain.where).toHaveBeenCalled();
  });
});
