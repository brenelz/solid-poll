import { useAction } from "@solidjs/router";
import { Progress } from "~/components/ui/progress";
import { vote } from "~/lib/actions";

export default function PollAnswer(props: any) {
    const voteAction = useAction(vote);

    return (
        <Progress value={props.answer.votes / props.pollData!?.totalVotes * 100}>
            <div class="flex justify-between py-2">
                <button class="flex-1 text-left" onClick={async () => {
                    const answerId = await voteAction(props.answer.questionId, props.answer.id);

                    props.ws.send(JSON.stringify({ type: "vote", pollData: props.pollData, answerId }));
                }}>
                    {props.answer.text}
                </button>
                <span>({props.answer.votes} of {props.pollData?.totalVotes} votes)</span>
            </div>
        </Progress>
    );
}
