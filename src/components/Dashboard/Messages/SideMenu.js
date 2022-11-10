import { useContext, useState } from "react"
import "../../../App.css"
import PropTypes from "prop-types"

/// material ui
import { Badge, Button, ClickAwayListener, Divider, List, ListItem, ListItemButton } from "@mui/material"

// react icons
import { AiOutlineInbox, AiOutlineSend, AiOutlineMail } from "react-icons/ai"
import { RiDraftLine } from "react-icons/ri"

// context
import { ProfileContext } from "../../../App"

// custom hook
import { useResponsiveMedia } from "../../../utils/helpers"

// constants
import { BLACK, center, MAINCOLOR, MEDIA, NEWMAIL, ORIENTATION, VIEW } from "../../../utils/constants"

const SideMenu = ({ close, onChange }) => {
	const { state } = useContext(ProfileContext)
	const { _id, messages } = state

	const { view } = state.message

	const media = useResponsiveMedia()
	const mobilePortrait = () => media.type === MEDIA.MOBILE && media.orientation === ORIENTATION.PORTRAIT

	const [mode, setMode] = useState(view)

	const isFocus = (selected) => mode === selected

	return (
		<ClickAwayListener onClickAway={() => close && close()}>
			<div style={styles.mainContainer}>
				<List>
					<ListItem>
						<Badge
							color="secondary"
							badgeContent={messages.reduce((total, current) => {
								current.from_id !== _id && !current.read && total++
								return total
							}, 0)}
						>
							<ListItemButton
								onClick={() => {
									setMode(VIEW.INBOX)
									onChange && onChange(VIEW.INBOX)
									mobilePortrait() && close()
								}}
							>
								<AiOutlineInbox style={{ color: isFocus(VIEW.INBOX) ? MAINCOLOR : "silver" }} />
								{!mobilePortrait() && (
									<div
										style={{
											marginLeft: "10px",
											fontWeight: isFocus(VIEW.INBOX) ? "bold" : "normal",
											color: isFocus(VIEW.INBOX) ? MAINCOLOR : BLACK,
										}}
									>
										Inbox
									</div>
								)}
							</ListItemButton>
						</Badge>
					</ListItem>
					<ListItem>
						<ListItemButton
							onClick={() => {
								setMode(VIEW.DRAFT)
								onChange && onChange(VIEW.DRAFT)
								mobilePortrait() && close()
							}}
						>
							<RiDraftLine style={{ color: isFocus(VIEW.DRAFT) ? MAINCOLOR : "silver" }} />
							{!mobilePortrait() && (
								<div
									style={{
										marginLeft: "10px",
										fontWeight: isFocus(VIEW.DRAFT) ? "bold" : "normal",
										color: isFocus(VIEW.DRAFT) ? MAINCOLOR : BLACK,
									}}
								>
									Draft
								</div>
							)}
						</ListItemButton>
					</ListItem>
					<ListItem>
						<ListItemButton
							onClick={() => {
								setMode(VIEW.SENT)
								onChange && onChange(VIEW.SENT)
								mobilePortrait() && close()
							}}
						>
							<AiOutlineSend style={{ color: isFocus(VIEW.SENT) ? MAINCOLOR : "silver" }} />
							{!mobilePortrait() && (
								<div
									style={{
										marginLeft: "10px",
										fontWeight: isFocus(VIEW.SENT) ? "bold" : "normal",
										color: isFocus(VIEW.SENT) ? MAINCOLOR : BLACK,
									}}
								>
									Sent
								</div>
							)}
						</ListItemButton>
					</ListItem>
				</List>
				<Divider />
				<div style={{ ...center }}>
					<Button
						onClick={() => {
							onChange && onChange(NEWMAIL)
							mobilePortrait() && close()
						}}
					>
						<AiOutlineMail style={{ marginRight: "5px" }} />
						{!mobilePortrait() && <div>Compose</div>}
					</Button>
				</div>
			</div>
		</ClickAwayListener>
	)
}

SideMenu.propTypes = {
	view: PropTypes.string,
	close: PropTypes.func,
	onChange: PropTypes.func,
}

const styles = {
	mainContainer: {
		height: "100%",
		boxShadow: "1px 1px 4px 2px silver",
		color: "gray",
		zIndex: 10000,
		backgroundColor: "white",
	},
}
export default SideMenu
