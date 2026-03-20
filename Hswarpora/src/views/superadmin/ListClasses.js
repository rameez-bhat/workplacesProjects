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
    const ListOfClasses=await firestoreQueries.FetchDataFromCollection(DatabaseName, "classes", 1000, null, null, "DDO","FieldOrderCol","asc");
    console.log("ListOfClasses----->",ListOfClasses)
    if(ListOfClasses.length)
    {
      setCurrentData(ListOfClasses);
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
                    <CTableHeaderCell scope="col">Class</CTableHeaderCell>
                    <CTableHeaderCell scope="col" colSpan={2}> List Of Teachers</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Add Teachers</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                {CurrentData.map((item) => {
                  numDdos++;
                   return (<CTableRow>
                    <CTableDataCell>{numDdos}</CTableDataCell>
                    <CTableHeaderCell scope="row">
    {item.class}
</CTableHeaderCell>
                    <CTableDataCell colSpan={2}>
                      <CTable color="secondary" bordered>
                        <CTableHead>
                          <CTableRow>
                            <CTableHeaderCell scope="col">Subject</CTableHeaderCell>
                            <CTableHeaderCell scope="col">Teacher </CTableHeaderCell>
                            <CTableHeaderCell scope="col">Action </CTableHeaderCell>
                          </CTableRow>
                        </CTableHead>
                          <CTableBody>
                            {Object.entries(item?.[item?.currentyear]?.teachers || {}).map(([classI, itemC]) => {
                            return (
                            <CTableRow>
                              <CTableDataCell>{classI}</CTableDataCell>
                               <CTableDataCell>{itemC.teacher}</CTableDataCell>
                               <CTableDataCell><CButton color="secondary" type="button"
                               onClick={(event) => DeleteAssignment(item.class,classI,itemC.teacher,itemC.tid,item?.currentyear)}
                                >

                    Delete
                  </CButton></CTableDataCell>
                              </CTableRow>
                              )
                            })}
                          </CTableBody>
                        </CTable>
                          </CTableDataCell>
                           <CTableDataCell>
                          <CCol xs={6}>
                  <a href={`/superadmin/addteacher/${item.id}`} target="_blank">
                  <CButton color="primary" type="button"
                   >

                    Add Teachers
                  </CButton>
                   </a>
                  </CCol>
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
