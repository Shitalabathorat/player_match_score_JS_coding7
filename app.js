const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();

app.use(express.json());

const dbPath = path.join(__dirname, "cricketMatchDetails.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// 1st GET API
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
  };
};
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
 SELECT
 *
 FROM
 player_details;`;
  const playersArray = await db.all(getPlayersQuery);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

//API 2nd
const convertResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
  };
};

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT * 
    FROM player_details
    WHERE player_id=${playerId};`;
  let player = await db.get(getPlayerQuery);
  response.send(convertResponseObject(player));
});
//3rd APP PUT
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playersDetails = request.body;
  const { playerName } = playersDetails;
  const updatedPlayersQuery = `
    UPDATE 
    player_details
    SET
    player_name ='${playerName}' 
    WHERE 
        player_id=${playerId};`;
  await db.run(updatedPlayersQuery);
  response.send("Player Details Updated");
});

//5th API
const convertMatchDetailsDbObjectToResponseObject = (dbObject) => {
  return {
    matchId: dbObject.match_id,
    match: dbObject.match,
    year: dbObject.year,
  };
};

app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerMatchesQuery = `
 SELECT
 *
 FROM
 player_match_score
 NATURAL JOIN match_details
 WHERE 
    player_id=${playerId};`;
  const playersMatches = await db.all(getPlayerMatchesQuery);
  response.send(
    playersMatches.map((eachMatch) =>
      convertMatchDetailsDbObjectToResponseObject(eachMatch)
    )
  );
});

//API 6th In Incorrect

app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const getMatchPlayersQuery = `
	    SELECT
	      player_details.player_id AS playerId,
	      player_details.player_name AS playerName
	    FROM player_match_score NATURAL JOIN player_details
        WHERE match_id=${matchId};`;

  let player = await db.all(getMatchPlayersQuery);
  response.send(player);
});

//API 4 It is wrong
////const convertMatchResponseObject = (dbObject) => {
// return {
//matchId: dbObject.match - id,
//match: dbObject.match,
// year: dbObject.year,
//};
//};

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getMatchQuery = `
    SELECT *
    FROM match_details
    WHERE match_id=${matchId};`;
  let match = await db.get(getMatchQuery);
  //response.send(convertMatchResponseObject(match));
  response.send({
    matchId: dbObject.match_id,
    match: dbObject.match,
    year: dbObject.year,
  });
});

//7th API

app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerScored = `
SELECT
player_details.player_id AS playerId,
player_details.player_name AS playerName,
SUM(player_match_score.score) AS totalScore,
SUM(fours) AS totalFours,
SUM(sixes) AS totalSixes FROM
player_details INNER JOIN player_match_score ON
player_details.player_id = player_match_score.player_id
WHERE player_details.player_id = ${playerId};
`;
  const playerScore = await db.get(getPlayerScored);
  response.send(playerScore);
});

module.exports = app;
