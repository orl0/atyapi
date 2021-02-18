const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");

const fetchAPI = async (url) => {
  try {
    const res = await fetch(url);
    const data = await res.json();
    return data;
  } catch (err) {
    console.log("Error");
    console.error(err);
    console.dir(err);
    throw new Error("Fetch Failed!");
  }
};

const urls = ["weapons", "gathers/per_day"].map((a) => process.env.API_BASE_URL + a);

fetchAPI(urls[0]).then((weapons) => {
  console.log("Rounds:", weapons.length);
  fetchAPI(urls[1]).then((gathersPerDay) => {
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

    fs.writeFileSync(path.join(__dirname, "db.json"), JSON.stringify(db), "utf8");
  });
});
