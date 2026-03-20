import React, { useState, useEffect, useRef } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormCheck,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CTableBody,
} from '@coreui/react'
import { useLoading } from '../../layout/LoadingContext'

const Validation = () => {
  const [errors, seterrors] = useState(false)
  const [CurrentData, setCurrentData] = useState([])
  const [ActionResult, setActionResult] = useState({})
  const [checkedItems, setCheckedItems] = useState({});
  const [initialize, setInitialize] = useState(false);
  const { showLoading, hideLoading, firestoreQueries, DatabaseName, ListOfSubjects,TooltipsPopovers } = useLoading();

  useEffect(() => {
    if (!initialize) fetchData();
  }, []);

  const AddSubject = async (event, className) => {
  showLoading()
    const selectedSubjects = Object.keys(checkedItems[className] || {}).filter(subject => checkedItems[className][subject]);
    const list = {};
    selectedSubjects.forEach(suj => {
      list[suj] = suj;
    });
    let data = { "subjects": list };
    await firestoreQueries.handleUpdate(DatabaseName, "classes", className, { subjects: null });
    const res=await firestoreQueries.handleUpdate(DatabaseName, "classes", className, data);
    console.log("res====>",res)
    TooltipsPopovers(res.status,res.message, `Subjects Of Class ${className}`);
    hideLoading();
  };

  const fetchData = async () => {
    const ListOfClasses = await firestoreQueries.FetchDataFromCollection(DatabaseName, "classes", 1000, null, null, "DDO", "FieldOrderCol", "asc");
    if (ListOfClasses.length) setCurrentData(ListOfClasses);

    const initialCheckedItems = {};
    ListOfClasses.forEach(item => {
      initialCheckedItems[item.class] = { ...item.subjects };
    });
    setCheckedItems(initialCheckedItems);
    setInitialize(true);
  };

  const handleCheckboxChange = (className, subject) => {
    setCheckedItems(prevState => ({
      ...prevState,
      [className]: {
        ...prevState[className],
        [subject]: !prevState[className][subject]
      }
    }));
  };

  return (
    <CCol xs={12}>
      <CCard className="mb-4">
        <CCardHeader>
          <strong>Class Subject Maping</strong>
        </CCardHeader>
        <CCardBody>
          <CTable color="success" striped>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Class</CTableHeaderCell>
                {ListOfSubjects.map(subject => (
                  <CTableHeaderCell key={subject}>{subject}</CTableHeaderCell>
                ))}
                <CTableHeaderCell>Action</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {CurrentData.map(item => (
                <CTableRow key={item.id}>
                  <CTableHeaderCell>
                    <a href={`/superadmin/list/${item.id}`} target="_blank">
                      {item.class}
                    </a>
                  </CTableHeaderCell>
                  {ListOfSubjects.map(subject => (
                    <CTableDataCell key={subject}>
                      <CFormCheck
                        name={`${item.class}[]`}
                        label={subject}
                        checked={checkedItems[item.class]?.[subject] || false}
                        onChange={() => handleCheckboxChange(item.class, subject)}
                      />
                    </CTableDataCell>
                  ))}
                  <CTableDataCell>
                    <CButton color="primary" type="button" onClick={(event) => AddSubject(event, item.class)}>
                      Add Subjects
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>
    </CCol>
  );
};

export default Validation;
