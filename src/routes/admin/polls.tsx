import { createAsync, useAction, useNavigate } from "@solidjs/router";
import { For, createEffect, createSignal } from "solid-js";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { addPoll, getUser, logout } from "~/lib/api";

export default function Polls() {
    const navigate = useNavigate();
    const user = createAsync(() => getUser(), { deferStream: true });
    const [numAnswers, setNumAnswers] = createSignal(2);
    const logoutAction = useAction(logout);

    createEffect(() => {
        if (user() === null) {
            navigate("/", { replace: true });
        }
    });

    return (
        <div>
            <form action={addPoll} method="post" class="grid w-full max-w-sm items-center gap-3 mx-auto">
                <h2 class="text-xl">Question</h2>
                <Input required type="text" id="question" name="question" />
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
        </div>
    );
}
