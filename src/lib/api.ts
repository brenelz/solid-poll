import { action, cache, redirect } from "@solidjs/router";
import { login, register, validateEmail, validatePassword } from "./utils";
import { answersTable, db, pollsTable, votesTable } from "./db";
import { getAuthUser, logoutSession } from "./auth";
import { and, eq } from "drizzle-orm";

export const getPoll = cache(async (id: number) => {
    'use server';

    const pollRows = await db.select().from(pollsTable).where(eq(pollsTable.id, id)).limit(1);
    const answersRows = await db.select().from(answersTable).where(eq(answersTable.questionId, pollRows[0].id));
    let totalVotes = 0;
    const answersWithVotes = await Promise.all(answersRows.map(async answerRow => {
        const votesRows = await db.select().from(votesTable).where(eq(votesTable.answerId, answerRow.id));
        totalVotes += votesRows.length;
        return {
            ...answerRow,
            votes: votesRows.length
        }
    }));

    return {
        poll: pollRows[0],
        answers: answersWithVotes,
        totalVotes
    }
}, 'get-poll');

export const getUser = cache(async () => {
    "use server";

    const userId = await getAuthUser();

    return userId;
}, "get-user");


export const vote = action(async (questionId: number, answerId: number) => {
    "use server";
    const userId = await getAuthUser();

    const votesRows = await db.select().from(votesTable).where(
        and(eq(votesTable.userId, userId), eq(votesTable.questionId, questionId)))

    if (votesRows.length > 0) {
        return new Error('Already voted');
    }

    await db.insert(votesTable).values({
        questionId,
        userId,
        answerId,
    });
}, "vote");

export const loginOrRegister = action(async (formData: FormData) => {
    'use server';

    const email = String(formData.get('email'));
    const password = String(formData.get('password'));
    const action = String(formData.get('action'));

    let error = validateEmail(email) || validatePassword(password);
    if (error) return new Error(error);

    if (action === 'login') {
        await login(email, password);
    } else if (action === 'register') {
        await register(email, password)
    }


    return redirect("/admin/polls");

}, 'login-or-register');


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

