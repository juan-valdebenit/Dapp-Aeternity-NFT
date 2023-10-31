import express from "express";
import dotenv from "dotenv";

import deployAndMintCollectionUniqueNFTs from "../../scripts/deployAndMintCollectionUniqueNFTs.js";
import { deployment } from "../../scripts/deployAndMintCollectionUniqueNFTs.js";

dotenv.config();

const router = express.Router();

// For checking if a string is blank, null or undefined
const isBlank = (str) => !str || /^\s*$/.test(str);
export let collectionUniqueMetadata = null;
router.post("/mint", async (req, res) => {
  try {
    const { hashKeys } = req.body;

    let immutableMetadataUrls = hashKeys.map((key) => `ipfs://${key}`);

    collectionUniqueMetadata = {
      name: "Apes stepping into the Metaverse - (Unique Version)",
      symbol: "ASITM-U",
      immutable_metadata_urls: immutableMetadataUrls,
    };

    await deployAndMintCollectionUniqueNFTs();

    res.status(200).json({ contractAddress: deployment.address });
  } catch (err) {
    console.log(err);
    res.status(503).json({ result: "server error" });
  }
});

export default router;
