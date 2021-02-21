const path = require("path");
const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, "db.json"));
const middlewares = jsonServer.defaults({ readOnly: true });

server.use(middlewares);

server.use("/api/v2", router);
server.listen(9000, () => {
  console.log("JSON Server is running");
});
