import { useContext, useEffect } from "react"
import "../../../App.css"

// react icons
import { FaNotesMedical } from "react-icons/fa"
import { IoInformationCircle } from "react-icons/io5"
import { GiPadlock } from "react-icons/gi"

// context
import { ProfileContext } from "../../../App"

// custom functions
import { loadAppointments } from "../../../utils/helpers"

// custom components
import PersonalInfo from "./PersonalInfo"
import Tabs from "./Tabs"
import MedicalHistory from "./MedicalHistory"
import Password from "./Password"

const Profile = () => {
	const value = useContext(ProfileContext)
	const { state, dispatch } = value
	const { _id, email } = state

	useEffect(() => {
		console.log('3')
		loadAppointments(dispatch, _id)
	}, [_id, dispatch])

	const tabs = [
		{ title: "Personal Info", screen: <PersonalInfo />, icon: <IoInformationCircle /> },
		{ title: "Medical History", screen: <MedicalHistory />, icon: <FaNotesMedical /> },
		{ title: "Password", screen: <Password />, icon: <GiPadlock /> },
	]

	return (
		<div className="pages" style={styles.mainContainer}>
			<div className="dashboardInnerContainer">
				<div style={styles.header}>
					<div style={{ marginLeft: "10px" }}>PROFILE</div>
				</div>
				<div style={styles.body}>
					<Tabs content={tabs} />
				</div>
				<div className="dashboardEmailDisplay">{email}</div>
			</div>
		</div>
	)
}

const styles = {
	mainContainer: {
		height: "100vh",
		width: "100vw",
		top: "0px",
		left: "0px",
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		position: "absolute",
		zIndex: 1,
		flexDirection: "column",
	},
	header: {
		margin: "10px",
		fontWeight: "bold",
		color: "black",
		width: "98%",
		letterSpacing: "0.2em",
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	body: {
		margin: "10px",
		width: "98%",
		height: "100%",
		letterSpacing: "0.1em",
		position: "relative",
	},
}
export default Profile
