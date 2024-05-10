import { useAction } from "@solidjs/router";
import PartySocket from "partysocket";
import { createEffect } from "solid-js";
import { Progress } from "~/components/ui/progress";
import { vote } from "~/lib/actions";
import { PollData } from "~/lib/data";

type PollAnswerProps = {
    pollData: PollData;
    answer: PollData['answers'][number];
    ws: PartySocket | null;
}

export default function PollAnswer(props: PollAnswerProps) {
    const voteAction = useAction(vote);

    return (
        <Progress value={props.answer.votes / props.pollData!?.totalVotes * 100}>
            <div class="flex justify-between py-2">
                <button class="flex-1 text-left" onClick={async () => {
                    const answerId = await voteAction(props.answer.questionId, props.answer.id);
                    await new Promise(r => setTimeout(r, 1000)); // waiting for props.pollData to update
                    props.ws?.send(JSON.stringify({ type: "vote", pollData: props.pollData, answerId }));
                }}>
                    {props.answer.text}
                </button>
                <span>({props.answer.votes} of {props.pollData?.totalVotes} votes)</span>
            </div>
        </Progress>
    );
}
