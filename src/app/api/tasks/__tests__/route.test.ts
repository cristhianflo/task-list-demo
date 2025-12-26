import { POST } from "../route";
import { auth } from "@/auth";
import { createTask } from "@/services/taskService";

jest.mock("@/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("@/services/taskService", () => ({
  createTask: jest.fn(),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({
      status: init?.status || 200,
      json: async () => data,
    })),
  },
}));

describe("POST /api/tasks", () => {
  const mockUserId = "user-uuid-123";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 401 if the user is not authenticated", async () => {
    (auth as jest.Mock).mockResolvedValue(null);

    const req = new Request("http://localhost/api/tasks", {
      method: "POST",
      body: JSON.stringify({ title: "New Task" }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("returns 201 and the created task on success", async () => {
    (auth as jest.Mock).mockResolvedValue({ user: { id: mockUserId } });
    const mockTask = { id: "task-1", title: "Test Task", userId: mockUserId };
    (createTask as jest.Mock).mockResolvedValue(mockTask);

    const req = new Request("http://localhost/api/tasks", {
      method: "POST",
      body: JSON.stringify({
        title: "Test Task",
        description: "Nice description",
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data).toEqual(mockTask);
  });
});
