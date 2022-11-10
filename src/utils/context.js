import { cloneDeep, set } from "lodash"
import { DateTime } from "luxon"
import Swal from "sweetalert2"
import { v4 as uuid } from "uuid"

// imported onstants
import { MODE, VIEW } from "./constants"
import { now } from "./helpers"

// * =============================================================== Action Creator Constants
const LOGIN = "LOGIN"
const LOGOUT = "LOGOUT"

const SET_GLOBAL_SETTINGS = "SET_GLOBAL_SETTINGS"

const WELCOME_SCREEN_SHOWN = "WELCOME_SCREEN_SHOWN"
const MODAL_SCREEN_ACTIVE = "MODAL_SCREEN_ACTIVE"

// * Dialog Queues
const UPDATE_DIALOG_QUEUE = "UPDATE_DIALOG_QUEUE"
const SET_ACTIVE_DIALOG = "SET_ACTIVE_DIALOG"
const REMOVE_DIALOG = "REMOVE_DIALOG"
// * ------

// * Messages
const SET_MESSAGES = "SET_MESSAGES"
const OPEN_MESSAGE = "OPEN_MESSAGE"
const CLOSE_MESSAGE = "CLOSE_MESSAGE"

const SET_MESSAGE_VIEW = "SET_MESSAGE_VIEW"
const SET_MESSAGE_MODE = "SET_MESSAGE_MODE"
const SET_MESSAGE_RECIPIENT = "SET_MESSAGE_RECIPIENT"
// * ------

// * Snackbar
const SHOW_SNACK = "SHOW_SNACK"
const HIDE_SNACK = "HIDE_SNACK"
// * ------

// * Spinner
const SHOW_SPINNER = "SHOW_SPINNER"
const HIDE_SPINNER = "HIDE_SPINNER"
// * ------

// * Video
const SET_VIDEO_SCREEN_VISIBLE = "SET_VIDEO_SCREEN_VISIBLE"
const SET_VIDEO_SCREEN_STATUS = "SET_VIDEO_SCREEN_STATUS"
const SET_VIDEO_MODE = "SET_VIDEO_MODE"

// * ------

// * Consultation
const CALL_ACCEPTED = "CALL_ACCEPTED"
const START_SESSION = "START_SESSION"
const SESSION_DISCONNECTED = "SESSION_DISCONNECTED"
const END_SESSION = "END_SESSION"
const SET_CONSULTATION = "SET_CONSULTATION"
const END_CONSULTATION = "END_CONSULTATION"
const SET_PEER_SIGNAL = "SET_PEER_SIGNAL"
const SET_CONSULTATION_NOTIFICATION = "SET_CONSULTATION_NOTIFICATION"
const SET_SESSION_END_TIME = "SET_SESSION_END_TIME"
const SET_SESSION_PAUSED = "SET_SESSION_PAUSED"
// * ------

// * Profile
const UPDATE_PERSONAL_PROFILE = "UPDATE_PERSONAL_PROFILE"
const UPDATE_MEDICAL_HISTORY = "UPDATE_MEDICAL_HISTORY"
// * ------

// * Miscellaneous
const SET_STREAM = "SET_STREAM"
const SET_PEER_VIDEO_STREAM = "SET_PEER_VIDEO_STREAM"
const SET_SOCKETS = "SET_SOCKETS"
const LOAD_APPOINTMENTS = "LOAD_APPOINTMENTS"
const SHOW_ADD_APPOINTMENT_DIALOG = "SHOW_ADD_APPOINTMENT_DIALOG"
const UPDATE_SYMPTOM_DESCRIPTION = "UPDATE_SYMPTOM_DESCRIPTION" // <BriefSummary/>
const UPDATE_SYMPTOM_IMAGE = "UPDATE_SYMPTOM_IMAGE" // <BriefSummary/>
// * ------

