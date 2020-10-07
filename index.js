require("dotenv").config();
const app = require("express")();
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const moment = require("moment");

app.use(morgan("dev"));
app.use(cors());
app.use(helmet());

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log("Listening on port " + PORT);
});
