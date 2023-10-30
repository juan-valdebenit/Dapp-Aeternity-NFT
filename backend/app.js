// Bring in our dependencies
const app = require("express")();
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();
const run = require("./scripts/createKeypairAndFundAccount");
const routes = require("./routes");
const PORT = process.env.PORT || 5000;
const cors = require("cors");

app.use(
  cors({
    origin: "*",
  })
);
//  Connect all our routes to our application
app.use("/", jsonParser, routes);

// Turn on that server!
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});

run();
