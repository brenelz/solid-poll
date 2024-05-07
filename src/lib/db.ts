import { drizzle } from 'drizzle-orm/better-sqlite3';
import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";
import Database from 'better-sqlite3';
import crypto from 'crypto';
import { and, eq } from 'drizzle-orm';

const sqlite = new Database('./db/sqlite.db');
export const db = drizzle(sqlite);

export const users = sqliteTable('users', {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    email: text('email').notNull(),
    passwordSalt: text('passwordSalt').notNull(),
    passwordHash: text('passwordHash').notNull(),
});

export async function getUser(email: string) {
    const userRows = await db.select().from(users).where(eq(users.email, email)).limit(1)
    if (userRows.length === 0) {
        return null;
    }
    return userRows[0];
}

export async function addUser(email: string, password: string) {
    const passwordSalt = crypto.randomBytes(16).toString("hex");
    const passwordHash = crypto
        .pbkdf2Sync(password, passwordSalt, 1000, 64, "sha256")
        .toString("hex");

    await db.insert(users).values({
        email,
        passwordSalt,
        passwordHash
    })

    return getUser(email);
}