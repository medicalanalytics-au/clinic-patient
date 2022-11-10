import { useCallback, useEffect, useState } from "react"
import { DateTime, Duration } from "luxon"

// material ui
import { createTheme } from "@mui/material/styles"

// context
import { addDialog, setSockets, setConsultation, updateAppointmentList, startSession, setVideoScreenStatus } from "./context"

// network
import { patient_getAppointmentDetails, patient_loadAppointments2, SERVER } from "./network"

// Swal
import { GenericDialog, GenericError } from "./sweetalertDialogs"

// sockets
import { socketFunctions } from "./sockets"
import { io } from "socket.io-client"
import { INSUFFICIENT_SESSION_BLOCK, MAINCOLOR, MEDIA, MIN_30, ORIENTATION, REQUESTSTATUS, SESSION, SESSION_ACTIVE } from "./constants"

export const now = () => DateTime.now().toMillis()
export const pluralize = (value, word) => value + " " + word + (value !== 1 ? "s" : "")

export const useResponsiveMedia = () => {
	const [media, setMedia] = useState({
		width: 0,
		height: 0,
		type: "mobile",
		orientation: "portrait",
	})

	const handleWindowResize = useCallback(() => {
		const width = window.innerWidth
		const height = window.innerHeight

		const orientation = width > height ? "landscape" : "portrait"
		const smallerDim = width < height ? width : height
		const largerDim = width > height ? width : height

		const type = smallerDim < 768 ? "mobile" : largerDim > 1366 ? "desktop" : smallerDim < 1024 ? "tablet" : largerDim === 1366 ? "tablet" : "desktop"

		setMedia({
			width,
			height,
			type,
			orientation,
		})
	}, [])

	useEffect(() => {
		handleWindowResize()
		window.addEventListener("resize", handleWindowResize)
		return () => window.removeEventListener("resize", handleWindowResize)
	}, [handleWindowResize])

	return media
}

export const mobile = (media) => media.type === MEDIA.MOBILE
export const portrait = (media) => media.orientation === ORIENTATION.PORTRAIT
export const mobilePortrait = (media) => media.type === MEDIA.MOBILE && media.orientation === ORIENTATION.PORTRAIT
export const mobileLandscape = (media) => media.type === MEDIA.MOBILE && media.orientation === ORIENTATION.LANDSCAPE

export const getDuration = (ms) => Duration.fromMillis(ms).shiftTo("years", "months", "days", "hours", "minutes", "seconds").toObject()

export const validEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.toLowerCase())

export const validPassword = (password) => /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(password)

export const THEME = createTheme({
	palette: {
		primary: { main: "#0a6e8a" }, // main color
	},
	typography: {
		fontFamily: `"Quicksand", sans-serif`,
		color: MAINCOLOR,
	},
})

export const loadAppointments = (dispatch, _id, caller) => {
	return new Promise((resolve, reject) => {
		patient_loadAppointments2(dispatch, _id)
			.then((res) => {
				updateAppointmentList(dispatch, res)
				resolve(res)
			})
			.catch((error) => {
				addDialog(dispatch, {
					dialog: GenericError(error),
				})
				reject(error)
			})
	})
}

export const decodeMilliseconds = (millis) => {
	const hr1 = 3600000

	let hours = Math.floor(millis / hr1)
	let minutes = Math.floor((millis - hours * hr1) / 60000)
	let seconds = parseInt(((millis % 60000) / 1000).toFixed(0))

	if (seconds === "60") {
		minutes++
		seconds = "0"
	}

	return {
		hours,
		minutes,
		seconds,
	}
}

export const developmentMode = true

export const PARAMS = {
	// ADDED_TIME: developmentMode ? 1 : Math.ceil(DateTime.now().minute / 5) * 5 - DateTime.now().minute + 5, // * min time is 5 mins ahead to ensure prompt payment
	ADDED_TIME: 0,
}

export const createSocket = (id, dispatch, state) => {
	let socket = io.connect(SERVER, { transports: ["websocket"], allowUpgrades: false })
	// let socket = io.connect(SERVER, { forceNew: true })
	setSockets(dispatch, socket)
	socketFunctions(socket, id, dispatch, state) // assign socket functions

	return socket
}

