require("dotenv").config();

const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const morganBody = require("morgan-body");
const routes = require("./routes");
const cors = require("cors");
app.use
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
app.use(express.json({ limit: "5mb" }));
const corsOptions = {
  origin: true, //included origin as true
  credentials: true, //included credentials as true
};
app.use(cors(corsOptions))
// app.use(cors({ credentials: true, origin: 'http://localhost:3000' }))

morganBody(app);
app.use((error, req, res, next) => {
  return error instanceof SyntaxError
    ? res.status(500).send({ message: "Invalid data structure" })
    : next();
});

// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', 'http://localhost:3001');
//   res.header('Access-Control-Allow-Credentials', 'true');
//   res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
//   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
//   console.log('CORS headers set:', req.headers.origin);
//   next();
// });

app.use(cookieParser())
app.disable("x-powered-by");
app.use(routes);

const PORT = process.env.SERVICE_PORT || 8080;
const SERVICE = process.env.SERVICE_NAME || "Express JS";
app.listen(PORT, () => {
  console.log(`${SERVICE} running on port ${PORT}`);
});
