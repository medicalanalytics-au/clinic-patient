import { useContext, useEffect, useRef, useState } from "react"
import "../../App.css"
import PropTypes from "prop-types"

// material ui
import { TextField, MenuItem, InputAdornment } from "@mui/material"

// placeholder
import { ProfileContext } from "../../App"
import { mobile, mobilePortrait, useResponsiveMedia, validEmail, validPassword } from "../../utils/helpers"
import {
	setAddr1,
	setContact,
	setConfirmEmail,
	setConfirmPassword,
	setDOB,
	setEmail,
	setFullname,
	setPassword,
	setPostalCode,
	setSex,
	setTerritory,
	validatePersonalInformation,
} from "../../utils/context"
import { RiEyeCloseLine, RiEyeLine } from "react-icons/ri"

const CustomTextField = (props) => {
	const value = useContext(ProfileContext)
	const { dispatch } = value

	const media = useResponsiveMedia()

	const FULL_LENGTH = mobile(media) ? "300px" : "400px"
	const SHORT_LENGTH = mobile(media) ? "140px" : "195px"

	const [showPassword, setShowPassword] = useState(false)

	let _InputProps = props.InputProps && { ...props.InputProps }

	if (props.passwordField) {
		_InputProps = {
			...props.InputProps,
			endAdornment: (
				<InputAdornment position="end">
					{showPassword ? (
						<RiEyeLine style={{ cursor: "pointer" }} onClick={() => setShowPassword(false)} />
					) : (
						<RiEyeCloseLine style={{ cursor: "pointer" }} onClick={() => setShowPassword(true)} />
					)}
				</InputAdornment>
			),
		}
	}

	return (
		<TextField
			label={props.label}
			autoFocus={props.autoFocus}
			InputLabelProps={{ shrink: true }}
			style={{ width: props.short ? SHORT_LENGTH : FULL_LENGTH, marginBottom: "10px" }}
			size="small"
			value={props.value}
			type={props.type ? (props.type === "password" ? (showPassword ? "text" : "password") : props.type) : "text"}
			onChange={(e) => {
				validatePersonalInformation(dispatch, false)
				props.onChange(dispatch, e.target.value)
			}}
			color="primary"
			error={props.error}
			select={props.select}
			InputProps={_InputProps}
		>
			{props.select && props.children}
		</TextField>
	)
}

CustomTextField.propTypes = {
	autoFocus: PropTypes.bool,
	type: PropTypes.string,
	label: PropTypes.string,
	value: PropTypes.string,
	passwordField: PropTypes.string,
	onChange: PropTypes.func,
	error: PropTypes.bool,
	select: PropTypes.bool,
	short: PropTypes.bool,
	InputProps: PropTypes.object,
}

