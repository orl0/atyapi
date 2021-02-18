const path = require("path");
const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, "db.json"));
const middlewares = jsonServer.defaults();

server.use(middlewares);

// server.get("/api/v2", (req, res) => {
//   res.jsonp(req.query);
// });

server.use("/api/v2", router);
server.listen(3000, () => {
  console.log("JSON Server is running");
});