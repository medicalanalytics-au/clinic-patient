import "../../App.css"
import PropTypes from "prop-types"

// material ui
import { Modal } from "@mui/material"

// custom component
import Header from "./Header"
import { useContext, useEffect } from "react"
import { ProfileContext } from "../../App"
import { center, GRAY, MAINCOLOR } from "../../utils/constants"
import { BeatLoader } from "react-spinners"
import { setModalScreenActive } from "../../utils/context"

const ModalScreen = (props) => {
	const { state, dispatch } = useContext(ProfileContext)
	const { show, text } = state.spinner

	useEffect(() => {
		// * currently, this is being use to prevent Spinner from displaying if ModalScreen is active, as
		// * another spinner will be displayed in the ModalScreen box

		setModalScreenActive(dispatch, props.open || false)
	}, [props.open, dispatch])

	return (
		<Modal className="glass" open={props.open} onClose={() => props.close()} disableEscapeKeyDown={props.closeIcon === false}>
			<div style={styles.overlay}>
				<div className="ModalScreen" style={{ position: "relative" }}>
					<Header closeIcon={props.closeIcon} icon={props.icon} title={props.title} close={() => props.close()} />

					{props.content}
					{show && (
						<div style={{ ...center, flexDirection: "column", position: "absolute", bottom: "10px", width: "100%" }}>
							<BeatLoader color={MAINCOLOR} />
							<div style={{ fontSize: "10px", color: GRAY }}>{text}</div>
						</div>
					)}
				</div>
			</div>
		</Modal>
	)
}

ModalScreen.propTypes = {
	open: PropTypes.bool,
	close: PropTypes.func,
	content: PropTypes.node,
	closeIcon: PropTypes.bool,
	icon: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
	title: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
}

const styles = {
	overlay: {
		height: "100%",
		width: "100%",
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
	},
}
export default ModalScreen
