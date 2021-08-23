/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import * as express from "express"
import fetch from "node-fetch"
import * as https from "https"
import * as fs from "fs"
import cheerio from "cheerio"

const app = express()

app.get("/api", (req, res) => {
	const now = [
		("0" + new Date().getHours()).slice(-2),
		("0" + new Date().getMinutes()).slice(-2),
	]
	const year = parseInt(now.join("")).toString()

	fetch(`https://en.wikipedia.org/api/rest_v1/page/html/${year}`, {
		headers: {
			"Api-User-Agent": "Michael W. Czechowski <mc@dailysh.it>",
			accept: "application/json",
			"Accept-Language": "de-de",
		},
	})
		.then((data) => {
			return data.text()
		})
		.then((raw) => {
			return cheerio.load(raw)
		})
		.then(($) => {
			const all = $("ul > li")
			const events = $('h2:contains("Events")').parent().find("ul > li")
			const births = $('h2:contains("Births")').parent().find("ul > li")
			const deaths = $('h2:contains("Deaths")').parent().find("ul > li")
			const topics = [...events, ...births, ...deaths]
			const list = events ?? topics ?? all
			const coinFlip = Math.floor(Math.random() * (list.length + 1))
			const random = cheerio(list[coinFlip]).html()

			// Oh man, sag schon, was soll das
			// ein falsches wort nach dem and'ern
			//
			// wir sind übertrieb'n gelad'n
			// und hätten so viel zu sag'n
			//
			// doch ein falsches wort
			// durchbricht diesen wundervollen ort

			res.send({
				year,
				now,
				random,
			})
		})
		.catch((err) => {
			console.warn(err)

			res.status(500)
		})
})

const port = process.env.port || 3333

const server = https
	.createServer(
		{
			key: fs.readFileSync("./ssl/key.pem"),
			cert: fs.readFileSync("./ssl/cert.pem"),
		},
		app
	)
	.listen(port, () => {
		console.log(`Listening at https://wiki.bell:${port}/api`)
	})
server.on("error", console.error)
