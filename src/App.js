/**
 * Main entry point
 *
 * This file renders either a <Main/> or <LandingPage/>, depending on login status
 *
 * <LandingPage/> will render <LoginBox/> which will call onLogin callback function upon successful login, passed through
 * a prop.
 *
 * Upon successful login:
 * 		perform these functions :
 *			- createSocket()
 *			- login() 					  - add socket details to Context state
 *			- common_loadGlobalSettings() - updates the Context state
 *
 * It loads 2 components that will be used universally throughout application, which will be rendered depending
 * on the Context state status of the component
 *  	- <Snackbar/>
 *  	- <Spinner/>
 *
 */

// TODO --------------- <LandingPage/>
// TODO - add sessiontokens
// TODO - encrypt data

import { createContext, useReducer } from "react"
import "./App.css"
import { Helmet } from "react-helmet"

// material ui
import { Snackbar, SnackbarContent, ThemeProvider } from "@mui/material"

// icons
import mail from "./images/mail.png"

// custom functions
import { createSocket, showError, THEME } from "./utils/helpers"

// custom Messages functions
import { changeReadStatus, deleteDraftMessageFromList, submitMessage } from "./components/Dashboard/Messages/Messages"

// constants
import { center, MODE } from "./utils/constants"

// custom components
import LandingPage from "./components/LandingPage"
import Main from "./components/Main"
import Message from "./components/Dashboard/Messages/Message"
import SenderInfoBox from "./components/Dashboard/Messages/SenderInfoBox"
import ModalScreen from "./components/Common/ModalScreen"
import Spinner from "./components/Common/Spinner"

// context
import { closeMessage, hideSnack, initialState, login, logout, reducer, setGlobalSettings, setMessageMode } from "./utils/context"

// network
import { common_loadGlobalSettings } from "./utils/network"

export const ProfileContext = createContext()

function App() {
	const [state, dispatch] = useReducer(reducer, initialState)
	const { show, text, fullMode, lightFont } = state.spinner

	const handleClose = (event, reason) => {
		if (reason === "clickaway") {
			return
		}

		hideSnack(dispatch)
	}

	const onLogin = (payload) => {
		createSocket(payload._id, dispatch, state)
		login(dispatch, payload) // add socket details to state
		
		common_loadGlobalSettings(dispatch)
			.then((res) => setGlobalSettings(dispatch, res))
			.catch((error) => showError(dispatch, error))
	}

	return (
		<ProfileContext.Provider value={{ state, dispatch }}>
			<ThemeProvider theme={THEME}>
				<Snackbar
					sx={{ width: "100%", textAlign: "center", flexGrow: 1 }}
					open={state.showSnack}
					autoHideDuration={3000}
					onClose={handleClose}
					anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
				>
					<SnackbarContent message={state.snackMessage} style={{ ...center }} />
				</Snackbar>

				<Spinner open={show} text={text} fullMode={fullMode} lightFont={lightFont} />

				<ModalScreen
					icon={mail}
					open={state.message.open}
					close={() => closeMessage(dispatch)}
					closeIcon={state.message.mode === MODE.READ}
					content={
						<Message
							onModeChange={(mode) => setMessageMode(dispatch, mode)}
							view={state.message.view}
							new={state.message.new} // * indicates whether this is a new message
							close={() => closeMessage(dispatch)}
							onMessageSubmit={(msg) => submitMessage(dispatch, state._id, msg)}
							onChangeReadStatus={(id, status) => changeReadStatus(dispatch, id, state.messages, status)}
							onDraftDeleted={(id) => deleteDraftMessageFromList(dispatch, id, state.messages)}
						/>
					}
					title={<SenderInfoBox />}
				/>

				<div className="App main">
					<Helmet>
						<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
						<meta name="description" content="Medical Analytics" />
						<title>Online Dental Consultation</title>
					</Helmet>
					{state.loggedIn ? <Main close={() => logout(dispatch)} /> : <LandingPage onLogin={onLogin} />}
				</div>
			</ThemeProvider>
		</ProfileContext.Provider>
	)
}

export default App
