import { useContext, useState } from "react"
import "../../../App.css"

// material ui
import { Button, MenuItem } from "@mui/material"

// custom components
import { CustomTextField } from "./Textfields"

// context
import { ProfileContext } from "../../../App"
import { addDialog, updatePersonalProfile } from "../../../utils/context"

// Swal
import { GenericAlert, GenericDialog } from "../../../utils/sweetalertDialogs"
import { patient_updatePersonalInfo } from "../../../utils/network"
import { showError } from "../../../utils/helpers"

const PersonalInfo = () => {
	const { state, dispatch } = useContext(ProfileContext)

	const [name, setName] = useState(state.name)
	const [address, setAddress] = useState(state.address)
	const [postalcode, setPostalcode] = useState(state.postalcode)
	const [territory, setTerritory] = useState(state.state)
	const [contact, setContact] = useState(state.contact)

	return (
		<div style={{ display: "flex", flexDirection: "column" }}>
			<CustomTextField label={"Name"} value={name} onChange={(event) => setName(event.target.value)} />
			<CustomTextField label={"Address"} value={address} onChange={(event) => setAddress(event.target.value)} />
			<CustomTextField label={"Postal Code"} value={postalcode} onChange={(event) => setPostalcode(event.target.value)} short />
			<CustomTextField label={"State"} value={territory} onChange={(event) => setTerritory(event.target.value)} short select>
				<MenuItem value={"TAS"}>TAS</MenuItem>
			</CustomTextField>
			<CustomTextField label={"Contact"} value={contact} onChange={(event) => setContact(event.target.value)} short />

			<div>
				<Button
					disabled={
						name === state.name &&
						address === state.address &&
						postalcode === state.postalcode &&
						territory === state.state &&
						contact === state.contact
					}
					onClick={() => {
						addDialog(dispatch, {
							dialog: GenericDialog("Save changes?", "Update details"),
							onConfirm: () => {
								patient_updatePersonalInfo(dispatch, state._id, {
									name,
									address,
									postalcode,
									state: territory,
									contact,
								})
									.then((res) => {
										updatePersonalProfile(dispatch, res)
										addDialog(dispatch, {
											dialog: GenericAlert("Profile Updated"),
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

export default PersonalInfo
