import { DateTime } from "luxon"
import { removeDialog } from "./context"
const MAINCOLOR = "#0a6e8a" // another declaration in helpers.js

const basicStyle = {
	customClass: {
		container: "sweetalert",
	},
	confirmButtonColor: MAINCOLOR,
	denyButtonColor: "silver",
	allowOutsideClick: false,
}

// -------------------------------- SweetAlert2 Error Dialog Box

// Generic Messages

export const GenericError = (msg) => ({
	...basicStyle,
	title: "Error",
	html: msg,
	focusConfirm: true,
})

export const GenericDialog = (msg, title) => ({
	...basicStyle,
	title: title ? title : "Confirm",
	html: msg,
	showDenyButton: true,
	showCancelButton: false,
	confirmButtonText: "Yes",
	denyButtonText: "No",
})

export const GenericAlert = (msg, title) => ({
	...basicStyle,
	title: title && title,
	html: msg,
	/* 	showDenyButton: false,
	showCancelButton: false,
	confirmButtonText: "Yes",
	denyButtonText: "No", */
})

export const ModifyAppointment = (data) => {
	let msg = ""

	const norefund = "No refunds will be made as your appointment is in less than 30 mins"
	const cancellationfees = "A Cancellation Fee of $15 will be charged as your appointment is in less than 24 hours"

	if (data.status !== "confirmed") msg = ""
	else {
		// free cancellation if it is within 30 mins of booking, or more than 24 hours prior to the appointment
		const timeleft = data.time - DateTime.now().toMillis()
		const elapsedTimeFromBooking = DateTime.now().toMillis() - data.bookingTime

		msg = elapsedTimeFromBooking < 1800000 ? "" : timeleft < 1800000 ? norefund : timeleft < 86400000 ? cancellationfees : ""
	}

	return {
		...basicStyle,
		title: "Modify appointment?",
		html: msg,
		showDenyButton: true,
		showCancelButton: false,
		confirmButtonText: "Yes",
		denyButtonText: `No`,
	}
}

export const ExtendSessionRequestCountdown = (Swal, extendBy, id, dispatch) => {
	let timerInterval
	return {
		...basicStyle,
		title: "This session is chargeable",
		html: "Extend session by " + extendBy + "mins<p>Do you accept?<p><time></time>",
		showDenyButton: true,
		showCancelButton: false,
		confirmButtonText: "Yes",
		denyButtonText: "No",
		timer: 60000,
		didOpen: () => {
			const content = Swal.getHtmlContainer()

			timerInterval = setInterval(() => {
				content.querySelector("time").textContent = (Swal.getTimerLeft() / 1000).toFixed(0)
			}, 100)
		},
		willClose: () => {
			removeDialog(dispatch, id)
			clearInterval(timerInterval)
		},
	}
}
