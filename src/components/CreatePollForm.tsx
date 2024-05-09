import { useAction } from "@solidjs/router";
import { For, createSignal } from "solid-js";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { addPoll, logout } from "~/lib/actions";

export default function CreatePollForm() {
    const [numAnswers, setNumAnswers] = createSignal(2);
    const logoutAction = useAction(logout);

    return (
        <form action={addPoll} method="post" class="grid w-full max-w-sm items-center gap-3 mx-auto">
            <h2 class="text-xl">New Poll</h2>
            <Input required type="text" id="question" name="question" placeholder="Question" />
            <hr />
            <For each={[...Array(numAnswers())]}>
                {(_, i) => <Input required type="text" name="answers" placeholder={`Answer ${i() + 1}`} />}
            </For>
            <div class="flex mx-auto gap-2">
                <Button variant="secondary" onClick={() => setNumAnswers(numAnswers() - 1)}>-</Button>
                <Button variant="secondary" onClick={() => setNumAnswers(numAnswers() + 1)}>+</Button>
            </div>
            <div class="flex mx-auto gap-3">
                <Button type="submit">Create Poll</Button>
            </div>
            <div class="flex mx-auto gap-3">
                <Button variant="ghost" onClick={() => logoutAction()}>Logout</Button>
            </div>
        </form>

    );
}
