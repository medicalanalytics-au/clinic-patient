import "../../../App.css"
import { useContext } from "react"
import PropTypes from "prop-types"

// material ui
import { Grow } from "@mui/material"

// react icons
import { FiPause, FiMic, FiMicOff, FiVideo, FiVideoOff } from "react-icons/fi"

// context
import { ProfileContext } from "../../../App"
import { showSnack } from "../../../utils/context"

// constants
import { center, DARKGRAY, GRAY, WHITE } from "../../../utils/constants"

// Swal
import { addDialog } from "../../../utils/context"
import { GenericDialog } from "../../../utils/sweetalertDialogs"

const ControlBar = (props) => {
	const value = useContext(ProfileContext)
	const { state, dispatch } = value
	const { socket, consultation } = state
	const { appointment_id, videoMode } = consultation

	const { audioAvailable, videoAvailable, setAudioAvailable, setVideoAvailable, pauseVideo } = props

	const styles = {
		...subStyles,
		videoButton: {
			...supportStyles.videoButton,
			cursor: videoMode ? "pointer" : "not-allowed",
		},
	}

	return (
		<Grow in={props.show}>
			<div style={styles.mainContainer}>
				<div
					style={styles.muteButtons}
					onClick={() => {
						audioAvailable && showSnack(dispatch, "Audio muted") // if audio is gonna be set to mute
						socket.emit("patient_audioSignal", { signal: !audioAvailable, appointment_id })
						setAudioAvailable((audioAvailable) => !audioAvailable)
					}}
				>
					{audioAvailable ? <FiMic color={"white"} /> : <FiMicOff color={"white"} />}
				</div>
				<div
					style={styles.callButton}
					onClick={() => {
						addDialog(dispatch, {
							dialog: GenericDialog("Pause consultation?"),
							onConfirm: () => {
								pauseVideo()
								props.close()
							},
						})
					}}
				>
					<FiPause size={20} color={"white"} />
				</div>

				<div
					style={styles.videoButton}
					onClick={() => {
						if (videoMode) {
							videoAvailable && showSnack(dispatch, "Video muted") // if video is gonna be set to mute
							socket.emit("patient_videoSignal", { signal: !videoAvailable, appointment_id })
							setVideoAvailable((videoAvailable) => !videoAvailable)
						}
					}}
				>
					{videoAvailable && videoMode ? <FiVideo color={WHITE} /> : <FiVideoOff color={videoMode ? WHITE : GRAY} />}
				</div>
			</div>
		</Grow>
	)
}

ControlBar.propTypes = {
	show: PropTypes.bool,
	close: PropTypes.func,
	audioAvailable: PropTypes.bool,
	videoAvailable: PropTypes.bool,
	setAudioAvailable: PropTypes.func,
	setVideoAvailable: PropTypes.func,
	pauseVideo: PropTypes.func,
}

const controlButtons = { ...center, cursor: "pointer" }

const subStyles = {
	mainContainer: {
		...center,
		width: "100%",
		position: "absolute",
		bottom: "0px",
		backgroundColor: DARKGRAY,
		zIndex: 10000,
		flexDirection: "row",
		paddingTop: "5px",
		paddingBottom: "5px",
	},
	muteButtons: {
		...controlButtons,
		height: "50px",
		width: "50px",
		borderRadius: "25px",
		backgroundColor: "silver",
	},
	callButton: {
		...controlButtons,
		height: "60px",
		width: "60px",
		borderRadius: "30px",
		backgroundColor: "red",
		marginLeft: "20px",
		marginRight: "20px",
	},
}

const supportStyles = {
	videoButton: subStyles.muteButtons,
}
export default ControlBar
