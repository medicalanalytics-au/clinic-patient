import { createRef, useContext, useEffect, useState } from "react"
import "../../App.css"
import PropTypes from "prop-types"
import { DateTime } from "luxon"

// material ui
import { Button } from "@mui/material"

// network
import { patient_cancelAppointment } from "../../utils/network"

// context
import { ProfileContext } from "../../App"

// Swal
import { addDialog } from "../../utils/context"
import { GenericDialog, GenericError } from "../../utils/sweetalertDialogs"

// custom functions
import { loadAppointments, useResponsiveMedia } from "../../utils/helpers"

// constants
import { center, FULLPAYMENTAMOUNT, HOUR_24, MAINCOLOR, MEDIA, MIN_15, ORIENTATION, REQUESTSTATUS, SESSION } from "../../utils/constants"

const AppointmentDetails = (props) => {
	const media = useResponsiveMedia()
	const mobilePortrait = () => media.type === MEDIA.MOBILE && media.orientation === ORIENTATION.PORTRAIT

	const { dispatch } = useContext(ProfileContext)
	const [timer, setTimer] = useState(0)
	const timerRef = createRef()

	const { PENDING_PAYMENT, CONFIRMED, CANCELLED } = REQUESTSTATUS
	const { STARTED, COMPLETED } = SESSION

	useEffect(() => {
		const now = DateTime.now().toMillis()

		if (props.selected && props.selected.datetime - now < HOUR_24) {
			setTimer(MIN_15 - (DateTime.now().toMillis() - props?.selected?.confirmationDate) || 0) // set to 0 if request have not been confirmed
		}
	}, [props])

	useEffect(() => {
		if (timer > 0) {
			let timerInterval = setInterval(() => {
				const now = DateTime.now().toMillis()
				const from = props?.selected?.confirmationDate

				setTimer(MIN_15 - (now - from))
			}, 1000)
			return () => clearInterval(timerInterval)
		}
	}, [timer, props.selected])

	const millisToMinutesAndSeconds = (millis) => {
		// return result in <div> to ensure that the positioning does not move during countdown
		let minutes = Math.floor(millis / 60000)
		let seconds = ((millis % 60000) / 1000).toFixed(0)

		if (seconds === "60") {
			minutes++
			seconds = "0"
		}

		return minutes <= 0 && seconds <= 0 ? (
			"0:00"
		) : (
			<div style={{ width: "40px", display: "flex", justifyContent: "space-between", color: millis > 60000 ? "black" : "red" }}>
				<div style={{ width: "15px", textAlign: "right" }}>{minutes}</div>
				<div>:</div>
				<div style={{ width: "15px", textAlign: "left" }}>{(parseInt(seconds) < 10 ? "0" : "") + seconds}</div>
			</div>
		)
	}

	return (
		<div style={styles.mainContainer}>
			<div style={{ display: "flex", flexDirection: "column" }}>
				<div
					style={{
						display: "flex",
						flexDirection: mobilePortrait() ? "column" : "row",
						justifyContent: "space-between",
						marginLeft: "30px",
						marginRight: "30px",
						marginTop: "50px",
					}}
				>
					<div>
						<div style={styles.detailsLine}>
							<div style={styles.detailsTitle}>Date</div>
							<div>{DateTime.fromMillis(props?.selected?.datetime || 0).toLocaleString(DateTime.DATE_SHORT)}</div>
						</div>
						<div style={styles.detailsLine}>
							<div style={styles.detailsTitle}>Time</div>
							<div>{DateTime.fromMillis(props?.selected?.datetime || 0).toLocaleString(DateTime.TIME_SIMPLE)}</div>
						</div>

						{props.selected && (
							<div style={{ ...styles.detailsLine, justifyContent: "flex-start", alignItems: "center" }}>
								<div style={styles.detailsTitle}>Status</div>
								<div style={{ display: "flex", flexDirection: "row", ...center }}>
									<div style={{ color: MAINCOLOR, fontWeight: "bold", marginRight: "10px" }}>
										{props.selected.status === PENDING_PAYMENT ? "PENDING PAYMENT" : props.selected.status.toUpperCase()}
									</div>
									{(props.selected.status === PENDING_PAYMENT || props.selected.status === SESSION.PAUSED) && (
										<Button
											variant="outlined"
											onClick={() => {
												props.selected.status === PENDING_PAYMENT ? props.paymentOpen() : props.resumeSession()
											}}
										>
											{props.selected.status === PENDING_PAYMENT ? "Pay now" : "Resume"}
										</Button>
									)}
								</div>
							</div>
						)}
						<div style={styles.detailsLine}>
							<div style={styles.detailsTitle}>Booked On</div>
							<div>{DateTime.fromMillis(props?.selected?.bookingDate || 0).toLocaleString(DateTime.DATETIME_SHORT)}</div>
						</div>
					</div>
					<div style={{ backgroundColor: "#f1f0f0", padding: "10px", borderRadius: "5px", ...center, flexDirection: "column" }}>
						<div style={styles.detailsLine}>
							<div style={styles.detailsTitle}>Total Payable:</div>
							<div>$ {props?.selected?.payable}</div>
						</div>

						<div style={styles.detailsLine}>
							<div style={styles.detailsTitle}>Amount Paid:</div>
							<div>$ {props?.selected?.paid}</div>
						</div>
					</div>
				</div>
				<div style={{ ...center, marginTop: "50px", flexDirection: "column" }}>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							visibility: timer > 0 && props?.selected?.status === CONFIRMED ? "visible" : "hidden",
						}}
					>
						<div style={{ textAlign: "center", margin: "10px" }}>Appointment can be cancelled without charges within</div>
						<div ref={timerRef} style={{ fontWeight: "bold" }}>
							{millisToMinutesAndSeconds(timer)}
						</div>
					</div>
					{props?.selected?.status !== COMPLETED && props?.selected?.status !== CANCELLED && props?.selected?.status !== STARTED && (
						<Button
							style={{ marginTop: "30px" }}
							onClick={() => {
								const freeCancelMsg = "Cancel this appointment?"
								const norefundMsg = "No refunds will be made as your appointment is in less than 30 mins"
								const depositCharged = "A Cancellation Fee of $15 will be charged as your appointment is in less than 24 hours"

								let charge = 0

								const now = DateTime.now().toMillis()
								const { status, _id, patient_id, confirmationDate, datetime } = props.selected

								charge =
									status === "confirmed"
										? now - confirmationDate <= 900000 || datetime - now > 86400000 // within 15 mins of confirmation or more than 24 hours to appointment
											? 0
											: datetime - now > 1800000 // more than 30 mins
											? 15
											: FULLPAYMENTAMOUNT // less than 30 mins
										: 0 // appt have not been confirmed

								addDialog(dispatch, {
									dialog: GenericDialog(charge === 0 ? freeCancelMsg : 15 ? depositCharged : norefundMsg),
									onConfirm: () => {
										patient_cancelAppointment(dispatch, _id, charge) // false for depositWithheld
											.then(() => {
												loadAppointments(dispatch, patient_id)
												props.close()
											})
											.catch((error) =>
												addDialog(dispatch, {
													dialog: GenericError(error),
												})
											)
									},
								})
							}}
						>
							Cancel Appointment
						</Button>
					)}
				</div>
			</div>
			<div style={{ display: "flex", justifyContent: "flex-end", marginRight: "10px" }}>
				<Button variant="contained" onClick={props.close}>
					Close
				</Button>
			</div>
		</div>
	)
}
AppointmentDetails.propTypes = {
	selected: PropTypes.object,
	open: PropTypes.bool,
	paymentOpen: PropTypes.func,
	resumeSession: PropTypes.func,
	close: PropTypes.func,
}

const styles = {
	mainContainer: {
		height: "100%",
		width: "100%",
		display: "flex",
		flexDirection: "column",
		justifyContent: "space-between",
		// alignItems: "center",
		color: "black",
	},
	/* body: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		margin: "10px",
		height: "100%",
		padding: "10px",
		borderRadius: "10px",
		border: '1px solid green'
	}, */
	detailsLine: {
		display: "flex",
		flexDirection: "row",
		marginBottom: "10px",
		justifyContent: "flex-start",
		width: "100%",
	},
	detailsTitle: {
		fontWeight: "bold",
		marginRight: "10px",
		width: "150px",
	},
	/* statusButtonContainer: {
		display: "flex",
		justifyContent: "center",
		marginBottom: "40px",
		flexDirection: "column",
	},
	statusButton: {
		padding: "10px",
		borderRadius: "10px",
		marginTop: "30px",
	}, */
}
export default AppointmentDetails
