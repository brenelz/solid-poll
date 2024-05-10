import { For, createMemo } from "solid-js";
import PollAnswer from "./PollAnswer";
import PartySocket from "partysocket";

export default function PollAnswers(props: any) {
    const ws = createMemo((prev) => {
        if (prev) return prev;
        if (!props.pollData?.poll?.id) return null;

        const partySocket = new PartySocket({
            // host: "localhost:1999",
            host: 'solid-poll-party.brenelz.partykit.dev',
            room: "poll-" + props.pollData?.poll?.id,
        });

        partySocket?.addEventListener('message', async (event) => {
            const message = JSON.parse(event.data);
            props.updatePollData(message);
        });

        return partySocket;
    });

    return (
        <For each={props.pollData.answers}>
            {answer => <PollAnswer answer={answer} pollData={props.pollData} ws={ws()} />}
        </For>
    )
}