require("dotenv").config();
const { Server } = require("socket.io");
const express = require("express");
const app = express();
const port = process.env.PORT;
const all_routes = require("./src/routes");
const bodyparser = require("body-parser");
const http = require("http");
const server = http.createServer(app);
const chatSocket = require("./src/sockets/chatSocket");
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());
require("./src/config/database");

app.get("/", (req, res) => {
  res.send("Hello, Express");
});

app.use("/", all_routes);
chatSocket(io);
server.listen(port, () => {
  console.log(`Server is Running at http://localhost:${port}`);
});
