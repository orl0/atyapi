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

module.exports = async function (baseUrl) {
  const weaponsAPI = baseUrl + "weapons";
  const gathersAPI = baseUrl + "gathers/per_day";

  return await fetchAPI(weaponsAPI).then((weapons) => {
    // console.log("Rounds:", weapons.length);
    return fetchAPI(gathersAPI).then((gathersPerDay) => {
      // console.log("Gathers per day:", gathersPerDay.length);

      let roundID = 0;
      // let gameID = 0;

      const rounds = [];
      const games = gathersPerDay.reduce((acc, gather) => {
        gather.games?.forEach((game) => {
          game.id = game._id;
          delete game._id;
          game.rounds?.forEach((round) => {
            const roundSorted = {};
            if (round.startTime === weapons[roundID].startTime) {
              const weaponKills = weapons[roundID].weapons;
              roundSorted.id = roundID;
              Object.keys(round).forEach((k) => (roundSorted[k] = round[k]));
              roundSorted.gameId = game.id;
              roundSorted.killsByWeapon = {};
              Object.keys(weaponKills).forEach((k) => {
                roundSorted.killsByWeapon[k] = weaponKills[k].kills;
              });
            } else {
              console.error("Rounds startTime mismatch!");
            }
            rounds.push(roundSorted);
            roundID++;
          });
          delete game.rounds;
          acc.push(game);
        });
        return acc;
      }, []);
      return { lastUpdate: Date.now(), rounds, games };
    });
  });
};
