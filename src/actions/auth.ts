"use server";

import db from "@/db/index";
import { usersTable } from "@/db/schema";
import { deleteAuthCookie, setAuthCookie } from "@/lib/auth";
import { findUsername, findUserByEmail } from "@/lib/dal";
import * as argon2 from "argon2";
import z from "zod";
import { redirect } from "next/navigation";

const SignUpSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username too long")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores",
    ),
  email: z.email("Invalid email address").trim().toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain one uppercase letter")
    .regex(/[a-z]/, "Must contain one lowercase letter")
    .regex(/[0-9]/, "Must contain one number"),
});

const SignInSchema = z.object({
  email: z.email("Invalid email address").trim().toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain one uppercase letter")
    .regex(/[a-z]/, "Must contain one lowercase letter")
    .regex(/[0-9]/, "Must contain one number"),
});

export type SignUpData = z.infer<typeof SignUpSchema>;
export type SignInData = z.infer<typeof SignInSchema>;

export type ActionResponse =
  | { success: true; message: string }
  | { success: false; message: string; errors?: Record<string, string[]> };

export async function signInAction(
  formData: SignInData,
): Promise<ActionResponse> {
  const validation = SignInSchema.safeParse(formData);

  if (!validation.success) {
    return {
      success: false,
      message: "Validation failed",
      errors: z.flattenError(validation.error).fieldErrors,
    };
  }

  const { email, password } = validation.data;

  const user = await findUserByEmail(email);
  if (!user) {
    return {
      success: false,
      message: "Invalid email or password",
      errors: { email: ["Invalid email or password"] },
    };
  }

  const isPassword = await argon2.verify(user.passwordHash, password);
  if (!isPassword) {
    return {
      success: false,
      message: "Invalid email or password",
      errors: { email: ["Invalid email or password"] },
    };
  }

  // success path: set cookie then redirect (no return)
  await setAuthCookie(user.id);
  redirect("/dashboard");
}

export async function signUpAction(
  formData: SignUpData,
): Promise<ActionResponse> {
  const validation = SignUpSchema.safeParse(formData);

  if (!validation.success) {
    // Return the specific error messages to the UI
    return {
      success: false,
      message: "Validation failed",
      errors: z.flattenError(validation.error).fieldErrors,
    };
  }

  // If valid, proceed with data from 'validation.data'
  const { firstName, lastName, username, email, password } = validation.data;
  const passwordHash = await argon2.hash(password);

  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    return {
      success: false,
      message: "User with this email already exists",
      errors: { email: ["User with this email already exists"] },
    };
  }

  const existingUsername = await findUsername(username);
  if (existingUsername) {
    return {
      success: false,
      message: "User with this username already exists",
      errors: { email: ["User with this username already exists"] },
    };
  }

  const createUser = await db
    .insert(usersTable)
    .values({
      firstName,
      lastName,
      username,
      email,
      passwordHash,
    })
    .returning({ id: usersTable.id });

  const user = createUser[0]?.id;

  if (!user) {
    return {
      success: false,
      message: "Failed to create user",
      errors: { _form: ["Failed to create user"] },
    };
  }

  await setAuthCookie(user);
  redirect("/dashboard");
}

export async function signOut() {
  await deleteAuthCookie();
  redirect("/signin");
}
