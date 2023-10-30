import React, { useState } from "react";
import FormData from "form-data";
import axios from "axios";
import VideoToThumb from "video-thumb-generator";

import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import { notification } from "antd";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import LocalMoviesIcon from "@mui/icons-material/LocalMovies";
import "App.css";

export const MintPage = () => {
  const [file, setFile] = useState([]);
  const [myipfsHash, setIPFSHASH] = useState([]);
  const [api, contextHolder] = notification.useNotification();
  const [aeScanUrl, setAeScanUrl] = useState();
  const [isMintStarted, setIsMintStarted] = useState(false);

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
      .positions([1, 3]) // time
      .xy([0, 0]) // coordinator
      .size([200, 200]) // image size
      .type("base64")
      .error(function (err) {
        console.log("error", err);
      })
      .done(async function (imgs) {
        // imgs.forEach(function (img) {
        //   var elem = new Image();
        //   elem.src = img;

        //   document.body.appendChild(elem);
        // });

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
    const url = "http://127.0.0.1:5000/mint";

    const response = await axios.post(url, { hashKeys: myipfsHash });

    openNotificationWithIcon(
      "success",
      "Success",
      "Contracts are deployed successfully"
    );
    setAeScanUrl(
      `https://testnet.aescan.io/contracts/${response.data.contractAddress}`
    );
    console.log(response);
  };

  return (
    <>
      {contextHolder}
      <div className="App">
        <Button
          component="label"
          variant="contained"
          startIcon={<LocalMoviesIcon />}
          style={{
            textTransform: "capitalize",
            marginTop: "30px",
            marginBottom: "30px",
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
            marginTop: "30px",
            marginBottom: "30px",
            marginLeft: "30px",
          }}
        >
          Upload Images To Cloud
        </Button>
        <Button
          variant="contained"
          startIcon={<CloudUploadIcon />}
          onClick={() => {
            setIsMintStarted(true);
            sendHashKeysToBackend();
            console.log(myipfsHash);
          }}
          style={{
            textTransform: "capitalize",
            marginTop: "30px",
            marginBottom: "30px",
            marginLeft: "30px",
          }}
        >
          Mint Images
        </Button>
        <br />
        {aeScanUrl ? (
          <a href={aeScanUrl}>Go to AEScan</a>
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
