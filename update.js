require("dotenv").config();

const gatherAPIBaseUrl = process.env.API_BASE_URL ?? false;
if (!gatherAPIBaseUrl) throw new Error("API_BASE_URL env is required!");

const isForced = process.env.npm_config_force_update ?? false;

const dbFile = require("path").join(__dirname, "db.json");

const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const adapter = new FileSync(dbFile, {
  serialize: (data) => JSON.stringify(data, null, null),
});
const db = low(adapter);

const updateDatabase = require("./updater");

const lastUpdate = new Date(db.get("lastUpdate").value());

const oneDay = 1000 * 60 * 60 * 24;
if (isForced || lastUpdate + oneDay < Date.now()) {
  console.log(`Last update: ${lastUpdate.toUTCString()}`);
  console.log(`Updating...`);
  updateDatabase(gatherAPIBaseUrl).then((data) => {
    db.setState(data).write();
    console.log(`'${adapter.source}' is successfully updated!`);
  });
}
