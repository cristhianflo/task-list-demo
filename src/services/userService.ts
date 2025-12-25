import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { User } from "@/schemas/user";

export async function syncUserWithCognito(
  cognitoSub: string,
  email: string,
): Promise<User> {
  const existingUser = await db
    .select({
      id: users.id,
      email: users.email,
      cognitoSub: users.cognitoSub,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(eq(users.cognitoSub, cognitoSub))
    .limit(1);

  if (existingUser.length > 0) {
    return existingUser[0];
  }

  await db.insert(users).values({
    email: email,
    cognitoSub: cognitoSub,
  });

  const [newUser] = await db
    .select({
      id: users.id,
      email: users.email,
      cognitoSub: users.cognitoSub,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(eq(users.cognitoSub, cognitoSub))
    .limit(1);

  return newUser;
}

export async function getUserBySub(cognitoSub: string): Promise<User | null> {
  const usersList = await db
    .select({
      id: users.id,
      email: users.email,
      cognitoSub: users.cognitoSub,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(eq(users.cognitoSub, cognitoSub))
    .limit(1);

  return usersList.length > 0 ? usersList[0] : null;
}
