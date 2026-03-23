import React, { useEffect, useState,useRef } from 'react';
import { countryData } from "../../apis/countryData";
import Select from 'react-select';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import axios from 'axios';
//const admin = require('firebase-admin');
import {
  TextField,
  Grid,
	Typography,
  Button,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,FormControl
} from '@mui/material';
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
  CToastBody,
  CToastClose,
  CToastHeader,
  CToaster,
  CRow,
} from '@coreui/react'
import { useLoading } from '../../layout/LoadingContext';
const CountryOption = ({ label, flag }) => (
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <img src={flag} alt="" style={{ width: 20, height: 20, marginRight: 5 }} />
    {label}
  </div>
);
const SameAsPhoneList=[{value:"",label:"Select Value"},{value:"no",label:"No"},{value:"yes",label:"Yes"}];
const allCountries = countryData.map(country => ({
    value: country.value,
    label: "("+country.phoneCode+")"+country.value,
    flag: country.flag,
    phoneCode: country.phoneCode,
  }));

let Newway=false;
const UserDetails = () => {
	const { showLoading, hideLoading,firestoreQueries,DatabaseName  } = useLoading();
	const [errors, setErrors] = useState({});
	const [OperationMessage, setOperationMessage] = useState('');
	const [OperationStatus, setOperationStatus] = useState('');
	const [StudentName, setStudentName] = useState(null);
	const [StudentEmail, setStudentEmail] = useState(null);
	const [StudentPhone, setStudentPhone] = useState(null);
	const [open, setOpen] = useState(false);
	const [isFormChanged, setIsFormChanged] = useState(false);
	const [initialData, setInitialData] = useState({});
	const [selectedCountry, setSelectedCountry] = useState(null);
	const [selectedCountryWhatApp, setselectedCountryWhatApp] = useState(null);
	const [toast, addToast] = useState(0)
	const toaster = useRef()
  useEffect(() => {
    const fetchUserData = async () => {
    setInitialData({
          StudentName:  '',
          StudentEmail: '',
          StudentPhone: '',
          SameAsWhatsAppNumber: '',
          StudentWhatsappPhone:'',
          StudentWhatsappCountry:''
        });
    };

    fetchUserData();
  }, []);
   const handleChange = (selectedOption) => {
    setSelectedCountry(selectedOption);
    console.log('Selected country:', selectedOption);
  };
	const handleCancel = () => {
    setOpen(false);
  };
	const handleStudentNameChange=(event)=>{
	setStudentName(event.target.value);
	checkForChanges('StudentName', event.target.value);
	}
	const handleStudentEmailChange=(event)=>{
	setStudentEmail(event.target.value);
	checkForChanges('StudentEmail', event.target.value);
	}
	const handleStudentPhoneChange=(event)=>{
	setStudentPhone(event.target.value);
	checkForChanges('StudentPhone', event.target.value);
	}
	const showLoader = () => {
   let elements =document.getElementsByClassName('LoadingDiv');
    for (let i = 0; i < elements.length; i++) {
      elements[i].classList.remove('hidden'); // Example manipulation
    }
  };

  const hideLoader = () => {
     let elements = document.getElementsByClassName('LoadingDiv');
    for (let i = 0; i < elements.length; i++) {
      elements[i].classList.add('hidden'); // Example manipulation
    }
  };
	const generateRandomPassword = (length = 12) =>
	{
  		const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+[]{}|;:,.<>?";
  		let password = '';
  		for (let i = 0; i < length; i++)
  		{
    		const randomIndex = Math.floor(Math.random() * chars.length);
    		password += chars[randomIndex];
  		}
  		return password;
	};
	const generateDocumentIdFromEmail = (email) => {
  // Replace special characters with hyphen before encoding
  const sanitizedEmail = email.replace(/@/g, '-at-').replace(/\./g, '-dot-');
  // Return the Base64 encoded string
  return btoa(sanitizedEmail);
};
	const handleChangeStudentDetails = async (event,name="",loop=-1,paymentIndex=-1)=>{
  		let value;
  		if(typeof event.target!="undefined")
  		{
  			value=event.target.value;
  		}
  		else if(typeof event.$d!="undefined")
  		{
  			value= event.toLocaleString('en-GB', { timeZone: 'GMT' });
  		}
  		else if(typeof event.label!="undefined")
  		{
  			value=event;
  		}
  		else
  		{
  			value=event.label;
  		}
  		if(name==="StudentWhatsappCountry")
  		{

  			setselectedCountryWhatApp(event);
  		}
  		else
  		{
  			setInitialData((prevValues) => ({
        ...prevValues,
        [name]: value,
      }));
  		}

      checkForChanges(name, value);
	}
	const handleAddStudentForm= async (event)=>{
		 const validationErrors = validate();
    setErrors(validationErrors);
    var dataTobesend={};
    if (Object.keys(validationErrors).length === 0) {
    	 showLoading()
    	 let StudentEmailNormal=StudentEmail.toLowerCase();
      		let StudentNameNormal=StudentName.toLowerCase();
      		let password=StudentName;
    	try {
      		const documentIdGen = generateDocumentIdFromEmail(StudentEmailNormal);
      		console.log("StudentEmailNormal===>",StudentEmailNormal)
      		const UserServicesSelectedUn = await firestoreQueries.FetchDataFromCollection(DatabaseName,"users", 20, "email", "==", StudentEmailNormal, 0);
      		
      		console.log("UserServicesSelectedUn---->",UserServicesSelectedUn)
      		if(UserServicesSelectedUn.length)
      		{
      			const userid=UserServicesSelectedUn[0].id;
      			const response = await axios.post('https://updatepassword-f6dijyh4qq-uc.a.run.app', { StudentEmail:StudentEmailNormal, password, userid:userid });
      			console.log("response---->",response)
     			setOperationStatus( response.data.status)
     			setOperationMessage("Successfully updated");
     			//setOperationMessage(result.message+"<a style='color:blue' href='/admin/userdetails/"+response.data.data.uid+"' >Click Here</a>");
     			setOpen(true);
     			hideLoading();
			}
			else
			{
				hideLoading();
    			setOperationStatus("Error")
     			setOperationMessage("Email Does Not Exists With Us.");
     			setOpen(true);
			}




    } catch (error) {
      setErrors({'errormessage':error.message});
      console.log("error====>",error)
      let errordata=error.response.data
		setOperationStatus( error.response.data.status)
		setOperationMessage(error.response.data.data)

      console.error("Error signing up", error.response.data.status);
      setOpen(true);
      hideLoading();
    }
    }
	}
	const validateEmail = (email) =>
	{
  		const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  		return regex.test(email);
	};
	const validatePhoneNumber = (phoneNumber) => {
    // List of possible phone number lengths for different countries (excluding country code)
    const validLengths = [7, 8, 9, 10, 11, 12, 13, 14];

    // Remove all non-digit characters from the input
    const cleanedNumber = phoneNumber.replace(/\D/g, '');
    // Check if the length of the cleaned number is valid
    if (!validLengths.includes(cleanedNumber.length)) {
      return false;
    }

    try {
      // Use a dummy country code 'US' for parsing the number as libphonenumber-js requires a country code
      const parsedNumber = parsePhoneNumberFromString(cleanedNumber, selectedCountry.value);
      return parsedNumber && parsedNumber.isValid();

    } catch (e) {
      return false;
    }
  };
	const validate = () => {
    const errors = {};
    if(!StudentName)
    {
    	errors.StudentName="Please Enter Student Name.";
    }
    if(!StudentEmail)
    {
    	errors.StudentEmail="Please Enter Student Email.";
    }
    else if(StudentEmail && !validateEmail(StudentEmail))
    {
    	errors.StudentEmail="Please Enter A Valid Student Email.";
    }
    if(StudentPhone)
    {
    	//errors.StudentPhone="Please Enter Student Phone Number.";
    	if(!selectedCountry)
    	{
    		errors.selectedCountry="Select Country Code.";
    	}
    	else if(StudentPhone && !validatePhoneNumber(StudentPhone))
    	{
    		errors.StudentPhone="Please Enter A Valid Phone Number (Without Country Code).";
    	}
    	if(initialData['SameAsWhatsAppNumber']?.['value']==='' || initialData['SameAsWhatsAppNumber']==='')
    	{
    		errors.SameAsWhatsAppNumber="Please Select If Whatapp Number Is Same.";
    	}
		else if(initialData['SameAsWhatsAppNumber']?.['value']==='no')
    	{
    		if(!selectedCountryWhatApp || selectedCountryWhatApp===null)
    		{
    			errors.StudentWhatsappCountry="Select Country Code.";
    		}
    		if(initialData['StudentWhatsappPhone']==='')
    		{
    			errors.StudentWhatsappPhone="Please Enter Student Whatsapp Number.";
    		}
    		else if(initialData['StudentWhatsappPhone'] && !validatePhoneNumber(initialData['StudentWhatsappPhone'],selectedCountryWhatApp?.value))
    		{
    			errors.StudentWhatsappPhone="Please Enter A Valid Phone Number (Without Country Code).";
    		}

    	}
    }

    return errors;
  };
	const checkForChanges = (field, value) => {
    setIsFormChanged(value !== initialData[field]);
  };
  return (
     <CRow>

      <CCol xs={12}>
        <CCard className="mb-4">
         <CToaster ref={toaster} push={toast} placement="top-end" />
          <CCardHeader>
            <strong>User</strong> <small>Addition</small>
          </CCardHeader>
          <CCardBody>
                    <p className="text-body-secondary small">
            </p>
              <CForm className="row g-3 needs-validation">
              <CCol md={6}>
              	<div class="InputLabel"></div>
                  <TextField
                    label="Student Email"
                    variant="outlined"
                    fullWidth
                    value={StudentEmail}
                    required
                    onChange={handleStudentEmailChange}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors.StudentEmail  && <span class="validationerror">{errors.StudentEmail }</span>}
                </CCol>

                 <CCol md={6}>
              <div class="InputLabel"></div>
                  <TextField
                    label="Enter Password"
                    variant="outlined"
                    fullWidth
                    value={StudentName}
                    required
                    onChange={handleStudentNameChange}
                    sx={{ my: 0, "margin-bottom": "4px" }}
                  />
                  {errors.StudentName  && <span class="validationerror">{errors.StudentName }</span>}
                </CCol>
              	


   
            <CCol xs={12}>
                  <CButton color="primary" type="button"
                   onClick={handleAddStudentForm}
              		disabled={!isFormChanged}
                   >

                    Update Password
                  </CButton>
                </CCol>
              </CForm>

         <Dialog
        open={open}
        onClose={handleCancel}
      >
        <DialogTitle>Operation Status: {OperationStatus}</DialogTitle>
        <DialogContent>
          <DialogContentText>
           <span dangerouslySetInnerHTML={{ __html: OperationMessage }} />

          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} color="primary">
            Ok
          </Button>

        </DialogActions>
      </Dialog>
    </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};


export default UserDetails;