export const log = (level, ...rest) => {
	const LOGLEVEL = 2 // change this for appropriate level, 0 = no logs

	// remove quotes from object property
	const string = (obj) => JSON.stringify(obj, null, 2).replace(/^[\t ]*"[^:\n\r]+(?<!\\)":/gm, (match) => match.replace(/"/g, ""))

	if (LOGLEVEL > 0) {
		let str = ""
		if (level >= LOGLEVEL) {
			for (let i = 0; i <= rest.length - 1; i++) {
				typeof rest[i] === "object" ? (str += (i > 0 ? ", " : "") + string(rest[i])) : (str += (i > 0 ? ", " : "") + rest[i])
			}
		}

		level >= LOGLEVEL && console.log(str)
	}
}

export const isToday = (date) => DateTime.fromMillis(date).toISODate() === DateTime.local().toISODate()

export const unreadMessages = (state) => {
	const { _id, messages } = state
	return messages.reduce((total, current) => {
		current.from_id !== _id && !current.read && total++
		return total
	}, 0)
}

export const todaysAppointments = (appointments) =>
	appointments.reduce((total, current) => {
		isToday(current.datetime) && !current.completedDate && total++
		return total
	}, 0)

export const upcomingAppointments = (appointments) =>
	appointments.reduce((total, current) => {
		!current.completedDate && total++
		return total
	}, 0)

export const reviewSessions = (appointments) => {
	const { PENDING_PAYMENT, CONFIRMED, REQUESTED } = REQUESTSTATUS

	return new Promise((resolve, reject) => {
		if (appointments.length === 0) resolve() // no appointments, just resolve
		else {
			if (appointments.findIndex((i) => i.status === PENDING_PAYMENT) > -1) {
				reject(PENDING_PAYMENT) // * pending payment
			} else {
				const upcomingAppointment = appointments.findIndex((i) => [CONFIRMED, REQUESTED].includes(i.status))

				if (upcomingAppointment > -1) {
					if (appointments[upcomingAppointment].datetime - now() < MIN_30) {
						reject(INSUFFICIENT_SESSION_BLOCK)
					} else resolve()
				} else {
					if (appointments.findIndex((i) => [SESSION.PAUSED, SESSION.STARTED].includes(i.status)) > -1) {
						reject(SESSION_ACTIVE) // * currently active - resume session
					} else resolve() // * no active appointments coming up
				}
			}
		}
	})
}

export const renderTime = (time, renderSeconds = true) => {
	// TODO - non urgent (cosmetic, affecting timer that is more than one hour)
	// TODO   -----------------
	// TODO noted below for the error:
	// TODO - fix:
	// TODO -     when hour > 0, set minutes to 00 or blank, and hour to be added with 1

	const { hours, minutes, seconds } = time

	return minutes > 1
		? minutes === 59
			? hours === 0
				? "1 hr"
				: "59 mins" // TODO there is an error here that will cause this time to be rendered for 2 mins
			: minutes + 1 + " mins"
		: minutes === 1
		? "1 min " + (renderSeconds ? (seconds > 0 ? pluralize(seconds, "sec") : "") : "")
		: renderSeconds
		? pluralize(seconds, "sec")
		: ""
}
export const renderer = (time) => {
	// * This is a renderer for react-countdown

	const { days, hours } = time
	return <span>{days > 0 ? pluralize(days, "day") : hours > 0 ? pluralize(hours, "hr") + " " + renderTime(time, false) : renderTime(time)}</span>
}

export const loremIpsum =
	"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."

export const formatStrToHTML = (str) => {
	let tmp = str

	while (tmp.indexOf("\n\n") > -1) tmp = tmp.replace("\n\n", "\n") // remove all double carriage returns
	tmp = tmp.replaceAll("\n", "<br>") // replace carriage returns with <br> tag

	while (tmp.indexOf(" <br>") > -1 || tmp.indexOf("<br> ") > -1 || tmp.indexOf("  ") > -1)
		tmp = tmp.replace(" <br>", "<br>").replace("<br> ", "<br>").replace("  ", " ") // remove space before <br>

	while (tmp.indexOf("<br><br>") > -1) tmp = tmp.replace("<br><br>", "<br>") // remove all double <br>

	if (tmp.substring(0, 4) === "<br>") tmp = tmp.substring(4, tmp.length) // remove leading <br>
	if (tmp.substring(tmp.length - 4) === "<br>") tmp = tmp.substring(0, tmp.length - 4) // remove trailing <br>

	return tmp
}

export const showError = (dispatch, errorMsg) => {
	addDialog(dispatch, {
		dialog: GenericError(errorMsg),
	})
}

export const initializeConsultation = (dispatch, appointment_id) => {
	patient_getAppointmentDetails(dispatch, appointment_id)
		.then((res) => setConsultation(dispatch, res))
		.catch((error) => showError(dispatch, error))
}

export const resumeConsultation = (socket, dispatch, appointment_id, patient_id) => {
	addDialog(dispatch, {
		dialog: GenericDialog("You have an active session", "Resume consultation?"),
		onConfirm: () => {
			socket.emit("patient_ready", { appointment_id, patient_id, id: 2 })
			startSession(dispatch)
		},
	})
}

export const startConsultation = (socket, dispatch, appointment_id, patient_id) => {
	addDialog(dispatch, {
		dialog: GenericDialog("Start session now?", "Consultation"),
		id: appointment_id,
		onConfirm: () => {
			setVideoScreenStatus(dispatch, "Establishing connection")
			startSession(dispatch)
			patient_getAppointmentDetails(dispatch, appointment_id)
				.then((res) => {
					setConsultation(dispatch, res)
					startSession(dispatch)
					socket.emit("patient_initiate_call", { appointment_id, patient_id })
				})
				.catch((error) => showError(dispatch, error))
			/* 
			// * this will trigger useEffect in VideoScreen that will prompt with a dialog 
			*/
			// initializeConsultation(dispatch, appointment_id)
		},
		// onDeny: () => pauseVideo(),
	})
}
