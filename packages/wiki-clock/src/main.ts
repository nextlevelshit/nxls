/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import * as express from "express"
import fetch from "node-fetch"
import * as https from "https"
import * as fs from "fs"
import * as convert from "xml2json"
import cheerio from "cheerio"
import { children } from "cheerio/lib/api/traversing"

const app = express()

app.get("/api", (req, res) => {
	const now = [
		("0" + new Date().getHours()).slice(-2),
		("0" + new Date().getMinutes()).slice(-2),
	]
	const date = parseInt(now.join("")).toString()
	// res.send({ time: now, test: "hello sheila", date })

	console.log(date)

	fetch(`https://en.wikipedia.org/api/rest_v1/page/html/${date}`, {
		headers: {
			"Api-User-Agent": "Michael W. Czechowski <mc@dailysh.it>",
			accept: "application/json",
			"Accept-Language": "de-de",
		},
	})
		// .then((data) => {
		// 	console.log(data.text())
		// 	res.send({ time: now, wiki: data.text() })
		// })
		// .then((data) => convert.toJson(data.text()))
		.then((data) => {
			return data.text()
		})
		.then((raw) => {
			return cheerio.load(raw)
		})
		.then(($) => {
			const eventsRaw = $('h2:contains("Events")')
				.parent()
				// .children()
				// .children("section > section")
				.find("ul > li")
			// .toArray()
			// .html()
			// const events = convert.toJson(
			// 	`<html>${eventsRaw.toString()}</html>`,
			// 	{
			// 		object: true,
			// 	}
			// )
			// const names = events?.ul?.li
			// 	// .filter(({ span }) => !span)
			// 	.flatMap(({ a }) => a)
			// .map(({ title, href }) => {
			// 	return { title, href }
			// })
			// const events = cheerio("ul > li", eventsRaw)
			// const events = eventsRaw.map((a) => {
			// 	console.log(a)
			// })
			console.log(eventsRaw.toArray())

			res.send({
				date,
				now,
				events: `<ul>${eventsRaw
					.toString()
					.replace(/\.\//gm, "https://en.wikipedia.org/wiki/")}</ul>`,
				// events: events.html(),
				// names,
				// events,
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
		console.log(`Listening at http://localhost:${port}/api`)
	})
server.on("error", console.error)
