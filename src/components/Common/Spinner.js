// Dental / Doctor / Web
import PropTypes from "prop-types"
import "../../App.css"
import RotateLoader from "react-spinners/RotateLoader"
import SyncLoader from "react-spinners/SyncLoader"
import { Modal } from "@mui/material"
import { center, GRAY, MAINCOLOR, WHITE } from "../../utils/constants"
import { useContext } from "react"
import { ProfileContext } from "../../App"

const Spinner = (props) => {
	const { state } = useContext(ProfileContext)
	const { modalScreenActive } = state

	const transparency = props.fullMode ? "0.5" : "0"

	return (
		<Modal open={props.open && !modalScreenActive} hideBackdrop>
			<div
				style={{
					height: "100vh",
					width: "100vw",
					display: "flex",
					justifyContent: "center",
					backgroundColor: "rgba(0, 0, 0, " + transparency + ")",
					alignItems: props.fullMode ? "center" : "flex-end",
				}}
			>
				<div
					style={{
						display: "flex",
						flexDirection: props.fullMode ? "column" : "row",
						...center,
						marginBottom: props.fullMode ? "0px" : "100px",
					}}
				>
					{props.fullMode ? (
						<RotateLoader color={props.color || MAINCOLOR} loading={props.open} />
					) : (
						<SyncLoader color={props.color || MAINCOLOR} loading={props.open} />
					)}

					{props.text && (
						<div
							style={{
								marginTop: props.fullMode ? "20px" : "0px",
								marginLeft: props.fullMode ? "0px" : "20px",
								color: props.lightFont ? WHITE : GRAY,
								fontWeight: "bold",
							}}
						>
							{props.text}
						</div>
					)}
				</div>
			</div>
		</Modal>
	)
}

Spinner.propTypes = {
	open: PropTypes.bool,
	text: PropTypes.string,
	color: PropTypes.string,
	fullMode: PropTypes.bool,
}

export default Spinner