// * New Patient Registration
const SET_FULLNAME = "SET_FULLNAME"
const SET_EMAIL = "SET_EMAIL"
const SET_CONFIRM_EMAIL = "SET_CONFIRM_EMAIL"
const SET_PASSWORD = "SET_PASSWORD"
const SET_CONFIRM_PASSWORD = "SET_CONFIRM_PASSWORD"
const SET_DOB = "SET_DOB"
const SET_SEX = "SET_SEX"
const SET_ADDR1 = "SET_ADDR1"
const SET_CONTACT = "SET_CONTACT"
const SET_POSTAL_CODE = "SET_POSTAL_CODE"
const SET_TERRITORY = "SET_TERRITORY"
const SET_ALLERGIES = "SET_ALLERGIES"
const SET_MEDICAL_HISTORY = "SET_MEDICAL_HISTORY"
const VALIDATE_PERSONAL_INFO = "VALIDATE_PERSONAL_INFO"
const SET_VERIFICATION_CODE = "SET_VERIFICATION_CODE"

// * =============================================================== End of Action Creator Constants

const newPatient = {
	PersonalInfo: {
		name: "",
		email: "",
		confirmEmail: "",
		password: "",
		confirmPassword: "",
		dob: "",
		sex: "",
		addr: "",
		contact: "",
		postalcode: "",
		territory: "",
		validated: false,
	},
	allergies: "",
	medicalHistory: "",
	verificationCode: "",
	verificationCodeTimestamp: 0,
}

const consultation = {
	appointment_id: "",
	startTime: 0,
	endTime: 0,
	bookingDate: 0,
	status: "",
	payable: 0,
	paid: 0,
	videoMode: false,
	prescriptions: [],
	confirmationDate: 0,
	doctor: {
		clinic_address: "",
		clinic_id: "",
		clinic_name: "",
		doctor_id: "",
		doctor_name: "",
	},
	summary: {
		text: "",
		image: null,
	},
}

const activeCall = {
	videoScreenStatus: "Not connected",
	callAccepted: false,
	peerSignal: null,
	sessionPaused: false,
}

const spinner = {
	text: "",
	show: false,
	fullMode: false,
	lightFont: false,
}

export const initialState = {
	// * show introductory tip if no appointments
	welcomeScreenShown: false,

	modalScreenActive: false, // * indicate ModalScreen active status
	// * handle dialog queues
	activeDialog: null,
	dialogs: {
		activeDialog: null,
		queue: [],
	},
	//
	_id: null,
	loggedIn: false,
	verified: false,
	email: null,
	name: "",
	address: "",
	postalcode: "",
	contact: "",
	state: "",
	token: null,
	appointments: [],

	newPatient,
	consultation,
	activeCall,

	videoScreenVisible: false,

	consultationNotification: false,
	sessionReady: false,
	// sessionEndTime: null,
	stream: null,
	socket: null,
	peerVideoStream: null,

	settings: {
		consultationFees: 0,
		sessionExtensionFees: 0,
		sessionStartMode: "audio",
	},

	// * --- snackbar
	showSnack: false,
	snackMessage: "",
	// * --- snackbar

	// * --- spinner
	spinner,

	// * ---- messages
	messages: [],
	message: {
		// new: false,
		body: null,
		senderData: null,
		recipient: null,
		view: VIEW.INBOX,
		mode: MODE.READ,
		open: false,
	},
	// * ---- messages
	addAppointmentDialogOpen: false,
}

let currentState = {}

