import type * as Party from "partykit/server";
import { PollData } from "~/lib/data";

export default class Server implements Party.Server {
  constructor(readonly room: Party.Room) { }

  async onMessage(message: string) {
    const event = JSON.parse(message);

    if (event.type === "vote") {
      const pollData = event.pollData as PollData;
      this.room.broadcast(JSON.stringify(pollData));
    }
  }
}

Server satisfies Party.Worker;