/**
 * * Main page
 * * This page will be rendered on successful login
 *
 * Program description:
 *
 * As this is the main page upon login, several components are declared here, which would be available application wide
 *
 * Components:
 * ===========
 * Declaring it here will allow these components to be rendered independent of which screen is currently active.
 *
 * Swal 	- a Sweetalert2 component for dialogs
 * 			- this Sweetalert2-defined method fire() takes a dialog as a parameter
 *			- a helper function addDialog() in Context is used to add to an array of dialogs, which is called on render() to check for
 *      	- the next active dialog in this component <Main/> useEffect() hook
 *
 * <ConsultationSummary />
 * <ConsultationDetails />
 *
 * PeerJs is initialized here, with peer and socket signals for video initialization is handled here
 * Peer server will take in an ICE candidate as a config param. Credentials is loaded from environment variables.
 *
 * A <BottomNavigation/> component for active page selection is rendered at the bottom of the screen
 */

import { useContext, useState, useCallback, useEffect, useRef } from "react"
import "../App.css"
import PropTypes from "prop-types"

// simple peer
import Peer from "simple-peer"

// material ui
import { BottomNavigation, BottomNavigationAction, Button } from "@mui/material"

// react icons
import { MdVideoCameraFront } from "react-icons/md"
import { GoDashboard } from "react-icons/go"
import { FaRegUser } from "react-icons/fa"

// icons
import info from "../images/info.png"
import camera from "../images/camera.png"
import creditcard from "../images/creditcard_transparent.png"

// Swal
import Swal from "sweetalert2"
import {
	addDialog,
	endSession,
	removeDialog,
	setCallAccepted,
	setSessionEndTime,
	updateSymptomDescription,
	updateSymptomImage,
} from "../utils/context"
import { GenericAlert, GenericDialog, GenericError } from "../utils/sweetalertDialogs"

// custom components
import Dashboard from "./Dashboard/Dashboard"
import Profile from "./Dashboard/Profile/Profile"

// context
import { ProfileContext } from "../App"
import {
	startSession,
	// setSessionEndTime,
	setVideoScreenStatus,
	setVideoScreenVisible,
	setPeerVideoStream,
} from "../utils/context"

// custom functions
import { reviewSessions, loadAppointments, now, showError, resumeConsultation } from "../utils/helpers"

import {
	// REQUESTSTATUS,
	SESSION_ACTIVE,
	INSUFFICIENT_SESSION_BLOCK,
	MIN_3,
	SESSION,
} from "../utils/constants"

// network
import { patient_requestAppointment } from "../utils/network"

// custom components
import ModalScreen from "./Common/ModalScreen"
import BriefSummary from "./BriefSummary/BriefSummary"
import ImageCapture from "./BriefSummary/ImageCapture"
import PaymentScreen from "./PaymentScreen/PaymentScreen"

const Container = (props) => {
	const { content, activePage } = props

	return (
		<div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
			<div style={{ height: "100%" }}>{content[activePage].dialog}</div>
			<div
				style={{
					display: "flex",
					flexDirection: "row",
					justifyContent: content[activePage].backButton ? (content[activePage].forwardButton ? "space-between" : "flex-start") : "flex-end",
				}}
			>
				{content[activePage].backButton && (
					<Button onClick={() => content[activePage].backButton.onClick()}>{content[activePage].backButton.title}</Button>
				)}
				{content[activePage].forwardButton && (
					<Button onClick={() => content[activePage].forwardButton.onClick()}>{content[activePage].forwardButton.title}</Button>
				)}
			</div>
		</div>
	)
}

Container.propTypes = {
	content: PropTypes.array,
	activePage: PropTypes.number,
}

