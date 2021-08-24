import React, { useState } from "react"
import * as styles from "./index.module.css"
import { useHarmonicIntervalFn } from "react-use"

export const Index = () => {
	const baseUrl =
		"development" === process.env.NODE_ENV
			? "http://0.0.0.0:3333/api"
			: "https://tengo.uber.space/api"
	const [full, setFull] = useState(null)
	const [wiki, setWiki] = useState(["Waiting is not a crime ..."])
	const [raw, html] = wiki
	const [[h, setH], [m, setM], [s, setS]] = [
		useState(null),
		useState(null),
		useState(null),
	]
	const fetchData = (query) => {
		fetch(`${baseUrl}/${parseInt(query)}/all`)
			.then((res) => {
				return res.json()
			})
			.then((data) => {
				console.log(data)
				const { AC, BC } = data
				setFull(data)
				setWiki([
					AC.closest?.raw ??
						AC.random?.raw ??
						BC.closest?.raw ??
						BC.random?.raw,
					AC.closest?.html ??
						AC.random?.html ??
						BC.closest?.html ??
						BC.random?.html,
				])
			})
	}

	useHarmonicIntervalFn(() => {
		const nextH = "" + ("0" + new Date().getHours()).slice(-2)
		const nextM = "" + ("0" + new Date().getMinutes()).slice(-2)
		const nextS = "" + ("0" + new Date().getSeconds()).slice(-2)

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
					{h && m && s && (
						<h1>
							{h}&#8239;
							{m}
							<span>:</span>
							<span>{s}</span>
						</h1>
					)}

					{html ? (
						<p
							dangerouslySetInnerHTML={{
								__html,
							}}
						/>
					) : (
						raw
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
