import { useContext, useEffect } from "react"
import "../../App.css"
import PropTypes from "prop-types"

// material ui
import { IconButton, Tooltip, useMediaQuery, useTheme } from "@mui/material"

// react icons
import { RiLogoutCircleLine } from "react-icons/ri"

// Swal
import { addDialog, endSession } from "../../utils/context"
import { GenericDialog } from "../../utils/sweetalertDialogs"

// context
import { startSession } from "../../utils/context"
import { ProfileContext } from "../../App"

// custom components
import Appointments from "../Appointments/Appointments"
import VideoScreen from "../Consultation/VideoScreen/VideoScreen"

// custom functions
import { loadAppointments } from "../../utils/helpers"

const Dashboard = (props) => {
	const theme = useTheme()
	const mobile = useMediaQuery(theme.breakpoints.down("sm"))

	const value = useContext(ProfileContext)
	const { state, dispatch } = value
	const { _id, email, sessionReady, peer, socket, consultation } = state
	const { appointment_id } = consultation

	useEffect(() => {
		loadAppointments(dispatch, _id)
	}, [_id, dispatch])

	useEffect(() => {
		// TODO PLACE THIS IN MAIN.JS
		// * socket resume signal is handled here to ensure that it is available app-wide
		const handler = () => {
			if (!peer) {
				addDialog(dispatch, {
					dialog: GenericDialog("Resume session?"),
					onConfirm: () => {
						// socket.emit("patient_initiate_call", { appointment_id, patient_id: _id })
						socket.emit("patient_ready", { appointment_id, patient_id: _id, id: 4 })
						startSession(dispatch)
					},
				})
			}
		}

		socket.on("doctor_consultation_resume", handler)
		return () => socket.off("doctor_consultation_resume", handler)
	}, [socket, dispatch, _id, appointment_id, peer])

	const styles = {
		...subStyles,
		notificationText: {
			...supportStyles.notificationText,
			fontSize: mobile ? "10px" : "14px",
		},
	}

	return (
		<div className="pages" style={styles.mainContainer}>
			{/* <DashboardModal open={modalOpen} close={() => setModalOpen(false)} title={modalTitle} content={modalContent} mobile={mobile} /> */}

			<VideoScreen
				open={sessionReady}
				close={() => {
					endSession(dispatch)
					loadAppointments(dispatch, _id)
				}}
			/>

			<div className="dashboardInnerContainer">
				<div style={styles.header}>
					<div style={{ marginLeft: "10px" }}>APPOINTMENTS</div>
					<div>
						<Tooltip title="Logout">
							<IconButton>
								<RiLogoutCircleLine />
							</IconButton>
						</Tooltip>
					</div>
				</div>
				<div style={styles.body}>
					<Appointments />
				</div>
				<div className="dashboardEmailDisplay">{email}</div>
			</div>
		</div>
	)
}

Dashboard.propTypes = {
	email: PropTypes.string,
}

const supportStyles = {
	notificationText: {
		marginBottom: "10px",
	},
}

const subStyles = {
	mainContainer: {
		height: "100vh",
		width: "100vw",
		top: "0px",
		left: "0px",
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		position: "absolute",
		zIndex: 1,
		flexDirection: "column",
	},
	header: {
		margin: "10px",
		fontWeight: "bold",
		color: "black",
		width: "98%",
		letterSpacing: "0.2em",
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	body: {
		margin: "10px",
		width: "98%",
		height: "100%",
		letterSpacing: "0.1em",
		position: "relative",
	},
	dashboxRow: {
		display: "flex",
		flexDirection: "row",
		padding: "10px",
		margin: "20px",
	},
	dashboxIconContainer: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
	},
	dashboxContent: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "flex-start",
		padding: "10px",
		width: "100%",
		flexDirection: "column",
	},
	dashboxTextContainer: {
		display: "flex",
		flexDirection: "column",
	},
	dashboxTextTitle: {
		fontWeight: "bold",
		marginBottom: "10px",
	},
	notificationAlert: {
		color: "#ffbf00",
		fontWeight: "bold",
		fontSize: "20px",
		marginRight: "10px",
	},
}
export default Dashboard
