import { useContext, useEffect, useState } from "react"
import "../../App.css"
import PropTypes from "prop-types"
import { DateTime, Duration } from "luxon"

// material ui
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material"

// icons
import creditcard from "../../images/creditcard.png"
import appointment from "../../images/appointment.png"
import start_consultation from "../../images/start_consultation.png"

// context
import { startSession, setVideoScreenStatus, setWelcomeScreenShown, showAddAppointmentDialog } from "../../utils/context"
import { ProfileContext } from "../../App"

// network
import { patient_paymentComplete } from "../../utils/network"

// Swal
import { addDialog } from "../../utils/context"
import { GenericError } from "../../utils/sweetalertDialogs"

import { loadAppointments, showError, useResponsiveMedia } from "../../utils/helpers"

import { BLACK, center, MAINCOLOR_LIGHT, MEDIA, ORIENTATION, PAYABLE, REQUESTSTATUS, WHITE, MAINCOLOR } from "../../utils/constants"

// custom components
import AppointmentDetails from "./AppointmentDetails"
import AddAppointment from "./AddAppointment"
import Payment from "./Payment"
import ModalScreen from "../Common/ModalScreen"

const Cell = ({ text, header, width, bold, hideMobile, center }) => {
	const media = useResponsiveMedia()
	const mobilePortrait = () => media.type === MEDIA.MOBILE && media.orientation === ORIENTATION.PORTRAIT

	const style = {
		padding: "5px",
		fontWeight: header || bold ? "bold" : "normal",
		width: width || "auto",
		backgroundColor: header ? MAINCOLOR_LIGHT : "white",
		color: header ? WHITE : BLACK,
		textAlign: center ? "center" : "left",
	}

	const InnerCell = () => <TableCell style={style}>{text}</TableCell>

	return !hideMobile ? <InnerCell /> : !mobilePortrait() ? <InnerCell /> : null
}

const ElapsedTime = ({ duration }) => {
	const elapsed = Duration.fromMillis(duration).shiftTo("hours", "minutes", "seconds").toObject()
	const { hours, minutes, seconds } = elapsed
	return (
		//
		<div style={{ display: "flex", flexDirection: "row" }}>
			{hours ? <div style={{ marginRight: "3px" }}>{hours + " hr "} </div> : ""}
			{minutes ? <div style={{ marginRight: "3px" }}>{minutes + "m"} </div> : ""}
			{seconds ? <div>{Math.floor(seconds) + "s"} </div> : ""}
		</div>
	)
}

ElapsedTime.propTypes = {
	duration: PropTypes.number,
}

/* const Time = ({ data }) => {
	const [rendered, setRendered] = useState(<div></div>)

	const { PENDING_PAYMENT, REQUESTED, CONFIRMED } = REQUESTSTATUS
	const { STARTED, COMPLETED } = SESSION

	useEffect(() => {
		const renderer = (duration) => {
			if (duration > 0) {
				const elapsed = Duration.fromMillis(duration).shiftTo("days", "hours", "minutes", "seconds").toObject()
				const { days, hours, minutes, seconds } = elapsed
				const renderTime = (min, renderSeconds = true) =>
					min > 1
						? min === 59
							? "1 hr"
							: min + 1 + " mins"
						: min === 1
						? "1 min " + (renderSeconds ? (seconds > 0 ? pluralize(Math.floor(seconds), "sec") : "") : "")
						: renderSeconds
						? pluralize(Math.floor(seconds), "sec")
						: ""

				return (
					<span>
						{days > 0 ? pluralize(days, "day") : hours > 0 ? pluralize(hours, "hr") + " " + renderTime(minutes, false) : renderTime(minutes)}
					</span>
				)
			} else {
				return <span />
			}
		}

		const getDueTime = (data) => {
			const { datetime, status, acceptedDate, endDate } = data

			return status === REQUESTED
				? datetime - MIN_2
				: status === PENDING_PAYMENT
				? acceptedDate + MIN_2
				: status === STARTED
				? endDate
					? endDate
					: datetime + MIN_15
				: datetime
		}

		const interval = setInterval(() => {
			const _now = now()
			setRendered(renderer(getDueTime(data) - _now))
		}, 1000)

		return () => clearInterval(interval)
	}, [data, PENDING_PAYMENT, REQUESTED, STARTED])

	const label = (status) => {
		return status === (PENDING_PAYMENT || REQUESTED)
			? "Request expiring"
			: status === COMPLETED
			? "Duration"
			: status === STARTED
			? "Ending in"
			: status === CONFIRMED
			? "Starting in"
			: ""
	}

	return (
		<div style={{ ...center }}>
			<div style={{ marginRight: "3px" }}>{label(data.status)}</div>
			{data.status === COMPLETED ? <ElapsedTime duration={data.completedDate - data.datetime} /> : <div>{rendered}</div>}
		</div>
	)
}
 */
Cell.propTypes = {
	text: PropTypes.string,
	width: PropTypes.string,
	header: PropTypes.bool,
	hideMobile: PropTypes.bool,
	bold: PropTypes.bool,
	center: PropTypes.bool,
}

