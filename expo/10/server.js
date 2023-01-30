const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

let users = [];

const broadcastNewMessage = (msg) =>
  users.forEach((u) => u.res.write(`data: ${JSON.stringify(msg)}\n\n`));

const chatHistory = [];
const newMessage = (sender, message) => {
  const msg = { sender, time: Date.now(), message };
  console.log(msg);
  broadcastNewMessage(msg);
  chatHistory.push(msg);
};

app.get("/subscribe", function (req, res) {
  const name = req.query.name;
  const id = Date.now();

  if (!name || name in users.map((u) => u.name)) {
    res.status(400).send();
    return;
  }

  users.push({ id, res, name });

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  req.on("close", () => {
    users = users.filter((u) => u.id !== id);
    newMessage("SERVER", `User ${name} disconnected`);
  });

  res.write(`data: ${JSON.stringify({ id, name, chatHistory })}\n\n`);

  newMessage("SERVER", `User ${name} connected`);
});

app.post("/message", function (req, res) {
  const id = req.body.id;
  const msg = req.body.msg;
  if (typeof msg !== "string" || !users.map((u) => u.id).includes(id)) {
    res.status(400).send();
    return;
  }

  newMessage(users.filter((u) => u.id === id)[0].name, msg);
  res.send("OK");
});

app.listen(3000, () => console.log("SSE app listening on port 3000!"));
