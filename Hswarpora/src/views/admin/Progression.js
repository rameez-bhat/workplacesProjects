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
  CTable,
  CTableHead,
  CTableRow,
  CTableBody,
  CTableDataCell,
  CTableHeaderCell,
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
let ListClassOption=[];
let classeslistwithinitials={};
let FullListConst={};
let ListOfStudentsToGetUpdated={};
let TempCurrentFilter={};
let CurrentYear=0;
let currentYear=new Date().getFullYear();
let PreviousYearSelected='';
let ListOfSubjectFullObject={};
let cid=null;
let Loop=0;
let className="";
const AddMarksModule =  ({ ActualUser, AuthUser }) => {
let { tid } = useParams();
const [errors, seterrors] = useState(false)
const [success, setsuccess] = useState({})
const [StudentList, setStudentList] = useState({})
const [CurrentYear, setCurrentYear] = useState('')
const {showLoading,hideLoading,firestoreQueries,DatabaseName,TooltipsPopovers} = useLoading();
const [toast, addToast] = useState(0)
const toaster = useRef()

Loop++;



  useEffect(() => {
fetchData();


  }, []);

  const fetchData = async () => {
    ///const ListOfClasses=await firestoreQueries.FetchDataFromCollection(DatabaseName, "classes", 1000, 'class', '==', cid,"FieldOrderCol","asc");
     const ListClasses=await firestoreQueries.FetchDataFromCollection(DatabaseName,"classes", 10000, 'id', '!=', "11th","class","asc");
    if(ListClasses.length)
    {
    	ListClasses.forEach(cls => {
    	let updatedRollno = cls.rollno;
		ListClassOption.push({value:cls.class,label:cls.class})
    classeslistwithinitials[cls.class] = cls;
  });
    const SettingsListed=await firestoreQueries.FetchDataFromCollection(DatabaseName, "settings", 1000, 'settingtype', '==', "currentyear","currentyear","asc");
    console.log("SettingsListed----->",SettingsListed)
    if(SettingsListed.length)
    {
    	currentYear=SettingsListed[0].currentyear;
    	PreviousYearSelected=String(currentYear)-1;
      	setCurrentYear(SettingsListed[0].currentyear);
    }
    
    let LastyearClasss=Number(currentYear)-1;
    let fieldvaluefull=LastyearClasss+".particulars.currentclass";
    console.log("fieldvaluefull---->",fieldvaluefull)
    const ListStudent=await firestoreQueries.FetchDataFromCollection(DatabaseName,"students", 10000, 'id', '!=', "11th",fieldvaluefull,"asc");
    if(ListStudent.length)
    {
    	setStudentList(ListStudent)
    }
   
   console.log("classeslistwithinitials--->",classeslistwithinitials)
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
  const handleFormChange = async (event,name="",StudentIndex,AdmissionNo) =>
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

     setStudentList((prevValues) => {
    const updated = [...prevValues]; // copy array
    const student = { ...updated[StudentIndex] }; // copy student
    const yearData = { ...student[currentYear] }; // copy current year
    const particulars = { ...yearData.particulars, [name]: value }; // update field

    updated[StudentIndex] = {
      ...student,
      [currentYear]: { ...yearData, particulars },
    };

    return updated;
  });
  if(typeof ListOfStudentsToGetUpdated["Student_"+AdmissionNo]=="undefined")
  {
  	ListOfStudentsToGetUpdated["Student_"+AdmissionNo]={};
  }
	ListOfStudentsToGetUpdated["Student_"+AdmissionNo][name]=value;
	if(typeof StudentList[StudentIndex]?.[currentYear]?.['particulars']?.currentclass && name!="currentclass")
	{
		ListOfStudentsToGetUpdated["Student_"+AdmissionNo]['currentclass']=StudentList[StudentIndex]?.[currentYear]?.['particulars']?.currentclass;
	}
	if(typeof StudentList[StudentIndex]?.[currentYear]?.['particulars']?.rollno  && name!="rollno")
	{
		ListOfStudentsToGetUpdated["Student_"+AdmissionNo]['rollno']=StudentList[StudentIndex]?.[currentYear]?.['particulars']?.rollno;
	}
	
	ListOfStudentsToGetUpdated["Student_"+AdmissionNo]['rowindex']=StudentIndex;

//fetchData();
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




 const handleFormSubmit = async () => {
  console.log("ListOfStudentsToGetUpdated---->", ListOfStudentsToGetUpdated);

  for (let studentKey in ListOfStudentsToGetUpdated) {
    console.log("Student ID:", studentKey);

    let studentData = ListOfStudentsToGetUpdated[studentKey];
    let StudentRowId = studentData["rowindex"];

    // validation for class
    if (typeof studentData["currentclass"] === "undefined") {
     seterrors((prevValues) => {
  return {
    ...prevValues,
    [StudentRowId]: {
      ...(prevValues[StudentRowId] || {}),
      currentclass: "Please Select Class.",
    },
  };
});
    }
    else if (typeof studentData["currentclass"]['value'] === "undefined" || studentData["currentclass"]['value'] === "") {
     

    }
    // validation for roll no
    else if (typeof studentData["rollno"] === "undefined") 
    {
      seterrors((prevValues) => {
  return {
    ...prevValues,
    [StudentRowId]: {
      ...(prevValues[StudentRowId] || {}),
      rollno: "Please Enter Roll No.",
    },
  };
});
    }
    else if (studentData["rollno"] === "") 
    {
    	
    }
    else
    {
    	 let RoLLNO=Number(classeslistwithinitials[studentData["currentclass"]['value']].initial+studentData["rollno"])
    	let DateToSubmit={[currentYear]:{particulars:{currentclass:studentData["currentclass"]['value'],rollno:RoLLNO}}};
    	let Condt = [
  { 
    fieldName: "admissionno", 
    operator: "==", 
    value: Number(studentKey.replace("Student_", "")) 
  }
];
    	firestoreQueries.updateOrCreateByField(DatabaseName, "students", Condt, DateToSubmit).then((resultInside) => {
			 console.log("resultInside:", resultInside);
			 if(resultInside.status=="success")
			 {
			 	setsuccess((prevValues) => {
  return {
    ...prevValues,
    [StudentRowId]: {
      ...(prevValues[StudentRowId] || {}),
      currentclass: "Student Successfully Updated.",
    },
  };
});
			 }
    	})
    }

    console.log("studentData:", studentData);
  }
};
  return (
    <CRow>
      <CCol xs={12}>
      <CCard className="mb-4">
          <CCardHeader>
          
          </CCardHeader>
          <CCardBody >
              <CTable color="success" bordered>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell >Admission No</CTableHeaderCell>
                    <CTableHeaderCell >Name</CTableHeaderCell>
                    <CTableHeaderCell >Previous Class({PreviousYearSelected})</CTableHeaderCell>
                    <CTableHeaderCell >Current Class({currentYear})</CTableHeaderCell>
                    <CTableHeaderCell >Roll No({PreviousYearSelected})</CTableHeaderCell>
					<CTableHeaderCell >Roll No({currentYear})</CTableHeaderCell>
                    
                  </CTableRow>
                  </CTableHead>
                  <CTableBody>

                    {Object.entries(StudentList).map(([studentIndex, StudentData]) =>
                  {
                  	/*if (StudentData?.[currentYear]?.particulars.rollno && StudentData?.[currentYear]?.particulars.rollno.startsWith(classeslistwithinitials?.[StudentData?.[currentYear]?.particulars.currentclass]?.initial)) 
                  	{
  						StudentData[currentYear].particulars.rollno = StudentData?.[currentYear]?.particulars.rollno.slice(classeslistwithinitials?.[StudentData?.[currentYear]?.particulars.currentclass]?.initial.length);
					}
					if (StudentData?.[PreviousYearSelected]?.particulars.rollno && StudentData?.[PreviousYearSelected]?.particulars.rollno.startsWith(classeslistwithinitials?.[StudentData?.[PreviousYearSelected]?.particulars.currentclass]?.initial)) 
                  	{
  						StudentData[PreviousYearSelected].particulars.rollno = StudentData?.[PreviousYearSelected]?.particulars.rollno.slice(classeslistwithinitials?.[StudentData?.[PreviousYearSelected]?.particulars.currentclass]?.initial.length);
					}*/
					let currentRoll = StudentData?.[currentYear]?.particulars?.rollno || '';
   					 let prevRoll = StudentData?.[PreviousYearSelected]?.particulars?.rollno || "";
   					 currentRoll=String(currentRoll);
   					 prevRoll=String(prevRoll);
					let  currentClassInitial =
      classeslistwithinitials?.[StudentData?.[currentYear]?.particulars?.currentclass]?.initial || "";
      currentClassInitial=String(currentClassInitial);

    if (
      currentRoll &&
      currentRoll.startsWith(currentClassInitial)
    ) {
      StudentData[currentYear].particulars.rollno =
        currentRoll.slice(currentClassInitial.length);
    }

    // For previous year
    let previousClassInitial =
      classeslistwithinitials?.[StudentData?.[PreviousYearSelected]?.particulars?.currentclass]?.initial || "";
       previousClassInitial=String(previousClassInitial);
    if (
      prevRoll &&
      prevRoll.startsWith(previousClassInitial)
    ) {
      StudentData[PreviousYearSelected].particulars.rollno =
        prevRoll.slice(previousClassInitial.length);
    }
    				let currentLocalClass=StudentData?.[currentYear]?.particulars?.currentclass;
					if(typeof StudentData?.[currentYear]?.particulars?.currentclass!="object")
					{
						currentLocalClass={value:StudentData?.[currentYear]?.particulars?.currentclass,label:StudentData?.[currentYear]?.particulars?.currentclass};
					}
					
					
                    return (
                    <CTableRow>
                    <CTableDataCell >{StudentData.admissionno}</CTableDataCell>
                    
                    <CTableDataCell >{StudentData.name}</CTableDataCell>
                    <CTableDataCell >{StudentData?.[PreviousYearSelected]?.particulars?.currentclass}</CTableDataCell>
                    <CTableDataCell >
                    <CCol md={12}>
              <Grid item xs={6}>

                <Select1
        value={currentLocalClass || ''}
        onChange={(event) => handleFormChange(event,'currentclass',studentIndex,StudentData.admissionno)}
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
      	 {errors?.[studentIndex]?.['currentclass'] && (
                      <CFormFeedback invalid>{success?.[studentIndex]?.['currentclass']}</CFormFeedback>
                  )}
      	 {success?.[studentIndex]?.['currentclass'] && (
                      <CFormFeedback valid>{success?.[studentIndex]?.['currentclass']}</CFormFeedback>
                  )}
              	</Grid>
              	</CCol>
                    
                    
                    </CTableDataCell>
                   <CTableDataCell>{StudentData?.[PreviousYearSelected]?.particulars?.rollno}</CTableDataCell>
                   <CTableDataCell>
                     <CCol md={12}>
                <CFormInput
                    type="text"
                    placeholder="Roll No"
                    value={StudentData?.[currentYear]?.particulars?.rollno || ''}
                    invalid={!!errors?.[studentIndex]?.['rollno']} // Set `invalid` if there's an error
                    valid={!errors?.[studentIndex]?.['rollno'] } // Set `valid` if no error and value exists
                    required
                    onChange={(event) => handleFormChange(event,'rollno',studentIndex,StudentData.admissionno )}
                />
                {errors?.[studentIndex]?.['rollno'] && (
                      <CFormFeedback invalid>{errors?.[studentIndex]?.['rollno']}</CFormFeedback>
                  )}
              </CCol>
                    </CTableDataCell>
                    
                    </CTableRow>
                    );
                  })}

                  </CTableBody>

              </CTable>
              <CCol xs={12} className="row">
                <p></p>

                <CCol xs={6}>
                  <CButton color="primary" type="button"
                   onClick={(event) => handleFormSubmit()}
                   >

                    Save Exam
                  </CButton>
                  </CCol>

                </CCol>
            </CCardBody>
            </CCard>
      </CCol>
    </CRow>

  )
}

export default AddMarksModule
