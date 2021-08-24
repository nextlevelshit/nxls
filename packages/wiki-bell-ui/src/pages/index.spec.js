import React from "react"
import { render } from "@testing-library/react"
import Index from "./index"
describe("Index", () => {
	it("should render successfully", () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const props = {}
		const { getByText } = render(<Index {...props} />)
		expect(getByText("Welcome to wiki-bell-ui!")).toBeTruthy()
	})
})
