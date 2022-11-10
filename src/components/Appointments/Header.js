import "../../App.css"
import PropTypes from "prop-types"

// material ui
import { IconButton } from "@mui/material"

// react icons
import { IoCloseOutline } from "react-icons/io5"

const Header = (props) => {
	return (
		<div style={styles.header}>
			<div style={styles.iconBox} />
			<div style={styles.titleBox}>{props.title}</div>
			<div style={styles.iconBox}>
				<IconButton onClick={() => props.close()}>
					<IoCloseOutline />
				</IconButton>
			</div>
		</div>
	)
}

Header.propTypes = {
	title: PropTypes.string,
	close: PropTypes.func,
}

const styles = {
	header: {
		padding: "5px",
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		fontWeight: "bold",
		borderBottom: "1px solid silver",
		boxShadow: "0px 0px 8px 1px silver",
		color: "black",
	},
	iconBox: {
		display: "flex",
		flex: "1",
	},
	titleBox: {
		display: "flex",
		flex: "8",
		alignItems: "center",
		justifyContent: "center",
	},
}
export default Header
