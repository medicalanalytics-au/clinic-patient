import { MAINCOLOR } from "../../helpers"

const dbstyles = {
	mainContainer: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		width: "100%",
		height: "100%",
	},
	innerContainerWithMargin: {
		display: "flex",
		flexDirection: "column",
		justifyContent: "space-between",
		height: "95%",
		width: "95%",
	},
	body: {
		display: "flex",
		flexDirection: "column",
	},
	buttonStyle: {
		width: "200px",
		// boxShadow: "inset 0px 0px 10px #00008b",
		border: "1px solid ghostwhite",
		boxShadow: "inset 1px 1px 2px 0 rgba(31, 38, 135, 0.37), 1px 1px 8px 0 rgba(0, 38, 135, 0.37)",
		color: MAINCOLOR,
	},
}

export default dbstyles
