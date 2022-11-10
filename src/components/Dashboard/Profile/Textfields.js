import { useState } from "react"
import "../../../App.css"
import PropTypes from "prop-types"

// material ui
import { InputAdornment, TextField } from "@mui/material"

// react icons
import { RiEyeCloseLine, RiEyeLine } from "react-icons/ri"

export const CustomTextField = (props) => {
	return (
		<div className={props.short ? "personalInfoShortTextWidth" : "personalInfoFullTextWidth"}>
			<TextField
				label={props.label}
				required
				select={props.select ? true : false}
				variant={"outlined"}
				value={props.value}
				onChange={props.onChange}
				style={styles.TextField}
				size={"small"}
			>
				{props.select && props.children}
			</TextField>
		</div>
	)
}

CustomTextField.propTypes = {
	label: PropTypes.string,
	value: PropTypes.string,
	onChange: PropTypes.func,
	short: PropTypes.bool,
}

export const PasswordTextField = (props) => {
	const [showPassword, setShowPassword] = useState(false)

	return (
		<TextField
			label={props.label}
			value={props.value}
			onChange={props.onChange}
			autoFocus={props.autoFocus || false}
			required
			variant={"outlined"}
			autoComplete={"off"}
			size={"small"}
			style={styles.PasswordTextField}
			type={showPassword ? "text" : "password"}
			onCopy={(e) => props.preventCopy && e.preventDefault()}
			onPaste={(e) => props.preventPaste && e.preventDefault()}
			InputProps={{
				endAdornment: (
					<InputAdornment position="end">
						{showPassword ? (
							<RiEyeLine style={styles.icon} onClick={() => setShowPassword(false)} />
						) : (
							<RiEyeCloseLine style={styles.icon} onClick={() => setShowPassword(true)} />
						)}
					</InputAdornment>
				),
			}}
		/>
	)
}
PasswordTextField.propTypes = {
	label: PropTypes.string,
	value: PropTypes.string,
	onChange: PropTypes.func,
	autoFocus: PropTypes.bool,
	preventCopy: PropTypes.bool,
	preventPaste: PropTypes.bool,
}

export const MultilineTextField = (props) => {
	return (
		<TextField
			label={props.label}
			required
			multiline
			rows={props.rows}
			variant={"outlined"}
			value={props.value}
			onChange={props.onChange}
			style={styles.MultilineTextField}
		/>
	)
}

MultilineTextField.propTypes = {
	label: PropTypes.string,
	value: PropTypes.string,
	onChange: PropTypes.func,
	rows: PropTypes.number,
}

const styles = {
	TextField: {
		width: "100%",
	},
	PasswordTextField: {
		width: "100%",
		marginBottom: "10px",
	},
	icon: {
		cursor: "pointer",
	},
	MultilineTextField: {
		width: "100%",
		marginBottom: "10px",
	},
}
