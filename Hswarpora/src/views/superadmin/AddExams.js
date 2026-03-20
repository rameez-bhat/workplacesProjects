import React, { useState,useEffect,useRef } from 'react'
import {useParams,useNavigate } from 'react-router-dom';
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
import dayjs from 'dayjs';
import Select1 from 'react-select';
import axios from 'axios';
import { useLoading } from '../../layout/LoadingContext';
import { DocsExample } from 'src/components'
let examTempNumber=0;
import { parsePhoneNumberFromString } from 'libphonenumber-js';
let AdminOptionsList=[];
let ListClassOption1=[];
let CurrentYear=0;
let ListOfSubjectFullObject={};
const Validation =  () => {
const { cid } = useParams();
const [errors, seterrors] = useState(false)
const [ListClassOption, setListClassOption] = useState([])
const [ListClassOptionFull, setListClassOptionFull] = useState([])
const [ListTeacherOption, setListTeacherOption] = useState([])
const [ListSubjectOption, setListSubjectOption] = useState([])
const [ListTeacherOptionFull, setListTeacherOptionFull] = useState([])
const [CurrentData, setCurrentData] = useState({})
const [CurrentYear, setCurrentYear] = useState(null)
const [ActionResult, setActionResult] = useState({})
const [medicalSchoolOptionsList, setMedicalSchoolOptionsList] = useState([]);
const {showLoading,hideLoading,firestoreQueries,DatabaseName,TooltipsPopovers} = useLoading();
const [toast, addToast] = useState(0)
const toaster = useRef()

useEffect(() => {
console.log("useEffect---->")
fetchData();
console.log("useEffect---->")

  }, []);
  useEffect(() => {

  }, [CurrentData]);
  const fetchData = async () => {
    const ListOfClasses=await firestoreQueries.FetchDataFromCollection(DatabaseName, "classes", 1000, 'class', '==', cid,"FieldOrderCol","asc");
    const ListOfTeachers=await firestoreQueries.FetchDataFromCollection(DatabaseName, "users", 1000, 'role', '==', "Teacher","name","asc");
    console.log("ListOfClasses--->",ListOfClasses)
    if(ListOfClasses.length)
    {
      setCurrentData(ListOfClasses[0][ListOfClasses[0]?.currentyear]?.['exams'])
      setCurrentYear(ListOfClasses[0].currentyear)
    }

  }
  const AddMoreExams = async (serialnumber) =>
  {
    const examname=`TempName${serialnumber}`;
     setCurrentData((prevValues) => ({
    ...prevValues,
    [examname]: {Name:examname,Max:0},
  }));
  }
  const handleFormChange = async (event,name="",actualName=null) =>
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
    console.log("value----->",value)
    console.log("name----->",name)
    if(name==="Name")
    {
      console.log("actualName----->",actualName)
      if(value!==actualName)
      {

          delete CurrentData[actualName];
          setCurrentData(CurrentData)
      actualName=value;
      }
    }

   setCurrentData((prevValues) => ({
  ...prevValues,
  [actualName]: {
    ...(prevValues[actualName] || {}),  // Preserve existing values or initialize an empty object
    [name]: value,  // Set the new value for the specified key
  },
}));
  }
  const validateNumber = (value) => {
    return !isNaN(value) && value !== '';
  };
  const formValidate = async()=>
  {
    const errors = {};
    Object.entries(CurrentData || {}).map(([examIndex, examData]) =>
    {
        if(examIndex.trim()==='')
        {
          if(typeof  errors[examIndex]==="undefined")
          {
            errors[examIndex]={}
          }
          errors[examIndex]['Name']="Please Enter A Valid Exam Name.";
        }
        if(examData['Max']===''  ||  !validateNumber(examData['Max']))
        {
          if(typeof  errors[examIndex]==="undefined")
          {
            errors[examIndex]={}
          }
          errors[examIndex]['Max']="Please Enter A Valid Maximum Marks.";
        }
    })
    return errors;
  }




  const handleFormSubmit = async () =>
  {
    showLoading()
    const validationErrors = await formValidate();
    console.log("validationErrors====> ",validationErrors)
    console.log("CurrentData====> ",CurrentData)
    seterrors(validationErrors);
    if (Object.keys(validationErrors).length === 0)
    {
      let dataTobesendUser={};
      let fieldToDelete=`${CurrentYear}.exams`;
      dataTobesendUser[CurrentYear]={};
      dataTobesendUser[CurrentYear]['exams']=CurrentData;
      await firestoreQueries.deleteFieldFromDocument(DatabaseName,"classes",cid,fieldToDelete)
       let CreateRes=await firestoreQueries.updateOrCreateById(DatabaseName, "classes",  cid, dataTobesendUser);
       console.log("CreateRes===>",CreateRes)
        TooltipsPopovers(CreateRes.status,CreateRes.message,`Exams Of Class ${cid} Added `);
        hideLoading();

    }
    else
    {
      hideLoading()
    }

  }
examTempNumber=0;
  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
         <CToaster ref={toaster} push={toast} placement="top-end" />
          <CCardHeader>
            <strong>Add Exams</strong> Class {cid} <small></small>
          </CCardHeader>
          <CCardBody>
            <p className="text-body-secondary small">
            {errors.mainerror  && <span class="validationerror">{errors.mainerror }</span>}
            </p>
              <CForm className="row g-3 needs-validation">
              {Object.entries(CurrentData || {}).map(([examIndex, examData]) => {
              examTempNumber=examTempNumber+1;
              return (
              <CCard className="mb-4">
          <CCardHeader>
            <strong>{examIndex}</strong> <small>Exam</small>
          </CCardHeader>
          <CCardBody className="row">
              <CCol md={6}>
                <CFormLabel htmlFor="validationServer01">Exam Name</CFormLabel>
                <CFormInput
                    type="text"
                    placeholder="Exam Name"
                    value={examIndex || ''}
                    invalid={!!errors?.[examIndex]?.['Name']} // Set `invalid` if there's an error
                    valid={!errors?.[examIndex]?.['Name'] && !!examIndex} // Set `valid` if no error and value exists
                    required
                    onChange={(event) => handleFormChange(event,'Name',examIndex )}
                />
                {errors?.[examIndex]?.['Name'] && (
                      <CFormFeedback invalid>{errors?.[examIndex]?.['Name']}</CFormFeedback>
                  )}
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="validationServer01">Maximum Marks</CFormLabel>
                <CFormInput
                    type="text"
                    placeholder="Maximum Marks"
                    value={examData?.Max || ''}
                    invalid={!!errors?.[examIndex]?.['Max']} // Set `invalid` if there's an error
                    valid={!errors?.[examIndex]?.['Max'] && !!examData?.Max} // Set `valid` if no error and value exists
                    required
                    onChange={(event) => handleFormChange(event,'Max',examIndex )}
                />
                {errors?.[examIndex]?.['Max'] && (
                      <CFormFeedback invalid>{errors?.[examIndex]?.['Max']}</CFormFeedback>
                  )}
              </CCol>
            </CCardBody>
            </CCard>)
            })}








                <CCol xs={12} className="row">
                <p></p>
                <CCol xs={6}>
                  <CButton color="warning" type="button"
                   onClick={(event) => AddMoreExams(examTempNumber)}
                   >

                    Add More Exams
                  </CButton>
                  </CCol>
                <CCol xs={6}>
                  <CButton color="primary" type="button"
                   onClick={(event) => handleFormSubmit()}
                   >

                    Save Exam
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
