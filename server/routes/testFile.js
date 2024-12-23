// const { default: axios } = require("axios");
// const fs = require("fs");
// const path = require("path");

// const imagePath = "./road map.jpg";

// // Function to convert image to Base64 using a Promise
// function convertImageToBase64(imagePath) {
//   return new Promise((resolve, reject) => {
//     // Read the image file as a buffer
//     fs.readFile(imagePath, (err, data) => {
//       if (err) {
//         reject("Error reading the file:", err);
//         return;
//       }

//       // Get the file extension (for MIME type)
//       const extname = path.extname(imagePath).toLowerCase();
//       let mimeType;

//       // Determine the MIME type based on file extension
//       switch (extname) {
//         case ".png":
//           mimeType = "image/png";
//           break;
//         case ".jpg":
//         case ".jpeg":
//           mimeType = "image/jpeg";
//           break;
//         case ".gif":
//           mimeType = "image/gif";
//           break;
//         case ".bmp":
//           mimeType = "image/bmp";
//           break;
//         default:
//           reject("Unsupported image format:", extname);
//           return;
//       }

//       // Convert the image data to Base64
//       const base64Image = data.toString("base64");

//       // Create the Data URL
//       const dataUrl = `data:${mimeType};base64,${base64Image}`;

//       // Resolve with the Data URL
//       resolve(dataUrl);
//     });
//   });
// }

// const chatgptApi = async (imageUrl) => {
//   try {
//     const messages = [
//       {
//         role: "user",
//         content: [
//           {
//             type: "text",
//             text: "What's in this image?",
//           },
//           {
//             type: "image_url",
//             image_url: {
//               url: imageUrl,
//             },
//           },
//         ],
//       },
//     ];

//     const response = await axios.post(
//       "https://api.openai.com/v1/chat/completions",
//       {
//         model: "gpt-4o",
//         messages,
//         max_tokens: 100,
//         temperature: 0.5,
//       },
//       {
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//         },
//       }
//     );
//     console.log(response.data.choices[0].message.content);
//   } catch (error) {
//     console.error("Error fetching GPT-4 response:", error);
//   }
// };

// // Convert the image and then call the ChatGPT API
// convertImageToBase64(imagePath)
//   .then((base64ImageUrl) => {
//     chatgptApi(base64ImageUrl);
//   })
//   .catch((error) => {
//     console.error("Error during Base64 conversion:", error);
//   });
