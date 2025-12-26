import { NextResponse } from "next/server";

jest.mock("next-auth", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    handlers: {},
    signIn: jest.fn(),
    signOut: jest.fn(),
    auth: jest.fn(),
  })),
}));

jest.mock("next-auth/providers/cognito", () => ({
  __esModule: true,
  default: jest.fn(() => ({})),
}));

jest.mock("@/services/userService", () => ({
  syncUserWithCognito: jest.fn(),
  getUserBySub: jest.fn(),
}));

import { authConfig } from "@/auth";
import { syncUserWithCognito, getUserBySub } from "@/services/userService";

describe("Auth Configuration Callbacks", () => {
  const mockSub = "cognito-sub-123";
  const mockEmail = "test@example.com";

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("signIn callback", () => {
    it("returns true and syncs user when profile has sub", async () => {
      (syncUserWithCognito as jest.Mock).mockResolvedValue({ id: "user-1" });

      const result = await authConfig.callbacks!.signIn!({
        user: { email: mockEmail },
        account: { provider: "cognito" } as any,
        profile: { sub: mockSub } as any,
      });

      expect(syncUserWithCognito).toHaveBeenCalledWith(mockSub, mockEmail);
      expect(result).toBe(true);
    });

    it("returns false if profile.sub is missing", async () => {
      const result = await authConfig.callbacks!.signIn!({
        user: { email: mockEmail },
        account: { provider: "cognito" } as any,
        profile: {} as any,
      });

      expect(result).toBe(false);
      expect(syncUserWithCognito).not.toHaveBeenCalled();
    });
  });

  describe("session callback", () => {
    it("attaches internal database id to the session", async () => {
      const mockDbUser = { id: "db-uuid-789" };
      (getUserBySub as jest.Mock).mockResolvedValue(mockDbUser);

      const mockSession = { user: { email: mockEmail } };
      const mockToken = { sub: mockSub };

      const result = await authConfig.callbacks!.session!({
        session: mockSession as any,
        token: mockToken as any,
        user: {} as any,
        newSession: {} as any,
        trigger: "update",
      });

      // @ts-ignore
      expect(result.user.id).toBe("db-uuid-789");
    });
  });

  describe("authorized callback", () => {
    const mockUrl = "http://localhost:3000";

    it("redirects unauthenticated users to login when hitting /tasks", async () => {
      const mockRequest = {
        url: mockUrl,
        nextUrl: { pathname: "/tasks" },
      };

      const result = await authConfig.callbacks!.authorized!({
        auth: null,
        request: mockRequest as any,
      });

      expect(result).toBeInstanceOf(NextResponse);
      // @ts-ignore
      expect(result.headers.get("location")).toBe(`${mockUrl}/`);
    });

    it("redirects authenticated users to /tasks when hitting login page", async () => {
      const mockRequest = {
        url: mockUrl,
        nextUrl: { pathname: "/" },
      };

      const result = await authConfig.callbacks!.authorized!({
        auth: { user: { id: "1" } } as any,
        request: mockRequest as any,
      });

      expect(result).toBeInstanceOf(NextResponse);
      // @ts-ignore
      expect(result.headers.get("location")).toBe(`${mockUrl}/tasks`);
    });
  });
});
