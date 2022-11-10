import { useContext, useEffect, useState } from "react"
import "../../../App.css"
import PropTypes from "prop-types"
import { DateTime } from "luxon"
import { cloneDeep } from "lodash"

// material ui
import { IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material"

// react icons
import { GiHamburgerMenu } from "react-icons/gi"

// context
import { ProfileContext } from "../../../App"
import { closeMessage, openMessage, setMessageMode, setMessageRecipient, setMessages, setMessageView, showSnack } from "../../../utils/context"

// custom functions
import { isToday, showError, useResponsiveMedia } from "../../../utils/helpers"

// custom components
import SideMenu from "./SideMenu"

// network
import { common_downloadMessages, common_sendMessage, common_updateReadStatus } from "../../../utils/network"

// Swal
import { addDialog } from "../../../utils/context"
import { GenericError } from "../../../utils/sweetalertDialogs"

// constants
import { MAINCOLOR_LIGHT, MEDIA, NEWMAIL, ORIENTATION } from "../../../utils/constants"
import { MODE, VIEW } from "../../../utils/constants"

const Cell = ({ text, header, width, bold }) => {
	const style = {
		padding: "5px",
		fontWeight: header || bold ? "bold" : "normal",
		width: width || "auto",
		backgroundColor: header ? "#f3f3f3" : "white",
	}
	return <TableCell style={style}>{text}</TableCell>
}

Cell.propTypes = {
	text: PropTypes.string,
	width: PropTypes.string,
	header: PropTypes.bool,
	bold: PropTypes.bool,
}

const downloadMessages = (dispatch, id) => {
	common_downloadMessages(dispatch, id)
		.then((res) => setMessages(dispatch, res))
		.catch((error) => showError(dispatch, error))
}

export const submitMessage = (dispatch, id, msg) => {
	common_sendMessage(dispatch, msg)
		.then(() => {
			showSnack(dispatch, msg.datetime ? (msg.from_id === "ADMIN" ? "Message reported" : "Mail sent") : "Draft saved")
			downloadMessages(dispatch, id)
			closeMessage(dispatch)
		})
		.catch((error) =>
			addDialog(dispatch, {
				dialog: GenericError(msg.datetime ? "Error in sending mail\n" + error : "Error in saving draft\n" + error),
				onConfirm: () => downloadMessages(dispatch, id),
			})
		)
}

export const changeReadStatus = (dispatch, id, messages, status) => {
	common_updateReadStatus(id, status)
		.then(() => {
			const _messages = cloneDeep(messages)
			const pos = _messages.findIndex((i) => i._id === id)
			_messages[pos].read = status
			setMessages(dispatch, _messages)
		})
		.catch((error) => showError(dispatch, error))
}

export const deleteDraftMessageFromList = (dispatch, id, messages) => {
	const _messages = cloneDeep(messages)
	const pos = _messages.findIndex((i) => i._id === id)
	_messages.splice(pos, 1)
	setMessages(dispatch, _messages)
}

const Messages = () => {
	const { state, dispatch } = useContext(ProfileContext)
	const { messages, message } = state
	const { view } = message

	const [drawerOpen, setDrawerOpen] = useState(false)

	const media = useResponsiveMedia()
	const mobilePortrait = () => media.type === MEDIA.MOBILE && media.orientation === ORIENTATION.PORTRAIT

	// const [view, setView] = useState(VIEW.INBOX)

	// const [messages, setMessages] = useState([])
	const [sourceArray, setSourceArray] = useState([])

	useEffect(() => {
		downloadMessages(dispatch, state._id)
	}, [state._id, dispatch])

	useEffect(() => {
		view !== NEWMAIL &&
			setSourceArray(
				view === VIEW.INBOX
					? messages.filter((i) => i.to_id === state._id) //
					: view === VIEW.DRAFT
					? messages.filter((i) => i.datetime === null)
					: messages.filter((i) => i.from_id === state._id && i.datetime !== null)
			)
	}, [view, messages, state._id])

	const handleViewChange = (selection) => {
		if (selection === NEWMAIL) {
			setMessageRecipient(dispatch, null)

			const body = {
				datetime: null,
				practice: null,
				practice_address: null,
				subject: null,
				text: "",
				to: null,
				to_id: null,
			}

			const senderData = {
				datetime: null,
				from_id: state._id,
				to: null,
				to_id: "",
			}

			openMessage(dispatch, {
				body,
				senderData,
				// new: true,
			})

			setMessageMode(dispatch, MODE.EDIT)
		} else {
			setMessageView(dispatch, selection)
		}
	}

	const styles = {
		...subStyles,
		tableContainer: {
			...supportStyles.tableContainer,
			marginLeft: mobilePortrait() ? 0 : "10px",
			position: mobilePortrait() ? "absolute" : "inherit",
		},
	}

	return (
		<div style={styles.mainContainer}>
			<div style={styles.header}>
				<div style={styles.headerTitle}>
					{mobilePortrait() && (
						<IconButton size="small" onClick={() => setDrawerOpen((drawerOpen) => !drawerOpen)}>
							<GiHamburgerMenu style={styles.menuIcon} />
						</IconButton>
					)}
					<div style={{ marginRight: "5px" }}>Messages - </div>
					<div>{view === VIEW.INBOX ? "Inbox" : view === VIEW.DRAFT ? "Draft" : "Sent"}</div>
				</div>
			</div>

			<div style={styles.innerContainer}>
				{mobilePortrait() ? (
					drawerOpen && <SideMenu close={() => setDrawerOpen(false)} onChange={handleViewChange} />
				) : (
					<SideMenu onChange={handleViewChange} />
				)}

				<div style={styles.tableContainer}>
					<TableContainer>
						<Table padding="none">
							<TableHead>
								<TableRow>
									<Cell text={view === VIEW.INBOX ? "From" : "To"} header width={mobilePortrait() ? "40%" : "20%"} />
									<Cell text="Subject" header />
									{view !== VIEW.DRAFT && <Cell text={view === VIEW.INBOX ? "Received" : "Sent"} header width="10%" />}
								</TableRow>
							</TableHead>
							<TableBody>
								{sourceArray
									.sort((a, b) => a.datetime - b.datetime)
									.map((i) => {
										return (
											<TableRow
												key={i._id}
												onClick={() => {
													const { from, to_practice, to_practice_address, to, to_id, datetime, read } = i

													setMessageMode(dispatch, MODE.READ)
													openMessage(dispatch, {
														body: i,
														senderData: {
															datetime,
															from,
															to,
															to_id,
															to_practice,
															to_practice_address,
														},
														// new: false,
													})

													to_id === state._id && !read && changeReadStatus(dispatch, i._id, state.messages, true)
												}}
											>
												<Cell bold={!i.read && view === VIEW.INBOX} text={view === VIEW.INBOX ? i.from : i.to ? i.to : "<No recipient>"} />
												<Cell bold={!i.read && view === VIEW.INBOX} text={i.subject || "<No subject>"} />
												<Cell
													bold={!i.read && view === VIEW.INBOX}
													text={
														i.datetime
															? isToday(i.datetime)
																? DateTime.fromMillis(i.datetime).toLocaleString(DateTime.TIME_SIMPLE)
																: DateTime.fromMillis(i.datetime).toFormat("dd/LL/yy")
															: ""
													}
												/>
											</TableRow>
										)
									})}
							</TableBody>
						</Table>
					</TableContainer>
				</div>
			</div>
		</div>
	)
}

const supportStyles = {
	tableContainer: {
		width: "100%",
		top: 0,
		left: 0,
	},
}

const subStyles = {
	mainContainer: {
		display: "flex",
		flexDirection: "column",
		height: "90%",
	},
	header: {
		marginBottom: "10px",
		width: "100%",
		backgroundColor: MAINCOLOR_LIGHT,
		color: "white",
	},
	headerTitle: {
		margin: "10px",
		display: "flex",
		flexDirection: "row",
		alignItems: "center",
		fontSize: "20px",
		fontWeight: "bold",
		menuIcon: { color: "white", marginRight: "10px" },
	},
	innerContainer: {
		display: "flex",
		flexDirection: "row",
		height: "100%",
		position: "relative",
	},
}
export default Messages
