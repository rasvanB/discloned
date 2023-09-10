import express from "express";
import { Server } from "socket.io";
import * as http from "http";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.post("/", (req, res) => {
  res.send("Hello World!");
});

io.on("connection", () => {
  console.log("a user connected");
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
