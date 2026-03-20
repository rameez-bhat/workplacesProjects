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
let ListClassOption1=[];
let classeslistwithinitials={};
let FullListConst={};
let TempCurrentFilter={};
let CurrentYear=0;
//let currentYear=new Date().getFullYear();
let currentYear=2024;
let PreviousYearSelected=2024;
let ListOfSubjectFullObject={};
let cid=null;
let Loop=0;
let className="";
const AddMarksModule =  ({ ActualUser, AuthUser }) => {
let { tid,currentyearget} = useParams();
const [CurrentSelectedClass,setCurrentSelectedClass] = useState({})
const [CurrentSelectedSubjects,setCurrentSelectedSubjects] = useState([])
const [errors, seterrors] = useState(false)
const [ChangeClass,setChangeClass]= useState(false);
const [ListClassOptionFull, setListClassOptionFull] = useState([])
const [ListTeacherOption, setListTeacherOption] = useState([])
const [ListSubjectOption, setListSubjectOption] = useState([])
const [ListClassOption, setListClassOption] = useState([])
const [ListTeacherOptionFull, setListTeacherOptionFull] = useState([])
const [CurrentData, setCurrentData] = useState({})
const [CurrentDataStudent, setCurrentDataStudent] = useState({})
const [CurrentFilter, setCurrentFilter] = useState({})
const [CurrentExamList, setCurrentExamList] = useState({})
const [CurrentYear, setCurrentYear] = useState(null)
const [ActionResult, setActionResult] = useState({})
const [medicalSchoolOptionsList, setMedicalSchoolOptionsList] = useState([]);
const {showLoading,hideLoading,firestoreQueries,DatabaseName,TooltipsPopovers} = useLoading();
const [toast, addToast] = useState(0)
const toaster = useRef()
console.log("Loop---->",Loop);
Loop++;
console.log("ActualUser11---->",ActualUser)
console.log("AuthUser11---->",AuthUser)
console.log("tid---->",tid)
if(typeof tid==="undefined")
{
  tid=ActualUser.id;
}
if(typeof currentyearget!=="undefined")
{
  currentYear=currentyearget;
  PreviousYearSelected=Number(currentYear);
}
console.log("tid---->",tid)



  useEffect(() => {
fetchData();


  }, [ChangeClass]);

  const fetchData = async () => {
    ///const ListOfClasses=await firestoreQueries.FetchDataFromCollection(DatabaseName, "classes", 1000, 'class', '==', cid,"FieldOrderCol","asc");
    const SettingsListed=await firestoreQueries.FetchDataFromCollection(DatabaseName, "settings", 1000, 'settingtype', '==', "currentyear","currentyear","asc");
    console.log("SettingsListed----->",SettingsListed)
    if(SettingsListed.length)
    {
    	currentYear=SettingsListed[0].currentyear;
    	//CurrentYear=String(currentYear);
    	PreviousYearSelected=String(currentYear);
      setCurrentYear(SettingsListed[0].currentyear);
    }
      const ListClasses=await firestoreQueries.FetchDataFromCollection(DatabaseName,"classes", 10000, 'id', '!=', "11th","class","asc");
    if(ListClasses.length)
    {
    	ListClasses.forEach(cls => {
    	let updatedRollno = cls.rollno;
		ListClassOption.push({value:cls.class,label:cls.class})
    classeslistwithinitials[cls.class] = cls;
  });
  }
    const ListOfTeachers1=await firestoreQueries.FetchDataFromCollection(DatabaseName, "users", 1000, 'tid', '==', tid,"name","asc");

    let ListOfTeachers;
    if(ListOfTeachers1.length)
    {
        ListOfTeachers=ListOfTeachers1[0];
        FullListConst={documentid:ListOfTeachers.documentid,
        email:ListOfTeachers.email,
        id:ListOfTeachers.id,
        name:ListOfTeachers.name,
        role:ListOfTeachers.role,
        tid:ListOfTeachers.tid,
        uid:ListOfTeachers.uid};
        console.log("FullListConst====>",FullListConst)
    }
     console.log("ListOfTeachers--->",ListOfTeachers)
     console.log("currentYear--->",currentYear)
     if(Object.entries(ListOfTeachers.assignments?.[currentYear || 2024] || {}).length)
     {

let ListClassOption1 = await Promise.all(
  Object.entries(ListOfTeachers.assignments?.[currentYear || 2024] || {}).map(
    async ([classLevel, subjects]) => {

      // Ensure subjects is an object
      if (!subjects || typeof subjects !== "object") return null;

      // Skip empty subject groups
      const subjectKeys = Object.keys(subjects);

      if (!subjectKeys.length) return null;

      // Build class-level object
      const list = {
        value: classLevel,
        label: classLevel,
        subjects: subjectKeys,
      };

      // Handle current filter setup
      if (!TempCurrentFilter["subject"] || !TempCurrentFilter["class"]) {
        if (cid === null) cid = classLevel;

        if (cid === classLevel) {
          setCurrentFilter({ class: list });

          const Subj = Object.entries(subjects).map(([subjectKey, subjectValue]) => {
            const cla = { label: subjectValue, value: subjectValue };

            if (!CurrentFilter["subject"]) {
              className = cla.value;
              TempCurrentFilter = { class: list, subject: cla };
              setCurrentFilter((prevValues) => ({
                ...prevValues,
                subject: cla,
              }));
            }

            return cla;
          });

          setListSubjectOption(Subj);
        }
      }

      return list;
    }
  )
)
ListClassOption1 = ListClassOption1.filter(Boolean);
setListClassOption(ListClassOption1);
  const ListClassForExam=await firestoreQueries.FetchDataFromCollection(DatabaseName, "classes", 1000, 'class', '==', cid,"FieldOrderCol","asc");
  let fieldvaluefull=String(currentYear+".particulars.currentclass");
    let fieldvaluefullno=currentYear+".particulars.rollno";
  const ListStudent=await firestoreQueries.FetchDataFromCollection(DatabaseName,"students", 1000, fieldvaluefull, '==', String(cid),fieldvaluefullno,"asc");
  setCurrentDataStudent(ListStudent)
  if(ListClassForExam.length)
  {

   // setCurrentYear(ListClassForExam[0].currentyear)
    if(ListStudent.length)
    {
      Object.entries(ListStudent || {}).map(([index,stu])=>{
       if(stu?.[currentYear])
       {
          setCurrentData((prevValues) => ({
  ...prevValues,
  [stu.documentid]:stu?.[currentYear]?.['subjects']?.[className]?stu?.[currentYear]?.['subjects']?.[className]:{}
}));
       }
      })
    }
    const examEntries = Object.entries(ListClassForExam[0]?.[currentYear]?.exams || {})
  .sort(([keyA], [keyB]) => keyA.localeCompare(keyB));

    setCurrentExamList(examEntries);
  }
  }
  else
  {
    TooltipsPopovers("error","Sorry!",`There Is No Class Assigned To You Yet, So You Have No Assignments`);
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
    console.log("value----->",value)
    console.log("name----->",name)
    console.log("CurrentFilter----->",CurrentFilter)
    console.log("ListClassOption----->",ListClassOption)


   setCurrentFilter((prevValues) => ({
  ...prevValues,
  [name]: value
}));

if(name==="class")
    {
      cid=value.value
      setCurrentFilter((prevValues) => {
  const updatedValues = { ...prevValues }; // Create a copy of the previous state
  delete updatedValues['subject']; // Delete the property
  return updatedValues; // Return the updated state
});
  delete TempCurrentFilter['class'];
  setChangeClass(!ChangeClass)
    }
    else
    {
       Object.entries(CurrentDataStudent || {}).map(([index,stu])=>{
       if(stu?.[CurrentYear])
       {
          setCurrentData((prevValues) => ({
  ...prevValues,
  //[stu.documentid]:stu?.[CurrentYear][value.value]
  [stu.documentid]:stu?.[CurrentYear]?.['subjects']?.[value.value]?stu?.[CurrentYear]?.['subjects']?.[value.value]:{}
}));
       }
      })
    }
//fetchData();
  }
  const handleInputChange = async (event,studentid,assesmentname,maximummarks,studentname) =>
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
    console.log("maximummarks----->",maximummarks)
    if(!validateNumber(value) && value!=="")
    {
        TooltipsPopovers("error","Error",`Please Enter Valid Marks For ${studentname} Exam ${assesmentname}`);
    }
    else if(Number(value)>Number(maximummarks))
    {
      TooltipsPopovers("error","Error",`Marks Entered For ${studentname} Exam ${assesmentname} Can't Be More Than Max ${maximummarks}`);
    }
    else
    {
      setCurrentData((prevValues) => ({
  ...prevValues,
  [studentid]: {
    ...prevValues[studentid], // Spread the existing student data
    [assesmentname]: value // Update or add the specific assessment field
  }
}));
/*setCurrentData((prevValues) => ({
  ...prevValues,
  [studentid]: {
    ...prevValues[studentid],
    subjects: {
      ...prevValues[studentid]?.subjects,
      [assesmentname]: value,
    },
  },
}));*/
    }

    console.log("studentid----->",studentid)
    console.log("assesmentname----->",assesmentname)
    console.log("maximummarks----->",maximummarks)
    console.log("name----->",name)


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
  showLoading();
console.log("CurrentData---->",CurrentData)
console.log("CurrentData---->",Object.keys(CurrentData).length )
if(typeof CurrentFilter['subject']?.label=="undefined")
{
  hideLoading();
  alert("Please Select Subject")
}
  else if (Object.keys(CurrentData).length) {
    // Use Promise.all to handle asynchronous calls within map
    const updatePromises = Object.entries(CurrentData || {}).map(async ([index, stu]) => {
      console.log("stu====>", CurrentFilter['subject']?.label);
      console.log("index====>", index);
      return firestoreQueries.updateOrCreateById(DatabaseName, "students", index, { [currentYear]:{ 'subjects':{[CurrentFilter['subject']?.label]:stu} }});
    });

    try {
      const results = await Promise.all(updatePromises);
      fetchData();
      console.log("Update results:", results);
    } catch (error) {
      console.error("Error updating students:", error);
    } finally {
      hideLoading();
    }
  }
   else {
    console.log(" else")
    hideLoading();
  }
};
  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
         <CToaster ref={toaster} push={toast} placement="top-end" />
          <CCardHeader>
            <strong>Add Marks</strong>   <small></small>
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
        value={CurrentFilter['class'] || ''}
        onChange={(event) => handleFormChange(event,'class')}
        variant="outlined"
        options={ListClassOption}
        placeholder="Select Clas"
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
        value={CurrentFilter['subject'] || ''}
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











              </CForm>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol xs={12}>
      <CCard className="mb-4">
          <CCardHeader>
           <strong>Teacher=
        <span style={{ color: 'blue' }}>
          {FullListConst.name || ''}
        </span>
        ------ Class={CurrentFilter['class']?.value || ''} and Subject={CurrentFilter['subject']?.label || ''}
      </strong> <small></small>
          </CCardHeader>
          <CCardBody >
              <CTable color="success" bordered>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell >Admission No</CTableHeaderCell>
                    <CTableHeaderCell >Roll No</CTableHeaderCell>
                    <CTableHeaderCell >Name</CTableHeaderCell>
                    <CTableHeaderCell >Class</CTableHeaderCell>
                {Object.entries(CurrentExamList).map(([examIndex, examData]) =>
                  {
                    return (
                    <CTableHeaderCell  className= 'w-25 minWidth'>{examData[1].Name.replace(/^.*\$\$/, '')}</CTableHeaderCell>
                    );
                  })}
                  </CTableRow>
                  </CTableHead>
                  <CTableBody>

                    {Object.entries(CurrentDataStudent).map(([studentIndex, StudentData]) =>
                  {
                    console.log("CurrentData?.[StudentData.documentid]--->",CurrentData?.[StudentData.documentid])
                  	let currentRoll = StudentData?.[currentYear]?.particulars?.rollno || '';
   					        currentRoll=String(currentRoll);
					          let  currentClassInitial =classeslistwithinitials?.[StudentData?.[currentYear]?.particulars?.currentclass]?.initial || "";
                    currentClassInitial=String(currentClassInitial);

                    if (currentRoll && currentRoll.startsWith(currentClassInitial)) 
                    {
                      StudentData[currentYear].particulars.rollno = currentRoll.slice(currentClassInitial.length);
                     }
                    return (
                    <CTableRow>
                    <CTableDataCell >{StudentData.admissionno}</CTableDataCell>
                    <CTableDataCell >{StudentData?.[currentYear]?.['particulars']?.rollno}</CTableDataCell>
                    <CTableDataCell >{StudentData.name}</CTableDataCell>
                    <CTableDataCell >{StudentData?.[currentYear]?.['particulars']?.currentclass}</CTableDataCell>
                    {Object.entries(CurrentExamList).map(([InexamIndex, InexamData]) =>
                    {
                      return (
                    <CTableHeaderCell ><CFormInput
                        type="text"
                        valkk={CurrentData?.[StudentData.documentid]?.[InexamData[1].Name]}
                        vakklue={CurrentData?.[StudentData.documentid]?.[InexamData[1].Name] }
                        value={CurrentData?.[StudentData.documentid]?.[InexamData[1].Name] || ''}
                        invalid={!!errors[StudentData.documentid]?.[InexamData[1].Name]}
                        onChange={(event) => handleInputChange(event, StudentData.documentid, InexamData[1].Name,InexamData[1].Max,StudentData.name)}
                      />
                      {errors?.[StudentData.documentid]?.[InexamData[1].Name]  && <span class="validationerror">{errors?.[StudentData.documentid]?.[InexamData[1].Name]}</span>}
                      </CTableHeaderCell>
                    );
                    })}
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
