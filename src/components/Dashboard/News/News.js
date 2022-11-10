import { useContext, useEffect, useState } from "react"
import "../../../App.css"

// material ui
import { Button, MobileStepper } from "@mui/material"

// react icons
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md"

// constants
import { center } from "../../../utils/constants"

// network
import { patient_getNews } from "../../../utils/network"
import { showError } from "../../../utils/helpers"
import { ProfileContext } from "../../../App"

const News = () => {
	const { dispatch } = useContext(ProfileContext)

	const [activeStep, setActiveStep] = useState(0)

	const [html, setHTML] = useState({ __html: "<div>Loading...</div>" })

	const handleNext = () => setActiveStep((activeStep) => activeStep + 1)
	const handleBack = () => setActiveStep((activeStep) => activeStep - 1)

	useEffect(() => {
		patient_getNews(dispatch, activeStep)
			.then((res) => setHTML({ __html: res }))
			.catch((error) => showError(dispatch, error))
	}, [activeStep])

	return (
		<div style={{ height: "100%" }}>
			<div style={{ margin: "10px", height: "90%", display: "flex", flexDirection: "column" }}>
				<div style={{ flex: 9, display: "flex", justifyContent: "center", width: "100%" }}>
					<div dangerouslySetInnerHTML={html} style={{ width: "100%", height: "90%" }}></div>
				</div>
			</div>
			<div style={{ height: "10%", ...center }}>
				<MobileStepper
					variant="dots"
					steps={2}
					position="static"
					activeStep={activeStep}
					sx={{ maxWidth: 400, flexGrow: 1 }}
					nextButton={
						<Button size="small" onClick={handleNext} disabled={activeStep === 1}>
							Next
							<MdKeyboardArrowRight />
						</Button>
					}
					backButton={
						<Button size="small" onClick={handleBack} disabled={activeStep === 0}>
							<MdKeyboardArrowLeft />
							Back
						</Button>
					}
				/>
			</div>
		</div>
	)
}

export default News
