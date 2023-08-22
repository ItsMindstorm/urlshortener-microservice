require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const parser = require("body-parser");
const dns = require("dns");

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

app.use(
  parser.urlencoded({
    extended: false,
  }),
);

let origUrls = [];
let shortUris = [];

const makeShortened = () => {
  // Makes a shortened, 5 random characters code
  const randValues = new Uint16Array(1);
  const shortUrl = crypto.getRandomValues(randValues);

  const finalShort = shortUrl[0];

  return finalShort;
};

app.post("/api/shorturl", function (req, res) {
  // This gets the host name from the input url
  const inputUrl = new URL(req.body.url);
  const hostname = inputUrl.hostname;

  // Undertakes a dns lookup from hostname to check validity
  dns.lookup(hostname, function (error) {
    // Throws error if the url is invalid
    if (error) {
      res.json({
        error: "invalid input",
      });
    } else {
      /* Runs when URL is valid
	   Then calls the function, getting the shortened code
	*/
      const shortened = makeShortened();
      // Returns URL and shortened code as json
      res.json({
        original_url: req.body.url,
        short_url: shortened,
      });
      // Pushes url and shortened code into 2 empty arrays
      origUrls.push(req.body.url);
      shortUris.push(shortened);
    }
  });
});

app.get("/api/shorturl/:url", function (req, res) {
  /* Checks if input code is identical in both type
     and content by converting it into a string */
  if (req.params.url === shortUris[0].toString()) {
    console.log("if statement working!");
    // Redirects to original url
    res.redirect(origUrls[0]);
    // Empties the 2 arrays
    origUrls = [];
    shortUris = [];
  } else {
    // Throws an error if the code is invalid
    res.json({
      error: "invalid url",
    });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
