import { useContext, useState } from "react"
import "../../../App.css"

// material ui
import { useTheme } from "@emotion/react"
import { Button, useMediaQuery } from "@mui/material"

// custom components
import { PasswordTextField } from "./Textfields"

// context
import { ProfileContext } from "../../../App"

// Swal
import { addDialog } from "../../../utils/context"
import { GenericAlert, GenericDialog, GenericError } from "../../../utils/sweetalertDialogs"

// network
import { patient_changePassword } from "../../../utils/network"


// constants
import { MAINCOLOR } from "../../../utils/constants"

const Password = () => {
	const value = useContext(ProfileContext)
	const { state, dispatch } = value

	const [currentPassword, setCurrentPassword] = useState("")
	const [newPassword, setNewPassword] = useState("")
	const [confirmPassword, setConfirmPassword] = useState("")

	const theme = useTheme()
	const mobile = useMediaQuery(theme.breakpoints.down("sm"))

	const styles = {
		...subStyles,
		passwordContainer: {
			...supportStyles.passwordContainer,
			width: mobile ? "95%" : "30%",
		},
	}

	const checkFields = () => {
		const firstline = "Password must be at least 8 characters long and must contain : <br>"
		const secondline = "<br>A mixture of uppercase and lowercase letters"
		const thirdline = "<br>A mixture of letters and numbers"
		const fourthline = "<br>At least one special character"
		const INVALID = firstline + secondline + thirdline + fourthline

		const validField = (field) => /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(field)

		return new Promise((resolve, reject) => {
			if (validField(currentPassword)) {
				if (validField(newPassword)) {
					if (validField(confirmPassword)) {
						if (newPassword === currentPassword) {
							reject("New password must be different from current password")
						} else if (newPassword !== confirmPassword) {
							reject("New passwords does not match")
						} else resolve()
					} else reject(INVALID)
				} else reject(INVALID)
			} else reject("Current password is invalid")
		})
	}
	const updatePassword = () => {
		const clearFields = () => {
			setCurrentPassword("")
			setNewPassword("")
			setConfirmPassword("")
		}

		const displayError = (error) => {
			clearFields()
			addDialog(dispatch, {
				dialog: GenericError(error),
			})
		}

		checkFields()
			.then(() => {
				addDialog(dispatch, {
					dialog: GenericDialog("Update password?"),
					onConfirm: () =>
						patient_changePassword(dispatch, state._id, currentPassword, newPassword)
							.then(() => {
								clearFields()
								addDialog(dispatch, {
									dialog: GenericAlert("Password changed successfully"),
								})
							})
							.catch(displayError),
				})
			})
			.catch(displayError)
	}

	return (
		<div style={{ display: "flex", flexDirection: "column", color: MAINCOLOR }}>
			<div style={styles.passwordContainer}>
				<div style={styles.label}>Change Password</div>
				<PasswordTextField
					label={"Current Password"}
					value={currentPassword}
					onChange={(event) => setCurrentPassword(event.target.value)}
					autoFocus
				/>
				<PasswordTextField
					label={"New Password"}
					value={newPassword}
					onChange={(event) => setNewPassword(event.target.value)}
					preventCopy
					preventPaste
				/>
				<PasswordTextField
					label={"Confirm New Password"}
					value={confirmPassword}
					onChange={(event) => setConfirmPassword(event.target.value)}
					preventCopy
					preventPaste
				/>
				<div>
					<Button disabled={currentPassword.length < 8 || newPassword.length < 8 || confirmPassword.length < 8} onClick={updatePassword}>
						Save New Password
					</Button>
				</div>
			</div>
		</div>
	)
}

const supportStyles = {
	passwordContainer: {
		padding: "10px",
		display: "flex",
		flexDirection: "column",
	},
}
const subStyles = {
	label: {
		fontWeight: "bold",
		margin: "5px",
	},
}

export default Password
