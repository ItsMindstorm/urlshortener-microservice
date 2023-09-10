require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const parser = require("body-parser");
const dns = require("dns")
const { MongoClient } = require("mongodb")

// Basic Configuration
const port = process.env.PORT || 3000;
const client = new MongoClient(process.env.DB_URL)
const db = client.db("shorturl")
const urls = db.collection("shorturl")

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function(req, res) {
	res.sendFile(process.cwd() + "/views/index.html");
});

app.use(
	parser.urlencoded({
		extended: false,
	}),
);


const makeShortened = () => {
	// Makes a shortened, 5 random characters code
	const randValues = new Uint16Array(1);
	const shortUrl = crypto.getRandomValues(randValues);

	const finalShort = shortUrl[0];

	return finalShort;
};

app.post("/api/shorturl", (req, res) => {
	// This gets the host name from the input url
	const inputUrl = new URL(req.body.url);
	const protocol = inputUrl.protocol

	if (protocol === "http:" || protocol === "https:") {
		/* Calls the function, getting the shortened code
		 */
		const shortened = makeShortened();
		// Returns URL and shortened code as json
		res.json({
			original_url: req.body.url,
			short_url: shortened,
		});
		// Pushes url and code to db
		urls.insertOne({ original_url: req.body.url, short_url: shortened })
	} else {
		res.json({
			error: "invalid url"
		})
	}
});

app.get("/api/shorturl/:url", async (req, res) => {
	console.log(req.params.url)
	const redirect = await urls.findOne({
		short_url: parseInt(req.params.url)
	});
	console.log(redirect)
	res.redirect(redirect.original_url)
});

app.listen(port, function() {
	console.log(`Listening on port ${port}`);
});
