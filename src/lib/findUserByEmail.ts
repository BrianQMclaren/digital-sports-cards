import db from "@/db";
import { usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function findUserByEmail(email: string) {
  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.email, email.toLowerCase()),
  });
  return user;
}