export const reducer = (state, action) => {
	const excludedSignals = [
		/* 	SET_ACTIVE_DIALOG,
		UPDATE_DIALOG_QUEUE,
		//	LOAD_APPOINTMENTS,
		SHOW_SNACK,
		//		SET_VIDEO_SCREEN_STATUS,
		//		SET_STREAM,
		HIDE_SNACK,
		SHOW_SPINNER,
		//		SET_SOCKETS,
		// LOGIN,
		HIDE_SPINNER,
		SET_MESSAGES,
		//		UPDATE_SYMPTOM_DESCRIPTION,
		//		UPDATE_SYMPTOM_IMAGE,
		WELCOME_SCREEN_SHOWN,
		// SET_GLOBAL_SETTINGS,
		//		SET_CONSULTATION_NOTIFICATION */
	]

	// !excludedSignals.includes(action.type) && console.log(action.type, action.payload)

	const refreshState = (returnedState) => (currentState = cloneDeep(returnedState))

	let returnedState

	switch (action.type) {
		case LOGIN:
			returnedState = {
				...state,
				...action.payload,
				loggedIn: true,
			}
			refreshState(returnedState)
			return returnedState

		case LOGOUT:
			returnedState = {
				...initialState,
			}
			refreshState(returnedState)
			return returnedState

		case WELCOME_SCREEN_SHOWN:
			returnedState = {
				...state,
				welcomeScreenShown: true,
			}
			refreshState(returnedState)
			return returnedState

		case SET_GLOBAL_SETTINGS:
			returnedState = {
				...state,
				settings: {
					consultationFees: action.payload.consultationFees,
					sessionExtensionFees: action.payload.sessionExtensionFees,
					sessionStartMode: action.payload.sessionStartMode,
				},
			}

			refreshState(returnedState)
			return returnedState

		case MODAL_SCREEN_ACTIVE:
			returnedState = {
				...state,
				modalScreenActive: action.payload,
			}

			refreshState(returnedState)
			return returnedState

		case SET_ACTIVE_DIALOG:
			returnedState = {
				...state,
				dialogs: {
					activeDialog: action.payload,
					queue: state.dialogs.queue,
				},
			}
			refreshState(returnedState)
			return returnedState

		case UPDATE_DIALOG_QUEUE:
			returnedState = {
				...state,
				dialogs: {
					activeDialog: state.dialogs.activeDialog,
					queue: action.payload,
				},
			}
			refreshState(returnedState)
			return returnedState

		case REMOVE_DIALOG:
			returnedState = {
				...state,
				activeDialog: null,
				dialogs: action.payload,
			}
			refreshState(returnedState)
			return returnedState

		case SET_SOCKETS:
			returnedState = {
				...state,
				socket: action.payload,
			}
			refreshState(returnedState)
			return returnedState

		case SET_STREAM:
			returnedState = {
				...state,
				stream: action.payload,
			}
			refreshState(returnedState)
			return returnedState

		case SET_PEER_VIDEO_STREAM:
			returnedState = {
				...state,
				peerVideoStream: action.payload,
			}
			refreshState(returnedState)
			return returnedState

		case LOAD_APPOINTMENTS:
			returnedState = {
				...state,
				appointments: action.payload,
			}
			refreshState(returnedState)
			return returnedState

		case SET_VIDEO_SCREEN_VISIBLE:
			returnedState = {
				...state,
				videoScreenVisible: action.payload,
			}
			refreshState(returnedState)
			return returnedState

		case SET_VIDEO_SCREEN_STATUS:
			returnedState = set(cloneDeep(state), "activeCall.videoScreenStatus", action.payload)

			refreshState(returnedState)
			return returnedState

		case SET_VIDEO_MODE:
			returnedState = set(cloneDeep(state), "consultation.videoMode", action.payload)

			refreshState(returnedState)
			return returnedState

		case CALL_ACCEPTED:
			if (!action.payload) {
				returnedState = set(cloneDeep(state), "activeCall.callAccepted", false)
			} else {
				returnedState = set(cloneDeep(state), "activeCall.callAccepted", true)
				returnedState = set(cloneDeep(returnedState), "consultation.doctor.doctor_id", action.payload)
			}

			refreshState(returnedState)
			return returnedState

		case START_SESSION:
			returnedState = set(cloneDeep(state), "activeCall.videoScreenStatus", "Establishing connection")
			returnedState = set(cloneDeep(returnedState), "sessionReady", true)

			refreshState(returnedState)
			return returnedState

		case SESSION_DISCONNECTED:
			returnedState = {
				...state,
				activeCall: {
					...state.activeCall,
					videoScreenStatus: "Doctor disconnected",
				},
				consultation,
				sessionReady: false,
			}

			refreshState(returnedState)
			return returnedState

		case END_SESSION:
			returnedState = {
				...state,
				activeCall: {
					...state.activeCall,
					videoScreenStatus: "Call ended",
				},
				consultation,
				sessionReady: false,
			}

			refreshState(returnedState)
			return returnedState

		case SET_CONSULTATION:
			returnedState = {
				...state,
				consultation: action.payload,
			}
			refreshState(returnedState)
			return returnedState

		/* case END_CONSULTATION:
			returnedState = {
				...state,
				consultation: { ...initialConsultationState },
				consultationNotification: false, // ! this is to be removed as dialog to start is from sockets.js
			}
			refreshState(returnedState)
			return returnedState */

		case SET_PEER_SIGNAL:
			returnedState = set(cloneDeep(state), "activeCall.peerSignal", action.payload)
			refreshState(returnedState)
			return returnedState

		case SET_CONSULTATION_NOTIFICATION:
			returnedState = {
				...state,
				consultationNotification: action.payload.status,
			}
			refreshState(returnedState)
			return returnedState

		case SET_SESSION_END_TIME:
			returnedState = set(cloneDeep(state), "consultation.endTime", action.payload)
			refreshState(returnedState)
			console.log({ returnedState })
			return returnedState

		case SET_SESSION_PAUSED:
			returnedState = set(cloneDeep(state), "activeCall.sessionPaused", action.payload)
			refreshState(returnedState)
			return returnedState

		case UPDATE_PERSONAL_PROFILE:
			returnedState = {
				...state,
				name: action.payload.name,
				address: action.payload.address,
				postalcode: action.payload.postalcode,
				contact: action.payload.contact,
				state: action.payload.state,
			}
			refreshState(returnedState)
			return returnedState

		case UPDATE_MEDICAL_HISTORY:
			returnedState = {
				...state,
				medicalHistory: action.payload.medicalHistory,
				allergies: action.payload.allergies,
			}
			refreshState(returnedState)
			return returnedState

		// * ----------- Messages
		case SET_MESSAGES:
			returnedState = {
				...state,
				messages: action.payload,
			}
			refreshState(returnedState)
			return returnedState

		case SET_MESSAGE_RECIPIENT:
			returnedState = {
				...state,
				message: {
					...state.message,
					recipient: action.payload,
				},
			}
			refreshState(returnedState)
			return returnedState

		case SET_MESSAGE_VIEW:
			returnedState = {
				...state,
				message: {
					...state.message,
					view: action.payload,
				},
			}
			refreshState(returnedState)
			return returnedState

		case SET_MESSAGE_MODE:
			returnedState = {
				...state,
				message: {
					...state.message,
					mode: action.payload,
				},
			}
			refreshState(returnedState)
			return returnedState

		case OPEN_MESSAGE:
			returnedState = {
				...state,
				message: {
					...state.message,
					body: action.payload.body,
					senderData: action.payload.senderData,
					// new: action.payload.new,
					open: true,
				},
			}
			refreshState(returnedState)
			return returnedState

		case CLOSE_MESSAGE:
			returnedState = {
				...state,
				message: {
					...state.message,
					body: null,
					senderData: null,
					open: false,
				},
			}
			refreshState(returnedState)
			return returnedState

		// * ----------- End of Messages

		// * ----------- Snackbar
		case SHOW_SNACK:
			returnedState = {
				...state,
				showSnack: true,
				snackMessage: action.payload,
			}
			refreshState(returnedState)
			return returnedState

		case HIDE_SNACK:
			returnedState = {
				...state,
				showSnack: false,
			}
			refreshState(returnedState)
			return returnedState
		// * ----------- End of Snackbar
		// * ----------- Spinner
		case SHOW_SPINNER: {
			returnedState = set(cloneDeep(state), "spinner.show", true)
			returnedState = set(cloneDeep(returnedState), "spinner.text", action.payload.text || "")
			returnedState = set(cloneDeep(returnedState), "spinner.fullMode", action.payload.fullMode || false)
			returnedState = set(cloneDeep(returnedState), "spinner.lightFont", action.payload.lightFont || false)

			refreshState(returnedState)
			return returnedState
		}

		case HIDE_SPINNER: {
			returnedState = {
				...state,
				spinner,
			}
			refreshState(returnedState)
			return returnedState
		}

		// * ----------- End of Spinner

		case SHOW_ADD_APPOINTMENT_DIALOG:
			returnedState = {
				...state,
				addAppointmentDialogOpen: action.payload,
			}
			refreshState(returnedState)
			return returnedState

		case UPDATE_SYMPTOM_DESCRIPTION:
			returnedState = set(cloneDeep(state), "consultation.summary.text", action.payload)
			refreshState(returnedState)
			return returnedState

		case UPDATE_SYMPTOM_IMAGE:
			returnedState = set(cloneDeep(state), "consultation.summary.image", action.payload)
			refreshState(returnedState)
			return returnedState

		// * New Patient Registration
		case SET_FULLNAME:
			returnedState = set(cloneDeep(state), "newPatient.PersonalInfo.name", action.payload)
			refreshState(returnedState)
			return returnedState
		case SET_EMAIL:
			returnedState = set(cloneDeep(state), "newPatient.PersonalInfo.email", action.payload)
			refreshState(returnedState)
			return returnedState
		case SET_CONFIRM_EMAIL:
			returnedState = set(cloneDeep(state), "newPatient.PersonalInfo.confirmEmail", action.payload)
			refreshState(returnedState)
			return returnedState
		case SET_PASSWORD:
			returnedState = set(cloneDeep(state), "newPatient.PersonalInfo.password", action.payload)
			refreshState(returnedState)
			return returnedState
		case SET_CONFIRM_PASSWORD:
			returnedState = set(cloneDeep(state), "newPatient.PersonalInfo.confirmPassword", action.payload)
			refreshState(returnedState)
			return returnedState
		case SET_DOB:
			returnedState = set(cloneDeep(state), "newPatient.PersonalInfo.dob", action.payload)
			refreshState(returnedState)
			return returnedState
		case SET_SEX:
			returnedState = set(cloneDeep(state), "newPatient.PersonalInfo.sex", action.payload)
			refreshState(returnedState)
			return returnedState
		case SET_ADDR1:
			returnedState = set(cloneDeep(state), "newPatient.PersonalInfo.addr", action.payload)
			refreshState(returnedState)
			return returnedState
		case SET_CONTACT:
			returnedState = set(cloneDeep(state), "newPatient.PersonalInfo.contact", action.payload)
			refreshState(returnedState)
			return returnedState
		case SET_POSTAL_CODE:
			returnedState = set(cloneDeep(state), "newPatient.PersonalInfo.postalcode", action.payload)
			refreshState(returnedState)
			return returnedState
		case SET_TERRITORY:
			returnedState = set(cloneDeep(state), "newPatient.PersonalInfo.territory", action.payload)
			refreshState(returnedState)
			return returnedState
		case SET_ALLERGIES:
			returnedState = set(cloneDeep(state), "newPatient.allergies", action.payload)
			refreshState(returnedState)
			return returnedState
		case SET_MEDICAL_HISTORY:
			returnedState = set(cloneDeep(state), "newPatient.medicalHistory", action.payload)
			refreshState(returnedState)
			return returnedState
		case VALIDATE_PERSONAL_INFO:
			returnedState = set(cloneDeep(state), "newPatient.PersonalInfo.validated", action.payload)
			refreshState(returnedState)
			return returnedState
		case SET_VERIFICATION_CODE:
			returnedState = set(cloneDeep(state), "newPatient.verificationCode", action.payload)
			returnedState = set(cloneDeep(returnedState), "newPatient.verificationCodeTimestamp", DateTime.now().plus({ minutes: 1 }).toMillis())
			refreshState(returnedState)
			return returnedState

		default:
			return state
	}
}

