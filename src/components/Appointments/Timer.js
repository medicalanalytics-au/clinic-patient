import "../../App.css"
import PropTypes from "prop-types"

import { decodeMilliseconds, MIN_15, MIN_2, pluralize, REQUESTSTATUS, SESSION } from "../../utils/helpers"
import Countdown from "react-countdown"
import { useEffect, useState } from "react"

const renderer = (time) => {
	console.log("test")
	const { days, hours, minutes, seconds } = time
	const renderTime = (min, renderSeconds = true) =>
		min > 1
			? min === 59
				? "1 hr"
				: min + 1 + " mins"
			: min === 1
			? "1 min " + (renderSeconds ? (seconds > 0 ? pluralize(seconds, "sec") : "") : "")
			: renderSeconds
			? pluralize(seconds, "sec")
			: ""

	return (
		<span>{days > 0 ? pluralize(days, "day") : hours > 0 ? pluralize(hours, "hr") + " " + renderTime(minutes, false) : renderTime(minutes)}</span>
	)
}

const Duration = (props) => {
	const duration = decodeMilliseconds(props.duration)
	return (
		//
		<div style={{ display: "flex", flexDirection: "row" }}>
			{duration.hours ? <div style={{ marginRight: "3px" }}>{duration.hours + " hr "} </div> : ""}
			{duration.minutes ? <div style={{ marginRight: "3px" }}>{duration.minutes + "m"} </div> : ""}
			{duration.seconds ? <div>{duration.seconds + "s"} </div> : ""}
		</div>
	)
}

Duration.propTypes = {
	duration: PropTypes.number,
}

const Timer = (props) => {
	const [date, setDate] = useState(0)

	const getDate = (data) => {
		const { datetime, status, acceptedDate, endDate } = data

		const { PENDING_PAYMENT, REQUESTED } = REQUESTSTATUS
		const { STARTED } = SESSION

		return status === REQUESTED
			? datetime - MIN_2
			: status === PENDING_PAYMENT
			? acceptedDate + MIN_2
			: status === STARTED
			? endDate
				? endDate
				: datetime + MIN_15
			: datetime
	}

	useEffect(() => {
		console.log(getDate(props.data), props.data.status)
		setDate(getDate(props.data))
	}, [props.data])

	return (
		<div style={{ width: "100%", border: "1px solid red" }}>
			{/* <div style={{ marginRight: "3px" }}>{label}</div> */}
			<Countdown date={date} renderer={renderer} />
			{/* {label === "Duration" ? <Duration duration={props?.completedDate - date} /> : <Countdown date={date} renderer={renderer} />} */}
		</div>
	)
}

Timer.propTypes = {
	label: PropTypes.string,
	date: PropTypes.number,
	data: PropTypes.object,
	completedDate: PropTypes.number,
}

export default Timer
