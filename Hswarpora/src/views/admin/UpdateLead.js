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
  CToastClose,
   CNav,
  CNavItem,
  CTabContent,
  CTabPane,
  CNavLink,
  CRow,
  CToaster,
  CToast,
  CToastBody,
  CToastHeader
} from '@coreui/react'
import {useParams,useNavigate } from 'react-router-dom';
import { DatePicker} from "antd";
import Select1 from 'react-select';
import dayjs from 'dayjs';
import { useLoading } from '../../layout/LoadingContext';
import { DocsExample } from 'src/components'
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { countryData } from "../../apis/countryData";
import { medicalSchoolOptions } from "../../apis/MedicalSchools";
import { Timestamp } from 'firebase/firestore';
const CountryOption = ({ label, flag }) => (
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <img src={flag} alt="" style={{ width: 20, height: 20, marginRight: 5 }} />
    {label}
  </div>
);
const allCountries = countryData.map(country => ({
    value: country.value,
    label: "("+country.phoneCode+")"+country.value,
    flag: country.flag,
    phoneCode: country.phoneCode,
  }));
const countryOfMedicalCollege = countryData.map(country => ({
    value: country.value,
    label: country.label,
    flag: country.flag,
    phoneCode: country.phoneCode,
    "FieldName":"CountryOfMedicalSchool",
  }));

let RotationsListFull={};
let RotationOptions=[]

let AdminOptionsList=[];
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
const { leadid } = useParams();
const [CurrentData, setCurrentData] = useState({})
const [ServicesData, setServicesData] = useState([]);
const [FollowUps, setFollowUps] = useState([]);
const [ActionResult, setActionResult] = useState({});
const [medicalSchoolOptionsList, setMedicalSchoolOptionsList] = useState([]);
const { showLoading, hideLoading,firestoreQueries,ShowToast, TooltipsPopovers,DatabaseName  } = useLoading();
const [activeKey, setActiveKey] = useState(0);
const [toast, addToast] = useState(0)
const toaster = useRef()




