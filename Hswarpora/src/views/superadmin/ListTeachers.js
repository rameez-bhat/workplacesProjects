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
import { DatePicker} from "antd";
import Select1 from 'react-select';
import { useLoading } from '../../layout/LoadingContext';
import { DocsExample } from 'src/components'
const DatabaseName="LeadTracker";
import { parsePhoneNumberFromString } from 'libphonenumber-js';
let AdminOptionsList=[];
let numDdos=0;
let currentYear=2024;
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
  useEffect(() => {

  }, [CurrentData]);
  const fetchData = async () => {
  
   const SettingsListed=await firestoreQueries.FetchDataFromCollection(DatabaseName, "settings", 1000, 'settingtype', '==', "currentyear","currentyear","asc");
    console.log("SettingsListed----->",SettingsListed)
    if(SettingsListed.length)
    {
    	currentYear=SettingsListed[0].currentyear;
    	//PreviousYearSelected=String(currentYear)-1;
      	//setCurrentYear(SettingsListed[0].currentyear);
    }
    const ListOfTeachers=await firestoreQueries.FetchDataFromCollection(DatabaseName, "users", 1000, 'role', '==', "Teacher","name","asc");
    console.log("ListOfTeachers----->",ListOfTeachers)
    if(ListOfTeachers.length)
    {
      setCurrentData(ListOfTeachers);
    }

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


  return (
     <CCol xs={12}>
      <CCard className="mb-4">
          <CCardHeader>
            <strong>Class List</strong> <small></small>
          </CCardHeader>
          <CCardBody>
            <p className="text-body-secondary small">
            </p>
            <CTable color="success" striped>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">S.No</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Class</CTableHeaderCell>
                    <CTableHeaderCell scope="col" colSpan={2}> Subjects Teaching</CTableHeaderCell>

                  </CTableRow>
                </CTableHead>
                <CTableBody>
                {CurrentData.map((item) => {
                  numDdos++;
                   return (<CTableRow>
                    <CTableDataCell>{numDdos}</CTableDataCell>
                    <CTableHeaderCell scope="row">
  <a href={`/admin/addresult/${item.tid}/${currentYear}`} target="_blank">
    {item.name}
  </a>
</CTableHeaderCell>
                    <CTableDataCell colSpan={2}>
                      <CTable color="secondary" bordered>
                        <CTableHead>
                          <CTableRow>
                            <CTableHeaderCell scope="col">Class</CTableHeaderCell>
                            <CTableHeaderCell scope="col">Subject </CTableHeaderCell>
                          </CTableRow>
                        </CTableHead>
                          <CTableBody>
  {Object.entries(item?.assignments?.[currentYear || 2024] || {}).map(([classI, itemC]) => (
    Object.entries(itemC || {}).map(([InclassI, InitemC]) => (
      <CTableRow key={`${classI}-${InclassI}`}>
        <CTableDataCell>{classI}</CTableDataCell>
        <CTableDataCell>{InclassI}</CTableDataCell>
      </CTableRow>
    ))
  ))}
</CTableBody>
                        </CTable>
                          </CTableDataCell>
                  </CTableRow>)
                })}
                </CTableBody>
              </CTable>
            </CCardBody>
        </CCard>
     </CCol>
  )
}

export default Validation