const Main = () => {
	const { state, dispatch } = useContext(ProfileContext)
	const { appointments, _id, socket, stream, dialogs, consultation, activeCall, sessionReady, videoScreenVisible } = state
	const { appointment_id, summary } = consultation
	const { text, image } = summary
	const { callAccepted, peerSignal } = activeCall
	const { doctor_id } = consultation.doctor

	const { activeDialog } = dialogs

	const [page, setValue] = useState(0)
	const pages = [<Dashboard />, <Profile />]

	const [viewPreConsultation, setViewPreConsultation] = useState(false)
	const [viewGetInfo, setViewGetInfo] = useState(false)
	const [viewImageCapture, setViewImageCapture] = useState(false)

	const [viewPaymentScreen, setViewPaymentScreen] = useState(false)

	// video session variables
	const _peer = useRef(null)
	const _stream = useRef(null)
	const _doctor_id = useRef()
	const signaled = useRef(false)
	const callInitiated = useRef(false)

	// ! *********************************************************** Dialog Handler ************************************************************* //
	useEffect(() => {
		if (activeDialog) {
			removeDialog(dispatch) // prevent double trigger of dialog

			Swal.fire(activeDialog.dialog)
				.then((result) => {
					if (result.isConfirmed && activeDialog.onConfirm) activeDialog.onConfirm(result.value)
					if (result.isDenied && activeDialog.onDeny) activeDialog.onDeny()
					if (result.isDismissed && activeDialog.onDismiss) activeDialog.onDismiss()
				})
				.catch((error) => {
					Swal.fire(GenericError(error))
				})
		}
	}, [activeDialog, dispatch])

	// ! **************************************************************************************************************************************** //

	// ! *********************************************************** Video Handler ************************************************************** //

	const destroyPeer = useCallback(
		(screenStatus) => {
			if (_peer.current) {
				_peer.current.destroy()
				_peer.current = null
			}
			videoScreenVisible && setVideoScreenVisible(dispatch, false)
			/* if (sessionReady) {
				screenStatus && setVideoScreenStatus(dispatch, screenStatus) // remove this when endSession is fully implemented
				setVideoScreenVisible(dispatch, false) // remove this when endSession is fully implemented
				callInitiated.current = false
				endSession(dispatch)
			} */
		},
		[dispatch, videoScreenVisible]
	)

	useEffect(() => {
		if (stream) _stream.current = stream
		if (doctor_id !== "") _doctor_id.current = doctor_id
	}, [stream, doctor_id])

	const createPeer = useCallback(() => {
		return new Promise((resolve, reject) => {
			if ((stream || _stream.current) && _doctor_id.current) {
				setVideoScreenVisible(dispatch, true)

				_peer.current = new Peer({
					initiator: true,
					stream: stream,
					trickle: false,
					config: {
						iceServers: [
							{
								urls: STUN_URL,
							},
							{
								urls: TURN_URL,
								username: TURN_USERNAME,
								credential: TURN_CREDENTIAL,
							},
						],
					},
				})

				_peer.current.on("signal", (data) => {
					if (data.renegotiate || data.transceiverRequest) return
					socket.emit("patient_signal", { doctor_id: _doctor_id.current, patient_id: _id, data })
				})

				_peer.current.on("stream", (stream) => {
					setVideoScreenStatus(dispatch, "Connected")
					// setVideoScreenVisible(dispatch, true)
					setPeerVideoStream(dispatch, stream)
				})

				_peer.current.on("error", (error) => {
					setCallAccepted(dispatch, false)
					destroyPeer("Disconnected")
					signaled.current = false
					reject(error)
				})
				_peer.current.on("close", () => {
					destroyPeer("Disconnected")
				})

				_peer.current && resolve()
			}
		})
	}, [stream, _id, destroyPeer, dispatch, socket])

	useEffect(() => {
		if (peerSignal && _peer.current && !signaled.current) {
			_peer.current.signal(peerSignal)
			signaled.current = true
		}
	}, [peerSignal])

	useEffect(() => {
		if (!videoScreenVisible && _peer.current) {
			console.log("disconnected - sessionReady is handled here", _peer.current)
			destroyPeer("Doctor disconnected")
		}
	}, [videoScreenVisible, destroyPeer])

	useEffect(() => callAccepted && !_peer.current && createPeer(), [callAccepted, createPeer, dispatch])

	// ! **************************************************************************************************************************************** //

	// ! ********************************************************* Navigation Selection ********************************************************* //
	const activeConsultation = () => appointments.findIndex((i) => [SESSION.PAUSED, SESSION.STARTED].includes(i.status)) > -1

	/* 	const resumeConsultation = () => {
		addDialog(dispatch, {
			dialog: GenericDialog("You have an active session", "Resume consultation?"),
			onConfirm: () => {
				socket.emit("patient_ready", { appointment_id, patient_id: _id, id: 2 })
				startSession(dispatch)
			},
		})
	}
 */
	const handleNavigationChange = (event, newValue) => {
		newValue === 1
			? activeConsultation()
				? resumeConsultation(socket, dispatch, appointment_id, _id)
				: addDialog(dispatch, {
						dialog: GenericDialog("Start consultation with the next available dentist?"),
						onConfirm: () =>
							reviewSessions(appointments)
								.then(() => {
									updateSymptomDescription(dispatch, "")
									updateSymptomImage(dispatch, null)
									setActivePage(0) // start with Brief Information page first
									setViewPreConsultation(true)
								})
								.catch((error) => {
									if (error === INSUFFICIENT_SESSION_BLOCK) showError(dispatch, "You have a consultation request within 30 minutes")
									else if (error === SESSION_ACTIVE) resumeConsultation(socket, dispatch, appointment_id, _id)
								}),
				  })
			: setValue(newValue)
	}

	// ! **************************************************************************************************************************************** //

	const [activePage, setActivePage] = useState(0)

	const content = [
		{
			dialog: (
				<BriefSummary
					onImageCapture={() => setViewImageCapture(true)}
					onContinue={() => {
						setViewGetInfo(false)
						setViewPaymentScreen(true)
					}}
					onEditImage={() => setViewImageCapture(true)}
				/>
			),
			title: "Brief Summary",
			icon: info,
			forwardButton: {
				title: "Next",
				onClick: () => setActivePage(activePage + 1),
			},
			backButton: null,
		},
		{
			dialog: (
				<PaymentScreen
					close={(res) => {
						setViewPreConsultation(false)
						if (res === "succeeded") {
							patient_requestAppointment(dispatch, { _id, datetime: now() + MIN_3, text, image })
								.then(() => {
									loadAppointments(dispatch, _id)

									addDialog(dispatch, {
										dialog: GenericAlert("Requesting appointments from available doctors"),
									})
								})
								.catch((error) => showError(dispatch, error))
						}
					}}
				/>
			),
			title: "Payment",
			icon: creditcard,
			buttonTitle: "Pay",
			backButton: {
				title: "Back",
				onClick: () => setActivePage(activePage - 1),
			},
			forwardButton: null,
		},
	]

	return (
		<div style={styles.mainContainer}>
			<div style={styles.body}>
				<ModalScreen
					icon={content[activePage].icon}
					open={viewPreConsultation}
					close={() => setViewPreConsultation(false)}
					closeIcon={true}
					content={<Container content={content} activePage={activePage} resetPage={() => setActivePage(0)} />}
					title={content[activePage].title}
				/>
				<ModalScreen
					icon={camera}
					open={viewImageCapture}
					close={() => setViewImageCapture(false)}
					closeIcon={true}
					content={
						<ImageCapture
							onAccept={(res) => {
								updateSymptomImage(dispatch, res)
								setViewImageCapture(false)
							}}
							close={() => setViewImageCapture(false)}
						/>
					}
					title={"Capture image"}
				/>
				<div>{pages[page === 2 ? 1 : page]}</div> {/* change page to 1 as pages array contains only 2 items */}
				<div className="bottomNavigator">
					<BottomNavigation showLabels page={page} onChange={handleNavigationChange} style={{ width: "100%" }}>
						<BottomNavigationAction label="Appointments" icon={<GoDashboard />} />
						<BottomNavigationAction label="Start Consultation" icon={<MdVideoCameraFront />} />
						<BottomNavigationAction label="Profile" icon={<FaRegUser />} />
					</BottomNavigation>
				</div>
			</div>
		</div>
	)
}

const styles = {
	mainContainer: {
		height: "100vh",
		width: "100vw",
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		position: "relative", //
	},
	body: {
		display: "flex",
		flexDirection: "column",
		justifyContent: "space-between",
		alignItems: "center",
		height: "100%",
		width: "100%",
		position: "relative",
	},
}
export default Main
