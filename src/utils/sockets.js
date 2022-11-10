import Swal from "sweetalert2"
import { END_SESSION, START_SESSION } from "./constants"
import {
	startSession,
	updateAppointmentList,
	addDialog,
	removeDialog,
	setMessages,
	showSnack,
	endSession,
	setSessionPaused,
	setSockets,
	setCallAccepted,
	setConsultation,
	setPeerSignal,
	setVideoScreenStatus,
	setVideoMode,
	sessionDisconnected,
	setVideoScreenVisible,
	setSessionEndTime,
} from "./context"
import { initializeConsultation, loadAppointments, resumeConsultation, showError, startConsultation } from "./helpers"
import { common_downloadMessages, patient_getAppointmentDetails } from "./network"
import { ExtendSessionRequestCountdown, GenericAlert, GenericDialog } from "./sweetalertDialogs"

export const socketFunctions = (socket, id, dispatch) => {
	/**
	 * @param id {string} Patient ID
	 */
	socket.onAny((event, ...args) => {
		setSockets(dispatch, socket)
		console.log({ event, args })
	})

	socket.on("identify", (serverSocketId) => {
		// ! currently serverSocketId args is unused
		socket.emit("identify", { client: "patient", id })
	})

	socket.on("appointment_request_accepted", () => {
		addDialog(dispatch, {
			dialog: GenericAlert("Your appointment had been confirmed"),
		})
		loadAppointments(dispatch, id)
	})

	socket.on("appointment_acceptance_cancelled", (appointment_id) => {
		// ! currently appointment_id args is unused

		addDialog(dispatch, {
			dialog: GenericAlert(
				"Due to unforeseen circumstances, the doctor is unable to take up your appointment slot. We are trying our best to assign you to another available doctor"
			),
		})

		loadAppointments(dispatch, id)
	})

	socket.on("appointments_list_updated", (args) => {
		updateAppointmentList(dispatch, args)
	})

	socket.on("request_expired", (args) => {
		removeDialog(dispatch)

		addDialog(dispatch, {
			dialog: GenericAlert(
				"All our doctors are currently engaged. We will respond to your appointment request within the next 15 minutes.\nPlease check your email for updates"
			),
		})

		loadAppointments(dispatch, id)
	})

	socket.on("payment_timeout", (args) => {
		removeDialog(dispatch)

		addDialog(dispatch, {
			dialog: GenericAlert("Appointment had been cancelled due to payment timeout"),
		})

		loadAppointments(dispatch, id)
	})

	socket.on("extendSessionTimeRequest", (args) => {
		addDialog(dispatch, {
			dialog: ExtendSessionRequestCountdown(Swal, args.extendBy, id, dispatch),
			id,
			onConfirm: () => socket.emit("patient_extendSessionTimeRequest_accepted", args), // send "appointment_id" and "extendBy"
			onDeny: () => socket.emit("patient_extendSessionTimeRequest_rejected", args.appointment_id),
			onDismiss: () => socket.emit("patient_extendSessionTimeRequest_timeout", args.appointment_id),
		})
	})

	socket.on("notification", (args) => {
		console.log("notification received")
		loadAppointments(dispatch, id)

		// ! START_SESSION is now obsolete as doctor will initiate immediate consultation (see "start_appointment" socket notification)
		if (args.signal === START_SESSION) {
			console.log("start")
			patient_getAppointmentDetails(dispatch, args.appointment_id)
				.then((res) => {
					setConsultation(dispatch, res)
					resumeConsultation(socket, dispatch, args.appointment_id, res.patient_id)
				})
				.catch((error) => showError(dispatch, error))

			// * this will trigger useEffect in VideoScreen that will prompt with a dialog
			// * appointmentId will update context appointment_id

			// resumeConsultation()
			// initializeConsultation(dispatch, args.appointment_id)
		} else if (args.signal === END_SESSION) {
			endSession(dispatch)

			addDialog(dispatch, {
				id: args.appointment_id,
				removePreviousDialogs: true,
				dialog: GenericAlert("Consultation ended"),
			})
		}

		socket.emit("patient_notification_received", { notification_id: args.notification_id })
	})

	socket.on("mail", (mail) => {
		common_downloadMessages(dispatch, mail.to_id)
			.then((res) => {
				setMessages(dispatch, res)
				showSnack(dispatch, "You have mail")
			})
			.catch((error) => showError(dispatch, error))
	})

	socket.on("missed_appointment_accepted", (id) => {
		addDialog(dispatch, {
			dialog: GenericAlert("Your appointment had been confirmed"),
		})
		loadAppointments(dispatch, id)
	})

	socket.on("video_mode_request", (args) => {
		const { doctor_id, patient_id } = args

		addDialog(dispatch, {
			dialog: GenericDialog("Request to switch to video mode"),
			onConfirm: () => {
				setVideoMode(dispatch, true)
				socket.emit("video_mode_accepted", { doctor_id, patient_id })
			},
			onDeny: () => socket.emit("video_mode_declined", { doctor_id }),
		})
		loadAppointments(dispatch, id)
	})

	socket.on("video_mode_switch", () => {
		console.log("video_mode_switch")
		setVideoMode(dispatch, true)
	})

	socket.on("doctor_pause_consultation", () => {
		setSessionPaused(dispatch, true)
	})

	socket.on("doctor_consultation_resume", () => {
		setSessionPaused(dispatch, false)
	})

	socket.on("doctor_call_accept", (id) => {
		setCallAccepted(dispatch, id)
	})

	socket.on("signal", (signal) => {
		setPeerSignal(dispatch, signal)
	})

	socket.on("start_consultation", (args) => {
		const { appointment_id, patient_id } = args

		startConsultation(socket, dispatch, appointment_id, patient_id)
	})

	socket.on("doctor_ready", (args) => {
		const { appointment_id, patient_id } = args

		startConsultation(socket, dispatch, appointment_id, patient_id)
	})

	socket.on("peer_disconnected", () => {
		console.log("disconnected is handled here")
		setVideoScreenStatus(dispatch, "Doctor disconnected")
		setVideoScreenVisible(dispatch, false)
	})

	socket.on("session_extended", (args) => {
		setSessionEndTime(dispatch, args.endTime)
		addDialog(dispatch, {
			dialog: GenericAlert("Session had been extended by " + args.extendBy + " minutes"),
		})
	})
}
