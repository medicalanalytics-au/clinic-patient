/**
 * Dashboard -> Appointments -> AddAppointment
 *
 * Send an appointment request to the server, that will match with a doctor that is currently online
 */

import { useContext, useEffect, useState } from "react"
import "../../App.css"
import PropTypes from "prop-types"

import { DateTime } from "luxon"

// material ui
import { Button, TextField } from "@mui/material"
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers"
import DateAdapter from "@mui/lab/AdapterLuxon"

// Swal
import { addDialog } from "../../utils/context"
import { GenericAlert, GenericDialog, GenericError } from "../../utils/sweetalertDialogs"

// context
import { ProfileContext } from "../../App"

// network
import { patient_requestAppointment } from "../../utils/network"

// custom functions
import { developmentMode, loadAppointments, PARAMS } from "../../utils/helpers"

// constants
import { center } from "../../utils/constants"

const AddAppointment = (props) => {
	const { dispatch, state } = useContext(ProfileContext)
	const { _id } = state

	const [selectedTime, setSelectedTime] = useState()
	const [minDateTime, setMinDateTime] = useState() // state is used to ensure that the initial date and the minimum date is sync

	const getMinDateTime = () => {
		const now = DateTime.now()
		return now.plus({ minutes: PARAMS.ADDED_TIME }).set({ second: 0, milliseconds: 0 })
	}

	useEffect(() => {
		setSelectedTime(getMinDateTime())
		setMinDateTime(getMinDateTime())
	}, [])

	const handleChange = (time) => setSelectedTime(time)

	const requestAppointment = () => {
		patient_requestAppointment(dispatch, { _id, datetime: selectedTime.toMillis() })
			.then(() => {
				loadAppointments(dispatch, _id)

				addDialog(dispatch, {
					dialog: GenericAlert("Outcome confirmation will be sent to your email", "Your appointment had been been requested"),
				})
			})
			.catch((error) =>
				addDialog(dispatch, {
					dialog: GenericError(error),
				})
			)
	}

	const addAppointment = () => {
		// * Time selected had expired

		// ! the line below requires half an hour grace period for the next appointment. check whether this is necessary
		// ! if (selectedTime.toMillis() < DateTime.now().toMillis() + MINS_29) Swal.fire(GenericError("Invalid time selected"))

		if (selectedTime.toMillis() < DateTime.now().toMillis())
			addDialog(dispatch, {
				dialog: GenericError("Invalid time selected"),
			})
		else if (selectedTime.minute !== Math.ceil(selectedTime.minute / 5) * 5 && !developmentMode) {
			// * Time selected is not within 5 minutes interval
			addDialog(dispatch, {
				dialog: GenericDialog("Minute had been adjusted to 5 minutes interval", "Invalid Time"),
				onConfirm: () => {
					setSelectedTime(selectedTime.set({ minute: Math.ceil(selectedTime.minute / 5) * 5 }))
				},
			})
		} else {
			addDialog(dispatch, {
				dialog: GenericDialog(selectedTime.toLocaleString(DateTime.DATETIME_SHORT), "Request appointment?"),
				removePreviousDialogs: true,
				onConfirm: requestAppointment,
			})

			props.close()
		}
	}
	return (
		<div style={styles.overlay}>
			<div style={styles.dateTimeContainer}>
				<LocalizationProvider dateAdapter={DateAdapter}>
					<DateTimePicker
						label="Request Appointment"
						value={selectedTime}
						minDateTime={minDateTime}
						onChange={handleChange}
						inputFormat="dd/MM/yyyy hh:mm a"
						renderInput={(params) => <TextField {...params} />}
						minutesStep={5}
					/>
				</LocalizationProvider>
			</div>
			<div style={styles.buttonContainer}>
				<Button style={{ width: "100px" }} onClick={() => props.close()}>
					Cancel
				</Button>
				<Button variant="contained" style={{ width: "100px" }} onClick={addAppointment}>
					OK
				</Button>
			</div>
		</div>
	)
}

AddAppointment.propTypes = {
	open: PropTypes.bool,
	close: PropTypes.func,
}

const styles = {
	overlay: {
		height: "100%",
		width: "100%",
		display: "flex",
		flexDirection: "column",
		justifyContent: "center",
		alignItems: "center",
		color: "black",
	},
	dateTimeContainer: {
		...center,
		height: "100%",
		padding: "10px",
		flexDirection: "column",
		width: "100%",
	},
	buttonContainer: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "flex-end",
		marginRight: "10px",
		width: "100%", ///
	},
}
export default AddAppointment
