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

let codeUrl = [];

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
      // Pushes url and code into the same array, one after another
      codeUrl.push(req.body.url);
      codeUrl.push(shortened);
      console.log(codeUrl);
    }
  });
});

app.get("/api/shorturl/:url", function (req, res) {
  /* Function finds whether the provided code matches the same code in the array */
  const matchingShort = () => {
    const matching = codeUrl.find((code) => {
      return code.toString() === req.params.url;
    });
    console.log(codeUrl.indexOf(matching));
    return matching;
  };

  const matching = matchingShort();

  /* Function grabs the url in the array that is 1 position before the index of the provided code */
  const matchingUrl = () => {
    const url = codeUrl[codeUrl.indexOf(matching) - 1];
    console.log(url);

    return url;
  };

  const url = matchingUrl();

  /* Checks whether there is a match provided by the function, if there is, it will redirect the user to the matched url from the function */
  if (matching) {
    console.log("if statement working!");
    // Redirects to original url
    res.redirect(url);
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
