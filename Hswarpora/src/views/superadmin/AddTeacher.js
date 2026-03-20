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
    const ListOfClasses=await firestoreQueries.FetchDataFromCollection(DatabaseName, "classes", 1000, null, null, "DDO","FieldOrderCol","asc");
    const ListOfTeachers=await firestoreQueries.FetchDataFromCollection(DatabaseName, "users", 1000, 'role', '==', "Teacher","name","asc");
    console.log("ListOfClasses--->",ListOfClasses)
     /*ListOfTeachers.map(async (classI) => {
      let dataTobesend={};
      console.log("classI====>",classI)
      dataTobesend['name'] = classI.email;
      dataTobesend['email'] = classI.name;
       console.log("classI====>",classI)
      console.log("dataTobesend====>",dataTobesend)
      let CreateRes=await firestoreQueries.updateOrCreateById(DatabaseName, "users",  classI.tid, dataTobesend);
    })*/

     ListClassOption1 = [
      ...ListOfClasses.map(classes => {
      ListOfSubjectFullObject[classes.class]=classes?.[classes.currentyear]?.['teachers'] ? {"TeacherList":classes?.[classes.currentyear]?.['teachers'],"SubjectList":classes?.subjects} :{"TeacherList":{},"SubjectList":classes?.subjects};
      return{ value: classes.class, label: classes.class };

      }),
    ];
  console.log("ListOfSubjectFullObject---->",ListOfSubjectFullObject)
     let ListOfTeachers1 = [
      ...ListOfTeachers.map(teacher => ({ value: teacher.name, label: teacher.name,tid:teacher.tid })),
    ];

    setListTeacherOption(ListOfTeachers1)
    setListClassOption(ListClassOption1)
    if(ListOfClasses.length)
    {
      setListClassOptionFull(ListOfClasses);
    }
    if(ListOfTeachers.length)
    {
      setListTeacherOptionFull(ListOfTeachers);
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
     console.log("ListOfSubjectFullObject====>",ListOfSubjectFullObject)
     if(name==="class")
     {
     let ListClassOption1 = [
  ...Object.values(ListOfSubjectFullObject[value.value]?.['SubjectList']).map(subject => {
        let disableed=false;
      if(ListOfSubjectFullObject?.[value.value]?.['TeacherList']?.[subject])
      {
        disableed=true;
      }
    return { value: subject, label: subject,isDisabled: disableed};
  })
];
      setListSubjectOption(ListClassOption1)
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
    if(!CurrentData.class)
    {
    	errors.class="Please Select Class.";
    }
    if(!CurrentData.subject)
    {
    	errors.subject="Please Select Subject.";
    }
    if(!CurrentData.teacher)
    {
    	errors.teacher="Please Select Teacher.";
    }
    return errors;
  }




  const handleFormSubmit = async () =>
  {
    showLoading()
    const validationErrors = await formValidate();
    console.log("validationErrors====> ",validationErrors)
    seterrors(validationErrors);
    if (Object.keys(validationErrors).length === 0)
    {
      const CurrentClass=CurrentData.class.value
      const SelectedClass=await firestoreQueries.FetchDataFromCollection(DatabaseName, "classes", 1000, 'class', '==', CurrentClass,"class","asc");
      console.log("SelectedClass---->",SelectedClass)
      if(SelectedClass.length)
      {
        if(SelectedClass[0]?.currentyear)
        {
            let dataTobesend={};
            let dataTobesendUser={};
            dataTobesend[SelectedClass[0]?.currentyear]={"teachers":{[CurrentData.subject.value]:{"teacher":CurrentData.teacher.value,tid:CurrentData.teacher.tid}}}
            console.log("dataTobesend----->",dataTobesend)
            dataTobesendUser["assignments"]={[SelectedClass[0]?.currentyear]:{[CurrentClass]:{[CurrentData.subject.value]:CurrentData.subject.value}}};
            let CreateRes=await firestoreQueries.updateOrCreateById(DatabaseName, "classes",  CurrentClass, dataTobesend);
            let CreateRes1=await firestoreQueries.updateOrCreateById(DatabaseName, "users",  CurrentData.teacher.tid, dataTobesendUser);
            TooltipsPopovers(CreateRes1.status,CreateRes1.message,`${CurrentData.subject.value} Of Class ${CurrentClass} Assigned To ${CurrentData.teacher.value}`)
            hideLoading();
        }
        else
        {
          seterrors({mainerror:"Please Select Current Year For Class:"+CurrentData?.class?.value});
          hideLoading()
        }
      }

    }
    else
    {
      hideLoading()
    }

    /* if (Object.keys(validationErrors).length === 0)
     {
       CurrentData.createTime=firestoreQueries.Timestamp.fromDate(new Date());
       CurrentData.updateTime=firestoreQueries.Timestamp.fromDate(new Date());
       CurrentData.sid=1;
        const lowerCaseEmail = CurrentData.email.toLowerCase();
        const lowerCaseName = CurrentData.name.toLowerCase();
         let dataTobesend = {
            name: lowerCaseEmail,
            email: lowerCaseName,
            role: "Customer Support",
          };
        try {
            // Post request to create a new user

            const response = await axios.post('https://addusertoauth-6jpqjob4bq-uc.a.run.app', { StudentEmail: lowerCaseEmail, password:CurrentData.password, StudentName: lowerCaseName });
            console.log("response---->",response)
            console.log("response---->",dataTobesend)
            let uid = response.data.data.uid; // Get the generated uid
            dataTobesend['uid'] = uid;
            let CreateRes=await firestoreQueries.updateOrCreateById(DatabaseName, "users",  uid, dataTobesend);
             console.log("CreateRes---->",CreateRes)

            setCurrentData({});
            hideLoading()
          } catch (error) {
          console.log("error---->",error)
            let uid = error.response?.data?.user?.uid;

            dataTobesend['uid'] = uid;
            if (uid) {
             console.log("error---->",error)
             let CreateRes=await firestoreQueries.updateOrCreateById(DatabaseName, "users",  uid, dataTobesend);
              setCurrentData({});
            }


        setActionResult({status:"error",message:"User Already Exists."})
         hideLoading()
          }

     }
     else
     {
       hideLoading()
     }*/
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
              <CFormLabel htmlFor="validationServer01">Select Class</CFormLabel>
              <Grid item xs={6}>

                <Select1
        value={CurrentData['class'] || ''}
        onChange={(event) => handleFormChange(event,'class')}
        variant="outlined"
        options={ListClassOption}
        placeholder="Select Class"
        label="Select Class"
        title="Select Class"
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
      	 {errors.class  && <span class="validationerror">{errors.class }</span>}
              	</Grid>
              	</CCol>
              	<CCol md={6}>
              <CFormLabel htmlFor="validationServer01">Select Subject</CFormLabel>
              <Grid item xs={6}>

                <Select1
        value={CurrentData['subject'] || ''}
        onChange={(event) => handleFormChange(event,'subject')}
        variant="outlined"
        options={ListSubjectOption}
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
              	<CCol md={6}>
              <CFormLabel htmlFor="validationServer01">Select Teacher</CFormLabel>
              <Grid item xs={6}>

                <Select1
        value={CurrentData['teacher'] || ''}
        onChange={(event) => handleFormChange(event,'teacher')}
        variant="outlined"
        options={ListTeacherOption}
        placeholder="Select Class"
        label="Select Class"
        title="Select Class"
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
      	 {errors.teacher  && <span class="validationerror">{errors.teacher }</span>}
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
