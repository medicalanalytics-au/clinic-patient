import { useContext, useEffect, useState } from "react"
import "../../App.css"
import PropTypes from "prop-types"

// stripe
import { loadStripe } from "@stripe/stripe-js"
import { CardCvcElement, CardExpiryElement, CardNumberElement, Elements /* useElements, useStripe */ } from "@stripe/react-stripe-js"

// icons
import CardIcon from "./CardIcon"

// material ui
import { Button, TextField } from "@mui/material"

// constants
import { center, MEDIA, ORIENTATION /* PAYABLE */ } from "../../utils/constants"

// network
import { patient_getStripeSecret } from "../../utils/network"

// custom hook
import { useResponsiveMedia } from "../../utils/helpers"

/* // Swal/Snack
import { addDialog, hideSpinner, showSnack, showSpinner } from "../../utils/context"
import { GenericError } from "../../utils/sweetalertDialogs"
 */
// context
import { ProfileContext } from "../../App"

const stripePromise = loadStripe("pk_test_51LcNuqFS0r1yfTtIDXjY8528MYSMCb7RZ9dmPnBz32mI2pyYMlIZXHt5fRQq26DBxlkyNdavrJjW5SAIRXcTYqo600YglF8lUG")

const PaymentForm = (props) => {
	/* 	const stripe = useStripe()
	const elements = useElements() */

	const { state /* dispatch */ } = useContext(ProfileContext)
	const { consultationFees } = state.settings

	const [cardBrand, setCardBrand] = useState("unknown")
	const [cardHolderName, setCardHolderName] = useState("")

	const submitPayment = async (e) => {
		e.preventDefault()

		/* if (!stripe || !elements) {
			showSpinner(dispatch)
			showSnack(dispatch, "Still loading. Please wait a few seconds and then try again.")
			return
		}

		showSpinner(dispatch)
		const paymentResult = await stripe.confirmCardPayment(props.clientSecret, {
			payment_method: {
				card: elements.getElement(CardNumberElement),
				billing_details: {
					name: cardHolderName,
				},
			},
		})
		hideSpinner(dispatch)

		if (paymentResult.error) {
			addDialog(dispatch, {
				dialog: GenericError(paymentResult.error.message),
			})
		} else {
			if (paymentResult.paymentIntent.status === "succeeded") {
				props.close(paymentResult.paymentIntent.status)
			}
		} */

		props.close("succeeded")
	}

	const setCardIcon = (e) => setCardBrand(e.brand)
	const handleNameChange = (e) => setCardHolderName(e.target.value)

	const styles = {
		...styles_PaymentForm,
	}

	return (
		<div style={styles.mainContainer}>
			<div style={styles.body}>
				<div style={styles.feeCaption}>A consultation fee of ${consultationFees} will be charged for this session</div>
				<TextField
					size="small"
					placeholder="Cardholder's Name"
					value={cardHolderName}
					onChange={handleNameChange}
					style={styles.textField}
					inputProps={{
						style: styles.textFieldInputProps,
					}}
				/>
				<div style={styles.cardNumber}>
					<CardNumberElement
						className="card cardnumber"
						onChange={setCardIcon}
						options={{
							style: styles.cardNumberElement,
						}}
					/>
					<CardIcon brand={cardBrand} />
				</div>
				<div style={styles.cardInfo}>
					<CardExpiryElement className="card cardinfo cardexpiry" />
					<CardCvcElement className="card cardinfo" />
				</div>
			</div>
			<div style={{ ...center, width: "100%" }}>
				<Button variant={"contained"} onClick={submitPayment} style={{ width: "100%" }}>
					Pay ${consultationFees}
				</Button>
			</div>
		</div>
	)
}

PaymentForm.propTypes = {
	clientSecret: PropTypes.string,
	close: PropTypes.func,
}

const PaymentScreen = (props) => {
	const { dispatch } = useContext(ProfileContext)
	const [clientSecret, setClientSecret] = useState(null)

	const media = useResponsiveMedia()
	const mobilePortrait = media.type === MEDIA.MOBILE && media.orientation === ORIENTATION.PORTRAIT

	useEffect(() => {
		patient_getStripeSecret(dispatch)
			.then((res) => setClientSecret(res))
			.catch((error) => console.log(error))
	}, [dispatch])

	const styles = {
		...styles_PaymentScreen,
		elementsContainer: {
			width: mobilePortrait ? "80%" : "60%", ///
		},
	}
	return (
		<div style={styles.mainContainer}>
			{clientSecret && (
				<div style={styles.elementsContainer}>
					<Elements stripe={stripePromise}>
						<PaymentForm clientSecret={clientSecret} close={props.close} />
					</Elements>
				</div>
			)}
		</div>
	)
}

PaymentScreen.propTypes = {
	open: PropTypes.bool,
	close: PropTypes.func,
}

const styles_PaymentScreen = {
	mainContainer: {
		...center,
		height: "90%",
		flexDirection: "column",
		width: "100%", ///
	},
}

const styles_PaymentForm = {
	mainContainer: { height: "100%" },
	body: {
		display: "flex",
		flexDirection: "column",
		width: "100%", ///
	},
	feeCaption: {
		...center,
		marginBottom: "10px",
		textAlign: "center", ///
	},
	textField: {
		marginBottom: "10px",
		width: "100%",
		boxShadow: " 0px 4px 5.5px 0px rgba(0, 0, 0, 0.07)", ///
	},
	textFieldInputProps: {
		padding: "10px 10px 10px 10px",
	},
	cardNumber: {
		width: "100%",
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between", ///
	},
	cardNumberElement: {
		base: {
			color: "#ff",
			fontFamily: "Quicksand, sans-serif",
			fontSize: "16px",
			fontSmoothing: "antialiased",
			":-webkit-autofill": {
				color: "black",
			},
			"::placeholder": {
				color: "silver",
			},
		},
	},
	cardInfo: {
		display: "flex",
		flexDirection: "row",
		width: "100%",
		justifyContent: "flex-start", ///
	},
}

export default PaymentScreen
