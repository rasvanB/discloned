import * as Party from "partykit/server";

export default class WebSocketServer implements Party.Server {
  constructor(readonly party: Party.Party) {}
  // when a client sends a message
  onMessage(message: string, sender: Party.Connection) {
    // send it to everyone else
    this.party.broadcast(message, [sender.id]);
  }
  // when a new client connects
  onConnect(connection: Party.Connection) {
    // welcome the new joiner
    connection.send(`Welcome, ${connection.id}`);
    // let everyone else know that a new connection joined
    this.party.broadcast(`Heads up! ${connection.id} joined the party!`);
  }
  // when a client disconnects
  onClose(connection: Party.Connection) {
    this.party.broadcast(`So sad! ${connection.id} left the party!`);
  }
}
