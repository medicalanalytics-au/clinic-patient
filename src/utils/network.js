import { hideSpinner, showSpinner } from "./context"

const SERVERPORT = "5555" //
export const SERVER = "https://www.medicalanalytics.org:" + SERVERPORT

const _send = (module) => {
	return new Promise((resolve, reject) => {
		const data = {
			method: module.method || "POST", // defaults to POST if not explicitly stated
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ ...module.data, sender: "patient" }) || null,
		}

		const { spinner, dispatch } = module
		spinner && showSpinner(dispatch, { text: spinner.text, fullMode: spinner.fullMode, lightFont: spinner.lightFont })

		fetch(SERVER + "/" + module.module, data)
			.then((res) => {
				dispatch && hideSpinner(dispatch)
				return res.json()
			})
			.then((data) => resolve(data))
			.catch((error) => {
				dispatch && hideSpinner(dispatch)
				reject(error)
			})
	})
}

export const patient_sendVerificationCode = (dispatch, code) => {
	return new Promise((resolve, reject) => {
		_send({
			dispatch,
			spinner: { text: "Sending verification code" },
			module: "patient_sendVerificationCode",
			data: { code },
		})
			.then((result) => {
				result.status === "OK" ? resolve(result.msg) : reject(result.msg)
			})
			.catch((error) => reject(error))
	})
}

export const patient_create = (dispatch, patient) => {
	return new Promise((resolve, reject) => {
		_send({
			dispatch,
			spinner: {
				text: "Verifying details",
				fullMode: true,
				lightFont: true,
			},
			module: "patient_create",
			data: patient,
		})
			.then((result) => {
				result.status === "OK" ? resolve(result.msg) : reject(result.msg)
			})
			.catch((error) => reject(error))
	})
}

export const patient_auth = (dispatch, email, password) => {
	return new Promise((resolve, reject) => {
		_send({
			dispatch,
			spinner: {
				text: "Logging in...",
				fullMode: true,
				lightFont: true,
			},
			module: "patient_auth",
			data: {
				email: email.toLowerCase(),
				password,
			},
		})
			.then((result) => {
				result.status === "OK" ? resolve(result.msg) : reject(result.msg)
			})
			.catch((error) => reject(error))
	})
}

export const common_loadGlobalSettings = (dispatch) => {
	/**
	 * @returns status "OK"/profile array (as result.status/result.msg) or error status/msg
	 */

	return new Promise((resolve, reject) => {
		_send({
			dispatch,
			spinner: { text: "Loading settings" },
			module: "common_loadGlobalSettings",
		})
			.then((result) => (result.status === "OK" ? resolve(result.msg) : reject(result.msg)))
			.catch((error) => reject(error))
	})
}

export const patient_updatePersonalInfo = (dispatch, _id, personalInfo) => {
	return new Promise((resolve, reject) => {
		_send({
			dispatch,
			spinner: { text: "Updating personal information" },
			module: "patient_updatePersonalInfo",
			data: {
				_id,
				personalInfo,
			},
		})
			.then((result) => {
				result.status === "OK" ? resolve(result.msg) : reject(result.msg)
			})
			.catch((error) => reject(error))
	})
}

export const patient_updateMedicalHistory = (dispatch, _id, medicalHistory) => {
	return new Promise((resolve, reject) => {
		_send({
			dispatch,
			spinner: { text: "Updating medical history" },
			module: "patient_updateMedicalHistory",
			data: {
				_id,
				medicalHistory,
			},
		})
			.then((result) => {
				result.status === "OK" ? resolve(result.msg) : reject(result.msg)
			})
			.catch((error) => reject(error))
	})
}

export const patient_requestAppointment = (dispatch, data) => {
	return new Promise((resolve, reject) => {
		_send({
			dispatch,
			spinner: { text: "Requesting appointment" },
			module: "patient_requestAppointment",
			data,
		})
			.then((result) => (result.status === "OK" ? resolve(result.status) : reject(result.msg)))
			.catch((error) => reject(error))
	})
}

export const patient_getAppointmentList = (dispatch, _id) => {
	// ! Currently not in used

	return new Promise((resolve, reject) => {
		console.log("Warning: Obsolete function - getAppointmentList")

		_send({
			dispatch,
			spinner: { text: "Downloading appointments" },
			module: "patient_getAppointmentList",
			data: { _id },
		})
			.then((result) => {
				result.status === "OK" ? resolve(result.msg) : reject(result.msg)
			})
			.catch((error) => reject(error))
	})
}

export const patient_cancelAppointment = (dispatch, _id, charge) => {
	return new Promise((resolve, reject) => {
		_send({
			dispatch,
			spinner: { text: "Cancelling appointment" },
			module: "patient_cancelAppointment",
			data: { _id, charge },
		})
			.then((result) => {
				result.status === "OK" ? resolve(result.msg) : reject(result.msg)
			})
			.catch((error) => reject(error))
	})
}

