import React, { useState } from "react"
import PropTypes from "prop-types"
import "../../App.css"

// React Credit Cards
import Cards from "react-credit-cards"
import "react-credit-cards/es/styles-compiled.css"

// Material UI
import { Button, TextField } from "@mui/material"

// custom hook
import { useResponsiveMedia } from "../../utils/helpers"

// constants
import { center, MEDIA, ORIENTATION } from "../../utils/constants"

const Payment = (props) => {
	const [cardOwnerName, setCardOwnerName] = useState("JOHN DOE")
	const [creditcardNumber, setCreditCardNumber] = useState("5105105105105100")
	const [expiry, setExpiry] = useState("04/24")
	const [CVV, setCVV] = useState("007")
	const [focus, setFocus] = useState("name")

	const media = useResponsiveMedia()

	const mobilePortrait = () => media.type === MEDIA.MOBILE && media.orientation === ORIENTATION.PORTRAIT

	const styles = {
		...subStyles,
		creditCardDialog: {
			...supportStyles.creditCardDialog,
			flexDirection: mobilePortrait() ? "column" : "row",
			alignItems: mobilePortrait() ? "space-evenly" : "center",
		},
	}

	return (
		<div style={styles.dialog}>
			<div style={styles.body}>
				<div style={styles.creditCardDialog}>
					<div style={{ display: "flex", flexDirection: "column", marginBottom: "10px" }}>
						<TextField
							label={"Name On Card"}
							size="small"
							style={{ width: "300px", marginBottom: "10px" }}
							value={cardOwnerName}
							onFocus={() => setFocus("name")}
							onChange={(event) => setCardOwnerName(event.target.value)}
						/>
						<TextField
							label={"Card Number"}
							size="small"
							style={{ width: "300px", marginBottom: "10px" }}
							value={creditcardNumber}
							onFocus={() => setFocus("number")}
							onChange={(event) => setCreditCardNumber(event.target.value)}
						/>

						<div style={{ display: "flex", flexDirection: "row" }}>
							<TextField
								label={"Valid Thru"}
								size="small"
								style={{ width: "80px", marginRight: "10px" }}
								value={expiry}
								onFocus={() => setFocus("expiry")}
								onChange={(event) => setExpiry(event.target.value)}
							/>
							<TextField
								label={"CVV"}
								size="small"
								style={{ width: "80px" }}
								value={CVV}
								onFocus={() => setFocus("cvc")}
								onChange={(event) => setCVV(event.target.value)}
							/>
						</div>
					</div>
					<div>
						<Cards cvc={CVV} expiry={expiry} focused={focus} name={cardOwnerName} number={creditcardNumber} />
					</div>
				</div>
			</div>
			<div style={{ marginBottom: "30px", marginTop: "20px", ...center, flexDirection: "column" }}>
				<div style={{ textAlign: "center", fontSize: mobilePortrait() ? "12px" : "15px" }}>An authorisation amount of $50 will be charged </div>
				<Button
					variant="contained"
					style={{ marginTop: "20px" }}
					onClick={(event) => {
						event.stopPropagation()
						props.onPaid()
						props.close()
					}}
				>
					Submit Payment
				</Button>
			</div>
		</div>
	)
}

Payment.propTypes = {
	open: PropTypes.bool,
	close: PropTypes.func,
	onPaid: PropTypes.func,
}

const supportStyles = {
	creditCardDialog: {
		display: "flex",
		justifyContent: "space-evenly",
		width: "100%",
	},
}

const subStyles = {
	dialog: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		borderRadius: "5px",
		background: "white",
		justifyContent: "center",
		transition: "all .2s linear",
		height: "100%",
	},
	header: {
		width: "98%",
		marginTop: "20px",
		display: "flex",
		flexDirection: "row",
	},
	headerCaption: {
		flex: 1,
		fontWeight: "bold",
		display: "flex",
		justifyContent: "center", ///
	},
	closeIcon: {
		flex: 1,
		display: "flex",
		justifyContent: "flex-end", ///
	},
	body: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		// margin: "50px",
		width: "100%",
	},
}
export default Payment
