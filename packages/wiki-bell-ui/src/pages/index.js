import React, { useState } from "react"
import { romanize } from "romans"
import * as styles from "./index.module.css"
import { useEffectOnce, useHarmonicIntervalFn } from "react-use"

export const Index = () => {
	const baseUrl =
		"development" === process.env.NODE_ENV
			? "http://0.0.0.0:3333/api"
			: "https://tengo.uber.space/api"
	const [isBC, setBC] = useState(false)
	const [blink, setBlink] = useState(false)
	const [suffix, setSuffix] = useState("")
	const [full, setFull] = useState(null)
	const [wiki, setWiki] = useState(["Waiting is not a crime ..."])
	const [raw, html] = wiki
	const [[h, setH], [m, setM], [s, setS]] = [
		useState(0),
		useState(0),
		useState(0),
	]
	const fetchData = (query) => {
		const year = parseInt(query)
		fetch(`${baseUrl}/${year}/all`)
			.then((res) => {
				return res.json()
			})
			.then((data) => {
				const { AC, BC } = data
				let category = AC
				if (year > new Date().getFullYear) {
					category = BC
					setBC(true)
				} else {
					setBC(false)
				}

				const item =
					((category.events?.closest || category.events?.random) &&
						category.events) ||
					((category.births?.closest || category.births?.random) &&
						category.births) ||
					((category.deaths?.closest || category.deaths?.random) &&
						category.deaths)

				setSuffix(item?.suffix)
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

	const update = () => {
		const [nextH, nextM, nextS] = useTime()
		const remainerS = nextS % 5
		const roundedNextS = nextS - remainerS

		setH(nextH)
		setM(nextM)
		setS(roundedNextS)

		if (nextM !== m) {
			fetchData(nextH + nextM)
		}
	}

	useHarmonicIntervalFn(() => {
		update()
	}, 1000)

	useHarmonicIntervalFn(() => {
		setBlink(!blink)
	}, 500)

	useEffectOnce(() => update())

	const __html = html?.replace(
		/href=\"\.\//gm,
		'target="_blank" href="https://en.wikipedia.org/wiki/'
	)

	return (
		<div className={styles.page}>
			<main>
				<article>
					{h && m ? (
						<h1
							onClick={() => fetchData(h + m)}
							role={"button"}
							tabIndex={0}
							ariaLabel={"Get another WikiPedia article"}
						>
							<span>in</span>
							&#8239;
							{h}
							<span>{blink ? ":" : " "}</span>
							{m}
							{isBC && BC}
							&#8239;
							<span>{suffix ?? ""}</span>
						</h1>
					) : (
						<h1>
							<span>&nbsp;</span>
						</h1>
					)}

					{html ? (
						<p
							style={{ borderWidth: `${s * 2}px` }}
							dangerouslySetInnerHTML={{
								__html,
							}}
						/>
					) : (
						<p>{raw}</p>
					)}
				</article>
				<footer>
					<center>with {"<3"} dailysh.it</center>
				</footer>
			</main>
		</div>
	)
}
export default Index
