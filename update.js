const fs = require("fs");
const path = require("path");

const dbFile = path.join(__dirname, "db.json");
const dbStats = fs.statSync(dbFile);

const daysSinceLastUpdate = (Date.now() - dbStats.mtime) / 1000 / 60 / 60 / 24;
if (daysSinceLastUpdate < 1) process.exit(0);

if (!process.env.API_BASE_URL) throw new Error("API_BASE_URL env is required!");

const weaponsAPI = process.env.API_BASE_URL + "weapons";
const gathersAPI = process.env.API_BASE_URL + "gathers/per_day";

const fetch = require("node-fetch");

const fetchAPI = async (url) => {
  try {
    const res = await fetch(url);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(err);
  }
};

fetchAPI(weaponsAPI).then((weapons) => {
  console.log("Rounds:", weapons.length);
  fetchAPI(gathersAPI).then((gathersPerDay) => {
    console.log("Gathers per day:", gathersPerDay.length);

    let i = 0;

    const rounds = [];
    const games = gathersPerDay.reduce((acc, gather) => {
      gather.games?.forEach((game) => {
        game.id = game._id;
        delete game._id;
        game.rounds.forEach((round) => {
          round.gameId = game.id;
          if (round.startTime === weapons[i].startTime) {
            const weaponKills = weapons[i].weapons;
            round.id = i;
            round.killsByWeapon = {};
            Object.keys(weaponKills).forEach((k) => {
              round.killsByWeapon[k] = weaponKills[k].kills;
            });
          } else {
            console.error("Rounds startTime mismatch!");
          }
          rounds.push(round);
          i++;
        });
        delete game.rounds;
        acc.push(game);
      });
      return acc;
    }, []);

    const db = {
      games,
      rounds,
    };

    fs.writeFileSync(dbFile, JSON.stringify(db), "utf8");
  });
});
