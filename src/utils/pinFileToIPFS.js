// // const axios = require("axios");
// // const FormData = require("form-data");
// // const fs = require("fs");
// import axios from "axios";
// import FormData from "form-data";

// import { JWT } from "constants/pinata";

// const myJWT = `Bearer ${JWT}`;
// const API_KEY = process.env.REACT_APP_API_KEY;
// const API_SECRET = process.env.REACT_APP_API_SECRET;

// export const pinFileToIPFS = async (file) => {
//   const formData = new FormData();
//   //   const src = "path/to/file.png";

//   //   const file = fs.createReadStream(src);
//   formData.append("file", file);

//   const pinataMetadata = JSON.stringify({
//     name: "File name",
//   });
//   formData.append("pinataMetadata", pinataMetadata);

//   const pinataOptions = JSON.stringify({
//     cidVersion: 0,
//   });
//   formData.append("pinataOptions", pinataOptions);

//   try {
//     const res = await axios.post(
//       "https://api.pinata.cloud/pinning/pinFileToIPFS",
//       formData,
//       {
//         maxBodyLength: "Infinity",
//         headers: {
//           "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,

//           Authorization: myJWT,
//         },
//       }
//     );
//     console.log(res.data);
//   } catch (error) {
//     console.log(error);
//   }
// };
