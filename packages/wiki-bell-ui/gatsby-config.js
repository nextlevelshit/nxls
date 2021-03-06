module.exports = {
	pathPrefix: "/",
	siteMetadata: {
		title: `wiki-bell-ui`,
		description: `This is a gatsby application created by Nx.`,
	},
	plugins: [
		{
			resolve: "gatsby-plugin-svgr",
			options: {
				svgo: false,
				ref: true,
			},
		},
		`gatsby-plugin-react-helmet`,
		{
			resolve: `gatsby-source-filesystem`,
			options: {
				name: `images`,
				path: `${__dirname}/src/images`,
			},
		},
		`gatsby-transformer-sharp`,
		{
			resolve: require.resolve(
				`@nrwl/gatsby/plugins/nx-gatsby-ext-plugin`
			),
			options: {
				path: __dirname,
			},
		},
		`gatsby-plugin-sharp`,
		{
			resolve: `gatsby-plugin-manifest`,
			options: {
				name: `wiki-bell-ui`,
				short_name: `starter`,
				start_url: `/`,
				background_color: `#70a9a1`,
				theme_color: `#70a9a1`,
				display: `fullscreen`,
				icon: `src/images/logo.svg`,
			},
		},
		`gatsby-plugin-offline`,
	],
}
