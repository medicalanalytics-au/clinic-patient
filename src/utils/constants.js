// signal constants
export const START_SESSION = "start"
export const END_SESSION = "end"

// * Messages *********
export const VIEW = {
	INBOX: "inbox",
	DRAFT: "draft",
	SENT: "sent",
}

export const MODE = {
	READ: "read",
	EDIT: "edit",
}

export const NEWMAIL = "new"
// ********************

export const SEC_1 = 1000
export const SEC_2 = 2000
export const SEC_30 = 30000
export const MIN_1 = 60000
export const MIN_2 = 120000
export const MIN_3 = 180000
export const MIN_4 = 240000
export const MIN_5 = 300000
export const MIN_6 = 360000
export const MIN_8 = 480000
export const MIN_10 = 600000
export const MIN_12 = 720000
export const MIN_14 = 840000
export const MIN_15 = 900000
export const MIN_19 = 1140000
export const MIN_20 = 1200000
export const MIN_30 = 1800000
export const MIN_35 = 2100000
export const HOUR_24 = 86400000

export const zeroTime = { hour: 0, minute: 0, second: 0, millisecond: 0 }
export const DARKGRAY = "#313131"
export const GREEN = "green"
export const RED = "red"

export const WHITE = "white"
export const BLACK = "black"
export const MAINCOLOR_LIGHT = "rgb(59, 139, 161)"
export const PAYABLE = 150
export const OFFBLACK = "#252525"
export const OFFWHITE = "#fdfdfd"
export const MAINCOLOR = "#0a6e8a" // another declaration in sweetalertdialogs.js
export const AMBER = "rgb(254,195,77)"
export const GRAY = "gray"
export const SILVER = 'silver'

export const MEDIA = {
	MOBILE: "mobile",
	TABLET: "tablet",
	DESKTOP: "desktop",
}

export const ORIENTATION = {
	PORTRAIT: "portrait",
	LANDSCAPE: "landscape",
}

export const center = { display: "flex", justifyContent: "center", alignItems: "center" }

export const redborder = { border: "1px solid red" }

export const REQUESTSTATUS = {
	PENDING_PAYMENT: "pending_payment",
	REQUESTED: "requested",
	CONFIRMED: "confirmed",
	CANCELLED: "cancelled",
}

export const SESSION = {
	COMPLETED: "completed",
	PAUSED: "paused",
	STARTED: "started",
}

export const SESSION_ACTIVE = "session_active"
export const INSUFFICIENT_SESSION_BLOCK = "insufficient_session_block"

export const FULLPAYMENTAMOUNT = 50
