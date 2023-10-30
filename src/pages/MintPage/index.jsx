import React, { useState } from "react";
import FormData from "form-data";
import axios from "axios";
import VideoToThumb from "video-thumb-generator";

import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import LocalMoviesIcon from "@mui/icons-material/LocalMovies";
import "App.css";

export const MintPage = () => {
  const [file, setFile] = useState([]);
  const [myipfsHash, setIPFSHASH] = useState("");

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

      //   console.log("file", fileImg);
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

      //   console.log(response);

      // get the hash
      setIPFSHASH(response.data.IpfsHash);
    } catch (error) {
      console.log(error);
    }
  };

  const handleVideoUpload = (event) => {
    const video = event.target.files[0];
    console.log("video", video);
    const videoToThumb = new VideoToThumb(video)
      .load()
      .positions([1, 2, 3, 4, 5, 6, 7, 8]) // time
      .xy([0, 0]) // coordinator
      .size([200, 200]) // image size
      .type("base64")
      .error(function (err) {
        // console.log(JSON.stringify(err));
        console.log("error", err);
      })
      .done(async function (imgs) {
        imgs.forEach(function (img) {
          var elem = new Image();
          elem.src = img;

          document.body.appendChild(elem);
        });

        setFile(imgs);
      });
    console.log(videoToThumb);
  };

  return (
    <>
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
            onChange={handleVideoUpload}
          />
        </Button>
        <Button
          variant="contained"
          startIcon={<CloudUploadIcon />}
          onClick={() => {
            file.forEach((i) => pinFileToPinata(i));
            // pinFileToPinata(file);
          }}
          style={{
            textTransform: "capitalize",
            marginTop: "30px",
            marginBottom: "30px",
            marginLeft: "30px",
          }}
        >
          Pin To Cloud
        </Button>
        <Button
          variant="contained"
          startIcon={<CloudUploadIcon />}
          onClick={() => {}}
          style={{
            textTransform: "capitalize",
            marginTop: "30px",
            marginBottom: "30px",
            marginLeft: "30px",
          }}
        >
          Minting
        </Button>
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
