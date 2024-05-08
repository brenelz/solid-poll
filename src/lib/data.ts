import { cache } from "@solidjs/router";
import { answersTable, db, pollsTable, votesTable } from "./db";
import { getAuthUser } from "./auth";
import { eq } from "drizzle-orm";

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

export const getPolls = cache(async () => {
    "use server";

    const userId = await getAuthUser();

    const pollRows = await db.select().from(pollsTable).where(eq(pollsTable.userId, userId));

    return pollRows;
}, "get-polls");

export const getUser = cache(async () => {
    "use server";

    const userId = await getAuthUser();

    return userId;
}, "get-user");