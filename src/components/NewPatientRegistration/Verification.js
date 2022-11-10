import "../../App.css"
import PropTypes from "prop-types"

// material ui
import { Button, TextField } from "@mui/material"

// placeholder
import { BLACK, center, MAINCOLOR, MIN_1 } from "../../utils/constants"
import { useCallback, useContext, useEffect, useState } from "react"
import { ProfileContext } from "../../App"
import { addDialog, setVerificationCode, showSnack } from "../../utils/context"
import { GenericDialog, GenericError } from "../../utils/sweetalertDialogs"
import Swal from "sweetalert2"
import Countdown from "react-countdown"
import { now, renderer } from "../../utils/helpers"
import { patient_create, patient_sendVerificationCode } from "../../utils/network"

const Verification = (props) => {
	const value = useContext(ProfileContext)
	const { state, dispatch } = value
	const { newPatient } = state
	const { verificationCode, verificationCodeTimestamp } = newPatient
	const [countdown, setCountdown] = useState(0)

	const [enteredCode, setEnteredCode] = useState("")

	const sendVerificationCode = useCallback(() => {
		const generateCode = () => {
			const num = Math.random(1).toString()
			return num.substring(num.length - 6)
		}

		const code = generateCode()
		setVerificationCode(dispatch, code)
		patient_sendVerificationCode(dispatch, code)
	},[dispatch])

	useEffect(() => {
		if (verificationCode === "") {
			setCountdown(now() + MIN_1)
			sendVerificationCode()
		}
	}, [verificationCode, dispatch, sendVerificationCode])

	useEffect(() => {
		verificationCodeTimestamp > 0 && setCountdown(verificationCodeTimestamp)
	}, [verificationCodeTimestamp])

	const handleSubmit = () => {
		if (countdown === 0) {
			Swal.fire(GenericDialog("Verification code expired. Resend code now?"))
				.then((result) => {
					if (result.isConfirmed) sendVerificationCode()
				})
				.catch((error) => {
					Swal.fire(GenericError(error))
				})
		} else {
			if (enteredCode === verificationCode) {
				const { PersonalInfo, medicalHistory, allergies } = newPatient
				const { email, password, name, sex, dob, addr, contact, postalcode, territory } = PersonalInfo

				const patient = {
					email,
					password,
					verified: true,
					name,
					sex,
					dob: dob.split("-").reverse().join(""), // convert from yyyy-MM-dd to ddMMyyyy
					address: addr,
					contact,
					postalcode,
					state: territory,
					medicalHistory,
					allergies,
				}

				patient_create(dispatch, { patient })
					.then((res) => {
						showSnack(dispatch, "Verification successful")
						props.onVerified(res)
					})
					.catch((error) => {
						Swal.fire(GenericError(error))
					})
			} else {
				Swal.fire(GenericError("Invalid verification code"))
			}
		}
	}

	const styles = {
		...subStyles,
		resendLink: {
			...supportStyles.resendLink,
			cursor: countdown === 0 ? "pointer" : "default",
		},
	}
	return (
		<div style={styles.mainContainer}>
			<div style={styles.strong}>We have sent a verification code to your email</div>
			<TextField
				autoFocus
				label={"Verification code"}
				InputLabelProps={{ shrink: true }}
				size="small"
				style={{ marginBottom: "10px" }}
				value={enteredCode}
				onChange={(e) => setEnteredCode(e.target.value)}
			/>
			<Button variant="contained" onClick={handleSubmit}>
				Submit
			</Button>
			{verificationCodeTimestamp > 0 && (
				<div style={styles.resendLink} onClick={() => countdown === 0 && sendVerificationCode()}>
					<div>Did not receive? Resend code</div>
					<div style={{ marginLeft: "3px" }}>
						{countdown > 0 ? (
							<div style={{ display: "flex", flexDirection: "row" }}>
								<div style={{ marginRight: "3px" }}>in</div>
								<Countdown
									date={countdown}
									renderer={renderer}
									onComplete={() => {
										setCountdown(0)
									}}
								/>
							</div>
						) : (
							<div>now</div>
						)}
					</div>
				</div>
			)}
		</div>
	)
}

const supportStyles = {
	resendLink: {
		fontSize: "10px",
		color: MAINCOLOR,
		marginTop: "30px", ///
		display: "flex",
		flexDirection: "row",
	},
}

const subStyles = {
	mainContainer: {
		margin: "10px",
		height: "100%",
		display: "flex",
		flexDirection: "column",
		marginTop: "20px",
		...center,
		color: BLACK,
	},
	strong: {
		marginBottom: "30px",
		fontSize: "20px",
		fontWeight: "bold", ///
		textAlign: "center",
	},
}

Verification.propTypes = {
	close: PropTypes.func, // TODO REMOVE THIS IF UNNECESSARY
	onVerified: PropTypes.func,
}

export default Verification
