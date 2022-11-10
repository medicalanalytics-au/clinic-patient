import "../../App.css"
import PropTypes from "prop-types"

// material ui
import { IconButton, Modal } from "@mui/material"

// react icons
import { IoCloseOutline } from "react-icons/io5"
import { BsArrowLeft } from "react-icons/bs"

const DashboardModal = (props) => {
	const Header = () => {
		return (
			<div style={styles.header}>
				<div style={{ ...styles.headerBackIcon, visibility: props.mobile ? "visible" : "hidden" }}>
					<IconButton onClick={() => props.close()}>
						<BsArrowLeft />
					</IconButton>
					<div style={styles.headerTitle}>{props.title}</div>
				</div>

				<IconButton style={{ visibility: props.mobile ? "hidden" : "visible" }} onClick={() => props.close()}>
					<IoCloseOutline />
				</IconButton>
			</div>
		)
	}
	return (
		<Modal open={props.open}>
			<div style={styles.overlay}>
				<div className={"dashboardModal" + (props.small === true ? " dashboardModalSmall" : "")}>
					<Header title={props.title} />
					<div style={styles.content}>{props.content}</div>
				</div>
			</div>
		</Modal>
	)
}

DashboardModal.propTypes = {
	mobile: PropTypes.bool,
	title: PropTypes.string,
	content: PropTypes.node,
	open: PropTypes.bool,
	close: PropTypes.func,
	small: PropTypes.bool,
}

const styles = {
	overlay: {
		height: "100%",
		width: "100%",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		flexDirection: "column",
	},
	header: {
		width: "100%",
		height: "40px",
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	headerBackIcon: {
		display: "flex",
		flexDirection: "row",
	},
	headerTitle: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		fontWeight: "bold",
	},
	content: {
		height: "100%",
		padding: "10px",
	},
}
export default DashboardModal
