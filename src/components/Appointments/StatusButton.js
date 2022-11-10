import { useContext } from "react"
import "../../App.css"
import PropTypes from "prop-types"

// material ui
import { Divider } from "@mui/material"

import { ProfileContext } from "../../App"
import { GenericDialog } from "../../utils/sweetalertDialogs"
import { AMBER, GREEN, MEDIA, MIN_15, MIN_2, RED, REQUESTSTATUS, SESSION, useResponsiveMedia } from "../../utils/helpers"
import Timer from "./Timer"
import { addDialog } from "../../utils/context"

const StatusButton = (props) => {
	console.log({ props })
	const { dispatch } = useContext(ProfileContext)
	const media = useResponsiveMedia()

	const mobile = () => media.type === MEDIA.MOBILE

	const { status, datetime } = props.data

	const { PENDING_PAYMENT, REQUESTED, CONFIRMED, CANCELLED } = REQUESTSTATUS
	const { STARTED, COMPLETED } = SESSION

	const greenStatus = [CONFIRMED, STARTED, COMPLETED]
	const color = greenStatus.includes(status) ? GREEN : status === CANCELLED ? RED : AMBER

	let label
	switch (status) {
		case PENDING_PAYMENT || REQUESTED:
			label = "Request expiring"
			break
		case COMPLETED:
			label = "Duration"
			break
		case STARTED:
			label = "Ending in"
			break
		case CONFIRMED:
			label = "Starting in"
			break
		default:
			label = ""
	}
	// const label = [PENDING_PAYMENT, REQUESTED].includes(status) ? "Request expiring" : status === "completed" ? "Duration" : "Starting In"

	let date

	switch (status) {
		case REQUESTED:
			date = datetime - MIN_2
			break
		case PENDING_PAYMENT:
			date = props.data.acceptedDate + MIN_2
			break
		case STARTED:
			date = props.data.endDate ? props.data.endDate : props.data.datetime + MIN_15
			break
		default:
			date = datetime
			break
	}

	const processPayment = (e) => {
		if (status === REQUESTSTATUS.PENDING_PAYMENT) {
			e.stopPropagation()

			addDialog(dispatch, {
				dialog: GenericDialog("Proceed to payment page now?"),
				onConfirm: () => props.OnPaymentSelect(props.data),
			})
		}
	}

	return (
		<div
			className={status === REQUESTSTATUS.PENDING_PAYMENT ? "pendingpaymentStatusButton" : ""}
			onClick={processPayment}
			style={{ ...styles.statusButton, border: "1px solid " + color }}
		>
			<div style={{ fontWeight: "bold", marginRight: "10px", width: "50%", textAlign: "center" }}>
				{status === REQUESTSTATUS.PENDING_PAYMENT ? "pending payment" : status}
			</div>

			{!mobile && (
				<div style={{ width: "50%", display: "flex" }}>
					<Divider variant="middle" />
					<div style={{ display: "flex", flexDirection: "column" }}>
						<Timer label={label} date={date} completedDate={props?.data?.completedDate} />
					</div>
				</div>
			)}
		</div>
	)
}
StatusButton.propTypes = {
	data: PropTypes.object,
	OnPaymentSelect: PropTypes.func,
}

const styles = {
	statusButton: {
		borderRadius: "5px",
		width: "100%",
		height: "30px",
		fontSize: "10px",
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
}
export default StatusButton
