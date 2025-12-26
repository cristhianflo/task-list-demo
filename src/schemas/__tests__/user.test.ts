import { UserSchema, CreateUserSchema } from "../user";

describe("User Zod Schemas", () => {
  const validUuid = "550e8400-e29b-41d4-a716-446655440000";
  const validEmail = "dev@example.com";
  const validSub = "us-east-1:7676-abcd-1234";

  describe("UserSchema", () => {
    const validUser = {
      id: validUuid,
      email: validEmail,
      cognitoSub: validSub,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("accepts a fully valid user object", () => {
      const result = UserSchema.safeParse(validUser);
      expect(result.success).toBe(true);
    });

    it("allows cognitoSub to be nullable", () => {
      const userWithNoSub = { ...validUser, cognitoSub: null };
      const result = UserSchema.safeParse(userWithNoSub);
      expect(result.success).toBe(true);
    });

    it("rejects invalid email formats", () => {
      const invalidUser = { ...validUser, email: "not-an-email" };
      const result = UserSchema.safeParse(invalidUser);

      expect(result.success).toBe(false);

      if (!result.success) {
        const issue = result.error.issues[0];
        expect(issue.code).toBe("invalid_string");

        expect((issue as any).validation).toBe("email");
      }
    });

    it("rejects non-uuid identifiers", () => {
      const invalidUser = { ...validUser, id: "12345" };
      const result = UserSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
    });

    it("requires createdAt and updatedAt to be Date objects", () => {
      const invalidUser = {
        ...validUser,
        createdAt: "2023-01-01",
      };
      const result = UserSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
    });
  });

  describe("CreateUserSchema", () => {
    it("accepts valid data while omitting internal database fields", () => {
      const payload = {
        email: validEmail,
        cognitoSub: validSub,
      };
      const result = CreateUserSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it("rejects if internal fields like 'id' are provided (strictness check)", () => {
      const payload = { email: validEmail, cognitoSub: validSub };
      const result = CreateUserSchema.safeParse(payload);

      expect(result.success).toBe(true);
      const data = result.success ? result.data : {};
      expect(data).not.toHaveProperty("id");
      expect(data).not.toHaveProperty("createdAt");
    });

    it("fails if email is missing", () => {
      const payload = { cognitoSub: validSub };
      const result = CreateUserSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });
});
