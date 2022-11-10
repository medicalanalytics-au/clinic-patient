import { useContext, useEffect, useRef, useState } from "react"
import "../../App.css"
import PropTypes from "prop-types"

// material ui
import { Button, TextField, Stepper, Step, StepLabel } from "@mui/material"

import { center } from "../../utils/constants"

import { ProfileContext } from "../../App"
import { setAllergies, setMedicalHistory, validatePersonalInformation } from "../../utils/context"

import Swal from "sweetalert2"
import { GenericError } from "../../utils/sweetalertDialogs"

import PersonalInfo from "./PersonalInfo"
import Verification from "./Verification"
import { mobilePortrait, useResponsiveMedia } from "../../utils/helpers"

const Allergies = () => {
	const value = useContext(ProfileContext)
	const { state, dispatch } = value
	const { allergies } = state.newPatient

	const [rows, setRows] = useState(1)

	const media = useResponsiveMedia()

	const inputfieldContainerRef = useRef()
	const textfieldRef = useRef()

	useEffect(() => {
		inputfieldContainerRef.current && setRows(Math.round((inputfieldContainerRef?.current?.clientHeight - 10) / 24) - 1)
	}, [media])

	const styles = {
		...subStyles,
		inputFieldContainer: {
			...supportStyles.inputFieldContainer,
			width: mobilePortrait(media) ? "90%" : "95%",
		},
	}

	return (
		<div style={styles.inputFieldContainer} ref={inputfieldContainerRef} onClick={() => textfieldRef.current.focus()}>
			<TextField
				inputRef={textfieldRef}
				InputProps={{ disableUnderline: true }}
				inputProps={{ maxLength: 300 }} ///
				label={"Allergies"}
				multiline
				fullWidth
				autoFocus
				rows={rows}
				value={allergies}
				onChange={(e) => setAllergies(dispatch, e.target.value)}
				variant="standard"
				InputLabelProps={{ shrink: true }}
				size="small"
			/>
		</div>
	)
}

const MedicalHistory = () => {
	const value = useContext(ProfileContext)
	const { state, dispatch } = value
	const { medicalHistory } = state.newPatient

	const [rows, setRows] = useState(1)

	const inputfieldContainerRef = useRef()
	const textfieldRef = useRef()

	const media = useResponsiveMedia()

	useEffect(() => {
		inputfieldContainerRef.current && setRows(Math.round((inputfieldContainerRef?.current?.clientHeight - 10) / 24) - 1)
	}, [media])

	const styles = {
		...subStyles,
		inputFieldContainer: {
			...supportStyles.inputFieldContainer,
			width: mobilePortrait(media) ? "90%" : "95%",
		},
	}
	return (
		<div style={styles.inputFieldContainer} ref={inputfieldContainerRef} onClick={() => textfieldRef.current.focus()}>
			<TextField
				inputRef={textfieldRef}
				InputProps={{ disableUnderline: true }}
				inputProps={{ maxLength: 300 }} ///
				label={"Medical History"}
				fullWidth
				autoFocus
				multiline
				rows={rows}
				value={medicalHistory}
				onChange={(e) => setMedicalHistory(dispatch, e.target.value)}
				variant="standard"
				InputLabelProps={{ shrink: true }}
				size="small"
			/>
		</div>
	)
}

const NewPatientRegistration = (props) => {
	const value = useContext(ProfileContext)
	const { dispatch } = value

	const [activePage, setActivePage] = useState(0)

	const media = useResponsiveMedia()

	const handleBackButtonClick = () => setActivePage(activePage - 1)

	const handleNextButtonClick = () => {
		if (activePage === 0) {
			validatePersonalInformation(dispatch, true)
		} else setActivePage(activePage + 1)
	}

	const handleValidatedPersonalInformation = (error) => (error ? Swal.fire(GenericError(error)) : setActivePage(1))

	const contents = [
		{
			label: "Personal Information",
			component: <PersonalInfo onValidate={handleValidatedPersonalInformation} />,
		},
		{
			label: "Allergies",
			component: <Allergies />,
		},
		{
			label: "Medical History",
			component: <MedicalHistory />,
		},
		{
			label: "Verification",
			component: <Verification close={props.close} onVerified={props.onAccountCreate} />,
		},
	]

	const styles = {
		...subStyles,
	}

	return (
		<div style={styles.mainContainer}>
			{contents[activePage].component}
			<div style={styles.footerContainer}>
				<div style={styles.stepperContainer}>
					<Stepper activeStep={activePage} style={styles.stepper}>
						{contents.map((i) => (
							<Step key={i.label}>
								<StepLabel>{mobilePortrait(media) ? "" : i.label}</StepLabel>
							</Step>
						))}
					</Stepper>
				</div>
				<div style={styles.buttonsContainer}>
					<Button disabled={activePage === 0} onClick={handleBackButtonClick}>
						BACK
					</Button>
					<Stepper />
					<Button disabled={activePage === 3} onClick={handleNextButtonClick}>
						NEXT
					</Button>
				</div>
			</div>
		</div>
	)
}

const supportStyles = {
	inputFieldContainer: {
		margin: "10px",
		border: "1px solid silver",
		height: "90%",
		borderRadius: "5px",
		padding: "10px",
	},
}

const subStyles = {
	mainContainer: {
		height: "100%",
		display: "flex",
		flexDirection: "column",
		justifyContent: "space-between", ///
	},
	footerContainer: {
		width: "100%",
		display: "flex",
		flexDirection: "column", ///
	},
	stepperContainer: {
		width: "100%",
		...center, ///
	},
	stepper: {
		width: "70%",
		marginBottom: "10px", ///
	},
	buttonsContainer: {
		width: "100%",
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between", ///
	},
}

NewPatientRegistration.propTypes = {
	close: PropTypes.func,
	onAccountCreate: PropTypes.func,
}

export default NewPatientRegistration
