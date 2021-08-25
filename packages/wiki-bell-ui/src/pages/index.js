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
				if (year > new Date().getFullYear) {
					if (BC.closest?.raw || BC.random?.raw) {
						setBC(true)
						setWiki([
							BC.closest?.raw ?? BC.random?.raw,
							BC.closest?.html ?? BC.random?.html,
						])
					} else {
						setBC(false)
						setWiki([setWiki([AC.random?.raw, AC.random?.html])])
					}
				} else {
					setBC(false)
					setWiki([
						AC.closest?.raw ?? AC.random?.raw,
						AC.closest?.html ?? AC.random?.html,
					])
				}
				setFull(data)
				console.log(data)
			})
	}

	const useTime = () => {
		const h = "" + new Date().getHours()
		const m = "" + ("0" + new Date().getMinutes()).slice(-2)
		const s = "" + ("0" + new Date().getSeconds()).slice(-2)

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

	useEffectOnce(() => update())

	const __html = html?.replace(
		/href=\"\.\//gm,
		'target="_blank" href="https://en.wikipedia.org/wiki/'
	)

	return (
		<div className={styles.page}>
			<main>
				<article>
					{h && m && s ? (
						<h1
							onClick={() => fetchData(h + m)}
							role={"button"}
							tabIndex={0}
							ariaLabel={"Get another WikiPedia article"}
						>
							{h}
							&#8239;
							{m}
							{isBC && BC}
							&#8239;
							{s > 0 ? <span>{romanize(parseInt(s))}</span> : "·"}
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
