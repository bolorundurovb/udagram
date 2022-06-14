import express from "express";
import bodyParser from "body-parser";
import { filterImageFromURL, deleteLocalFiles } from "./util/util";

(async () => {
  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;

  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // Root Endpoint
  // Displays a simple message to the user
  app.get("/", async (req, res) => {
    res.send("try GET /filteredimage?image_url={{}}");
  });

  /**
   * Filter an image from a public url.
   */
  app.get("/filteredimage", async (req, res) => {
    let { image_url } = req.query;
    image_url = String(image_url);
    const regexQuery =
      "^(https?://)?(www\\.)?([-a-z0-9]{1,63}\\.)*?[a-z0-9][-a-z0-9]{0,61}[a-z0-9]\\.[a-z]{2,6}(/[-\\w@\\+\\.~#\\?&/=%]*)?$";
    const url = new RegExp(regexQuery, "i");
    const check = url.test(image_url);

    if (!image_url) {
      return res.status(400).send("Image url is required");
    } else {
      if (!check) {
        return res.status(400).send("Invalid image url");
      }
      const filteredpath = await filterImageFromURL(image_url);
      res.sendFile(filteredpath, () => {
        deleteLocalFiles([filteredpath]);
      });
    }
  });

  // Start the Server
  app.listen(port, () => {
    console.log(`server running http://localhost:${port}`);
    console.log(`press CTRL+C to stop server`);
  });
})();
