import React, { useState } from "react"
import { romanize } from "romans"
import * as styles from "./index.module.css"
import { useHarmonicIntervalFn } from "react-use"

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

	useHarmonicIntervalFn(() => {
		const nextH = "" + new Date().getHours()
		const nextM = "" + ("0" + new Date().getMinutes()).slice(-2)
		const nextS = "" + ("0" + new Date().getSeconds()).slice(-2)

		if (nextS % 5 !== 0) return

		if (nextM !== m) {
			setM(nextM)
			fetchData(nextH + nextM)
		}

		if (nextH !== h) {
			setH(nextH)
		}

		if (nextS !== s) {
			setS(nextS)
		}
	}, 1000)

	const __html = html?.replace(
		/href=\"\.\//gm,
		'target="_blank" href="https://en.wikipedia.org/wiki/'
	)

	return (
		<div className={styles.page}>
			<main>
				<article>
					{h && m && s ? (
						<h1 onClick={() => fetchData(h + m)}>
							{h}
							&#8239;
							{m}
							{isBC && <span className={"bc"}>BC</span>}
							&#8239;
							{s > 0 ? <span>{romanize(parseInt(s))}</span> : "·"}
						</h1>
					) : (
						<h1>
							<span>00:00:00</span>
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