export const login = (dispatch, payload) => {
	dispatch({
		type: LOGIN,
		payload,
	})
}

export const logout = (dispatch) => {
	dispatch({
		type: LOGOUT,
	})
}

export const setWelcomeScreenShown = (dispatch) => {
	dispatch({
		type: WELCOME_SCREEN_SHOWN,
	})
}

export const setModalScreenActive = (dispatch, payload) => {
	dispatch({
		type: MODAL_SCREEN_ACTIVE,
		payload,
	})
}

export const setGlobalSettings = (dispatch, payload) => {
	dispatch({
		type: SET_GLOBAL_SETTINGS,
		payload,
	})
}

export const addDialog = (dispatch, payload) => {
	const id = payload.id || uuid() // create a new id if it was not defined
	let activeDialog = cloneDeep(currentState.dialogs.activeDialog)

	const queue = [...currentState.dialogs.queue].filter((i) => (payload.removePreviousDialogs ? i.id !== id : i))
	queue.push({ ...payload, id })

	if (payload.removePreviousDialogs && activeDialog?.id === id) {
		// remove the current activeDialog
		activeDialog = null
		Swal.close()
	}

	if (!activeDialog) {
		activeDialog = queue[0]
		queue.shift()
		dispatch({
			type: SET_ACTIVE_DIALOG,
			payload: activeDialog,
		})
	}

	dispatch({
		type: UPDATE_DIALOG_QUEUE,
		payload: queue,
	})

	return id
}

