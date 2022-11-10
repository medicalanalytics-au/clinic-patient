import "../../App.css"
import PropTypes from "prop-types"

// material ui
import { Button } from "@mui/material"

// react icons
import { MdPhotoCamera } from "react-icons/md"

import { center, MAINCOLOR, WHITE } from "../../utils/constants"

import Webcam from "react-webcam"
import { useContext, useRef, useState } from "react"
import { ProfileContext } from "../../App"
import { updateSymptomImage } from "../../utils/context"

const ImageCapture = (props) => {
	const { state, dispatch } = useContext(ProfileContext)
	const { consultationSummaryImage } = state
	const [image, setImage] = useState(consultationSummaryImage || null)

	const webcamRef = useRef(null)

	const VIDEOHEIGHT = 720
	const VIDEOWIDTH = 1280

	const videoConstraints = {
		width: VIDEOWIDTH,
		height: VIDEOHEIGHT,
		facingMode: "user",
	}

	const capture = () => setImage(webcamRef.current.getScreenshot())
	const reject = () => {
		setImage(null)
		updateSymptomImage(dispatch, null)
	}
	const accept = () => props.onAccept(image)

	return (
		<div style={styles.mainContainer}>
			<div style={{ ...center, height: "100%" }}>Initializing camera</div>
			<div style={styles.imageContainer}>
				{image ? (
					<img src={image} alt="screenshot" style={{ height: "100%", width: "98%", objectFit: "cover" }} />
				) : (
					<Webcam
						audio={false}
						height={VIDEOHEIGHT}
						ref={webcamRef}
						screenshotFormat="image/jpeg"
						width={VIDEOWIDTH}
						mirrored={true}
						videoConstraints={videoConstraints}
					/>
				)}
			</div>
			<div style={styles.controlBar}>
				{image ? (
					<div style={styles.buttonsContainer}>
						<Button variant="outlined" style={styles.rejectButton} onClick={reject}>
							Reject
						</Button>
						<Button variant="contained" style={styles.acceptButton} onClick={accept}>
							Accept
						</Button>
					</div>
				) : (
					<div style={styles.captureButton} onClick={capture}>
						<MdPhotoCamera style={{ color: WHITE }} />
					</div>
				)}
			</div>
		</div>
	)
}

ImageCapture.propTypes = {
	image: PropTypes.string,
	onAccept: PropTypes.func,
	close: PropTypes.func,
}

const styles = {
	mainContainer: {
		height: "100%",
		position: "relative", ///
	},
	imageContainer: {
		position: "absolute",
		top: "0px",
		left: "0px",
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		height: "100%",
		width: "100%",
	},
	controlBar: {
		position: "absolute",
		top: "0px",
		left: "0px",
		height: "98%",
		width: "100%",
		display: "flex",
		justifyContent: "center",
		alignItems: "flex-end",
	},
	buttonsContainer: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "center",
	},
	rejectButton: {
		marginRight: "5px",
		color: MAINCOLOR,
		backgroundColor: "silver", ///
	},
	acceptButton: {
		marginLeft: "5px", ///
	},
	captureButton: {
		height: "40px",
		width: "40px",
		borderRadius: "20px",
		border: "1px solid " + MAINCOLOR,
		...center,
		backgroundColor: MAINCOLOR, ///
	},
}
export default ImageCapture
