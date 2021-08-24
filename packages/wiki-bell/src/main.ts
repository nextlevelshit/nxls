/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import * as express from "express"
import fetch from "node-fetch"
import cheerio from "cheerio"

const app = express()

app.get("/", (req, res) => {
	res.send("Wiki Bell API v1.0.0")
})

app.get("/api", (req, res) => {
	const now = [
		("0" + new Date().getHours()).slice(-2),
		("0" + new Date().getMinutes()).slice(-2),
	]
	const time = parseInt(now.join("")).toString()

	fetch(`https://en.wikipedia.org/api/rest_v1/page/html/${time}`, {
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
			const list = topics.length ? topics : all
			const coinFlip = Math.floor(Math.random() * list.length)
			const randomEl = cheerio(list[coinFlip])
			const random = {
				html: randomEl.html(),
				raw: randomEl.text(),
			}

			console.log(
				cheerio(all)
					.toArray()
					.map((a) => {
						return cheerio(a).text()
					})
			)

			const closestEl = [...list].find((item) => {
				if ((cheerio(item).text() as String).includes(time)) {
					return true
				}
				return false
			})
			const closest = {
				html: cheerio(closestEl).html(),
				raw: cheerio(closestEl).text(),
			}

			// Oh man, sag schon, was soll das
			// ein falsches wort nach dem and'ern
			//
			// wir sind übertrieb'n gelad'n
			// und hätten so viel zu sag'n
			//
			// doch ein falsches wort
			// durchbricht diesen wundervollen ort

			res.send({
				time,
				now,
				random,
				closest,
			})
		})
		.catch((err) => {
			console.warn(err)

			res.status(500)
		})
})

const port = process.env.PORT || 3333

const server = app.listen(port, () => {
	console.log(`Listening at https://0.0.0.0:${port}/api`)
})
server.on("error", console.error)
