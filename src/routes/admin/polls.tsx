import { RouteDefinition, createAsync, useNavigate } from "@solidjs/router";
import { For, Show, createEffect } from "solid-js";
import CreatePollForm from "~/components/CreatePollForm";
import { getPolls, getUser } from '~/lib/data';

export const route = {
    load: () => {
        void getUser();
        void getPolls();
    }
} satisfies RouteDefinition

export default function Polls() {
    const navigate = useNavigate();
    const user = createAsync(() => getUser(), { deferStream: true });
    const polls = createAsync(() => getPolls());

    createEffect(() => {
        if (user() === null) {
            navigate("/", { replace: true });
        }
    });

    return (
        <div class="flex gap-6">
            <CreatePollForm />
            <div>
                <h2 class="text-xl">Existing Polls</h2>
                <Show when={polls()?.length} fallback={<div class="text-s">No polls found.</div>}>
                    <ul>
                        <For each={polls()}>
                            {poll => <li><a href={`/poll/${poll.id}`}>{poll.question}</a></li>}
                        </For>
                    </ul>
                </Show>

            </div>
        </div>
    );
}
