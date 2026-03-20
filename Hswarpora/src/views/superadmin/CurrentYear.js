import React, { useState,useEffect,useRef } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormCheck,
  CFormInput,
  CFormFeedback,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
  CInputGroup,
  CInputGroupText,
  CToast,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CTableBody,
  CToastBody,
  CToastClose,
  CToastHeader,
  CToaster,
  CRow,
} from '@coreui/react'
import {
  TextField,
  Grid,
  Box,
	Typography,
	 InputLabel,
  Button,
  Select,
  MenuItem,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,FormControl
} from '@mui/material';
import { DatePicker} from "antd";
import Select1 from 'react-select';
import { useLoading } from '../../layout/LoadingContext';
import { DocsExample } from 'src/components'
const DatabaseName="LeadTracker";
import { parsePhoneNumberFromString } from 'libphonenumber-js';
let AdminOptionsList=[];
let currentYear=new Date().getFullYear();
let numDdos=0;
let PreviousYearSelected='';
const yearOptions = Array.from({ length: 11 }, (_, i) => {
  const year = currentYear - 5 + i;
  return { value: year, label: year.toString() };
});
const interestedin = [
    { value: 'rotation', label: 'Rotation' },
    { value: 'research', label: 'Research' },
    { value: 'match', label: 'Match' },
    { value: 'steps preparation', label: 'STEPs preparation' },
    { value: 'usmle guidance', label: 'USMLE guidance' },
    { value: 'interview preparations', label: 'Interview Preparations' },
  ];

const Validation =  () => {
const [errors, seterrors] = useState(false)
const [CurrentData, setCurrentData] = useState([])
const [CurrentYear, setCurrentYear] = useState({})
const [ActionResult, setActionResult] = useState({})
const [medicalSchoolOptionsList, setMedicalSchoolOptionsList] = useState([]);
const { showLoading, hideLoading,firestoreQueries, DatabaseName,TooltipsPopovers} = useLoading();
const [toast, addToast] = useState(0)
  const toaster = useRef()

console.log("1111useEffect---->")



useEffect(() => {
console.log("useEffect---->")
fetchData();
console.log("useEffect---->")

  }, []);

  const fetchData = async () => {
   //let CreateRes1=await firestoreQueries.updateOrCreateById(DatabaseName, "settings",  "currentyear", {settingtype:"currentyear","currentyear":"2024"});
    const SettingsListed=await firestoreQueries.FetchDataFromCollection(DatabaseName, "settings", 1000, 'settingtype', '==', "currentyear","currentyear","asc");
    console.log("SettingsListed----->",SettingsListed)
    if(SettingsListed.length)
    {
    	currentYear=SettingsListed[0].currentyear;
    	PreviousYearSelected=String(currentYear);
      setCurrentYear({value:SettingsListed[0].currentyear,label:SettingsListed[0].currentyear});
    }

  }
  const handleFormChange = async (event,name="") =>
  {

    let value;
    if(typeof event.target!="undefined")
    {
  	  value=event.target.value;
    }
    else if(typeof event.$d!="undefined")
    {
  	  value= event.toLocaleString('en-GB', { timeZone: 'GMT' });
  	  value = firestoreQueries.Timestamp.fromDate(new Date(value))
    }
    else if(typeof event.label!="undefined")
    {
  	  value=event;
    }
    else if(typeof event?.[0]?.['label']!="undefined")
    {
  	  value=event;
    }
    else
    {
  	  value=event.label;
    }
    console.log("name====>",name)
    console.log("value====>",value)
    
     if(name==="class")
     {}
	 setCurrentYear(value);
  }
  const DeleteAssignment= async(classname,examName,SelectedYear) =>
  {
        showLoading();
        let FieldToDelete=`${SelectedYear}.exams.${examName}`;
        let res=await firestoreQueries.deleteFieldFromDocument(DatabaseName,"classes",classname,FieldToDelete);
        fetchData();
        TooltipsPopovers(res.status,res.message,res.status)
        hideLoading()

  }
const handleFormSubmit = async () =>
{
	//showLoading()
	console.log("CurrentYear---->",CurrentYear)
	const NewYear=String(CurrentYear.value);
	console.log("PreviousYearSelected---->",PreviousYearSelected)
	console.log("NewYear---->",NewYear)
	let res=await firestoreQueries.updateWhereFieldEquals(DatabaseName,"settings","settingtype","==","currentyear",{currentyear:NewYear})
	res= await firestoreQueries.updateWhereFieldEquals(DatabaseName,"classes","currentyear","==",PreviousYearSelected,{currentyear:NewYear})
	console.log("res---->",res)
	if(res.status=="success")
	{
		TooltipsPopovers(res.status,res.message,res.status)
        hideLoading()
        PreviousYearSelected=NewYear;
	}
}


  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
         <CToaster ref={toaster} push={toast} placement="top-end" />
          <CCardHeader>
            <strong>Teacher Class</strong> <small>Maping</small>
          </CCardHeader>
          <CCardBody>
            <p className="text-body-secondary small">
            {errors.mainerror  && <span class="validationerror">{errors.mainerror }</span>}
            </p>
              <CForm className="row g-3 needs-validation">
              
              	<CCol md={6}>
              <CFormLabel htmlFor="validationServer01">Select Subject</CFormLabel>
              <Grid item xs={6}>

                <Select1
        value={CurrentYear || {}}
        onChange={(event) => handleFormChange(event,'subject')}
        variant="outlined"
        options={yearOptions}
        placeholder="Select Subject"
        label="Select Subject"
        title="Select Subject"
        isSearchable
menuPosition="fixed"
 styles={{
    menu: (base) => ({
      ...base,
      backgroundColor: 'white', // Set background color to opaque white
      zIndex: 9999, // Ensure it appears on top of other elements
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Optional: add shadow for clarity
    }),
  }}
      />
      	 {errors.subject  && <span class="validationerror">{errors.subject }</span>}
              	</Grid>
              	</CCol>
              	





                <CCol xs={12} className="row">
                <p></p>
                <CCol xs={6}>
                  <CButton color="primary" type="button"
                   onClick={(event) => handleFormSubmit()}
                   >

                    Map Teacher
                  </CButton>
                  </CCol>
                </CCol>
              </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Validation