const PersonalInfo = (props) => {
	const value = useContext(ProfileContext)
	const { state, dispatch } = value
	const { PersonalInfo } = state.newPatient
	const { name, email, confirmEmail, password, confirmPassword, dob, sex, addr, contact, postalcode, territory, validated } = PersonalInfo
	const territories = ["ACT", "NSW", "NT", "QLD", "TAS", "VIC", "WA"]

	const error = useRef()

	const MINIMUM_FULLNAME_LENGTH = 5

	const media = useResponsiveMedia()

	const styles = {
		mainContainer: {
			...supportStyles.mainContainer,
			flexDirection: mobilePortrait(media) ? "column" : "row",
			justifyContent: "center",
		},
		leftBox: {
			...supportStyles.leftBox,
			width: mobilePortrait(media) ? "100%" : "50%",
		},
		rightBox: {
			...supportStyles.rightBox,
			width: mobilePortrait(media) ? "100%" : "50%",
		},
		territory: {
			...supportStyles.territory,
			width: mobile(media) ? "300px" : "400px",
		},
	}

	// * conditional checks
	const errors = {
		FULLNAME_TOO_SHORT: {
			condition: name.trim().length < MINIMUM_FULLNAME_LENGTH,
			message: "Please enter a valid name",
		},
		INVALID_EMAIL: {
			condition: !validEmail(email),
			message: "Invalid email address", ///
		},
		EMAIL_DOES_NOT_MATCH: {
			condition: confirmEmail !== email, ///
			message: "Email addresses does not match",
		},
		INVALID_PASSWORD: {
			condition: !validPassword(password), ///
			message:
				"Password must be at least 8 characters long and must contain :\nA mixture of uppercase and lowercase letters\nA mixture of letters and numbers\nAt least one special character\n",
		},
		INVALID_DOB: {
			condition: dob === "",
			message: "Please select date of birth",
		},
		PASSWORDS_DOES_NOT_MATCH: {
			condition: confirmPassword !== password,
			message: "Passwords does not match",
		},
		SEX_NOT_SELECTED: {
			condition: sex === "",
			message: "Please select MALE or FEMALE",
		},
		INVALID_ADDRESS: {
			condition: addr.length < 10,
			message: "Invalid address",
		},
		INVALID_CONTACT: {
			condition: contact.length < 10,
			message: "Invalid contact number",
		},
		INVALID_POSTAL_CODE: {
			condition: postalcode === "",
			message: "Please enter the postal code",
		},
		INVALID_TERRITORY: {
			condition: territory === "",
			message: "Please select State/Territory",
		},
	}

	const {
		FULLNAME_TOO_SHORT,
		INVALID_EMAIL,
		EMAIL_DOES_NOT_MATCH,
		INVALID_PASSWORD,
		INVALID_DOB,
		PASSWORDS_DOES_NOT_MATCH,
		SEX_NOT_SELECTED,
		INVALID_ADDRESS,
		INVALID_CONTACT,
		INVALID_POSTAL_CODE,
		INVALID_TERRITORY,
	} = errors

	const { onValidate } = props

	useEffect(() => {
		//  if (error) console.log({ error })
	}, [error])

	useEffect(() => {
		if (validated) {
			if (FULLNAME_TOO_SHORT.condition) error.current = FULLNAME_TOO_SHORT.message
			else if (INVALID_EMAIL.condition) error.current = INVALID_EMAIL.message
			else if (EMAIL_DOES_NOT_MATCH.condition) error.current = EMAIL_DOES_NOT_MATCH.message
			else if (INVALID_PASSWORD.condition) error.current = INVALID_PASSWORD.message
			else if (INVALID_DOB.condition) error.current = INVALID_DOB.message
			else if (PASSWORDS_DOES_NOT_MATCH.condition) error.current = PASSWORDS_DOES_NOT_MATCH.message
			else if (SEX_NOT_SELECTED.condition) error.current = SEX_NOT_SELECTED.message
			else if (INVALID_ADDRESS.condition) error.current = INVALID_ADDRESS.message
			else if (INVALID_CONTACT.condition) error.current = INVALID_CONTACT.message
			else if (INVALID_POSTAL_CODE.condition) error.current = INVALID_POSTAL_CODE.message
			else if (INVALID_TERRITORY.condition) error.current = INVALID_TERRITORY.message
			else error.current = null

			onValidate(error.current)
			validatePersonalInformation(dispatch, false)
		}
	}, [
		dispatch,
		validated,
		FULLNAME_TOO_SHORT,
		INVALID_EMAIL,
		EMAIL_DOES_NOT_MATCH,
		INVALID_PASSWORD,
		INVALID_DOB,
		PASSWORDS_DOES_NOT_MATCH,
		SEX_NOT_SELECTED,
		INVALID_ADDRESS,
		INVALID_CONTACT,
		INVALID_POSTAL_CODE,
		INVALID_TERRITORY,
		onValidate,
	])

	return (
		<div style={styles.mainContainer}>
			<div style={styles.leftBox}>
				<CustomTextField
					autoFocus
					label={"name"}
					value={name}
					onChange={setFullname}
					error={(name.length > 0 || validated) && FULLNAME_TOO_SHORT.condition}
				/>

				<CustomTextField
					label={"email address"}
					value={email}
					onChange={setEmail} ///
					error={(email.length > 0 || validated) && INVALID_EMAIL.condition}
				/>

				<CustomTextField
					label={"confirm email address"}
					value={confirmEmail}
					onChange={setConfirmEmail}
					error={(confirmEmail.length > 0 || validated) && EMAIL_DOES_NOT_MATCH.condition}
				/>
				<CustomTextField
					label={"set password"}
					value={password}
					type="password"
					passwordField={password}
					onChange={setPassword}
					error={(password.length > 0 || validated) && INVALID_PASSWORD.condition}
				/>
				<CustomTextField
					label={"confirm password"}
					value={confirmPassword}
					type="password"
					passwordField={confirmPassword}
					onChange={setConfirmPassword}
					error={(confirmPassword.length > 0 || validated) && PASSWORDS_DOES_NOT_MATCH.condition}
				/>
			</div>
			<div style={styles.rightBox}>
				<CustomTextField
					label={"date of birth"}
					type="date"
					value={dob}
					onChange={setDOB} ///
					error={validated && INVALID_DOB.condition}
				/>

				<CustomTextField
					label={"sex"}
					select
					value={sex}
					onChange={setSex} ///
					error={validated && SEX_NOT_SELECTED.condition}
				>
					<MenuItem value="m">Male</MenuItem>
					<MenuItem value="f">Female</MenuItem>
				</CustomTextField>

				<CustomTextField
					label={"address"}
					value={addr}
					onChange={setAddr1} ///
					error={(addr.length > 0 || validated) && INVALID_ADDRESS.condition}
				/>

				<CustomTextField
					label={"contact"}
					value={contact}
					onChange={setContact} ///
					error={(contact.length > 0 || validated) && INVALID_CONTACT.condition}
				/>

				<div style={styles.territory}>
					<CustomTextField
						label={"postal code"}
						type="number"
						InputProps={{ inputProps: { min: 1000, max: 9999 } }}
						short
						value={postalcode}
						onChange={setPostalCode}
						error={validated && INVALID_POSTAL_CODE.condition}
					/>

					<CustomTextField
						label={"state"}
						select
						short
						value={territory}
						onChange={setTerritory} ///
						error={validated && INVALID_TERRITORY.condition}
					>
						{territories.map((i) => (
							<MenuItem value={i} key={i}>
								{i}
							</MenuItem>
						))}
					</CustomTextField>
				</div>
			</div>
		</div>
	)
}

const supportStyles = {
	mainContainer: {
		margin: "10px",
		height: "100%",
		display: "flex",
		marginTop: "20px",
	},
	leftBox: {
		height: "100%",
		display: "flex",
		alignItems: "center",
		flexDirection: "column",
		justifyContent: "center",
	},
	rightBox: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
	},
	territory: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
	},
}

PersonalInfo.propTypes = {
	onValidate: PropTypes.func,
}

export default PersonalInfo
