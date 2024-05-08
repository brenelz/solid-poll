import { Navigate, RouteSectionProps, createAsync, useAction, useNavigate, useSubmission } from "@solidjs/router";
import { For, Show, createEffect } from "solid-js";
import { Callout, CalloutTitle } from "~/components/ui/callout";
import { getPoll, getUser, vote } from "~/lib/api";

export default function Poll({ params }: RouteSectionProps) {
    const navigate = useNavigate();
    const user = createAsync(() => getUser(), { deferStream: true });
    const pollData = createAsync(() => getPoll(+params.id))
    const voteAction = useAction(vote);
    const voteSubmission = useSubmission(vote);

    createEffect(() => {
        if (user() === null) {
            navigate("/", { replace: true });
        }
    });

    return (
        <Show when={pollData()?.poll} fallback={<h2 class="text-xl">No poll found.</h2>}>
            <h2 class="text-xl">{pollData()?.poll.question}</h2>
            <hr />
            <For each={pollData()?.answers}>
                {(answer) => (
                    <button class="text-left" onClick={() => voteAction(answer.questionId, answer.id)}>
                        {answer.text} <i>({answer.votes})</i>
                    </button>
                )}
            </For>
            {voteSubmission.result && (
                <Callout variant="error">
                    <CalloutTitle>{voteSubmission.result.message}</CalloutTitle>
                </Callout>
            )}
        </Show>
    );
}