export const patient_statusChangedACK = (_id) => {
	console.log("Warning: Obsolete function - statusChangedACK")
	return new Promise((resolve, reject) => {
		_send({
			module: "patient_statusChangedACK",
			data: { _id },
		})
			.then((result) => {
				result.status === "OK" ? resolve(result.msg) : reject(result.msg)
			})
			.catch((error) => reject(error))
	})
}

export const patient_paymentComplete = (dispatch, _id, amountPaid) => {
	return new Promise((resolve, reject) => {
		_send({
			dispatch,
			spinner: { text: "Processing payment" },
			module: "patient_paymentComplete",
			data: { _id, amountPaid },
		})
			.then((result) => {
				result.status === "OK" ? resolve(result.msg) : reject(result.msg)
			})
			.catch((error) => reject(error))
	})
}

export const patient_loadAppointments2 = (dispatch, patient_id) => {
	// TODO change module name here and on server to loadAppointments

	/**
	 * @returns status "OK"/appointments array (as result.status/result.msg) or error status/msg
	 */

	return new Promise((resolve, reject) => {
		_send({
			dispatch,
			spinner: { text: "Loading appointments" },
			module: "patient_loadAppointments2",
			data: { patient_id },
		})
			.then((result) => (result.status === "OK" ? resolve(result.msg) : reject(result.msg)))
			.catch((error) => reject(error))
	})
}

export const patient_getAppointmentDetails = (dispatch, appointment_id) => {
	return new Promise((resolve, reject) => {
		_send({
			dispatch,
			spinner: { text: "Loading appointment details" },
			module: "patient_getAppointmentDetails",
			data: { appointment_id },
		})
			.then((result) => (result.status === "OK" ? resolve(result.msg) : reject(result.msg)))
			.catch((error) => reject(error))
	})
}

export const patient_changePassword = (dispatch, _id, currentPassword, newPassword) => {
	return new Promise((resolve, reject) => {
		_send({
			dispatch,
			spinner: { text: "Updating password" },
			module: "patient_changePassword",
			data: {
				_id,
				currentPassword,
				newPassword,
			},
		})
			.then((result) => (result.status === "OK" ? resolve(result.msg) : reject(result.msg)))
			.catch((error) => reject(error))
	})
}

export const patient_getNews = (dispatch, page) => {
	return new Promise((resolve, reject) => {
		_send({
			dispatch,
			spinner: { text: "Downloading latest news" },
			module: "patient_getNews",
			data: { page },
		})
			.then((result) => (result.status === "OK" ? resolve(result.msg) : reject(result.msg)))
			.catch((error) => reject(error))
	})
}

export const common_downloadMessages = (dispatch, id) => {
	return new Promise((resolve, reject) => {
		_send({
			dispatch,
			spinner: { text: "Downloading messages" },
			module: "common_downloadMessages",
			data: { id },
		})
			.then((result) => (result.status === "OK" ? resolve(result.msg) : reject(result.msg)))
			.catch((error) => reject(error))
	})
}

export const common_sendMessage = (dispatch, message) => {
	return new Promise((resolve, reject) => {
		_send({
			dispatch,
			spinner: { text: "Sending message" },
			module: "common_sendMessage",
			data: { message },
		})
			.then((result) => (result.status === "OK" ? resolve(result.msg) : reject(result.msg)))
			.catch((error) => reject(error))
	})
}

export const common_updateReadStatus = (message_id, status) => {
	return new Promise((resolve, reject) => {
		_send({
			module: "common_updateReadStatus",
			data: { message_id, status },
		})
			.then((result) => (result.status === "OK" ? resolve(result.msg) : reject(result.msg)))
			.catch((error) => reject(error))
	})
}

export const common_deleteDraftMessage = (dispatch, message_id) => {
	return new Promise((resolve, reject) => {
		_send({
			dispatch,
			spinner: { text: "Deleting message" },
			module: "common_deleteDraftMessage",
			data: { message_id },
		})
			.then((result) => (result.status === "OK" ? resolve(result.msg) : reject(result.msg)))
			.catch((error) => reject(error))
	})
}

export const patient_getDoctorsList = (dispatch, patient_id) => {
	return new Promise((resolve, reject) => {
		_send({
			dispatch,
			spinner: { text: "Downloading doctor's list" },
			module: "patient_getDoctorsList",
			data: { patient_id },
		})
			.then((result) => (result.status === "OK" ? resolve(result.msg) : reject(result.msg)))
			.catch((error) => reject(error))
	})
}

export const patient_getStripeSecret = (dispatch) => {
	return new Promise((resolve, reject) => {
		_send({
			dispatch,
			spinner: { text: "Contacting payment gateway. Please wait" },
			spinnerLightFont: true,
			module: "patient_getStripeSecret",
		})
			.then((result) => (result.status === "OK" ? resolve(result.msg) : reject(result.msg)))
			.catch((error) => reject(error))
	})
}
