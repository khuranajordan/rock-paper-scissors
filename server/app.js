const fs = require("fs");
const express = require("express");
const app = express();
const port = process.env.PORT || 3030;
const server = app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

const io = require("socket.io")(server, {
  cors: { origin: "*" },
});
let picks = [];

let leaderboard = {};

try {
  const data = fs.readFileSync("db.txt", "utf8");
  leaderboard = JSON.parse(data);
} catch (err) {
  console.error("Error reading leaderboard file:", err);
}
const updateLeaderboard = (winner) => {
  if (leaderboard[winner]) {
    leaderboard[winner]++;
    if (leaderboard[winner] % 3 === 0) {
      fs.appendFileSync("db.txt", `${winner} wins ${leaderboard[winner]} games\n`);
      console.log(`${winner} wins ${leaderboard[winner]} games and is added to the leaderboard.`);
    }
  } else {
    leaderboard[winner] = 1;
  }
};

const saveLeaderboardToFile = () => {
  fs.writeFileSync("db.txt", JSON.stringify(leaderboard));
};

io.on("connection", (socket) => {
  console.log("player connected");

  socket.on("picked", (data) => {
    picks.push({
      name: data.player,
      picked: data.picked,
    });

    if (picks.length <= 1) {
    } else {
      let [playerOne, playerTwo] = picks;
      let win = "";
      let message = "";

      if (playerOne.picked === "rock") {
        if (playerOne.picked === "rock" && playerTwo.picked === "scissors") {
          message = `Player ${playerOne.name} Win!`;
          win = playerOne.name;
        } else if (playerOne.picked === playerTwo.picked) {
          message = `Draw!`;
        } else {
          message = `Player ${playerTwo.name} Win!`;
          win = playerTwo.name;
        }
      } else if (playerOne.picked === "scissors") {
        if (playerOne.picked === "scissors" && playerTwo.picked === "paper") {
          message = `Player ${playerOne.name} Win!`;
          win = playerOne.name;
        } else if (playerOne.picked === playerTwo.picked) {
          message = `Draw!`;
        } else {
          message = `Player ${playerTwo.name} Win!`;
          win = playerTwo.name;
        }
      } else if (playerOne.picked === "paper") {
        if (playerOne.picked === "paper" && playerTwo.picked === "rock") {
          message = `Player ${playerOne.name} Win!`;
          win = playerOne.name;
        } else if (playerOne.picked === playerTwo.picked) {
          message = `Draw!`;
        } else {
          message = `Player ${playerTwo.name} Win!`;
          win = playerTwo.name;
        }
      }

      let result = {
        message,
        picks,
        winner: win.toUpperCase(),
      };

      io.emit("result", result);
      updateLeaderboard(win);
      picks = [];
    }
  });

  socket.on("disconnect", () => {
    console.log("player disconnected");
    picks = [];
  });
});

process.on("exit", () => {
  saveLeaderboardToFile();
});

process.on("SIGINT", () => {
  saveLeaderboardToFile();
  process.exit();
});
