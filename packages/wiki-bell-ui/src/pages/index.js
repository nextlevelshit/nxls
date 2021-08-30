import React, { useState } from "react"
import { romanize } from "romans"
import * as styles from "./index.module.css"
import { useEffectOnce, useHarmonicIntervalFn } from "react-use"

const isDebug = "development" === process.env.NODE_ENV

const Index = () => {
	const baseUrl = isDebug
		? "http://0.0.0.0:3333/api"
		: "https://tengo.uber.space/api"
	const [isBC, setBC] = useState(false)
	const [topic, setTopic] = useState("events")
	const [pulse, setPulse] = useState(false)
	const wikiDefault = ["Waiting is not a crime ..."]
	const [full, setFull] = useState(null)
	const [wiki, setWiki] = useState(wikiDefault)
	const [raw, html] = wiki
	const [[h, setH], [m, setM], [s, setS]] = [
		useState(0),
		useState(0),
		useState(0),
	]
	const fetchData = (query) => {
		setWiki(wikiDefault)
		const year = parseInt(query)
		fetch(`${baseUrl}/${year}/all`)
			.then((res) => {
				return res.json()
			})
			.then((data) => {
				const { AC, BC } = data
				let category = AC
				if (year > new Date().getFullYear() || year < 200) {
					category = BC
					setBC(true)
				} else {
					setBC(false)
				}
				const item = category[topic]

				setWiki([
					item.closest?.raw || item.random?.raw,
					item.closest?.html || item.random?.html,
				])
				setFull(data)
			})
	}

	const useTime = () => {
		const h = new Date().getHours().toString()
		const m = ("0" + new Date().getMinutes()).slice(-2).toString()
		const s = ("0" + new Date().getSeconds()).slice(-2).toString()

		return [h, m, s]
	}

	/**
	 * @param interval number - in miliseconds (optional)
	 */
	const update = (interval = 5000) => {
		const [nextH, nextM, nextS] = useTime()
		const remainerS = nextS % (interval * 0.001)
		const roundedNextS = Math.floor(nextS - remainerS)

		setS(roundedNextS)
		setM(nextM)
		setH(nextH)

		if (nextM !== m) {
			fetchData(nextH + nextM)
		}
	}

	const updateEachSecond = () => update(1000)

	const toggleTopic = () => {
		const topics = ["births", "deaths", "events"]
		const key = (topics.findIndex((t) => topic === t) + 1) % topics.length

		setTopic(topics[key])
		fetchData(h + m)
	}

	const useTopics = () => {
		const list = [
			["births", "So, who was born"],
			["deaths", "So, who died"],
			["events", "So, what happend"],
		]
		const map = new Map(list)
		const prefix = map.get(topic)
		const topics = map.keys()

		return { list, map, prefix, topics }
	}

	useHarmonicIntervalFn(() => {
		updateEachSecond()
	}, 1000)

	useHarmonicIntervalFn(() => {
		setPulse(!pulse)
	}, 1000)

	useEffectOnce(() => updateEachSecond())

	const __html = html?.replace(
		/href=\"\.\//gm,
		'target="_blank" href="https://en.wikipedia.org/wiki/'
	)

	const { prefix } = useTopics()

	return (
		<div className={styles.page}>
			<hr
				style={{
					height: Math.abs(Math.cos((s / 60) * Math.PI)) * 100 + "vh",
					// opacity: (s / 60) * 100 + "%",
					// background: pulse ? "#70A9A1" : "#F6F1D1",
				}}
			/>
			<main>
				<article>
					{h && m ? (
						<h1
							onClick={() => toggleTopic()}
							role={"button"}
							tabIndex={0}
							aria-label={"Get another WikiPedia article"}
						>
							<span>
								It is {h}
								{pulse ? ":" : " "}
								{m}
							</span>
							<br />
							<br />
							<span>{prefix && `${prefix} `}</span>
							<span>{isBC ? "around" : "in"}</span> the year{" "}
							{h > 0 && h}
							{m}
							{isBC && " BC"}
							?!
						</h1>
					) : (
						<h1>
							<span>&nbsp;</span>
						</h1>
					)}

					{html ? (
						<p
							dangerouslySetInnerHTML={{
								__html,
							}}
						/>
					) : (
						<p>{raw ?? wikiDefault[0]}</p>
					)}
				</article>
				<footer>
					{/* {isDebug && <pre>{JSON.stringify(full, null, 2)} </pre>} */}
					<center>
						with {"<3"}{" "}
						<a
							className={"author"}
							target={"_blank"}
							href={
								"https://dailysh.it?sendWithLoveFromWikiDailyshIt"
							}
						>
							dailysh.it
						</a>
					</center>
				</footer>
			</main>
		</div>
	)
}
export default Index
