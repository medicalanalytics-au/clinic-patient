import "../../../App.css"
import { useCallback, useContext, useEffect, useRef, useState } from "react"
import PropTypes from "prop-types"

// material ui
import { IconButton, Modal } from "@mui/material"

// react icons
import { FiMicOff, FiVideoOff } from "react-icons/fi"
import { IoCloseOutline } from "react-icons/io5"

// icon
import medical from "../../../images/medical.png"
import logo from "../../../images/medicalanalyticstransparentbackground.png"

// context
import { ProfileContext } from "../../../App"
import {
	// setConsultationNotification,
	// startSession,
	/* setSessionEndTime, */ setStream,
	setVideoMode,
	// setVideoScreenStatus,
	showSnack,
} from "../../../utils/context"

// constants
import { center, MAINCOLOR, MEDIA, OFFBLACK, ORIENTATION, WHITE } from "../../../utils/constants"

// custom components
import Menubar from "./Menubar"
import ControlBar from "./ControlBar"

// custom functions
import { loadAppointments, useResponsiveMedia } from "../../../utils/helpers"
import ModalScreen from "../../Common/ModalScreen"
import DoctorDetails from "../DoctorDetails"

const SplashBackgroundScreen = (props) => {
	const { state } = useContext(ProfileContext)
	const { videoMode } = state.consultation

	const styles = {
		...subStyles.SplashBackgroundScreen,
	}

	return (
		<div style={styles.mainContainer} onClick={props.onClick && props.onClick}>
			<img src={logo} alt="logo" width="60%" />
			<div style={styles.statusText}>{props.status}</div>
			{props.menuBar && props.menuBar}
			{!videoMode && <div style={styles.audioModeStatus}>Audio mode</div>}
		</div>
	)
}

SplashBackgroundScreen.propTypes = {
	status: PropTypes.string,
	onClick: PropTypes.func,
	menuBar: PropTypes.object,
}

const VideoScreen = (props) => {
	const value = useContext(ProfileContext)
	const { state, dispatch } = value
	const { socket, consultationNotification, consultation, _id, activeCall, videoScreenVisible, stream, peerVideoStream } = state
	const { appointment_id, videoMode } = consultation
	const { videoScreenStatus, sessionPaused } = activeCall

	const peerVideo = useRef()

	const localVideo = useCallback((node) => node && (node.srcObject = stream), [stream])

	const [audioAvailable, setAudioAvailable] = useState(true)
	const [videoAvailable, setVideoAvailable] = useState(true)
	const [peerAudioAvailable, setPeerAudioAvailable] = useState(true)
	const [peerVideoAvailable, setPeerVideoAvailable] = useState(true)

	const [showControlBar, setShowControlBar] = useState(false)

	const [showDoctorDetails, setShowDoctorDetails] = useState(false)

	const media = useResponsiveMedia()
	const mobile = media.type === MEDIA.MOBILE
	const mobilePortrait = mobile && media.orientation === ORIENTATION.PORTRAIT
	const mobileLandscape = mobile && media.orientation === ORIENTATION.LANDSCAPE
	const tablet = media.type === MEDIA.TABLET
	const portrait = media.orientation === ORIENTATION.PORTRAIT

	useEffect(() => {
		// this will set the video to the screen
		if (peerVideo.current) peerVideo.current.srcObject = peerVideoStream
	}, [peerVideoStream])

	useEffect(() => {
		// same as above but it refreshes the screen when the videoMode is changed
		if (videoMode && peerVideo.current) {
			peerVideo.current.srcObject = peerVideoStream
		}
	}, [videoMode, peerVideoStream])

	useEffect(() => {
		// * set up local video when videoscreen is set to open
		if (props.open) {
			const constraints = {
				video: {
					frameRate: {
						ideal: 25,
						max: 25,
					},
				},
				audio: true,
			}
			navigator.mediaDevices.getUserMedia(constraints).then((stream) => setStream(dispatch, stream))
		} else setStream(dispatch, null)
	}, [props.open, dispatch])

	const pauseVideo = useCallback(() => {
		socket.emit("patient_pause_consultation", appointment_id)
		loadAppointments(dispatch, _id)
	}, [_id, appointment_id, dispatch, socket])

	useEffect(() => {
		if (stream) {
			stream.getVideoTracks()[0].enabled = true
			stream.getAudioTracks()[0].enabled = audioAvailable && !sessionPaused
		}
	}, [audioAvailable, stream, sessionPaused, videoMode, state])

	useEffect(() => {
		socket.on("doctor_audioSignal", (signal) => {
			setPeerAudioAvailable(signal)
			!signal && showSnack(dispatch, "Audio disabled by doctor")
		})
		socket.on("doctor_videoSignal", (signal) => {
			setPeerVideoAvailable(signal)
			showSnack(dispatch, !signal ? "Video disabled by doctor" : "Video enabled by doctor")
		})

		socket.on("audio_mode_switch", () => {
			setVideoMode(dispatch, false)
			showSnack(dispatch, "Consultation switched to audio mode")
		})
	}, [socket, dispatch])

	const styles = {
		...subStyles,
		localVideoContainer: {
			...supportStyles.localVideoContainer,
			width: mobile ? (mobilePortrait ? "30%" : "15%") : tablet ? (portrait ? "20%" : "10%") : portrait ? "30%" : "10%",
			height: mobileLandscape ? "40%" : "20%",
		},
	}

	const handleControlBar = () => {
		const hideControlBar = () => setShowControlBar(false)
		!showControlBar && setTimeout(hideControlBar, 5000)
		setShowControlBar(!showControlBar)
	}

	return (
		<Modal open={props.open}>
			<div style={styles.mainContainer}>
				<ModalScreen
					icon={medical}
					open={showDoctorDetails}
					close={() => setShowDoctorDetails(false)}
					closeIcon={true}
					content={<DoctorDetails />}
					title={"Consulting Doctor"}
				/>

				<div style={styles.innerContainer}>
					{videoScreenVisible && <Menubar setShowDoctorDetails={setShowDoctorDetails} />}

					<div
						style={{
							position: "absolute",
							top: "10px",
							right: "20px",
							zIndex: 100,
						}}
					>
						<IconButton
							onClick={() => {
								socket.emit("patient_pause_consultation", appointment_id)
								props.close()
							}}
						>
							<IoCloseOutline />
						</IconButton>
					</div>

					<ControlBar
						show={showControlBar}
						close={props.close}
						audioAvailable={audioAvailable}
						videoAvailable={videoAvailable}
						setAudioAvailable={setAudioAvailable}
						setVideoAvailable={setVideoAvailable}
						pauseVideo={pauseVideo}
					/>

					{!sessionPaused && videoMode && (
						<div style={styles.localVideoContainer}>
							<div style={{ position: "absolute", zIndex: 2000, color: "gray", ...center }}>
								{!audioAvailable && <FiMicOff size={30} color={"silver"} style={styles.muteIcons} />}
								{!videoAvailable && <FiVideoOff size={30} color={"silver"} style={styles.muteIcons} />}
							</div>
							<video ref={localVideo} playsInline muted autoPlay style={styles.localVideo} />
						</div>
					)}

					{videoMode && videoScreenVisible && !sessionPaused ? (
						<video ref={peerVideo} playsInline autoPlay style={styles.peerVideo} onClick={handleControlBar} />
					) : (
						<SplashBackgroundScreen
							onClick={handleControlBar}
							menuBar={<Menubar setShowDoctorDetails={setShowDoctorDetails} />}
							status={videoScreenStatus}
						/>
					)}

					{videoScreenVisible && (
						<div style={styles.muteIconsContainer}>
							{!peerAudioAvailable && <FiMicOff size={50} color={"silver"} style={styles.muteIcons} />}
							{!peerVideoAvailable && <FiVideoOff size={50} color={"silver"} style={styles.muteIcons} />}
						</div>
					)}
				</div>
			</div>
		</Modal>
	)
}

