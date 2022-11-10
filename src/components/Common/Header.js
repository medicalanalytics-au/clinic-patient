import "../../App.css"
import PropTypes from "prop-types"

// material ui
import { IconButton } from "@mui/material"

// react icons
import { IoCloseOutline } from "react-icons/io5"

// custom functions
import { useResponsiveMedia } from "../../utils/helpers"

// constants
import { MEDIA, ORIENTATION, } from "../../utils/constants"

const Header = (props) => {
	const media = useResponsiveMedia()

	const styles = {
		...subStyles,
		icon: {
			...supportStyles.icon,
			height: media.type === MEDIA.MOBILE ? (media.orientation === ORIENTATION.PORTRAIT ? "40px" : "20px") : "50px",
		},
		titleBox: {
			...supportStyles.titleBox,
			fontSize: media.type === MEDIA.MOBILE ? (media.orientation === ORIENTATION.PORTRAIT ? "20px" : "10px") : "20px",
		},
	}

	return (
		<div style={styles.header}>
			<div style={styles.titleBox}>
				{props.icon ? typeof props.icon === "string" ? <img src={props.icon} alt={"propsIcon"} style={styles.icon} /> : props.icon : null}
				<div style={{ marginLeft: "10px" }}>{props.title}</div>
			</div>
			<div style={styles.closeIcon}>
				{(props.closeIcon === undefined || props.closeIcon === true) && (
					<IconButton onClick={() => props.close()}>
						<IoCloseOutline />
					</IconButton>
				)}
			</div>
		</div>
	)
}

Header.propTypes = {
	closeIcon: PropTypes.bool,
	icon: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
	title: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
	close: PropTypes.func,
}

const supportStyles = {
	icon: {
		// top: "10px",
		marginLeft: "10px",
		marginRight: "10px",
	},
	titleBox: {
		fontWeight: "bold",
		display: "flex",
		alignItems: "center",
		flexDirection: "row",
	},
}
const subStyles = {
	header: {
		marginTop: "10px",
		color: "gray",
		position: "relative",
	},
	closeIcon: {
		position: "absolute",
		top: -3,
		right: "10px",
	},
}
export default Header
