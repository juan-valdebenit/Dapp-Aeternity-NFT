import axios from "axios";
import { generateKeyPair } from "@aeternity/aepp-sdk";
import dotenv from "dotenv";
dotenv.config();

export let keypair = null;

export const run = async () => {
  keypair = generateKeyPair();
  console.log(`Secret key: ${keypair.secretKey}`);
  console.log(`Public key: ${keypair.publicKey}`);

  await axios.post(`https://faucet.aepps.com/account/${keypair.publicKey}`);
  const accountResponse = await axios.get(
    `https://testnet.aeternity.io/v3/accounts/${keypair.publicKey}`
  );

  console.log(`Balance: ${accountResponse.data.balance} ættos`);
};

// run();
