import { PATCH, DELETE } from "../route";
import { auth } from "@/auth";
import { updateTask, deleteTask } from "@/services/taskService";

jest.mock("@/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("@/services/taskService", () => ({
  updateTask: jest.fn(),
  deleteTask: jest.fn(),
}));

jest.mock("next/server", () => {
  const actualNextServer = jest.requireActual("next/server");

  class MockNextResponse {
    status: number;
    body: any;

    constructor(body: any, init?: { status?: number }) {
      this.body = body;
      this.status = init?.status || 200;
    }

    async json() {
      return typeof this.body === "string" ? JSON.parse(this.body) : this.body;
    }

    static json(data: any, init?: { status?: number }) {
      return new MockNextResponse(data, init);
    }
  }

  return {
    ...actualNextServer,
    NextResponse: MockNextResponse,
  };
});

describe("Dynamic Task API Routes /[id]", () => {
  const mockUserId = "user-123";
  const mockTaskId = "task-456";
  const mockContext = { params: Promise.resolve({ id: mockTaskId }) };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterAll(() => {
    (console.error as jest.Mock).mockRestore();
  });

  describe("PATCH Handler", () => {
    it("returns 401 if unauthorized", async () => {
      (auth as jest.Mock).mockResolvedValue(null);
      const req = new Request(`http://localhost/api/tasks/${mockTaskId}`, {
        method: "PATCH",
      });

      const response = await PATCH(req, mockContext);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("returns 404 if the service cannot find/own the task", async () => {
      (auth as jest.Mock).mockResolvedValue({ user: { id: mockUserId } });
      (updateTask as jest.Mock).mockResolvedValue(null);

      const req = new Request(`http://localhost/api/tasks/${mockTaskId}`, {
        method: "PATCH",
        body: JSON.stringify({ title: "New Title" }),
      });

      const response = await PATCH(req, mockContext);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("Task not found");
    });

    it("returns 200 and the task on successful update", async () => {
      (auth as jest.Mock).mockResolvedValue({ user: { id: mockUserId } });
      const updatedMock = { id: mockTaskId, title: "Updated" };
      (updateTask as jest.Mock).mockResolvedValue(updatedMock);

      const req = new Request(`http://localhost/api/tasks/${mockTaskId}`, {
        method: "PATCH",
        body: JSON.stringify({ title: "Updated" }),
      });

      const response = await PATCH(req, mockContext);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(updatedMock);
      expect(updateTask).toHaveBeenCalledWith(mockTaskId, mockUserId, {
        title: "Updated",
      });
    });
  });

  describe("DELETE Handler", () => {
    it("returns 204 on successful deletion", async () => {
      (auth as jest.Mock).mockResolvedValue({ user: { id: mockUserId } });
      (deleteTask as jest.Mock).mockResolvedValue(true);

      const req = new Request(`http://localhost/api/tasks/${mockTaskId}`, {
        method: "DELETE",
      });

      const response = await DELETE(req, mockContext);

      expect(response.status).toBe(204);
      expect(deleteTask).toHaveBeenCalledWith(mockTaskId, mockUserId);
    });

    it("returns 404 if deletion fails (task not found or not owned)", async () => {
      (auth as jest.Mock).mockResolvedValue({ user: { id: mockUserId } });
      (deleteTask as jest.Mock).mockResolvedValue(false);

      const req = new Request(`http://localhost/api/tasks/${mockTaskId}`, {
        method: "DELETE",
      });

      const response = await DELETE(req, mockContext);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("Task not found");
    });
  });
});