const WelcomeScreen = () => {
	return (
		<div style={{ height: "100%", width: "100%", ...center, flexDirection: "column" }}>
			<div style={{ fontSize: "25px", fontWeight: "bold", marginBottom: "20px" }}>You have no appointments</div>
			<img src={start_consultation} alt="Start Consultation" />
			<div style={{ marginTop: "20px", marginBottom: "20px" }}>Begin by clicking on the Start Consultation icon</div>
		</div>
	)
}
const Appointments = () => {
	const { state, dispatch } = useContext(ProfileContext)

	const { _id, appointments, consultation, socket, addAppointmentDialogOpen, welcomeScreenShown } = state
	const { appointment_id } = consultation

	const [showWelcomeScreen, setShowWelcomeScreen] = useState(false)

	const [showDetails, setShowDetails] = useState(false)
	const [selected, setSelected] = useState(-1)

	const [paymentOpen, setPaymentOpen] = useState(false)

	const { PENDING_PAYMENT } = REQUESTSTATUS

	const media = useResponsiveMedia()
	const mobilePortrait = () => media.type === MEDIA.MOBILE && media.orientation === ORIENTATION.PORTRAIT

	useEffect(() => {
		loadAppointments(dispatch, _id)
			.then((res) => res.length === 0 && setShowWelcomeScreen(true))
			.catch((error) => showError(error))
	}, [_id, dispatch])

	const handlePayment = () => {
		patient_paymentComplete(dispatch, appointments[selected]._id, PAYABLE)
			.then(() => loadAppointments(dispatch, _id, "Appointments - handlePayment"))
			.catch((error) =>
				addDialog(dispatch, {
					dialog: GenericError(error),
				})
			)
	}

	const statusLabel = (status) => (status === PENDING_PAYMENT ? "PENDING PAYMENT" : status.toUpperCase())

	return (
		<div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
			<ModalScreen
				icon={appointment}
				open={showWelcomeScreen && !welcomeScreenShown}
				close={() => {
					setShowWelcomeScreen(false)
					setWelcomeScreenShown(dispatch)
				}}
				closeIcon={true}
				content={<WelcomeScreen />}
				title={mobilePortrait() ? "" : "Welcome to Online Dental Consultation"}
			/>

			<ModalScreen
				icon={creditcard}
				open={paymentOpen}
				close={() => setPaymentOpen(false)}
				closeIcon={true}
				content={<Payment onPaid={handlePayment} close={() => setPaymentOpen(false)} />}
				title={"Payment"}
			/>

			<ModalScreen
				icon={appointment}
				open={addAppointmentDialogOpen}
				close={() => showAddAppointmentDialog(dispatch, false)}
				closeIcon={true}
				content={<AddAppointment close={() => showAddAppointmentDialog(dispatch, false)} />}
				title={"Request Appointment"}
			/>

			<ModalScreen
				icon={appointment}
				open={showDetails}
				close={() => setShowDetails(false)}
				closeIcon={true}
				content={
					<AppointmentDetails
						selected={appointments[selected]}
						close={() => setShowDetails(false)}
						paymentOpen={() => setPaymentOpen(true)}
						resumeSession={() => {
							setVideoScreenStatus(dispatch, "Resuming session. Waiting for response from doctor")
							socket.emit("patient_consultation_resume", appointment_id)
							startSession(dispatch)
						}}
					/>
				}
				title={"Appointment Details"}
			/>

			<TableContainer className="appointmentListTable">
				<Table stickyHeader size="small">
					<TableHead>
						<TableRow>
							<Cell text="Date" header />
							<Cell text="Time" header />
							<Cell text="Status" header center />
							<Cell text="Paid" header hideMobile />
							<Cell text="Payable" header hideMobile />
							<Cell text="Booking Date" header hideMobile />
						</TableRow>
					</TableHead>

					<TableBody>
						{appointments.map((i, index) => {
							return (
								<TableRow
									key={i._id}
									hover
									onClick={() => {
										setSelected(index)
										setShowDetails(true)
									}}
								>
									<Cell text={DateTime.fromMillis(i.datetime).toLocaleString(DateTime.DATE_SHORT)} />

									<Cell text={DateTime.fromMillis(i.datetime).toLocaleString(DateTime.TIME_24_SIMPLE)} />

									<TableCell style={{ ...center }}>
										<div style={{ width: "100%", ...center, flexDirection: "column" }}>
											<div style={{ fontSize: "12px", letterSpacing: "0.1em", color: MAINCOLOR, fontWeight: "bold" }}>
												{statusLabel(i.status).toUpperCase()}
											</div>
										</div>
									</TableCell>
									<Cell text={"$" + i.paid} hideMobile />
									<Cell text={"$" + i.payable} hideMobile />
									<Cell text={DateTime.fromMillis(i.bookingDate).toLocaleString(DateTime.DATETIME_SHORT)} hideMobile />
								</TableRow>
							)
						})}
					</TableBody>
				</Table>
			</TableContainer>
		</div>
	)
}

export default Appointments
