import "../../App.css"
import PropTypes from "prop-types"

import Countdown from "react-countdown"

// custom function
import { renderer } from "../../utils/helpers"

// constants
import { center, WHITE } from "../../utils/constants"

const TimeBox = (props) => {
	const styles = {
		...subStyles,
		mainContainer: {
			...supportStyles.mainContainer,
			visibility: props.visible ? "visible" : "hidden",
		},
		timebox: {
			...supportStyles.timebox,
			color: props.color ? props.color : WHITE,
		},
	}

	return (
		<div style={styles.mainContainer}>
			<div style={styles.timebox}>
				<Countdown
					date={props.end}
					renderer={renderer}
					onTick={({ total }) => {
						if (props.triggers.length > 0) {
							if (props.triggers.includes(total)) {
								props.onTrigger && props.onTrigger(total)
							}
						}
					}}
				/>
			</div>
		</div>
	)
}

const supportStyles = {
	mainContainer: {
		...center,
		fontWeight: "bold",
	},
	timebox: {
		...center,
		fontSize: "15px",
		flexDirection: "column",
		padding: "5px",
		borderRadius: "5px",
	},
}

const subStyles = {
	header: {
		fontWeight: "bold",
		marginBottom: "5px",
		color: WHITE,
	},
}
TimeBox.propTypes = {
	end: PropTypes.number,
	visible: PropTypes.bool,
	triggers: PropTypes.array,
	onTrigger: PropTypes.func,
}

export default TimeBox
