import { useContext, useState } from "react"
import "../../../App.css"

// material ui
import { Button } from "@mui/material"
import { ProfileContext } from "../../../App"
import { addDialog, updateMedicalHistory } from "../../../utils/context"
import { GenericAlert, GenericDialog } from "../../../utils/sweetalertDialogs"
import { MultilineTextField } from "./Textfields"
import { patient_updateMedicalHistory } from "../../../utils/network"
import { showError } from "../../../utils/helpers"

const MedicalHistory = () => {
	const { state, dispatch } = useContext(ProfileContext)

	const [medicalHistory, setMedicalHistory] = useState(state.medicalHistory)
	const [allergies, setAllergies] = useState(state.allergies)

	return (
		<div style={styles.mainContainer}>
			<MultilineTextField label={"Medical History"} rows={12} value={medicalHistory} onChange={(event) => setMedicalHistory(event.target.value)} />
			<MultilineTextField label={"Allergies"} rows={5} value={allergies} onChange={(event) => setAllergies(event.target.value)} />

			<div>
				<Button
					disabled={medicalHistory === state.medicalHistory && allergies === state.allergies}
					onClick={() => {
						addDialog(dispatch, {
							dialog: GenericDialog("Save changes?", "Update details"),
							onConfirm: () => {
								patient_updateMedicalHistory(dispatch, state._id, {
									medicalHistory,
									allergies,
								})
									.then((res) => {
										updateMedicalHistory(dispatch, res)
										addDialog(dispatch, {
											dialog: GenericAlert("Medical history updated"),
										})
									})
									.catch((error) => showError(dispatch, error))
							},
						})
					}}
				>
					Save Changes
				</Button>
			</div>
		</div>
	)
}

const styles = {
	mainContainer: {
		height: "100%",
		display: "flex",
		flexDirection: "column",
		alignItems: "flex-start",
	},
}

export default MedicalHistory
