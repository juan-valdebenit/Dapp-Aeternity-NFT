import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compress from "compression";
import helmet from "helmet";

import Mint from "./routes/api/mint.js";
import { run } from "./scripts/createKeypairAndFundAccount.js";

const app = express();

const timezone = "America/New_York";
Intl.DateTimeFormat().resolvedOptions().timeZone = timezone;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compress());
app.use(helmet());
app.use(cors());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Define Routes
app.use("/api", Mint);

app.use(express.static("build"));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get("*", (req, res) => {
  //  res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
});

// SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on PORT ${PORT}`));

run();
