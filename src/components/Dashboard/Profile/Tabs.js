import { useState } from "react"
import "../../../App.css"
import PropTypes from "prop-types"

// constants
import { center, MAINCOLOR } from "../../../utils/constants"

const Tabs = (props) => {
	const [activeTab, setActiveTab] = useState(props.initialTab ? props.initialTab : 0)

	return (
		<div style={styles.mainContainer}>
			<div style={styles.tabRow}>
				{props.content.map((i, index) => {
					const tabStyle = {
						...supportStyles.tab,
						backgroundColor: index === activeTab ? "ghostwhite" : "white",
						fontWeight: index === activeTab ? "bold" : "normal",
					}
					return (
						<div key={i.title} style={tabStyle} onClick={() => setActiveTab(index)}>
							<div style={styles.icon}>{i.icon}</div>
							{i.title}
						</div>
					)
				})}
			</div>
			<div style={styles.activeScreen}>{props.content[activeTab].screen}</div>
		</div>
	)
}

const supportStyles = {
	tab: {
		padding: "5px",
		marginRight: "10px",
		cursor: "pointer",
		letterSpacing: "0em",
		display: "flex",
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		color: MAINCOLOR,
	},
}

const styles = {
	mainContainer: {
		display: "flex",
		flexDirection: "column",
		height: "100%", //
	},
	tabRow: {
		display: "flex",
		flexDirection: "row",
		marginBottom: "10px",
	},
	icon: {
		marginRight: "5px",
		...center,
	},
	activeScreen: {
		margin: "5px",
		height: "100%",
	},
}

Tabs.propTypes = {
	initialTab: PropTypes.number,
	content: PropTypes.array,
}

export default Tabs