useEffect(() => {

fetchData();
  }, []);
  useEffect(() => {
    console.log("ServicesData====>",ServicesData)
 if(CurrentData['countryofmedicalcollege'])
	{
		if(CurrentData['countryofmedicalcollege']?.label)
		{
			if(CurrentData['countryofmedicalcollege'].label!=="Others")
			{
				const filtered = medicalSchoolOptions.filter(college => college.includes(", "+CurrentData['countryofmedicalcollege'].label));
    			setMedicalSchoolOptionsList([
          ...filtered.map(college => ({ value: college, label: college })),
          { value: 'Others', label: 'Others' }
        ]);
			}
		}

    }
  }, [CurrentData,ServicesData]);
  useEffect(() => {
    // Update followUps only when ServicesData changes
    const newFollowUps = {};
    ServicesData.forEach((serviceData, ServiceIndex) => {
      if (serviceData.joinData) {
        newFollowUps[ServiceIndex] = serviceData.joinData;
      }
    });
    setFollowUps(newFollowUps);
  }, [ServicesData]);
  const fetchData = async () => {
    showLoading()
    const RotationList=await firestoreQueries.FetchDataFromCollection(DatabaseName, "rotationslist", 1000);
 RotationList.map((item) => {
    RotationOptions.push({label:item.location_code,value:item.location_code,locationid:item.id});
    return "h";
    })
    const adminlist=await firestoreQueries.FetchDataFromCollection(DatabaseName, "users", 100, "role", "==", "Customer Support");
    const LeadData=await firestoreQueries.FetchDataFromCollection(DatabaseName, "leads", 100, "id", "==", leadid);
    let conditionsArray=[[{name:'leadid',condition:'==',value:leadid}]]
    const serviceswithJoin=await firestoreQueries.SelectWithComplexConditions(DatabaseName,"services", conditionsArray, 'followups','id','serviceid');
    console.log("RotationList---->",RotationList)
    //const services=await firestoreQueries.FetchDataFromCollection(DatabaseName, "services", 100, "leadid", "==", leadid);
    console.log("LeadData---->",LeadData)
    //console.log("services---->",services)
    if(serviceswithJoin.status==="success")
    {
      setServicesData(serviceswithJoin.data)
    }
    setCurrentData(LeadData[0]);
    /*setMedicalSchoolOptionsList([
          ...medicalSchoolOptions.map(college => ({ value: college, label: college })),
          { value: 'Others', label: 'Others' }
        ]);*/
    adminlist.map((item) => {
    AdminOptionsList.push({label:item.name,value:item.uid,name:item.name});
    return "h";
    })
    console.log("adminlist---->",adminlist)
    //setAdminList()
    hideLoading()

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
  	  value = Timestamp.fromDate(new Date(value))
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
    console.log("event====>",event)
    console.log("value====>",value)
    if(name==="step1result" && value==="not taken")
    {
      setCurrentData((prevValues) => ({
    ...prevValues,
    step2ckresult: value,
    step3ckresult: value,
  }));
    }
    setCurrentData((prevValues) => ({
    ...prevValues,
    [name]: value,
  }));
  }
  const formValidate = async()=>
  {
    const errors = {};
     console.log("CurrentData====> ",CurrentData)
    if(!CurrentData.firstname)
    {
    	errors.firstname="Please Enter First Name.";
    }
    if(!CurrentData.lastname)
    {
    	errors.lastname="Please Enter Last Name.";
    }
    if(!CurrentData.email)
    {
    	errors.email="Please Enter Email.";
    }
    else if(CurrentData.email && !validateEmail(CurrentData.email))
    {
    	errors.email="Please Enter A Valid Email.";
    }
    if(CurrentData.phonecountrycode && !CurrentData.phone)
    {
    	errors.phone="Please Enter A Valid Phone.";
    }
    else if(!CurrentData.phonecountrycode && CurrentData.phone)
    {
    	errors.phonecountrycode="Please Select Country Code.";
    }
    else if(CurrentData.phonecountrycode && CurrentData.phone &&  !validatePhoneNumber(CurrentData.phone,CurrentData.phonecountrycode.value))
    {
    	errors.phone="Please Enter A Valid Phone.";
    }

    return errors;
  }
  const validateEmail = (email) =>
	{
  		const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  		return regex.test(email);
	};
	const validatePhoneNumber = (phoneNumber,countrycode) => {
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
      const parsedNumber = parsePhoneNumberFromString(cleanedNumber, countrycode);
      return parsedNumber && parsedNumber.isValid();

    } catch (e) {
      return false;
    }
  };
  const handleFormSubmit = async () =>
  {
    showLoading()
    const validationErrors = await formValidate();
    console.log("validationErrors====> ",validationErrors)
    seterrors(validationErrors);
     if (Object.keys(validationErrors).length === 0)
     {

       CurrentData.createTime=firestoreQueries.Timestamp.fromDate(new Date());
       CurrentData.updateTime=firestoreQueries.Timestamp.fromDate(new Date());
      firestoreQueries.updateOrCreateByField("LeadTracker", "leads", "id","==" ,leadid, CurrentData).then((result) => {
        console.log("result====>",result)
        const exampleToast = (
    <CToast title="CoreUI for React.js">
      <CToastHeader closeButton>
        <svg
          className="rounded me-2"
          width="20"
          height="20"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
          focusable="false"
          role="img"
        >
          <rect width="100%" height="100%" fill="#007aff"></rect>
        </svg>
        <strong className="me-auto">{result.status}</strong>
        <small></small>
      </CToastHeader>
      <CToastBody>{result.message}</CToastBody>
    </CToast>
  )
        setActionResult(result)
        addToast(exampleToast)
        hideLoading()
      })
     }
     else
     {
       hideLoading()
     }
  }
  const handleFormServiceChange = async (event, name = "",level=null,sublevel=null) => {
    let value;
    if(name==="whycontacted")
    {
      value = Array.from(event.target.selectedOptions, (option) => option.value);
    }
    else if (event.target) {
      value = event.target.value;
    } else if (event.$d) {
      value = event.toLocaleString('en-GB', { timeZone: 'GMT' });
      value = Timestamp.fromDate(new Date(value));
    } else if (event.label) {
      value = event;
    } else if (event?.[0]?.['label']) {
      value = event;
    } else {
      value = event.label;
    }
console.log("name====>",name)
   setServicesData(prevValues => {
        const updatedValues = [ ...prevValues ];

        if (sublevel !== null)
        {
            if (!updatedValues[level]) {
                updatedValues[level] = {};
            }
            if (!updatedValues[level][sublevel]) {
                updatedValues[level][sublevel] = {};
                if(name==="servicetype")
                {
                  updatedValues[level][sublevel]['servicename']=value;
                }
            }
            updatedValues[level][sublevel][name] = value;
        }
        else if (level !== null)
        {
            if (!updatedValues[level]) {
                updatedValues[level] = {};
            }
            if(name==="servicetype")
            {
              updatedValues[level]['servicename']=value;
            }
            updatedValues[level][name] = value;
        }
        else
        {
            updatedValues[name] = value;
            if(name==="servicetype")
            {
              updatedValues['servicename']=value;
            }
        }
        return updatedValues;
    });

  }
  const fetchFollowups = async () =>
  {

  }
  const handleFormFollowupChange = async (event, name = "",level=null,sublevel=null) => {
    let value;
    if(name==="whycontacted")
    {
      value = Array.from(event.target.selectedOptions, (option) => option.value);
    }
    else if (event.target) {
      value = event.target.value;
    } else if (event.$d) {
      value = event.toLocaleString('en-GB', { timeZone: 'GMT' });
      value = Timestamp.fromDate(new Date(value));
    } else if (event.label) {
      value = event;
    } else if (event?.[0]?.['label']) {
      value = event;
    } else {
      value = event.label;
    }
   setFollowUps(prevValues => {
        const updatedValues = { ...prevValues };

        if (sublevel !== null) {
            if (!updatedValues[level]) {
                updatedValues[level] = {};
            }
            if (!updatedValues[level][sublevel]) {
                updatedValues[level][sublevel] = {};
            }
            updatedValues[level][sublevel][name] = value;
        } else if (level !== null) {
            if (!updatedValues[level]) {
                updatedValues[level] = {};
            }
            updatedValues[level][name] = value;
        } else {
            updatedValues[name] = value;
        }
    console.log("updatedValues---->",updatedValues)
        return updatedValues;
    });

  }
  const AddServices = () => {
  setServicesData(prevServices => {
    if (prevServices.length >= 3) {
      // Show error tooltip if the maximum limit is reached
      TooltipsPopovers("Error", "You Can Add A Maximum of 3 Services", "Maximum Limit Reached");
      return prevServices; // Return existing services without adding a new one
    } else {
      // Add a new service and show success tooltip
      TooltipsPopovers("Success", "Service Added Successfully", "Added");
      return [
        ...prevServices,
        { servicename: `Service ${prevServices.length + 1}`, description: `Description ${prevServices.length + 1}` }
      ];
    }
  });
};
  const AddFollowup = (servicename) => {

    setFollowUps(prevFollowUps => ({
      ...prevFollowUps,
      [servicename]: [
        ...(prevFollowUps[servicename] || []),
        { name: `Followup ${prevFollowUps[servicename]?.length + 1 || 1}`, description: `Description ${prevFollowUps[servicename]?.length + 1 || 1}` }
      ]
    }));
  };
  const validateService = async (service,servicenumber) =>
  {
    const errors = {};
    if(!service.servicetype)
    {
      errors.servicetype="Please Select Service Type.";
    }
    if(!service.contactsource)
    {
      errors.contactsource="Please Select Contact Source.";
    }
    if(typeof service.followupsrequired==="undefined")
    {
      errors.followupsrequired="Please Select Follow Up Required."
    }
    else if(service.followupsrequired==="yes")
    {
      if(typeof service.nextfollowupdate==="undefined")
      {
          errors.nextfollowupdate="Please Select Next Follow Up Date."
      }
    }
    if(typeof FollowUps[servicenumber] !="undefined")
    {
      FollowUps[servicenumber].map((item,index)=>{
          if(typeof item.followupdate==="undefined")
          {
            if(typeof errors[index]==="undefined")
            {
              errors[index]={};
            }
            errors[index].followupdate = "Please Select Follow-up Date."
          }
          if(typeof item.mode==="undefined")
          {
            if(typeof errors[index]==="undefined")
            {
              errors[index]={};
            }
            errors[index].mode="Please Select Mode Of Follow-up."
          }
      })
    }
    return errors;
  }
  const UpdateService = async(servicenumber) =>
  {
    showLoading()
    const validationErrors = await validateService(ServicesData[servicenumber],servicenumber);
    console.log("FollowUps---->",FollowUps)
    console.log("ServicesData---->",ServicesData)
     console.log("validationErrors---->",validationErrors)
    seterrors((prevErrors) => ({
  ...prevErrors,
  services: {
    ...prevErrors.service,
    [servicenumber]: validationErrors
  }
}));
  if(Object.keys(validationErrors).length === 0)
  {
    console.log("Object.keys(validationErrors).length===>",Object.keys(validationErrors).length)
    let condition=[];
    if(typeof ServicesData[servicenumber].id!=="undefined")
    {
      condition=[{fieldName:'id',operator:'==',value:ServicesData[servicenumber].id}];
    }
    else
    {
      condition=[{fieldName:'servicename',operator:'==',value:ServicesData[servicenumber].servicename},{fieldName:'leadid',operator:'==',value:leadid}]
    }

       firestoreQueries.updateOrCreateByField(DatabaseName, "services",condition, ServicesData[servicenumber]).then((result) =>
        {
          console.log("here you are")
          FollowUps[servicenumber].map((follow,findex)=>{
           console.log("here you are")
              follow.numbersequence=findex;
              follow.serviceid=result.docId;
              follow.leadid=leadid
              if(typeof follow.id!=="undefined")
              {
                condition=[{fieldName:'id',operator:'==',value:follow.id}];
              }
              else
              {
                condition=[{fieldName:'numbersequence',operator:'==',value:follow.numbersequence}]
              }
              firestoreQueries.updateOrCreateByField(DatabaseName, "followups",condition, follow).then((resultRes) =>
              {
                console.log("resultRes====>",resultRes)
              })
          })
          console.log("result===>",result)
        TooltipsPopovers(result.status, result.message, result.status);
        hideLoading()
      })
  }
  else
  {
    hideLoading()
  }
    console.log("--servicenumber------>",servicenumber)
    console.log("-------->",ServicesData[servicenumber])
  }

  return (
    <CRow>

      <CCol xs={12}>
        <CCard className="mb-4">
         <CToaster ref={toaster} push={toast} placement="top-end" />
          <CCardHeader>
            <strong>Lead</strong> <small>Update</small>
          </CCardHeader>
          <CCardBody>
            <p className="text-body-secondary small">
            </p>
              <CForm className="row g-3 needs-validation">
              <CCol md={4}>
                <CFormLabel htmlFor="validationServer01">First Name</CFormLabel>
                <CFormInput
                    type="text"
                    placeholder="First Name"
                    value={CurrentData?.firstname}
                    invalid={!!errors.firstname} // Set `invalid` if there's an error
                    valid={!errors.firstname && !!CurrentData?.firstname} // Set `valid` if no error and value exists
                    required
                    onChange={(event) => handleFormChange(event,'firstname' )}
                />
                {errors.firstname && (
                      <CFormFeedback invalid>{errors.firstname}</CFormFeedback>
                  )}
              </CCol>
                <CCol md={4}>
                <CFormLabel >Last Name</CFormLabel>
                <CFormInput
                    type="text"
                    placeholder="Last Name"
                    value={CurrentData?.lastname}
                    invalid={!!errors.lastname} // Set `invalid` if there's an error
                    valid={!errors.firstname && !!CurrentData?.lastname} // Set `valid` if no error and value exists
                    required
                    onChange={(event) => handleFormChange(event,'lastname' )}
                />
                {errors.lastname && (
                      <CFormFeedback invalid>{errors.lastname}</CFormFeedback>
                  )}
              </CCol>
              <CCol md={4}>
                <CFormLabel >Email</CFormLabel>
                <CFormInput
                    type="text"
                    value={CurrentData?.email || ''}
                    placeholder="Email"
                    invalid={!!errors.email} // Set `invalid` if there's an error
                    valid={!errors.email && !!CurrentData?.email} // Set `valid` if no error and value exists
                    required
                    onChange={(event) => handleFormChange(event,'email' )}
                />
                {errors.email && (
                      <CFormFeedback invalid>{errors.email}</CFormFeedback>
                  )}
              </CCol>
              <CCol md={6}>
              <CInputGroup className="mb-3">
                <CCol md={2.2}>
                  <CFormLabel >Country Code</CFormLabel>
                  <Select1
        value={CurrentData?.phonecountrycode || ''}
        onChange={(event) => handleFormChange(event,'phonecountrycode')}
        options={allCountries}
        placeholder="Country Code"
         invalid={!!errors.phonecountrycode}
          valid={!errors.phonecountrycode && !!CurrentData?.phonecountrycode}
        isSearchable
        formatOptionLabel={CountryOption}
      />
                   {errors.phonecountrycode && (
                      <CFormFeedback invalid>{errors.phonecountrycode}</CFormFeedback>
                  )}
                </CCol>
                 <CCol md={0.1}>
                <CFormLabel>-</CFormLabel>
                <CInputGroupText>-</CInputGroupText>
                 </CCol>
                <CCol md={1.7}>
                <CFormLabel >Phone Without Country Code</CFormLabel>
                <CFormInput
                    type="text"
                    value={CurrentData?.phone || ''}
                    placeholder="Phone Without Country Code"
                    invalid={!!errors.phone} // Set `invalid` if there's an error
                    valid={!errors.phone && !!CurrentData?.phone} // Set `valid` if no error and value exists
                    required
                    onChange={(event) => handleFormChange(event,'phone' )}
                />
                {errors.phone && (
                      <CFormFeedback invalid>{errors.phone}</CFormFeedback>
                  )}
              </CCol>

                </CInputGroup>
                </CCol>
                 <CCol md={4}>
                <CFormLabel >Sarthi Student</CFormLabel>
                <CFormSelect  value={CurrentData?.sarthistudent || ''}
                    placeholder="Sarthi Student"
                    invalid={!!errors.sarthistudent} // Set `invalid` if there's an error
                    valid={!errors.sarthistudent && !!CurrentData?.sarthistudent} // Set `valid` if no error and value exists
                    required
                    onChange={(event) => handleFormChange(event,'sarthistudent' )}>
                    <option value='yes'>Yes</option>
                    <option value='no'>No</option>
                    <option value='do not know'>Do Not Know</option>
                  </CFormSelect>

                {errors.sarthistudent && (
                      <CFormFeedback invalid>{errors.sarthistudent}</CFormFeedback>
                  )}
              </CCol>
               <CCol md={4}>
                <CFormLabel >Source</CFormLabel>
                <CFormSelect  value={CurrentData?.source}
                    placeholder="Source"
                    invalid={!!errors.source} // Set `invalid` if there's an error
                    valid={!errors.source && CurrentData?.source} // Set `valid` if no error and value exists
                    required
                    onChange={(event) => handleFormChange(event,'source' )}>
                    <option value='rotation inquery'>Rotation Inquiry</option>
                    <option value='qhatsapp'>WhatsApp</option>
                    <option value='calendly'>Calendly</option>
                    <option value='webinar'>Webinar</option>
                    <option value='contact us page'>Contact Us Page</option>
                    <option value='enroll email'>Enroll Email</option>
                    <option value='call'>Call</option>
                    <option value='via team member'>Via team member</option>
                  </CFormSelect>

                {errors.source && (
                      <CFormFeedback invalid>{errors.source}</CFormFeedback>
                  )}
              </CCol>
              <CCol md={4}>
                <CFormLabel >Interested In</CFormLabel>
                <Select1  value={CurrentData?.interestedin}
                    placeholder="Interested In"
                    invalid={!!errors.interestedin} // Set `invalid` if there's an error
                    valid={!errors.interestedin && CurrentData?.interestedin} // Set `valid` if no error and value exists
                    required
                    isMulti
                    closeMenuOnSelect={false}
                    options={interestedin}
                    onChange={(event) => handleFormChange(event,'interestedin' )}>
                  </Select1>

                {errors.interestedin && (
                      <CFormFeedback invalid>{errors.interestedin}</CFormFeedback>
                  )}
              </CCol>
              <CCol md={4}>
                <CFormLabel >Status</CFormLabel>
                <CFormSelect  value={CurrentData?.status}
                    placeholder="Status"
                    invalid={!!errors.status} // Set `invalid` if there's an error
                    valid={!errors.status && CurrentData?.status} // Set `valid` if no error and value exists
                    required
                    onChange={(event) => handleFormChange(event,'status')}>
                    <option value='enrolled'>Enrolled</option>
                    <option value='hot'>Hot</option>
                    <option value='active'>Active</option>
                    <option value='not responding'>Not Responding</option>
                    <option value='Dead'>Dead</option>
                    <option value='do not disturb'>Do Not Disturb</option>
                  </CFormSelect>

                {errors.source && (
                      <CFormFeedback invalid>{errors.source}</CFormFeedback>
                  )}
              </CCol>
              <CCol md={4}>
                <CFormLabel >Lead Created By</CFormLabel>
                <Select1  value={CurrentData?.leadcreatedby}
                    placeholder="Lead Created By"
                    invalid={!!errors.leadcreatedby} // Set `invalid` if there's an error
                    valid={!errors.leadcreatedby && CurrentData?.leadcreatedby} // Set `valid` if no error and value exists
                    required
                    closeMenuOnSelect={false}
                    options={AdminOptionsList}
                    onChange={(event) => handleFormChange(event,'leadcreatedby' )}>
                  </Select1>

                {errors.leadcreatedby && (
                      <CFormFeedback invalid>{errors.leadcreatedby}</CFormFeedback>
                  )}
              </CCol>
              <CCol md={4}>
                <CFormLabel >Lead Owner</CFormLabel>
                <Select1  value={CurrentData?.leadowner}
                    placeholder="Lead Owner"
                    invalid={!!errors.leadowner} // Set `invalid` if there's an error
                    valid={!errors.leadowner && CurrentData?.leadowner} // Set `valid` if no error and value exists
                    required
                    closeMenuOnSelect={false}
                    options={AdminOptionsList}
                    onChange={(event) => handleFormChange(event,'leadowner' )}>
                  </Select1>

                {errors.leadowner && (
                      <CFormFeedback invalid>{errors.leadowner}</CFormFeedback>
                  )}
              </CCol>

              <CCol md={4}>
                <CFormLabel >YOG</CFormLabel>
                <DatePicker className="DatePicker"
        defaultValue={CurrentData?.yog?dayjs(CurrentData?.yog?.toDate().toISOString()):null}
        onChange={(event) => handleFormChange(event,'yog',index )}
        dateFormat="dd/mm/yyyy" // Customize date format as needed
        scrollableYearDropdown  // Make year dropdown scrollable
         yearDropdownItemNumber={50}
         picker="date"
          label="YOG"
  		variant="outlined"
      />

                {errors.leadowner && (
                      <CFormFeedback invalid>{errors.leadowner}</CFormFeedback>
                  )}
              </CCol>
              <CCol md={4}>
                <CFormLabel >Step 1 Result</CFormLabel>
                <CFormSelect  value={CurrentData?.step1result}
                    placeholder="Step 1 Result"
                    invalid={!!errors.step1result} // Set `invalid` if there's an error
                    valid={!errors.step1result && !!CurrentData?.step1result} // Set `valid` if no error and value exists
                    required
                    onChange={(event) => handleFormChange(event,'step1result')}>
                    <option value=''>=Select=</option>
                    <option value='score'>Score</option>
                    <option value='pass'>Pass</option>
                    <option value='fail'>Fail</option>
                    <option value='not taken'>Not Taken</option>
                  </CFormSelect>

                {errors.step1result && (
                      <CFormFeedback invalid>{errors.step1result}</CFormFeedback>
                  )}
              </CCol>
               {CurrentData?.step1result === 'score' && (
               <CCol md={4}>
                <CFormLabel >Step 1 Score</CFormLabel>
                <CFormInput
                    type="text"
                    value={CurrentData?.step1score}
                    placeholder="Step 1 Score"
                    invalid={!!errors.step1score} // Set `invalid` if there's an error
                    valid={!errors.step1score && !!CurrentData?.step1score} // Set `valid` if no error and value exists
                    required
                    onChange={(event) => handleFormChange(event,'step1score' )}
                />
                {errors.step1score && (
                      <CFormFeedback invalid>{errors.step1score}</CFormFeedback>
                  )}
              </CCol>
               )}
                <CCol md={4}>
                <CFormLabel >Step 2 CK Result</CFormLabel>
                <CFormSelect  value={CurrentData?.step2ckresult}
                    placeholder="Step 2 CK Result"
                    invalid={!!errors.step2ckresult} // Set `invalid` if there's an error
                    valid={!errors.step2ckresult && !!CurrentData?.step2ckresult} // Set `valid` if no error and value exists
                    required
                    onChange={(event) => handleFormChange(event,'step2ckresult')}>
                    <option value=''>=Select=</option>
                    <option value='score'>Score</option>
                    <option value='not taken'>Not Taken</option>
                  </CFormSelect>

                {errors.step2ckresult && (
                      <CFormFeedback invalid>{errors.step2ckresult}</CFormFeedback>
                  )}
              </CCol>
               {CurrentData?.step2ckresult === 'score' && (
               <CCol md={4}>
                <CFormLabel >Step 2 CK Score</CFormLabel>
                <CFormInput
                    type="text"
                    value={CurrentData?.step2ckscore}
                    placeholder="Step 2 CK Score"
                    invalid={!!errors.step2ckscore} // Set `invalid` if there's an error
                    valid={!errors.step2ckscore && !!CurrentData?.step2ckscore} // Set `valid` if no error and value exists
                    required
                    onChange={(event) => handleFormChange(event,'step2ckscore' )}
                />
                {errors.step2ckscore && (
                      <CFormFeedback invalid>{errors.step2ckscore}</CFormFeedback>
                  )}
              </CCol>
               )}
               <CCol md={4}>
                <CFormLabel >Step 3 CK Result</CFormLabel>
                <CFormSelect  value={CurrentData?.step3ckresult}
                    placeholder="Step 3 CK Result"
                    invalid={!!errors.step3ckresult} // Set `invalid` if there's an error
                    valid={!errors.step3ckresult && !!CurrentData?.step3ckresult} // Set `valid` if no error and value exists
                    required
                    onChange={(event) => handleFormChange(event,'step3ckresult')}>
                    <option value=''>=Select=</option>
                    <option value='score'>Score</option>
                    <option value='not taken'>Not Taken</option>
                  </CFormSelect>

                {errors.step3ckresult && (
                      <CFormFeedback invalid>{errors.step3ckresult}</CFormFeedback>
                  )}
              </CCol>
               {CurrentData?.step3ckresult === 'score' && (
               <CCol md={4}>
                <CFormLabel >Step 3 CK Score</CFormLabel>
                <CFormInput
                    type="text"
                    value={CurrentData?.step3ckscore}
                    placeholder="Step 3 CK Score"
                    invalid={!!errors.step3ckscore} // Set `invalid` if there's an error
                    valid={!errors.step3ckscore && !!CurrentData?.step3ckscore} // Set `valid` if no error and value exists
                    required
                    onChange={(event) => handleFormChange(event,'step3ckscore' )}
                />
                {errors.step3ckscore && (
                      <CFormFeedback invalid>{errors.step3ckscore}</CFormFeedback>
                  )}
              </CCol>
               )}
              <CCol md={4}>
                  <CFormLabel >Country Of Medical College</CFormLabel>
                  <Select1
        value={CurrentData?.countryofmedicalcollege}
        onChange={(event) => handleFormChange(event,'countryofmedicalcollege')}
        options={countryOfMedicalCollege}
        placeholder="Country Code"
         invalid={!!errors.countryofmedicalcollege}
          valid={!errors.countryofmedicalcollege && CurrentData?.countryofmedicalcollege}
        isSearchable
        formatOptionLabel={CountryOption}
      />
                   {errors.countryofmedicalcollege && (
                      <CFormFeedback invalid>{errors.countryofmedicalcollege}</CFormFeedback>
                  )}
                </CCol>
                <CCol md={4}>
                  <CFormLabel >Medical college name</CFormLabel>
                  <Select1
        value={CurrentData?.nameofmedicalcollege || ''}
        onChange={(event) => handleFormChange(event,'nameofmedicalcollege')}
        variant="outlined"
         invalid={!!errors.nameofmedicalcollege}
        valid={!errors.nameofmedicalcollege && CurrentData?.nameofmedicalcollege}
        options={medicalSchoolOptionsList}
        placeholder="Name of Medical School"
        label="Name of Medical School"
        title="Name of Medical School"
        isSearchable
      />
                   {errors.nameofmedicalcollege && (
                      <CFormFeedback invalid>{errors.nameofmedicalcollege}</CFormFeedback>
                  )}
                </CCol>
                {CurrentData?.['nameofmedicalcollege']?.['value'] === 'Others' && (
                  <CCol md={4}>
                <CFormLabel >Other Name</CFormLabel>
                <CFormInput
                    type="text"
                    value={CurrentData?.nameofmedicalschoolother}
                    placeholder="Other Name"
                    invalid={!!errors.nameofmedicalschoolother} // Set `invalid` if there's an error
                    valid={!errors.nameofmedicalschoolother && CurrentData?.nameofmedicalschoolother} // Set `valid` if no error and value exists
                    required
                    onChange={(event) => handleFormChange(event,'nameofmedicalschoolother' )}
                />
                {errors.nameofmedicalschoolother && (
                      <CFormFeedback invalid>{errors.nameofmedicalschoolother}</CFormFeedback>
                  )}
              </CCol>
                )}
                <CCol md={4}>
                <CFormLabel >Visa Status</CFormLabel>
                <CFormSelect  value={CurrentData?.visastatus}
                    placeholder="Visa Status"
                    invalid={!!errors.visastatus} // Set `invalid` if there's an error
                    valid={!errors.visastatus && CurrentData?.visastatus} // Set `valid` if no error and value exists
                    required
                    onChange={(event) => handleFormChange(event,'visastatus')}>
                    <option value='required'>Required</option>
                    <option value='not required'>Not Required</option>
                  </CFormSelect>

                {errors.visastatus && (
                      <CFormFeedback invalid>{errors.visastatus}</CFormFeedback>
                  )}
              </CCol>
                <CCol xs={12}>
                  <CButton color="primary" type="button"
                   onClick={(event) => handleFormSubmit()}
                   >

                    Update Lead Profile
                  </CButton>
                </CCol>
              </CForm>
          </CCardBody>
        </CCard>
      </CCol>

       {/* Services section starts here */}
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Services</strong>
          </CCardHeader>
          <CCardBody>
            <CNav variant="tabs" role="tablist">

              {ServicesData.map((serviceData, ServiceIndex) => (

                <CNavItem key={ServiceIndex}>
                  <CNavLink
                  href="javascript:void(0)"
                    active={activeKey === ServiceIndex}
                    onClick={() => setActiveKey(ServiceIndex)}
                  >
                    {serviceData.servicename}
                  </CNavLink>
                </CNavItem>
              ))}
            </CNav>

            <CTabContent>
            <p> </p>
            <p> </p>


                {ServicesData.map((serviceData, ServiceIndex) => (
                  <CTabPane  className="row" role="tabpanel" aria-labelledby="home-tab" visible={activeKey === ServiceIndex}>
                    <CForm className="row g-3 needs-validation">
                    <CCol md={6}>
                      <CFormLabel >Contact Source</CFormLabel>
                      <CFormSelect value={ServicesData?.[`${ServiceIndex}`]?.contactsource || ''}
                        placeholder="Contact Source"
                        invalid={!!errors?.services?.[ServiceIndex]?.contactsource}
                        valid={!errors?.services?.[ServiceIndex]?.contactsource && !!ServicesData?.[`${ServiceIndex}`]?.contactsource}
                        required
                        onChange={(event) => handleFormServiceChange(event, 'contactsource',`${ServiceIndex}`)}>
                        <option value=''>=Select=</option>
                        <option value='Via rotation enquire'>Via rotation enquire</option>
                        <option value='Via Calendly/WhatsApp/Call/Via team member/Contact us page/Enroll email'>Via Calendly/WhatsApp/Call/Via team member/Contact us page/Enroll email</option>
                        <option value='Via Webinar, dump leads etc'>Via Webinar, dump leads etc</option>
                      </CFormSelect>
                     {errors?.services?.[ServiceIndex]?.contactsource && (
                  <CFormFeedback invalid>{errors?.services?.[ServiceIndex]?.contactsource}</CFormFeedback>
                )}
                    </CCol>
                    <CCol md={6}>
                    <CFormLabel >Service Type</CFormLabel>
                    <CFormSelect value={ServicesData?.[`${ServiceIndex}`]?.servicetype || ''}
                      placeholder="Service Type"
                      invalid={!!errors?.services?.[ServiceIndex]?.servicetype}
                      valid={!errors?.services?.[ServiceIndex]?.servicetype && ServicesData?.[`${ServiceIndex}`]?.servicetype}
                      required
                      onChange={(event) => handleFormServiceChange(event, 'servicetype',`${ServiceIndex}`)}>
                      <option value=''>=Select=</option>
                      <option value='rotation'>Rotation</option>
                      <option value='match'>Match</option>
                      <option value='research'>Research</option>
                    </CFormSelect>
                    {errors?.services?.[ServiceIndex]?.servicetype && (
                  <CFormFeedback invalid>{errors?.services?.[ServiceIndex]?.servicetype}</CFormFeedback>
                )}
                  </CCol>
                  {ServicesData?.[`${ServiceIndex}`]?.contactsource==="Via rotation enquire" && (
                  <>
                   <CCol md={6}>
                <CFormLabel >Rotation Inquired</CFormLabel>
                <Select1
                  value={ServicesData?.[`${ServiceIndex}`].rotationincuired || ''}
                  onChange={(event) => handleFormServiceChange(event, 'rotationincuired',`${ServiceIndex}`)}
                  variant="outlined"
                  invalid={!!errors?.services?.[ServiceIndex]?.rotationincuired}
                  valid={!errors?.services?.[ServiceIndex]?.rotationincuired && ServicesData?.[`${ServiceIndex}`]?.rotationincuired}
                  options={RotationOptions}
                  placeholder="Rotation Inquired"
                  label="Rotation Inquired"
                  title="Rotation Inquired"
                  isSearchable
                  isMulti
                />
                {errors?.services?.[ServiceIndex]?.rotationincuired && (
                  <CFormFeedback invalid>{errors?.services?.[ServiceIndex]?.rotationincuired}</CFormFeedback>
                )}
              </CCol>
              <CCol md={6}>
                <CFormLabel >Planned Start Date</CFormLabel>
                <DatePicker className="DatePicker"
                  defaultValue={ServicesData?.[`${ServiceIndex}`]?.plannedstartdate ? dayjs(ServicesData?.[`${ServiceIndex}`]?.plannedstartdate?.toDate().toISOString()) : null}
                  onChange={(event) => handleFormServiceChange(event, 'plannedstartdate',`${ServiceIndex}`)}
                  dateFormat="dd/mm/yyyy"
                  scrollableYearDropdown
                  yearDropdownItemNumber={50}
                  picker="date"
                  label="Planned Start Date"
                  variant="outlined"
                />
                {errors?.services?.[ServiceIndex]?.plannedstartdate && (
                  <CFormFeedback invalid>{errors?.services?.[ServiceIndex]?.plannedstartdate}</CFormFeedback>
                )}
              </CCol>
              <CCol md={6}>
                      <CFormLabel >Our Response</CFormLabel>
                      <CFormSelect value={ServicesData?.[`${ServiceIndex}`]?.ourresponse || ''}
                        placeholder="Contact Source"
                        invalid={!!errors?.services?.[ServiceIndex]?.ourresponse}
                        valid={!errors?.services?.[ServiceIndex]?.ourresponse && !!ServicesData?.[`${ServiceIndex}`]?.ourresponse}
                        required
                        onChange={(event) => handleFormServiceChange(event, 'ourresponse',`${ServiceIndex}`)}>
                        <option value=''>=Select=</option>
                        <option value='accepted'>Accepted</option>
                        <option value='Rejected'>Rejected</option>
                      </CFormSelect>
                      {errors?.services?.[ServiceIndex]?.ourresponse && (
                  <CFormFeedback invalid>{errors?.services?.[ServiceIndex]?.ourresponse}</CFormFeedback>
                )}
                    </CCol>
              </>
                  )}
                {ServicesData?.[`${ServiceIndex}`]?.contactsource==="Via Calendly/WhatsApp/Call/Via team member/Contact us page/Enroll email" && (
                  <>
                    <CCol md={6}>
                  <CFormLabel >Speciality</CFormLabel>
                  <CFormInput
                    type="text"
                    value={ServicesData?.[`${ServiceIndex}`]?.speciality || ''}
                    placeholder="Speciality"
                    invalid={!!errors?.services?.[ServiceIndex]?.speciality}
                    valid={!errors?.services?.[ServiceIndex]?.speciality && !!ServicesData?.[`${ServiceIndex}`]?.speciality}
                    required
                    onChange={(event) => handleFormServiceChange(event, 'speciality',`${ServiceIndex}`)}
                  />
                   {errors?.services?.[ServiceIndex]?.speciality && (
                  <CFormFeedback invalid>{errors?.services?.[ServiceIndex]?.speciality}</CFormFeedback>
                )}
                </CCol>
                 <CCol md={6}>
                      <CFormLabel >Why contacted</CFormLabel>
                      <CFormSelect value={ServicesData?.[`${ServiceIndex}`]?.whycontacted || ''}
                        placeholder="Contact Source"
                        invalid={!!errors?.services?.[ServiceIndex]?.whycontacted}
                        valid={!errors?.services?.[ServiceIndex]?.whycontacted && !!ServicesData?.[`${ServiceIndex}`]?.whycontacted}
                        required
                        multiple
                        onChange={(event) => handleFormServiceChange(event, 'whycontacted',`${ServiceIndex}`)}>
                        <option value=''>=Select=</option>
                        <option value='rotation availability'>Rotation Availability</option>
                        <option value='rotation process'>Rotation Process</option>
                        <option value='rotation date change'>Rotation Date Change</option>
                        <option value='Rotation Cancellation'>Rotation Cancellation</option>
                        <option value='rotation documents'>Rotation Documents</option>
                        <option value='rotation refunds'>Rotation Refunds</option>
                        <option value='housing refunds'>Housing Refunds</option>
                        <option value='visa question'>Visa Question</option>
                        <option value='visa letter'>Visa Letter</option>
                        <option value='lor'>LoR</option>
                        <option value='Research'>Research</option>
                        <option value='match'>Match</option>
                        <option value='usmle guidance'>USMLE Guidance</option>
                        <option value='step preparation'>STEP Preparation</option>
                        <option value='housing'>Housing</option>
                        <option value='Physician Connect'>Physician Connect</option>
                        <option value='landlord connect'>Landlord Connect</option>
                        <option value='payment links'>Payment Links</option>
                      </CFormSelect>
                       {errors?.services?.[ServiceIndex]?.whycontacted && (
                  <CFormFeedback invalid>{errors?.services?.[ServiceIndex]?.whycontacted}</CFormFeedback>
                )}
                    </CCol>
                    <CCol md={6}>
                      <CFormLabel >Status</CFormLabel>
                      <CFormSelect value={ServicesData?.[`${ServiceIndex}`]?.status || ''}
                        placeholder="Contact Source"
                        invalid={!!errors?.services?.[ServiceIndex]?.status}
                        valid={!errors?.services?.[ServiceIndex]?.status && !!ServicesData?.[`${ServiceIndex}`]?.status}
                        required
                        onChange={(event) => handleFormServiceChange(event, 'status',`${ServiceIndex}`)}>
                        <option value=''>=Select=</option>
                        <option value='attended'>Attended</option>
                        <option value='no-show'>No-show</option>
                      </CFormSelect>
                      {errors?.services?.[ServiceIndex]?.status && (
                  <CFormFeedback invalid>{errors?.services?.[ServiceIndex]?.status}</CFormFeedback>
                )}
                    </CCol>
                  </>
                  )}
                  {ServicesData?.[`${ServiceIndex}`]?.contactsource==="Via Webinar, dump leads etc" && (
                  <>
                    <CCol md={6}>
                  <CFormLabel >Speciality</CFormLabel>
                  <CFormInput
                    type="text"
                    value={ServicesData?.[`${ServiceIndex}`]?.speciality || ''}
                    placeholder="Speciality"
                    invalid={!!errors?.services?.[ServiceIndex]?.speciality}
                    valid={!errors?.services?.[ServiceIndex]?.speciality && !!ServicesData?.[`${ServiceIndex}`]?.speciality}
                    required
                    onChange={(event) => handleFormServiceChange(event, 'speciality',`${ServiceIndex}`)}
                  />
                   {errors?.services?.[ServiceIndex]?.speciality && (
                  <CFormFeedback invalid>{errors?.services?.[ServiceIndex]?.speciality}</CFormFeedback>
                )}
                </CCol>
                 <CCol md={6}>
                      <CFormLabel >Follow Up For</CFormLabel>
                      <CFormSelect value={ServicesData?.[`${ServiceIndex}`]?.followupfor || ''}
                        placeholder="Contact Source"
                        invalid={!!errors?.services?.[ServiceIndex]?.followupfor}
                        valid={!errors?.services?.[ServiceIndex]?.followupfor && !!ServicesData?.[`${ServiceIndex}`]?.followupfor}
                        required
                        multiple
                        onChange={(event) => handleFormServiceChange(event, 'followupfor',`${ServiceIndex}`)}>
                        <option value=''>=Select=</option>
                        <option value='steps preparation'>STEPs Preparation</option>
                        <option value='rotations'>Rotations</option>
                        <option value='research'>Research</option>
                        <option value='match'>Match</option>
                        <option value='interview preparations'>Interview Preparations</option>
                        <option value='fellowship preparation'>Fellowship Preparation</option>
                      </CFormSelect>
                      {errors?.services?.[ServiceIndex]?.followupfor && (
                  <CFormFeedback invalid>{errors?.services?.[ServiceIndex]?.followupfor}</CFormFeedback>
                )}
                    </CCol>
                  </>
                  )}
              {/* Followups Start Here*/}
              {FollowUps?.[`${ServiceIndex}`]?.map((followupdata, followupindex) => (
              <CCol xs={12}>
        <CCard className="row mb-4">
          <CCardHeader>
            <strong>Follow Up</strong> <small>{followupindex+1}</small>
          </CCardHeader>
          <CCardBody className="">
          <div className="row g-3 needs-validation">
            <CCol md={6}>
                <CFormLabel >Date</CFormLabel>
                <DatePicker className="DatePicker"
                  defaultValue={followupdata?.followupdate ? dayjs(followupdata?.followupdate?.toDate().toISOString()) : null}
                  onChange={(event) => handleFormFollowupChange(event, 'followupdate',`${ServiceIndex}`,followupindex)}
                  dateFormat="dd/mm/yyyy"
                  scrollableYearDropdown
                  yearDropdownItemNumber={50}
                  picker="date"
                  label="Date"
                  variant="outlined"
                />
               {errors.services?.[ServiceIndex]?.[followupindex]?.followupdate && (
                    <CFormFeedback invalid>{errors.services?.[ServiceIndex]?.[followupindex]?.followupdate}</CFormFeedback>
                  )}
              </CCol>
              <CCol md={6}>
                      <CFormLabel >Mode</CFormLabel>
                      <CFormSelect value={followupdata?.mode || ''}
                        placeholder="Mode"
                        invalid={!!errors.services?.[ServiceIndex]?.[followupindex]?.mode}
                        valid={!errors.services?.[ServiceIndex]?.[followupindex]?.mode && !!followupdata?.mode}
                        required
                        onChange={(event) => handleFormFollowupChange(event, 'mode',`${ServiceIndex}`,followupindex)}>
                        <option value=''>=Select=</option>
                        <option value='call'>Call</option>
                        <option value='whatsapp'>WhatsApp</option>
                        <option value='email'>Email</option>
                      </CFormSelect>
                     {errors.services?.[ServiceIndex]?.[followupindex]?.mode && (
                    <CFormFeedback invalid>{errors.services?.[ServiceIndex]?.[followupindex]?.mode}</CFormFeedback>
                  )}
                    </CCol>

                     <CCol md={6}>
                <CFormLabel >Rotation Pushed</CFormLabel>
                <Select1
                  value={followupdata?.rotationpushed || ''}
                  onChange={(event) => handleFormFollowupChange(event, 'rotationpushed',`${ServiceIndex}`,followupindex)}
                  variant="outlined"
                  invalid={!!errors.services?.[ServiceIndex]?.[followupindex]?.rotationpushed}
                  valid={!errors.services?.[ServiceIndex]?.[followupindex]?.rotationpushed && !!followupdata?.rotationpushed}
                  options={RotationOptionss}
                  placeholder="Rotation Pushed"
                  label="Rotation Pushed"
                  title="Rotation Pushed"
                  isSearchable
                  isMulti
                />
                 {errors.services?.[ServiceIndex]?.[followupindex]?.rotationpushed && (
                    <CFormFeedback invalid>{errors.services?.[ServiceIndex]?.[followupindex]?.rotationpushed}</CFormFeedback>
                  )}
              </CCol>
              <CCol md={6}>
                      <CFormLabel >Response</CFormLabel>
                      <CFormSelect value={followupdata?.response || ''}
                        placeholder="Response"
                        invalid={!!errors.services?.[ServiceIndex]?.[followupindex]?.response}
                        valid={!errors.services?.[ServiceIndex]?.[followupindex]?.response && !!followupdata?.response}
                        required
                        onChange={(event) => handleFormFollowupChange(event, 'response',`${ServiceIndex}`,followupindex)}>
                        <option value=''>=Select=</option>
                        <option value='expensive'>Expensive</option>
                        <option value='competitor has cheap service'>Competitor Has Cheap Service</option>
                        <option value='step 2 or step 3 exam'>Step 2 or Step 3 Exam</option>
                        <option value='prefer rotations/research'>Prefer Rotations/Research</option>
                        <option value='will join later'>Will Join Later</option>
                        <option value='rotation not available'>Rotation Not Available</option>
                        <option value='research not available'>Research Not Available</option>
                        <option value='not replying'>Not Replying</option>
                        <option value='not interested (no reason provided)'>Not Interested (No Reason Provided)</option>
                        <option value='not applying'>Not Applying</option>
                        <option value='have interviews'>Have Interviews</option>
                        <option value='currently busy'>Currently Busy</option>
                        <option value='financial issues'>financial issues</option>
                        <option value='will let you know/discussing with family'>Will Let You Know/Discussing With Family</option>
                        <option value='have another mentor or reviewer'>Have Another Mentor Or Reviewer</option>
                        <option value='visa issues'>Visa Issues</option>
                        <option value='seeking discount'>Seeking Discount</option>
                        <option value='plan not available'>Plan Not Available</option>
                        <option value='need time to think'>Need Time To Think</option>
                        <option value='about to enroll'>about to enroll</option>
                        <option value='family emergency'>Family Emergency</option>
                        <option value='need visa letter only'>Need Visa Letter Only</option>
                        <option value='will do on my own'>Will Do On My Own</option>
                        <option value='blocked'>Blocked</option>
                        <option value='dropped plan'>Dropped Plan</option>
                        <option value='newly enquired'>Newly Enquired</option>
                        <option value='others'>Others</option>
                      </CFormSelect>
                      {errors.services?.[ServiceIndex]?.[followupindex]?.response && (
                    <CFormFeedback invalid>{errors.services?.[ServiceIndex]?.[followupindex]?.response}</CFormFeedback>
                  )}
                    </CCol>
                    {followupdata.response==="others" && (
                    <CCol md={6}>
                  <CFormLabel >Others Specify</CFormLabel>
                  <CFormInput
                    type="text"
                    value={followupdata?.responseothers || ''}
                    placeholder="Others Specify"
                    invalid={!!errors.services?.[ServiceIndex]?.[followupindex]?.responseothers}
                    valid={!errors.services?.[ServiceIndex]?.[followupindex]?.responseothers && !!followupdata?.responseothers}
                    required
                    onChange={(event) => handleFormFollowupChange(event, 'responseothers',`${ServiceIndex}`,followupindex)}
                  />
                   {errors.services?.[ServiceIndex]?.[followupindex]?.responseothers && (
                    <CFormFeedback invalid>{errors.services?.[ServiceIndex]?.[followupindex]?.responseothers}</CFormFeedback>
                  )}
                </CCol>
                    )}
                    <CCol md={6}>
                      <CFormLabel >Research Pushed</CFormLabel>
                      <CFormSelect value={followupdata?.researchpushed || ''}
                        placeholder="Response"
                        invalid={!!errors.services?.ServiceIndex?.followupindex?.researchpushed}
                        valid={!errors.services?.ServiceIndex?.followupindex?.researchpushed && !!followupdata?.researchpushed}
                        required
                        onChange={(event) => handleFormFollowupChange(event, 'researchpushed',`${ServiceIndex}`,followupindex)}>
                        <option value=''>=Select=</option>
                        <option value='c2p'>C2P</option>
                        <option value='rar'>RAR</option>
                        <option value='irc'>IRC</option>
                      </CFormSelect>
                       {errors.services?.ServiceIndex?.followupindex?.researchpushed && (
                    <CFormFeedback invalid>{errors.services?.[ServiceIndex]?.[followupindex]?.researchpushed}</CFormFeedback>
                  )}
                    </CCol>
                    <CCol md={6}>
                  <CFormLabel >Notes</CFormLabel>
                  <CFormTextarea
                    type="text"
                    row="7"
                    value={followupdata?.note || ''}
                    placeholder="General Notes"
                    invalid={!!errors.services?.ServiceIndex?.followupindex?.note}
                    valid={!errors.services?.ServiceIndex?.followupindex?.note && !!followupdata?.note}
                    required
                    onChange={(event) => handleFormFollowupChange(event, 'note',`${ServiceIndex}`,followupindex)}
                  />
                  {errors.services?.ServiceIndex?.followupindex?.note && (
                    <CFormFeedback invalid>{errors.services?.ServiceIndex?.followupindex?.note}</CFormFeedback>
                  )}
                </CCol>
                    </div>
          </CCardBody>
            </CCard>
            </CCol>
            ))}
            <CCol md={6}>
                      <CFormLabel >Follow-ups Required</CFormLabel>
                      <CFormSelect value={ServicesData?.[`${ServiceIndex}`]?.followupsrequired || ''}
                        placeholder="Follow-ups Required"
                        invalid={!!errors?.services?.[ServiceIndex]?.followupsrequired}
                        valid={!errors?.services?.[ServiceIndex]?.followupsrequired && !!ServicesData?.[`${ServiceIndex}`]?.followupsrequired}
                        required
                        onChange={(event) => handleFormServiceChange(event, 'followupsrequired',`${ServiceIndex}`)}>
                        <option value=''>=Select=</option>
                        <option value='yes'>Yes</option>
                        <option value='no'>No</option>
                        <option value='dnd'>Do Not Disturb</option>
                      </CFormSelect>
                      {errors?.services?.[ServiceIndex]?.followupsrequired && (
                  <CFormFeedback invalid>{errors?.services?.[ServiceIndex]?.followupsrequired}</CFormFeedback>
                )}
                    </CCol>
                    <CCol md={6}>
                <CFormLabel >Next Follow-up Date</CFormLabel>
                <DatePicker className="DatePicker"
                  defaultValue={ServicesData?.[`${ServiceIndex}`]?.nextfollowupdate ? dayjs(ServicesData?.[`${ServiceIndex}`]?.nextfollowupdate?.toDate().toISOString()) : null}
                  onChange={(event) => handleFormServiceChange(event, 'nextfollowupdate',`${ServiceIndex}`)}
                  dateFormat="dd/mm/yyyy"
                  scrollableYearDropdown
                  yearDropdownItemNumber={50}
                  picker="date"
                  label="Next Follow-up Date"
                  variant="outlined"
                />
                {errors?.services?.[ServiceIndex]?.nextfollowupdate && (
                  <CFormFeedback invalid>{errors?.services?.[ServiceIndex]?.nextfollowupdate}</CFormFeedback>
                )}
              </CCol>
            <CCol xs={12}>
            <CCard className="mb-4">
          <CCardHeader>
          <strong>Add</strong> <small>Follow-up</small>
          </CCardHeader>
          <CCardBody  className="row">
           <CCol xs={6}>
        <CButton color="secondary" type="button"
                  onClick={(event) => AddFollowup(`${ServiceIndex}`)}>
                  Add Followup
                </CButton>
              </CCol>
           <CCol xs={6}>
        <CButton color="success" type="button"
                  onClick={(event) => UpdateService(`${ServiceIndex}`)}>
                  Update Service
                </CButton>
              </CCol>
              </CCardBody>
          </CCard>
            </CCol>
                    </CForm>
                  </CTabPane>
                )
                )}


            </CTabContent>
          </CCardBody>
        </CCard>
      </CCol>

      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Operation</strong>
          </CCardHeader>
          <CCardBody>
            <CForm className="row g-3 needs-validation">

              <CCol md={6}>
                <CButton color="primary" type="button"
                  onClick={(event) => AddServices()}>
                  Add Services
                </CButton>
              </CCol>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>




    </CRow>
  )
}

export default Validation
