import type { ClassValue } from "clsx"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { db, usersTable } from "./db";
import { eq } from "drizzle-orm";
import crypto from 'crypto';
import { setAuthOnResponse } from "./auth";
import { redirect } from "@solidjs/router";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function validateEmail(email: string) {
  if (!email) {
    return "Email is required.";
  } else if (!email.includes("@")) {
    return "Please enter a valid email address.";
  }
}

export function validatePassword(password: string) {
  if (!password) {
    return "Password is required.";
  } else if (password.length < 6) {
    return "Password must be at least 6 characters.";
  }
}

export async function login(email: string, password: string) {
  "use server";
  const userRows = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1)
  if (userRows.length === 0) {
    return null;
  }

  const user = userRows[0];

  const passwordHash = crypto
    .pbkdf2Sync(password, String(user?.passwordSalt), 1000, 64, "sha256")
    .toString("hex");

  if (user?.passwordHash !== passwordHash) {
    return new Error('Invalid login credentails')
  }

  if (!user) return new Error('No user found');

  await setAuthOnResponse(String(user.id));
}

export async function register(email: string, password: string) {
  "use server";
  const passwordSalt = crypto.randomBytes(16).toString("hex");
  const passwordHash = crypto
    .pbkdf2Sync(password, passwordSalt, 1000, 64, "sha256")
    .toString("hex");

  const user = await db.insert(usersTable).values({
    email,
    passwordSalt,
    passwordHash
  })

  await setAuthOnResponse(String(user.lastInsertRowid));
}