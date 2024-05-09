import { RouteDefinition, RouteSectionProps, createAsync, createAsyncStore, useAction, useNavigate, useSubmission } from "@solidjs/router";
import PartySocket from "partysocket";
import { For, Show, createEffect } from "solid-js";
import { createStore } from "solid-js/store";
import PollAnswer from "~/components/PollAnswer";
import { Callout, CalloutTitle } from "~/components/ui/callout";
import { vote } from "~/lib/actions";
import { getPoll, getUser } from "~/lib/data";

export const route = {
    load: ({ params }) => {
        void getUser();
        void getPoll(+params.id);
    }
} satisfies RouteDefinition

export default function Poll(props: RouteSectionProps) {
    const navigate = useNavigate();
    const user = createAsync(() => getUser(), { deferStream: true });
    const pollDataFromServer = createAsyncStore(() => getPoll(+props.params.id), { deferStream: true })
    const voteSubmission = useSubmission(vote);
    const [pollData, setPollData] = createStore(pollDataFromServer);

    const ws = new PartySocket({
        // host: "localhost:1999",
        host: 'solid-poll-party.brenelz.partykit.dev',
        room: "poll-" + pollData()?.poll?.id,
    });

    ws.addEventListener('message', (event) => {
        const message = JSON.parse(event.data);
        setPollData(message);
    })

    createEffect(() => {
        if (user() === null) {
            navigate("/", { replace: true });
        }
    });

    return (
        <Show when={user()} fallback="Loading...">
            <Show when={pollData()?.poll} fallback={<h2 class="text-xl">No poll found.</h2>}>
                <h2 class="text-xl">{pollData()?.poll.question}</h2>
                <hr />
                <For each={pollData()?.answers}>
                    {answer => <PollAnswer answer={answer} pollData={pollData()} ws={ws} />}
                </For>
                {voteSubmission.result instanceof Error && (
                    <Callout variant="error">
                        <CalloutTitle>{voteSubmission.result.message}</CalloutTitle>
                    </Callout>
                )}
            </Show>
        </Show >
    );
}
