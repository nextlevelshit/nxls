/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import * as express from "express"
import fetch from "node-fetch"
import cheerio from "cheerio"

const useElements = (list, search) => {
	const closestElements = [...list].filter((item) => {
		console.log(cheerio(item).text(), search)
		if ((cheerio(item).text() as String).includes(search)) {
			return true
		}
		return false
	})
	const closestEl =
		closestElements[Math.floor(Math.random() * closestElements.length)]
	const randomEl = list[Math.floor(Math.random() * closestElements.length)]

	return {
		closest: closestEl
			? {
					html: cheerio(closestEl).html(),
					raw: cheerio(closestEl).text(),
			  }
			: null,
		random: randomEl
			? {
					html: cheerio(randomEl).html(),
					raw: cheerio(randomEl).text(),
			  }
			: null,
	}
}

const useDom = ($, search) => {
	const all = $("ul > li")
	const eventsList = $('h2:contains("Events")').parent().find("ul > li")
	const events = {
		...useElements(eventsList, search),
		type: "event",
		suffix: "happend",
	}
	const birthsList = $('h2:contains("Births")').parent().find("ul > li")
	const births = {
		...useElements(birthsList, search),
		type: "birth",
		suffix: "was born",
	}
	const deathsList = $('h2:contains("Deaths")').parent().find("ul > li")
	const deaths = {
		...useElements(deathsList, search),
		type: "death",
		suffix: "died",
	}
	// const births = $('h2:contains("Births")').parent().find("ul > li")
	// const deaths = $('h2:contains("Deaths")').parent().find("ul > li")
	// const topics = [...events, ...births, ...deaths]
	// const list = topics.length ? topics : all
	// const coinFlip = Math.floor(Math.random() * list.length)
	// const randomEl = cheerio(list[coinFlip])
	// const random = {
	// 	html: randomEl.html(),
	// 	raw: randomEl.text(),
	// 	type: "random",
	// }

	// console.log(events)

	// console.log(
	// 	cheerio(all)
	// 		.toArray()
	// 		.map((a) => {
	// 			return cheerio(a).text()
	// 		})
	// )

	// const closestElements = [...list].filter((item) => {
	// 	if ((cheerio(item).text() as String).includes(search)) {
	// 		return true
	// 	}
	// 	return false
	// })
	// const closestEl =
	// 	closestElements[Math.floor(Math.random() * closestElements.length)]
	// const closest = {
	// 	html: cheerio(closestEl).html(),
	// 	raw: cheerio(closestEl).text(),
	// }

	return { births, events, deaths, random: null, closest: null }
}

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
		.then((data) => data.text())
		.then((raw) => cheerio.load(raw))
		.then(($) => {
			const { random, closest } = useDom($, time)

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

app.get("/api/:time", (req, res) => {
	const { time } = req.params
	const timeEscaped = parseInt(time)

	fetch(`https://en.wikipedia.org/api/rest_v1/page/html/${timeEscaped}`, {
		headers: {
			"Api-User-Agent": "Michael W. Czechowski <mc@dailysh.it>",
			accept: "application/json",
			"Accept-Language": "de-de",
		},
	})
		.then((data) => data.text())
		.then((raw) => cheerio.load(raw))
		.then(($) => {
			const { random, closest } = useDom($, timeEscaped)

			res.send({
				timeEscaped,
				random,
				closest,
			})
		})
		.catch((err) => {
			console.warn(err)

			res.status(500)
		})
})

app.get("/api/:time/all", (req, res) => {
	const { time } = req.params
	const timeEscaped = parseInt(time)

	fetch(`https://en.wikipedia.org/api/rest_v1/page/html/${timeEscaped}`, {
		headers: {
			"Api-User-Agent": "Michael W. Czechowski <mc@dailysh.it>",
			accept: "application/json",
			"Accept-Language": "de-de",
		},
	})
		.then((data) => data.text())
		.then((raw) => cheerio.load(raw))
		.then(($) => {
			const { random, closest, events, births, deaths } = useDom(
				$,
				timeEscaped
			)
			const AC = {
				timeEscaped,
				random,
				closest,
				events,
				births,
				deaths,
			}

			fetch(
				`https://en.wikipedia.org/api/rest_v1/page/html/${timeEscaped}_BC`,
				{
					headers: {
						"Api-User-Agent":
							"Michael W. Czechowski <mc@dailysh.it>",
						accept: "application/json",
						"Accept-Language": "de-de",
					},
				}
			)
				.then((data) => data.text())
				.then((raw) => cheerio.load(raw))
				.then(($BC) => res.send({ AC, BC: useDom($BC, timeEscaped) }))
				.catch((err) => res.status(500).send(err))
		})
		.catch((err) => {
			console.warn(err)

			res.status(500)
		})
})

const port = process.env.PORT || 3333

const server = app.listen(port, () => {
	console.log(`Listening at http://0.0.0.0:${port}/api`)
})
server.on("error", console.error)
