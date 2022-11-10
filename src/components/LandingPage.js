
/**
 * Landing Page
 * 
 * Renders LoginBox
 * 
 */
import { useContext, useEffect, useState } from "react"
import "../App.css"
import PropTypes from "prop-types"

// material ui
import { Button, Checkbox, FormControlLabel, Grow, TextField, } from "@mui/material"

// images
import child_smile from "../../src/images/child_smile.jpg"
import convenience_video from "../../src/images/convenience_video.jpg"
import logo from "../../src/images/medicalanalyticstransparentbackground.png"

// network
import { patient_auth } from "../utils/network"

// Swal
import Swal from "sweetalert2"
import { GenericError } from "../utils/sweetalertDialogs"

// placeholder
import { ProfileContext } from "../App"
import ModalScreen from "./Common/ModalScreen"
import NewPatientRegistration from "./NewPatientRegistration/NewPatientRegistration"

const WELCOME_TITLE = "Online dental consultation"

const FIRST_TITLE = "Protect your smile"

const SECOND_TITLE = "Connect anywhere"

const FIRST_CAPTION =
	"Whether it is something of an immediate concern, or just to alleviate your worries, a dentist will be available almost instantaneously"
const SECOND_CAPTION = "At the comfort of your home, in the office, or just anywhere. Consult a dentist through your computer or mobile devices"

const LoginBox = (props) => {
	const { dispatch } = useContext(ProfileContext)

	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")

	const handleLogin = async () => {
		try {
			const res = await patient_auth(dispatch, email, password)
			props.onLogin(res)
		} catch (error) {
			Swal.fire(GenericError(error.message === "Failed to fetch" ? "Server is offline. Please try again" : error))
		}
	}

	return (
		<div className="loginBox">
			<div className="loginInnerBox">
				<div style={styles.loginHeader}>
					<div style={{ fontWeight: "bold" }}>Login</div>
					<div style={{ fontSize: "12px", marginTop: "5px", marginBottom: "10px" }}>Connect to a dentist now</div>
				</div>

				<TextField
					label="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					autoComplete="none"
					autoFocus
					InputLabelProps={{ shrink: true }}
					style={styles.loginTextfield}
				/>

				<TextField
					label="password"
					value={password}
					onChange={(e) => {
						setPassword(e.target.value)
					}}
					InputLabelProps={{ shrink: true }}
					style={styles.loginTextfield}
				/>
				<FormControlLabel
					sx={{ marginBottom: "5px", fontSize: 10 }}
					label={<div style={{ ...styles.helperText, marginTop: "10%", marginBottom: "10px" }}>Remember me</div>}
					control={<Checkbox size="small" color="primary" sx={{ fontSize: "10px" }} />}
				/>
				<Button variant="outlined" style={{ width: "40%" }} onClick={handleLogin}>
					Login
				</Button>
				{/* <div style={{ ...styles.helperText, marginTop: "10%", marginBottom: "10px" }}>Having trouble logging in?</div> */}
				<div style={{ ...styles.helperText, marginBottom: "10px" }} onClick={props.onRegister}>
					Register for an account
				</div>
			</div>
		</div>
	)
}

LoginBox.propTypes = {
	onLogin: PropTypes.func,
	demo: PropTypes.bool,
	onChange: PropTypes.func,
	onRegister: PropTypes.func,
}

const Header = (props) => {
	return (
		<div className="header" style={{ cursor: "pointer" }} onClick={props.onClick}>
			<img src={logo} alt="logo" style={styles.logo} />
		</div>
	)
}

Header.propTypes = {
	onClick: PropTypes.func,
}

const Title = () => {
	return <div className="welcomeTitle">{WELCOME_TITLE}</div>
}

const Captions = () => {
	const [loaded, setLoaded] = useState(false)

	useEffect(() => setLoaded(true), [])

	return (
		<div className="captions">
			<Grow in={loaded} style={{ transformOrigin: "0 0 0" }} {...(loaded ? { timeout: 1500 } : {})}>
				<div className="captionBox captionBox1">
					<img src={child_smile} alt="child smile" className="captionImage captionImage1" />
					<div className="captionText captionText1">
						<h4 className="h4Bold">{FIRST_TITLE}</h4>
						<h4 className="h4Normal">{FIRST_CAPTION}</h4>
					</div>
				</div>
			</Grow>

			<Grow in={loaded} style={{ transformOrigin: "0 0 0" }} {...(loaded ? { timeout: 3000 } : {})}>
				<div className="captionBox captionBox2">
					<div className="captionText captionText2">
						<h4 className="h4Bold">{SECOND_TITLE}</h4>
						<h1 className="h4Normal">{SECOND_CAPTION}</h1>
					</div>
					<img src={convenience_video} alt="child smile" className="captionImage captionImage2" />
				</div>
			</Grow>
		</div>
	)
}

const LandingPage = (props) => {
	const [demo, setDemo] = useState(false)
	const [registerNewAccount, setRegisterNewAccount] = useState(false)

	return (
		<>
			<div className="dentistbackgroundimage" />
			<ModalScreen
				icon={logo}
				open={registerNewAccount}
				close={() => setRegisterNewAccount(false)}
				closeIcon={true}
				content={<NewPatientRegistration close={() => setRegisterNewAccount(false)} onAccountCreate={(res) => props.onLogin(res)} />}
				title={"New Patient Registration"}
			/>
			<Header />
			<Title />
			<Captions />
			<LoginBox onLogin={(res) => props.onLogin(res)} demo={demo} onChange={(e) => setDemo(!demo)} onRegister={() => setRegisterNewAccount(true)} />
		</>
	)
}

LandingPage.propTypes = {
	onLogin: PropTypes.func,
}

const styles = {
	loginHeader: {
		width: "80%",
		margin: "10px",
	},
	loginTextfield: {
		width: "80%",
		marginBottom: "10px",
	},
	helperText: {
		fontSize: "10px",
		cursor: "pointer",
	},
	logo: {
		height: "45px",
		marginLeft: "50px", ///
	},
}
export default LandingPage
