"use server";

import db from "@/db/index";
import { usersTable } from "@/db/schema";
import findUserByEmail from "@/lib/findUserByEmail";
import * as argon2 from "argon2";
import { eq } from "drizzle-orm";
import z from "zod";

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
  try {
    const validation = SignInSchema.safeParse(formData);

    if (!validation.success) {
      // Return the specific error messages to the UI
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
        errors: {
          email: ["Invalid email or password"],
        },
      };
    }

    const isPassword = await argon2.verify(user.passwordHash, password);

    if (!isPassword) {
      return {
        success: false,
        message: "Invalid email or password",
        errors: {
          email: ["Invalid email or password"],
        },
      };
    }

    return {
      success: true,
      message: "Signed in successfully",
    };
  } catch (error) {
    console.error("Error getting user by email:", error);
    return {
      success: false,
      message: "An error occurred while signing in",
      errors: { _form: ["Failed to sign in"] },
    };
  }
}

export async function signUpAction(
  formData: SignUpData,
): Promise<ActionResponse> {
  try {
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

    await db.insert(usersTable).values({
      firstName,
      lastName,
      username,
      email,
      passwordHash,
    });
    return { success: true, message: "Welcome to the league!" };
  } catch (error) {
    console.error("Sign up error:", error);
    return {
      success: false,
      message: "Could not create account. Try a different username or email",
      errors: { _form: ["Failed to sign up"] },
    };
  }
}
