const projectId = "gns-gpt-bot";
const location = "us"; // Format is 'us' or 'eu'
// const processorId = "e7a923443fcb4ffb"; // form parser id
const processorId = "1af71b78f04c04c3"; // form processor trained for surge fee

const { DocumentProcessorServiceClient } =
  require("@google-cloud/documentai").v1;

const client = new DocumentProcessorServiceClient();

const fs = require("fs");
const path = require("path");

let counter = 0;
let total = 0;
async function parseImagesInFolder(folderPath) {
  // Read the contents of the folder
  const files = await fs.promises.readdir(folderPath, { withFileTypes: true });

  // Loop through each file/directory in the folder
  for (const file of files) {
    const filePath = path.join(folderPath, file.name);

    // If the item is a directory, recursively parse its contents
    if (file.isDirectory()) {
      await parseImagesInFolder(filePath);
      continue;
    }

    // If the file is not a PNG, JPEG or JPG file, skip it
    if (
      ![".png", ".jpeg", ".jpg"].includes(path.extname(filePath).toLowerCase())
    ) {
      continue;
    }

    // Read the file data
    const fileData = await fs.promises.readFile(filePath);

    const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;
    const request = {
      name,
      rawDocument: {
        content: fileData,
        mimeType: "image/png",
      },
    };
    // Parse the document using Document AI
    const [result] = await client.processDocument(request);
    const { document } = result;

    if (
      (document.text.includes("GrabFood") ||
        document.text.includes("GrabPay")) &&
      document.text.includes("Total net earnings")
    ) {
      // Log the text extracted from the document
      console.log(`------------Text from file ${filePath}:----------`);
      console.log(document.text);
      console.log(
        `-----------------${counter++}--------------------------------`
      );
    }
  }
}

const images = "/Users/ashokjaiswal/Downloads/Receipts";

// Example usage: parse all PNG, JPEG and JPG files in the "images" folder
parseImagesInFolder(images);
