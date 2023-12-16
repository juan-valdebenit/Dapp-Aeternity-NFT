import React, { useState } from "react";
import FormData from "form-data";
import axios from "axios";
import VideoToThumb from "video-thumb-generator";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { notification } from "antd";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import LocalMoviesIcon from "@mui/icons-material/LocalMovies";
import BrokenImageIcon from "@mui/icons-material/BrokenImage";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import AddCard from "@mui/icons-material/AddCard";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import logo from "assets/logo.png";
import "App.css";
import "./style.css";
import { useMediaQuery } from "@mui/material";
import { MDBDataTableV5 } from "mdbreact";
import { useTheme } from "@mui/material/styles";

export const MintPage = () => {
  const [file, setFile] = useState([]);
  const [myipfsHash, setIPFSHASH] = useState([]);
  const [api, contextHolder] = notification.useNotification();
  const [aeScanUrl, setAeScanUrl] = useState();
  const [isMintStarted, setIsMintStarted] = useState(false);
  const [mintAddress, setMintAddress] = useState();
  const [value, setValue] = React.useState(0);
  const [inputAddress, setInputAddress] = useState("");
  const [fetchData, setFetchData] = useState([]);
  const [realData, setRealData] = useState([]);
  const theme = useTheme()
  const matchMd = useMediaQuery(theme.breakpoints.up('md'))

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
      .size([280, 158]) // image size
      .type("base64")
      .error(function (err) {
        console.log("error", err);
      })
      .done(async function (imgs) {
        var div = document.createElement("div");
        div.className = "div-flex";

        imgs.forEach(function (img) {
          var elem = new Image();
          elem.src = img;
          elem.className = "img-style";
          div.appendChild(elem);
        });
        const element = document.getElementById("imageClip");
        element.appendChild(div);
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
    const url = "http://localhost:5000/api/mint";

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
      `https://testnet.aescan.io/accounts/` + response.data.deployerAddress
    );
    console.log(response);
  };

  const getCustomNFT = async () => {
    console.log(inputAddress);
    if (inputAddress == "") {
      openNotificationWithIcon(
        "error",
        "Alert",
        "Input correct Address please"
      );
    }
    await axios
      .get(
        "https://testnet.aeternity.io/mdw/v2/accounts/" +
          inputAddress +
          "/activities?limit=100"
      )
      .then((response) => {
        setFetchData(response.data);
        handleData(response.data.data);
      })
      .catch((err) => {});
  };

  const handleData = async (buffer) => {
    let rowDatas = [];
    try {
      for (let i = 0; i < buffer.length; i++) {
        if (buffer[i].payload.tx.function === "mint") {
          let rowData = [];
          console.log(
            "here",
            buffer[i].payload.tx.arguments[1].value[1].value[1]
          );
          rowData = {
            index: rowDatas.length + 1,
            mintHash: buffer[i].payload.hash,
            tokenAddress: buffer[i].payload.tx.contract_id,
            tokenID: buffer[i].payload.tx.return.value,
            tokenURI: (
              <img
                style={{ width: 120, height: 60, paddingTop: 8, paddingBottom: 8, verticalAlign: 'middle' }}
                src={buffer[
                  i
                ].payload.tx.arguments[1].value[1].value[1].value[0].val.value.replace(
                  "ipfs://",
                  "https://ipfs.io/ipfs/"
                )}
              ></img>
            ),
          };
          rowDatas.push(rowData);
          setRealData(rowDatas);
        }
      }
    } catch (err) {
      console.log(err);
    }
    console.log("realdata", rowDatas, realData);
    return realData;
  };

  const AddCustomNFTTrading = () => {
    openNotificationWithIcon(
      "success",
      "Success",
      "Adding to Trading Card Now..."
    );
  }

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleAddress = (e) => {
    setInputAddress(e.target.value);
    console.log(inputAddress);
  };

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
        <p style={{ color: "#2F3F7C", textAlign: "center" }} id="mainTitle">
          This is the MVP version, which Mints NFT tokens containing thumbnails
          of sports videos on the Aeternity blockchain.
        </p>
        <Box sx={{ maxWidth: 1440, width: '100%', px: 2, borderColor: "#F69025" }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={value}
              onChange={handleChange}
              aria-label="basic tabs example"
            >
              <Tab
                label="Mint Page"
                {...a11yProps(0)}
                sx={{ color: "#F69025" }}
              />
              <Tab
                label="Trading Card"
                {...a11yProps(1)}
                sx={{ color: "#F69025" }}
              />
            </Tabs>
          </Box>
          <CustomTabPanel value={value} index={0}>
            <div className="div-flex" style={{ gap: 20}}>
              <Button
                component="label"
                id="selectFile"
                variant="contained"
                startIcon={<LocalMoviesIcon />}
                style={{
                  textTransform: "capitalize",
                  backgroundColor: "#F69025",
                  fontWeight: "600!important",
                  fontSize: "16px",
                  width: '100%'
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
                id="uploadCloud"
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
                  
                  width: '100%',
                  textTransform: "capitalize",
                  backgroundColor: "#F69025",
                  fontWeight: "600!important",
                  fontSize: "16px",
                  // width: "300px",
                }}
              >
                Upload Images To Cloud
              </Button>
              <Button
                id="mintImages"
                variant="contained"
                startIcon={<BrokenImageIcon />}
                onClick={() => {
                  setIsMintStarted(true);
                  sendHashKeysToBackend();
                  console.log(myipfsHash);
                }}
                sx={{
                  width: '100%'
                }}
                style={{
                  textTransform: "capitalize",
                  backgroundColor: "#F69025",
                  fontWeight: "600!important",
                  fontSize: "16px",
                  // width: "300px",
                }}
              >
                Mint Images
              </Button>
            </div>
            {aeScanUrl ? (
              <div style={{ width: 'fit-content', display: 'flex', gap: '40px', marginTop: '30px', marginRight: 'auto', marginLeft: 'auto'}}>
                <a href={aeScanUrl} target="_blank">
                  Go to AEScan
                </a>
                <br />
                <a href={mintAddress}>Go to Account</a>
              </div>
            ) : (
              isMintStarted && (
                <h2 style={{ textAlign: 'center', marginTop: '50px' }}>
                  Minting...
                </h2>
              )
            )}
            <div id="imageClip"></div>
            <br />
          </CustomTabPanel>
          <CustomTabPanel value={value} index={1}>
            <div>
              <Box sx={{
                display: 'flex',
                flexDirection: {
                  md: 'row',
                  xs: 'column'
                },
                alignItems: { md: 'center', xs: 'flex-start'},
                gap: 4,
                pb: matchMd ? 5 : 0
              }}>
              <TextField
                id="editAddr"
                label="Address"
                variant="outlined"
                size="small"
                sx={{
                  width: {md: '575px', xs:'100%'}
                }}
                onChange={handleAddress}
                defaultValue={inputAddress}
              />
              <Box sx={{ 
                    width: matchMd ? 'unset' : '100%', pb: {md: 0, xs: 4}}}>
              
              <Button
                id="listNFT"
                variant="contained"
                startIcon={<AddCard />}
                
                onClick={() => {
                  getCustomNFT();
                }}
                style={{
                  textTransform: "capitalize",
                  backgroundColor: "#F69025",
                  fontWeight: "600!important",
                  fontSize: "16px",
                  width: '100%'
                }}
              >
                List presented NFT
              </Button>
              </Box>
              </Box>

              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell width={"10%"} align="center">No</TableCell>
                      <TableCell width={"30%"} align="center">Address</TableCell>
                      <TableCell width={"10%"} align="center">ID</TableCell>
                      <TableCell align="center">Assets</TableCell>
                      <TableCell width={"50%"} align="left">Methods</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {realData.map((row) => (
                      <TableRow
                        key={row.index}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                          "& td, th": {
                            padding: 0
                          }
                        }}
                      >
                        <TableCell align="center" component="th" scope="row">
                          {row.index}
                        </TableCell>
                        <TableCell align="center">{row.tokenAddress.slice(0,6)}...{row.tokenAddress.slice(48)}</TableCell>
                        <TableCell align="center">{row.tokenID}</TableCell>
                        <TableCell align="center">{row.tokenURI}</TableCell>
                        <TableCell align="left">
                          {" "}
                          <Button
                            variant="contained"

                            onClick={() => {
                              AddCustomNFTTrading();
                            }}
                            style={{
                              textTransform: "capitalize",
                              margin: "20px",
                              backgroundColor: "#F69025",
                              fontWeight: "600!important",
                              fontSize: "16px",
                              	
                            }}
                          >
                            Add to Trading Card
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          </CustomTabPanel>
        </Box>
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

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}
