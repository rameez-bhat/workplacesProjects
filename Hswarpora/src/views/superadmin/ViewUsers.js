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
    const ListOfUsers=await firestoreQueries.FetchDataFromCollection(DatabaseName, "users", 1000, null, null, "DDO","name","asc");
    console.log("ListOfUsers----->",ListOfUsers)
    if(ListOfUsers.length)
    {
      setCurrentData(ListOfUsers);
    }

  }
  const DeleteAssignment= async(classname,subject,teachername,teacherid,SelectedYear) =>
  {
        showLoading();
        console.log("classname----->",classname)
        console.log("teachername----->",teachername)
        console.log("teacherid----->",teacherid)
        console.log("SelectedYear----->",SelectedYear)
        let FieldToDelete=`${SelectedYear}.teachers.${subject}`;
        let UsersFieldToDelete=`assignments.${SelectedYear}.${classname}.${subject}`;
        let res=await firestoreQueries.deleteFieldFromDocument(DatabaseName,"classes",classname,FieldToDelete);
        let CreateRes1=await firestoreQueries.deleteFieldFromDocument(DatabaseName,"users",teacherid,UsersFieldToDelete);
        fetchData();
        TooltipsPopovers(CreateRes1.status,CreateRes1.message,CreateRes1.status)
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
                    <CTableHeaderCell scope="col">Name </CTableHeaderCell>
                    <CTableHeaderCell scope="col" >Email</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Role</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Action</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                {CurrentData.map((item) => {
                  numDdos++;
                   return (<CTableRow>
                    <CTableDataCell>{numDdos}</CTableDataCell>
                    <CTableHeaderCell scope="row">
    {item.name}
</CTableHeaderCell>
                    <CTableDataCell >{item.email}</CTableDataCell>
                    <CTableDataCell >{item.role}</CTableDataCell>
                           <CTableDataCell>
                          {/*<CCol xs={6}>
                  <CButton color="primary" type="button">Delete</CButton>

                  </CCol>*/}
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
