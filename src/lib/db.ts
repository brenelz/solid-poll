import { drizzle } from 'drizzle-orm/libsql';
import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";
import { createClient } from '@libsql/client';

const client = createClient({
    url: process.env.TURSO_CONNECTION_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
});

export const db = drizzle(client);

export const usersTable = sqliteTable('users', {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    email: text('email').notNull(),
    passwordSalt: text('passwordSalt').notNull(),
    passwordHash: text('passwordHash').notNull(),
});

export const pollsTable = sqliteTable('polls', {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    userId: integer('userId').notNull().references(() => usersTable.id),
    question: text('question').notNull(),
});

export const answersTable = sqliteTable('answers', {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    questionId: integer('questionId').notNull().references(() => pollsTable.id),
    text: text('text').notNull(),
});

export const votesTable = sqliteTable('votes', {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    userId: integer('userId').notNull().references(() => usersTable.id),
    questionId: integer('questionId').notNull().references(() => pollsTable.id),
    answerId: integer('answerId').notNull().references(() => answersTable.id),
});