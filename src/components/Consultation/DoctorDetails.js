import "../../App.css"
import PropTypes from "prop-types"

import { useContext } from "react"
import { ProfileContext } from "../../App"
import { mobile, useResponsiveMedia } from "../../utils/helpers"

const DoctorDetails = (props) => {
	const value = useContext(ProfileContext)
	const { state } = value
	const { profilePic, title, profileName, email, qualifications, clinic_name, clinic_address, languages, specialisation } = state.consultation.doctor

	console.log({ state })

	const media = useResponsiveMedia()

	const styles = {
		...subStyles,
		mainContainer: {
			...supportStyles.mainContainer,
			flexDirection: mobile(media) ? "column" : "row",
		},
		profileContainer: {
			...supportStyles.profileContainer,
			width: mobile ? "80%" : "30%",
		},
		clinicContainer: {
			...supportStyles.clinicContainer,
			textAlign: mobile ? "center" : "left",
			width: mobile ? "80%" : "100%",
			fontSize: mobile ? "12px" : "15px",
		},
		additionalProfileInfo: {
			fontSize: mobile ? "12px" : "15px",
		},
		iconLabelContainer: {
			...supportStyles.iconLabelContainer,
			justifyContent: mobile ? "center" : "left",
		},
	}

	// these specialisations will be added with the suffix 'Dentistry'
	const suffix = ["General", "Children", "Cosmetic", "Prosthetic", "Sleep"]

	return (
		<div style={styles.mainContainer}>
			<div style={styles.profileContainer}>
				<img src={profilePic} style={styles.profilePicture} alt="Profile" />
				<div style={styles.profileName}>
					<div style={{ marginRight: "5px" }}>{title}</div>
					<div style={{ marginRight: "5px" }}>{profileName}</div>
				</div>
				<div style={styles.additionalProfileInfo}>
					<div>{qualifications.reduce((str, curr, index) => str + (index > -1 ? ", " : "") + curr)}</div>
					<div>{email}</div>
				</div>
			</div>

			<div style={styles.clinicContainer}>
				<div style={styles.boldLabel}>{clinic_name}</div>
				<div style={{ marginBottom: "5px" }}>{clinic_address}</div>

				{languages.length > 0 && (
					<div style={styles.listDisplay}>
						<div style={styles.boldLabel}>Languages</div>

						{[...new Set(languages)].map((i) => {
							// ensure there are no duplicates
							return <div key={i}>{i}</div>
						})}
					</div>
				)}

				{specialisation.length > 0 && (
					<div style={styles.listDisplay}>
						<div style={styles.boldLabel}>Specialisation</div>

						{[...new Set(specialisation)].map((i) => {
							// ensure there are no duplicates
							return (
								<div key={i}>
									{i} {suffix.includes(i) && "Dentistry"}
								</div>
							)
						})}
					</div>
				)}
			</div>
		</div>
	)
}

const supportStyles = {
	mainContainer: {
		display: "flex",
		height: "100%",
		width: "100%",
		color: "black",
		justifyContent: "center",
		alignItems: "center",
	},
	profileContainer: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		padding: "30px",
		backgroundColor: "ghostwhite",
		textAlign: "center",
		margin: "10px",
		borderRadius: "5px",
	},
	clinicContainer: {
		display: "flex",
		flexDirection: "column",
		padding: "30px",
	},
	iconLabelContainer: {
		display: "flex",
		flexDirection: "row",
		alignItems: "center",
		marginBottom: "5px", //
	},
}
const subStyles = {
	profilePicture: {
		width: "10rem",
		height: "10rem",
		border: "2px solid silver",
		borderRadius: "5rem",
		marginBottom: "20px",
	},
	profileName: {
		fontWeight: "bolder",
		display: "flex",
		flexDirection: "row",
		marginBottom: "5px",
	},
	listDisplay: {
		marginTop: "15px",
		marginBottom: "15px",
		display: "flex",
		flexDirection: "column",
	},
	boldLabel: {
		fontWeight: "bold",
		marginBottom: "5px",
	},
}
DoctorDetails.propTypes = {
	mobile: PropTypes.bool,
	doctor: PropTypes.object,
	clinic: PropTypes.object,
}

export default DoctorDetails
