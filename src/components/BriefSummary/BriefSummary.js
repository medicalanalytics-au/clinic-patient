import { useContext, useEffect, useRef, useState } from "react"
import "../../App.css"
import PropTypes from "prop-types"

// material ui
import { TextField } from "@mui/material"

// react icons
import { MdPhotoCamera } from "react-icons/md"

// custom functions
import { useResponsiveMedia } from "../../utils/helpers"

import { center, MAINCOLOR, MEDIA, ORIENTATION } from "../../utils/constants"
import { updateSymptomDescription } from "../../utils/context"
import { ProfileContext } from "../../App"

const BriefSummary = (props) => {
	const { state, dispatch } = useContext(ProfileContext)
	const { text, image } = state.consultation.summary

	const inputfieldContainerRef = useRef()
	const textfieldRef = useRef()

	const media = useResponsiveMedia()
	const mobile = media.type === MEDIA.MOBILE
	const tablet = media.type === MEDIA.TABLET
	const portrait = media.orientation === ORIENTATION.PORTRAIT
	const landscape = media.orientation === ORIENTATION.LANDSCAPE
	const mobilePortrait = mobile && portrait
	const screenLandscape = !mobile && !tablet && landscape

	const [rows, setRows] = useState(1)

	useEffect(() => {
		inputfieldContainerRef.current && setRows(Math.round((inputfieldContainerRef?.current?.clientHeight - 10) / 24) - 1)
	}, [media])

	const styles = {
		...subStyles,
		inputFieldContainer: {
			...supportStyles.inputFieldContainer,
			width: mobilePortrait ? "90%" : "95%",
		},
	}

	return (
		<div style={styles.mainContainer}>
			<div style={styles.inputFieldContainer} ref={inputfieldContainerRef} onClick={() => textfieldRef.current.focus()}>
				<TextField
					inputRef={textfieldRef}
					fullWidth
					autoFocus
					multiline
					variant="standard"
					InputProps={{ disableUnderline: true }}
					inputProps={{ maxLength: 300 }}
					placeholder={"Please provide a brief summary of symptoms"}
					rows={rows - (screenLandscape ? 0 : 0)}
					value={text}
					onChange={(e) => updateSymptomDescription(dispatch, e.target.value)}
				/>
			</div>
			<div style={styles.controlBar}>
				<div style={styles.controlBarInnerContainer}>
					<div style={styles.thumbnail}>
						{image && <img src={image} alt="thumbnail" style={{ height: "40px", width: "40px", zIndex: 1000 }} onClick={props.onEditImage} />}
					</div>
					<div style={styles.cameraButton} onClick={props.onImageCapture}>
						<MdPhotoCamera style={{ color: "white" }} />
					</div>
					<div style={{ marginRight: "10px", fontSize: "12px" }}>{text.length}/300</div>
				</div>
			</div>
		</div>
	)
}
const supportStyles = {
	inputFieldContainer: {
		margin: "10px",
		border: "1px solid silver",
		height: "90%",
		borderRadius: "5px",
		padding: "10px",
	},
}

const subStyles = {
	mainContainer: {
		height: "100%",
		display: "flex",
		flexDirection: "column",
		top: 0,
		position: "relative", ///
	},
	controlBar: {
		width: "100%",
	},
	controlBarInnerContainer: {
		width: "100%",
		height: "100%",
		position: "relative",
		...center, ///
		flexDirection: "row",
		justifyContent: "space-between",
	},
	thumbnail: {
		height: "40px",
		width: "40px",
		marginLeft: "10px",
	},
	cameraButton: {
		height: "40px",
		width: "40px",
		borderRadius: "20px",
		border: "1px solid " + MAINCOLOR,
		backgroundColor: MAINCOLOR,
		...center,
		zIndex: 1000,
	},
	continueButtonContainer: {
		position: "absolute",
		...center,
		bottom: "0px",
		width: "100%",
		height: "100%",
		display: "flex",
		justifyContent: "flex-end",
		marginRight: "20px",
	},
}

BriefSummary.propTypes = {
	onImageCapture: PropTypes.func,
	onEditImage: PropTypes.func,
	onContinue: PropTypes.func,
}

export default BriefSummary