export const removeDialog = (dispatch, payload) => {
	let activeDialog = cloneDeep(currentState.dialogs.activeDialog)

	// * if payload id is given, filter out the matching ids. else, with a payload = null, all the rest of the dialogs will be accepted
	const queue = currentState.dialogs.queue.filter((i) => i.id !== payload)

	if (!payload || (currentState?.dialogs?.activeDialog?.id && currentState.dialogs.activeDialog.id === payload)) {
		// id is not given or id is activeDialog. remove activeDialog
		activeDialog = queue[0]

		// this will trigger the next dialog
		dispatch({
			type: SET_ACTIVE_DIALOG,
			payload: activeDialog,
		})
		queue.shift()
	}

	dispatch({
		type: UPDATE_DIALOG_QUEUE,
		payload: queue,
	})
}

export const setPeerVideoStream = (dispatch, payload) => {
	dispatch({
		type: SET_PEER_VIDEO_STREAM,
		payload,
	})
}

export const setStream = (dispatch, payload) => {
	dispatch({
		type: SET_STREAM,
		payload,
	})
}

export const setSockets = (dispatch, payload) => {
	dispatch({
		type: SET_SOCKETS,
		payload,
	})
}

export const updateAppointmentList = (dispatch, payload) => {
	dispatch({
		type: LOAD_APPOINTMENTS,
		payload,
	})
}

