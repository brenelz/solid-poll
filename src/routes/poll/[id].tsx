import { RouteDefinition, RouteSectionProps, createAsync, createAsyncStore, useNavigate, useSubmission } from "@solidjs/router";
import { clientOnly } from "@solidjs/start";
import { Show, createEffect } from "solid-js";
import { createStore } from "solid-js/store";
import { Callout, CalloutTitle } from "~/components/ui/callout";
import { vote } from "~/lib/actions";
import { PollData, getPoll, getUser } from "~/lib/data";

const PollAnswers = clientOnly(() => import('../../components/PollAnswers'));

export const route = {
    load: ({ params }) => {
        void getUser();
        void getPoll(+params.id);
    }
} satisfies RouteDefinition;

export default function Poll(props: RouteSectionProps) {
    const navigate = useNavigate();
    const user = createAsync(() => getUser(), { deferStream: true });
    const pollDataFromServer = createAsyncStore(() => getPoll(+props.params.id), { deferStream: true })
    const voteSubmission = useSubmission(vote);
    const [pollData, setPollData] = createStore(pollDataFromServer()!);

    const updatePollData = (data: PollData) => {
        setPollData(data);
    };

    createEffect(() => {
        setPollData(pollDataFromServer()!);
        if (user() === null) {
            navigate("/", { replace: true });
        }
    });

    return (
        <Show when={user()} fallback="Loading...">
            <Show when={pollData?.poll} fallback={<h2 class="text-xl">No poll found.</h2>}>
                <h2 class="text-xl">{pollData?.poll.question}</h2>
                <hr />
                <PollAnswers pollData={pollData} updatePollData={updatePollData} />
                {voteSubmission.result instanceof Error && (
                    <Callout variant="error">
                        <CalloutTitle>{voteSubmission.result.message}</CalloutTitle>
                    </Callout>
                )}
            </Show>
        </Show >
    );
}
