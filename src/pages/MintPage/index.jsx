import React, { useState } from "react";
import FormData from "form-data";
import axios from "axios";
import VideoToThumb from "video-thumb-generator";

import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import { notification } from "antd";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import LocalMoviesIcon from "@mui/icons-material/LocalMovies";
import BrokenImageIcon from "@mui/icons-material/BrokenImage";
import AddCard from "@mui/icons-material/AddCard";

import logo from "assets/logo.png";
import "App.css";
import "./style.css";

export const MintPage = () => {
  const [file, setFile] = useState([]);
  const [myipfsHash, setIPFSHASH] = useState([]);
  const [api, contextHolder] = notification.useNotification();
  const [aeScanUrl, setAeScanUrl] = useState();
  const [isMintStarted, setIsMintStarted] = useState(false);
  const [mintAddress, setMintAddress] = useState();

  const openNotificationWithIcon = (type, message, description) => {
    api[type]({
      message,
      description,
    });
  };

  // helper function: generate a new file from base64 String
  const dataURLtoFile = (dataurl, filename) => {
    const arr = dataurl.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n) {
      u8arr[n - 1] = bstr.charCodeAt(n - 1);
      n -= 1; // to make eslint happy
    }
    return new File([u8arr], filename, { type: mime });
  };

  const pinFileToPinata = async (filesToHandle) => {
    try {
      console.log("starting", filesToHandle);

      // generate file from base64 string
      const fileImg = dataURLtoFile(`${filesToHandle}`, "image");

      //   initialize the form data
      const formData = new FormData();
      // append the files form data to
      formData.append("file", fileImg);
      // call the keys from .env

      const API_KEY = process.env.REACT_APP_API_KEY;
      const API_SECRET = process.env.REACT_APP_API_SECRET;

      // the endpoint needed to upload the file
      const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

      const response = await axios.post(url, formData, {
        maxContentLength: "Infinity",
        headers: {
          "Content-Type": `multipart/form-data;boundary=${formData._boundary}`,
          pinata_api_key: API_KEY,
          pinata_secret_api_key: API_SECRET,
        },
      });

      console.log(response);

      // get the hash
      const ipfsHashs = myipfsHash;
      ipfsHashs.push(response.data.IpfsHash);

      setIPFSHASH(ipfsHashs);
    } catch (error) {
      console.log(error);
    }
  };

  const handleVideoUpload = (event) => {
    const video = event.target.files[0];

    console.log("video", video);

    new VideoToThumb(video)
      .load()
      .positions([1, 3, 5]) // time
      .xy([0, 0]) // coordinator
      .size([280, 280]) // image size
      .type("base64")
      .error(function (err) {
        console.log("error", err);
      })
      .done(async function (imgs) {
        var div = document.createElement("div");
        // div.style =
        //   "display: flex; justify-content: center; align-items: center";
        div.className = "div-flex";

        imgs.forEach(function (img) {
          var elem = new Image();
          elem.src = img;
          elem.className = "img-style";

          div.appendChild(elem);
        });

        document.body.appendChild(div);

        setFile(imgs);
      });

    openNotificationWithIcon(
      "success",
      "Success",
      "Thumbnails are created from the selected video successfully"
    );
  };

  const sendHashKeysToBackend = async () => {
    // the endpoint needed to upload the file
    const url = "http://127.0.0.1:5000/api/mint";

    const response = await axios.post(url, { hashKeys: myipfsHash });

    openNotificationWithIcon(
      "success",
      "Success",
      "Contracts are deployed successfully"
    );
    setAeScanUrl(
      `https://testnet.aescan.io/contracts/${response.data.contractAddress}`
    );
    setMintAddress(
      `https://testnet.aescan.io/accounts/`+ response.data.deployerAddress
    );
    console.log(response);
  };

  const addToTradingCard = ()=> {
    console.log("add to trading card")
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <img
          src={logo}
          className="App-logo"
          alt="logo"
          style={{
            marginTop: "100px",
            textAlign: "center",
            display: "block",
          }}
        />
      </div>
      {contextHolder}
      <div className="div-flex-1">
        <p style={{ color: "#2F3F7C", textAlign: "center" }}>
          This is the MVP version, which Mints NFT tokens containing thumbnails
          of sports videos on the Aeternity blockchain.
        </p>
        <div className="div-flex">
          <Button
            component="label"
            variant="contained"
            startIcon={<LocalMoviesIcon />}
            style={{
              textTransform: "capitalize",
              margin: "20px",
              backgroundColor: "#F69025",
              fontWeight: "600!important",
              fontSize: "16px",
              width: "300px",
            }}
          >
            Select file
            <VisuallyHiddenInput
              type="file"
              multiple={true}
              onChange={(event) => {
                handleVideoUpload(event);
              }}
            />
          </Button>
          <Button
            variant="contained"
            startIcon={<CloudUploadIcon />}
            onClick={async () => {
              await file.forEach((i) => pinFileToPinata(i));
              openNotificationWithIcon(
                "success",
                "Success",
                "Thumbnails are pinned to cloud successfully"
              );
            }}
            style={{
              textTransform: "capitalize",
              margin: "20px",
              backgroundColor: "#F69025",
              fontWeight: "600!important",
              fontSize: "16px",
              width: "300px",
            }}
          >
            Upload Images To Cloud
          </Button>
          <Button
            variant="contained"
            startIcon={<BrokenImageIcon />}
            onClick={() => {
              setIsMintStarted(true);
              sendHashKeysToBackend();
              console.log(myipfsHash);
            }}
            style={{
              textTransform: "capitalize",
              margin: "20px",
              backgroundColor: "#F69025",
              fontWeight: "600!important",
              fontSize: "16px",
              width: "300px",
            }}
          >
            Mint Images
          </Button>

          <Button
            variant="contained"
            startIcon={<AddCard />}
            onClick={() => {
              addToTradingCard();
            }}
            style={{
              textTransform: "capitalize",
              margin: "20px",
              backgroundColor: "#F69025",
              fontWeight: "600!important",
              fontSize: "16px",
              width: "300px",
            }}
          >
            Add to Trading Card
          </Button>
        </div>

        <br />
        {aeScanUrl ? (
          <div>
          <a href={aeScanUrl} target ="_blank">Go to AEScan</a><br/>
          <a href={mintAddress}>Go to Account</a>
          </div>
        ) : (
          isMintStarted && <h2>Minting...</h2>
        )}
      </div>
    </>
  );
};

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  whiteSpace: "nowrap",
  width: 1,
  marginTop: "30px",
  textTransform: "none",
});
