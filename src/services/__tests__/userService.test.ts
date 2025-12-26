import { syncUserWithCognito, getUserBySub } from "../userService";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

const selectChain = {
  from: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  limit: jest.fn(),
};

const insertChain = {
  values: jest.fn().mockResolvedValue([{ affectedRows: 1 }]),
};

jest.mock("@/db", () => ({
  db: {
    select: jest.fn(() => selectChain),
    insert: jest.fn(() => insertChain),
  },
}));

jest.mock("@/db/schema", () => ({
  users: {
    id: "users_id_col",
    email: "users_email_col",
    cognitoSub: "users_sub_col",
    createdAt: "users_created_col",
    updatedAt: "users_updated_col",
  },
}));

jest.mock("drizzle-orm", () => ({
  eq: jest.fn((col, val) => ({ col, val })),
}));

describe("UserService", () => {
  const mockSub = "aws-cognito-sub-123";
  const mockEmail = "test@example.com";
  const mockUser = {
    id: "internal-uuid",
    email: mockEmail,
    cognitoSub: mockSub,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("syncUserWithCognito", () => {
    it("returns the existing user if they already exist in the DB", async () => {
      (selectChain.limit as jest.Mock).mockResolvedValue([mockUser]);

      const result = await syncUserWithCognito(mockSub, mockEmail);

      expect(db.select).toHaveBeenCalledTimes(1);
      expect(insertChain.values).not.toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it("inserts and returns a new user if they do not exist", async () => {
      (selectChain.limit as jest.Mock)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([mockUser]);

      const result = await syncUserWithCognito(mockSub, mockEmail);

      expect(db.insert).toHaveBeenCalledWith(users);
      expect(insertChain.values).toHaveBeenCalledWith({
        email: mockEmail,
        cognitoSub: mockSub,
      });

      expect(db.select).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockUser);
    });
  });

  describe("getUserBySub", () => {
    it("returns the user when the sub matches", async () => {
      (selectChain.limit as jest.Mock).mockResolvedValue([mockUser]);

      const result = await getUserBySub(mockSub);

      expect(eq).toHaveBeenCalledWith(users.cognitoSub, mockSub);
      expect(result).toEqual(mockUser);
    });

    it("returns null when no user is found", async () => {
      (selectChain.limit as jest.Mock).mockResolvedValue([]);

      const result = await getUserBySub("non-existent");

      expect(result).toBeNull();
    });
  });
});