export const setVideoScreenVisible = (dispatch, payload) => {
	dispatch({
		type: SET_VIDEO_SCREEN_VISIBLE,
		payload,
	})
}

export const setVideoScreenStatus = (dispatch, payload) => {
	dispatch({
		type: SET_VIDEO_SCREEN_STATUS,
		payload,
	})
}

export const setVideoMode = (dispatch, payload) => {
	dispatch({
		type: SET_VIDEO_MODE,
		payload,
	})
}

export const setCallAccepted = (dispatch, payload) => {
	dispatch({
		type: CALL_ACCEPTED,
		payload,
	})
}

export const startSession = (dispatch) => {
	dispatch({
		type: START_SESSION,
	})
}

export const sessionDisconnected = (dispatch) => {
	dispatch({
		type: SESSION_DISCONNECTED,
	})
}

export const endSession = (dispatch) => {
	dispatch({
		type: END_SESSION,
	})
}

export const setConsultation = (dispatch, payload) => {
	dispatch({
		type: SET_CONSULTATION,
		payload,
	})
}

export const setPeerSignal = (dispatch, payload) => {
	dispatch({
		type: SET_PEER_SIGNAL,
		payload,
	})
}

export const setConsultationNotification = (dispatch, payload) => {
	dispatch({
		type: SET_CONSULTATION_NOTIFICATION,
		payload,
	})
}

export const setSessionEndTime = (dispatch, payload) => {
	dispatch({
		type: SET_SESSION_END_TIME,
		payload,
	})
}

export const setSessionPaused = (dispatch, payload) => {
	dispatch({
		type: SET_SESSION_PAUSED,
		payload,
	})
}

export const updatePersonalProfile = (dispatch, payload) => {
	dispatch({
		type: UPDATE_PERSONAL_PROFILE,
		payload,
	})
}

