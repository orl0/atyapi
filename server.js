require("dotenv").config();

const gatherAPIBaseUrl = process.env.API_BASE_URL;
if (!gatherAPIBaseUrl) throw new Error("API_BASE_URL env is required!");

const dbFile = require("path").join(__dirname, "db.json");

const updateDatabase = require("./updater");

const low = require("lowdb");
const FileAsync = require("lowdb/adapters/FileAsync");
class myFileAsync extends FileAsync {
  constructor(...args) {
    super(...args);
  }
  read() {
    console.log("FileAsync read called");
    return super.read();
  }
  write(data) {
    console.log("FileAsync write called");
    return super.write(data);
  }
}
const adapter = new myFileAsync(dbFile, {
  serialize: (data) => JSON.stringify(data, null, 2), // 2 spaces for debug
});
const dbPromise = low(adapter);

dbPromise.then((db) => {
  const lastUpdate = new Date(db.get("lastUpdate").defaultTo(0).value());
  console.log(`Last update time: ${lastUpdate}`);

  // const oneDay = 1000 * 60 * 60 * 24;
  const oneDay = 1000 * 60; // 1 min for debug

  if (Date.now() > +lastUpdate + oneDay) {
    console.log(`Updating...`);
    updateDatabase(gatherAPIBaseUrl).then((data) => {
      db.setState(data).write();
      console.log(`'${adapter.source}' is successfully updated!`);
    });
  } else {
    console.log(`Update is not required...`);
    // startJSONServer(db);
  }
});

function startJSONServer(db) {
  const jsonServer = require("json-server");
  const server = jsonServer.create();
  const router = jsonServer.router(db);
  const middlewares = jsonServer.defaults({ readOnly: true });

  server.use(middlewares);

  server.use((req, res, next) => {
    res.header("Last-Modified", lastUpdate.toUTCString());

    if (Date.now() > +lastUpdate + oneDay) console.log(`Update is needed!`);

    next();
  });

  server.use("/api/v2", router);

  server.listen(9000, () => {
    console.log("JSON Server is running");
  });
}
