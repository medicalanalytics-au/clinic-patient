import "../../../App.css"
import { useContext } from "react"
import PropTypes from "prop-types"

// react icons
import { MdMenu } from "react-icons/md"

import { center, DARKGRAY, MIN_3, WHITE } from "../../../utils/constants"

// context
import { ProfileContext } from "../../../App"

// custom components
import TimeBox from "../TimeBox"
import { addDialog } from "../../../utils/context"
import { GenericAlert } from "../../../utils/sweetalertDialogs"

const Menubar = (props) => {
	const { state, dispatch } = useContext(ProfileContext)

	const { endTime } = state.consultation

	return (
		<div style={styles.mainContainer}>
			{endTime > 0 ? (
				<TimeBox
					end={endTime}
					visible={endTime > 0}
					triggers={[MIN_3]}
					onTrigger={() => {
						addDialog(dispatch, {
							dialog: GenericAlert("Session ending in 3 minutes"),
						})
					}}
				/>
			) : (
				<div style={styles.placeholder}>Calculating...</div>
			)}
			<div style={styles.menuIcon} onClick={() => props.setShowDoctorDetails(true)}>
				<MdMenu style={{ color: WHITE }} />
			</div>
		</div>
	)
}

Menubar.propTypes = {
	setShowDoctorDetails: PropTypes.func,
}

const styles = {
	mainContainer: {
		...center,
		width: "100%",
		position: "absolute",
		bottom: "0px",
		backgroundColor: DARKGRAY,
		zIndex: 1000,
		flexDirection: "column",
	},
	menuIcon: {
		position: "absolute",
		right: "10px",
		cursor: "pointer",
		fontSize: "20px",
		...center,
	},
	placeholder: {
		color: WHITE,
		fontSize: "15px",
	},
}

export default Menubar