VideoScreen.propTypes = {
	open: PropTypes.bool,
	close: PropTypes.func,
}

const supportStyles = {
	localVideoContainer: {
		...center,
		top: "10px",
		left: "10px",
		position: "absolute",
		objectFit: "cover",
		border: "3px solid silver",
		borderRadius: "15px",
		zIndex: 1000,
	},
}

const subStyles = {
	mainContainer: {
		...center,
		width: "100%",
		height: "100%",
		backgroundColor: "silver",
	},
	innerContainer: {
		...center,
		border: "1px solid " + MAINCOLOR,
		height: "95%",
		width: "98%",
		borderRadius: "5px",
		position: "relative",
		backgroundColor: "white",
	},

	localVideo: {
		...center,
		objectFit: "cover",
		width: "100%",
		height: "100%",
		transform: "scaleX(-1)",
		borderRadius: "15px",
		zIndex: 1000,
	},
	loadingScreen: {
		...center,
		height: "100%",
		width: "100%",
		border: "1px solid green",
		position: "absolute",
	},
	peerVideo: {
		height: "100%",
		width: "100%",
		left: 0,
		top: 0,
		position: "absolute",
		transform: "scaleX(-1)",
		objectFit: "cover",
		zIndex: 800,
	},
	muteIcons: {
		marginLeft: "20px",
		marginRight: "20px",
	},
	muteIconsContainer: {
		display: "flex",
		flexDirection: "row",
		zIndex: 1000,
	},
	SplashBackgroundScreen: {
		mainContainer: {
			height: "100%",
			width: "100%",
			...center,
			backgroundColor: OFFBLACK,
			flexDirection: "column",
			left: 0,
			top: 0,
			position: "absolute",
		},
		statusText: {
			color: WHITE,
			fontWeight: "bold",
			fontSize: "20px",
			marginTop: "20px",
		},
		audioModeStatus: {
			/* 	position: "absolute",
			bottom: "10%", */
			color: WHITE,
		},
	},
}
export default VideoScreen
