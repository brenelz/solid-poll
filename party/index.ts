import type * as Party from "partykit/server";

export default class Server implements Party.Server {
  constructor(readonly room: Party.Room) { }

  async onMessage(message: string) {
    const event = JSON.parse(message);

    if (event.type === "vote") {
      this.room.broadcast(JSON.stringify(event.pollData));
    }
  }
}

Server satisfies Party.Worker;