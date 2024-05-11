import { action, redirect } from "@solidjs/router";
import { validateEmail, validatePassword } from "./utils";
import { answersTable, db, pollsTable, usersTable, votesTable } from "./db";
import { getAuthUser, logoutSession, setAuthOnResponse } from "./auth";
import { and, eq } from "drizzle-orm";
import crypto from 'crypto';
import { getPoll } from "./data";

export const vote = action(async (questionId: number, answerId: number) => {
    "use server";
    const userId = await getAuthUser();

    const votesRows = await db.select().from(votesTable).where(
        and(eq(votesTable.userId, userId), eq(votesTable.questionId, questionId)))

    // if (votesRows.length > 0) {
    //     return new Error('Already voted');
    // }

    await db.insert(votesTable).values({
        questionId,
        userId,
        answerId,
    });

    return getPoll(questionId);
}, "vote");

export const loginOrRegister = action(async (formData: FormData) => {
    'use server';

    const email = String(formData.get('email'));
    const password = String(formData.get('password'));
    const action = String(formData.get('action'));

    let error = validateEmail(email) || validatePassword(password);
    if (error) return new Error(error);

    if (action === 'login') {
        return login(email, password);
    } else if (action === 'register') {
        return register(email, password)
    }

}, 'login-or-register');

export const login = async (email: string, password: string) => {
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

    return redirect("/admin/polls");
};

export const register = async (email: string, password: string) => {
    "use server";

    const userRows = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1)
    if (userRows.length > 0) {
        return new Error('User already exists.')
    }

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

    return redirect("/admin/polls");
};


export const addPoll = action(async (formData: FormData) => {
    "use server";

    const userId = await getAuthUser();
    const question = String(formData.get('question'));
    const answers = formData.getAll('answers');

    const poll = await db.insert(pollsTable).values({
        question,
        userId
    });

    answers.forEach(async answer => {
        await db.insert(answersTable).values({
            questionId: Number(poll.lastInsertRowid),
            text: String(answer)
        })
    })

    return redirect('/poll/' + poll.lastInsertRowid);
}, "add-poll");


export const logout = action(async () => {
    "use server";

    await logoutSession();

    return redirect('/');
}, "loggedOut");