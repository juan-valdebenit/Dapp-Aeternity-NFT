const routes = require("express").Router();

const models = require("./models");
const cars = require("./cars");
const deployAndMintCollectionUniqueNFTs = require("../scripts/deployAndMintCollectionUniqueNFTs");

routes.use("/models", models);
routes.use("/cars", cars);

routes.get("/", (req, res) => {
  res.status(200).json({ message: "Connected!" });
});

routes.post("/mint", async (req, res) => {
  const { hashKeys } = req.body;

  immutableMetadataUrls = hashKeys.map((key) => `ipfs://${key}`);

  collectionUniqueMetadata = {
    name: "Apes stepping into the Metaverse - (Unique Version)",
    symbol: "ASITM-U",
    immutable_metadata_urls: immutableMetadataUrls,
  };

  await deployAndMintCollectionUniqueNFTs();

  res.status(200).json({ contractAddress: deployment.address });
});

module.exports = routes;
