import "../../App.css"
import PropTypes from "prop-types"

// card icons
import visa from "../../images/creditcardicons/visa.png"
import mastercard from "../../images/creditcardicons/mastercard.png"
import amex from "../../images/creditcardicons/amex.png"
import discover from "../../images/creditcardicons/discover.png"
import diners from "../../images/creditcardicons/diners.png"
import jcb from "../../images/creditcardicons/jcb.png"
import unionpay from "../../images/creditcardicons/unionpay.png"
import unknown from "../../images/creditcard.png"

import { center } from "../../utils/constants"

const CardIcon = (props) => {
	var brands = {
		visa,
		mastercard,
		amex,
		discover,
		diners,
		jcb,
		unionpay,
		unknown,
	}

	return (
		<div style={{ ...center }}>
			<img src={brands[props.brand] || unknown} alt={"CC"} style={{ height: "30px" }} />
		</div>
	)
}

CardIcon.propTypes = {
	brand: PropTypes.string,
}

export default CardIcon