export const updateMedicalHistory = (dispatch, payload) => {
	dispatch({
		type: UPDATE_MEDICAL_HISTORY,
		payload,
	})
}

// * --------- Messages

export const setMessages = (dispatch, payload) => {
	dispatch({
		type: SET_MESSAGES,
		payload,
	})
}

export const setMessageRecipient = (dispatch, payload) => {
	dispatch({
		type: SET_MESSAGE_RECIPIENT,
		payload,
	})
}

export const setMessageView = (dispatch, payload) => {
	dispatch({
		type: SET_MESSAGE_VIEW,
		payload,
	})
}

export const setMessageMode = (dispatch, payload) => {
	dispatch({
		type: SET_MESSAGE_MODE,
		payload,
	})
}

export const openMessage = (dispatch, payload) => {
	dispatch({
		type: OPEN_MESSAGE,
		payload,
	})
}
export const closeMessage = (dispatch) => {
	dispatch({
		type: CLOSE_MESSAGE,
	})
}

// * --------- End of Messages

// * --------- Snackbar
export const showSnack = (dispatch, payload) => {
	dispatch({
		type: SHOW_SNACK,
		payload,
	})
}

export const hideSnack = (dispatch) => {
	dispatch({
		type: HIDE_SNACK,
	})
}
// * --------- End of Snackbar

// * --------- Spinner
export const showSpinner = (dispatch, payload) => {
	dispatch({
		type: SHOW_SPINNER,
		payload,
	})
}

export const hideSpinner = (dispatch) => {
	dispatch({
		type: HIDE_SPINNER,
	})
}
// * --------- End of Spinner

export const showAddAppointmentDialog = (dispatch, payload) => {
	dispatch({
		type: SHOW_ADD_APPOINTMENT_DIALOG,
		payload,
	})
}

export const updateSymptomDescription = (dispatch, payload) => {
	dispatch({
		type: UPDATE_SYMPTOM_DESCRIPTION,
		payload,
	})
}

export const updateSymptomImage = (dispatch, payload) => {
	dispatch({
		type: UPDATE_SYMPTOM_IMAGE,
		payload,
	})
}

// * ------- New Patient Registration
export const setFullname = (dispatch, payload) => {
	dispatch({
		type: SET_FULLNAME,
		payload,
	})
}

export const setEmail = (dispatch, payload) => {
	dispatch({
		type: SET_EMAIL,
		payload,
	})
}
export const setConfirmEmail = (dispatch, payload) => {
	dispatch({
		type: SET_CONFIRM_EMAIL,
		payload,
	})
}
export const setPassword = (dispatch, payload) => {
	dispatch({
		type: SET_PASSWORD,
		payload,
	})
}
export const setConfirmPassword = (dispatch, payload) => {
	dispatch({
		type: SET_CONFIRM_PASSWORD,
		payload,
	})
}
export const setDOB = (dispatch, payload) => {
	dispatch({
		type: SET_DOB,
		payload,
	})
}
export const setSex = (dispatch, payload) => {
	dispatch({
		type: SET_SEX,
		payload,
	})
}
export const setAddr1 = (dispatch, payload) => {
	dispatch({
		type: SET_ADDR1,
		payload,
	})
}
export const setContact = (dispatch, payload) => {
	dispatch({
		type: SET_CONTACT,
		payload,
	})
}
export const setPostalCode = (dispatch, payload) => {
	dispatch({
		type: SET_POSTAL_CODE,
		payload,
	})
}
export const setTerritory = (dispatch, payload) => {
	dispatch({
		type: SET_TERRITORY,
		payload,
	})
}

export const setAllergies = (dispatch, payload) => {
	dispatch({
		type: SET_ALLERGIES,
		payload,
	})
}

export const setMedicalHistory = (dispatch, payload) => {
	dispatch({
		type: SET_MEDICAL_HISTORY,
		payload,
	})
}

export const validatePersonalInformation = (dispatch, payload) => {
	dispatch({
		type: VALIDATE_PERSONAL_INFO,
		payload,
	})
}

export const setVerificationCode = (dispatch, payload) => {
	dispatch({
		type: SET_VERIFICATION_CODE,
		payload,
	})
}
