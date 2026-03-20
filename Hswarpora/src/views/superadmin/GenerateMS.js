import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CTable,
  CTableHead,
  CTableRow,
  CFormLabel,
  CTableHeaderCell,
  CTableDataCell,
  CTableBody,
  CRow,
} from '@coreui/react';
import Select1 from 'react-select';
import axios from 'axios';
import { useLoading } from '../../layout/LoadingContext';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import dayjs from 'dayjs';

const dateFormat = "DD-MM-YYYY";
let AdminOptionsList=[];
let ListClassOption1=[];
let ListStudentsOption1=[];
let FullStudentResult={};
let FullClassDetails={};
let SubjectList={};
let currentResult={};
let CurrentClass="";
let CurrentClassSel="";
let SortedListofExams=[];
let ShowResult=false;
let CurrentYear=0;
let MaximumMarks=0;
let MarksObtained=0;
let GrandMaxMarks=0;
let GrandMarksObtained=0;
let ListOfSubjectFullObject={};

const Validation = () => {
  const { cid } = useParams();
  const [errors, setErrors] = useState(false);
  const [ListClassOption, setListClassOption] = useState([]);
  const [ListStudentOption, setListStudentOption] = useState([]);
  const [CurrentData, setCurrentData] = useState({});
  //const [ShowResult, setShowResult] = useState(false);
  //const [currentResult, setCurrentResult] = useState({});
  //const [FullClassDetails, setFullClassDetails] = useState({});
 // const [SubjectList, setSubjectList] = useState({});
  //const [SortedListofExams, setSortedListofExams] = useState([]);
  //const [GrandMaxMarks, setGrandMaxMarks] = useState(0);
 // const [GrandMarksObtained, setGrandMarksObtained] = useState(0);
  const { showLoading, hideLoading, firestoreQueries, DatabaseName } = useLoading();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchStudents = async () => {
    const ListOfStudents = await firestoreQueries.FetchDataFromCollection(DatabaseName, "students", 1000, 'currentclass', '==', CurrentClass, "name", "asc");
    const ListStudentsOption1 = ListOfStudents.map(stud => ({
      value: stud.id,
      label: stud.name,
      rollno: stud.rollno,
    }));
    setListStudentOption(ListStudentsOption1);
  };

  const fetchData = async () => {
const ListOfClasses=await firestoreQueries.FetchDataFromCollection(DatabaseName, "classes", 1000, null, null, "DDO","FieldOrderCol","asc");
    //const ListOfTeachers=await firestoreQueries.FetchDataFromCollection(DatabaseName, "users", 1000, 'role', '==', "Teacher","name","asc");
    console.log("ListOfClasses--->",ListOfClasses)

     ListClassOption1 = [
      ...ListOfClasses.map(classes => {
      ListOfSubjectFullObject[classes.class]=classes?.[classes.currentyear]?.['teachers'] ? {"TeacherList":classes?.[classes.currentyear]?.['teachers'],"SubjectList":classes?.subjects} :{"TeacherList":{},"SubjectList":classes?.subjects};
      FullClassDetails[classes.class]=classes;
      return{ value: classes.class, label: classes.class };

      }),
    ];

    setListClassOption(ListClassOption1)
    if(ListOfClasses.length)
    {
      setListClassOptionFull(ListOfClasses);
    }

  };

  const handleFormChange = (event, name) => {
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
    if(name==="class")
     {
        CurrentClass=value.value;
        setCurrentData((prevValues) => {
          const updatedValues = { ...prevValues }; // Create a shallow copy of prevValues
          delete updatedValues.student; // Remove the 'student' key
          return {
            ...updatedValues,
            [name]: value, // Add/update the new key-value pair
          };
        });
        fetchStudents();
     }
     
    ShowResult=false;
    setCurrentData((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const formValidate = () => {
    const errors = {};
    if (!CurrentData.class) errors.class = "Please Select Class.";
    if (!CurrentData.student) errors.student = "Please Select Student.";
    return errors;
  };

  const handleFormSubmit = async () => {showLoading()
    const validationErrors = await formValidate();
    console.log("validationErrors====> ",validationErrors)
    seterrors(validationErrors);
    SortedListofExams=[];
    MaximumMarks=0;
    MarksObtained=0;
    GrandMaxMarks=0;
    GrandMarksObtained=0;
    if (Object.keys(validationErrors).length === 0)
    {
      CurrentClassSel=CurrentData.class.value
      currentResult=FullStudentResult[CurrentData.student.value];
      console.log("currentResult=====>",currentResult)
      console.log("FullClassDetails=====>",FullClassDetails[CurrentClass])
      SubjectList=FullClassDetails[CurrentClass]['subjects'];
      console.log("SubjectList=====>",SubjectList)
      ShowResult=true;
 hideLoading()

    }
    else
    {
      hideLoading()
    }};

  const generatePDF = () => {
    const doc = new jsPDF();

    // Header Section
    doc.setFont("times", "bold");
    doc.setFontSize(30);
    doc.setTextColor("#327da8");
    doc.text("Govt. Boys High School Warpora", 105, 12, { align: "center" });
    doc.setFontSize(12);
    doc.setTextColor("#0bf6ef");
    doc.text("Zone Dangerpora", 105, 19, { align: "center" });
    doc.setTextColor(255, 0, 0);
    doc.text("Udise+: 01020501103", 105, 25, { align: "center" });
    doc.setTextColor(0, 0, 0);

    // Add Border for Header
    doc.setDrawColor(0, 0, 0);
    doc.rect(1, 1, 208, 28); // Header border

    // Student Details Section
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Name: ${currentResult?.name}`, 15, 60);
    doc.text(`Roll Number: ${String(currentResult?.rollno)?.slice(1)}`, 105, 60, { align: "left" });
    doc.text(`Class: ${CurrentData.class?.label}`, 15, 70);
    doc.text(`Session: 2024`, 105, 70, { align: "left" });

    // Section Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor("#007bff");
    doc.text("Student Marks Sheet", 105, 90, { align: "center" });

    // Table Content
   // const tableColumn = ["Subject", ...SortedListofExams.map(exam => exam.replace(/^.*\$\$/, '')), "Max Marks", "Marks Obtained"];
    let HeadRowsG=["Subject"];
     {Object.entries(FullClassDetails?.[CurrentClassSel]?.['2024']?.['exams']|| {}).sort(([keyA], [keyB]) => keyA.localeCompare(keyB)).map(([key, value]) => {
                        HeadRowsG.push(key)
        })}
        HeadRowsG.push("Max Marks");
        HeadRowsG.push("Marks Obtained");
    const tableRows = Object.entries(SubjectList).map(([subject, _]) => {
      const marks = SortedListofExams.map(exam => currentResult?.['2024']?.[subject]?.[exam] || 0);
      const maxMarks = SortedListofExams.reduce((total, exam) => Number(total) + Number(FullClassDetails[CurrentData.class.value]?.['2024']?.['exams']?.[exam]?.Max || 0), 0);
      const marksObtained = marks.reduce((total, mark) => total + Number(mark), 0);
      return [subject, ...marks, maxMarks, marksObtained];
    });

    // Table with Borders
    doc.autoTable({
      startY: 100,
      head: [HeadRowsG],
      body: tableRows,
      theme: "grid",
      headStyles: {
        fillColor: [0, 123, 255],
        textColor: "#ffffff",
        fontStyle: "bold",
        lineWidth: 0.5,
        lineColor: [0, 0, 0],
      },
      bodyStyles: {
        textColor: [0, 0, 0],
        fontSize: 12,
        lineWidth: 0.5,
        lineColor: [0, 0, 0],
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240],
      },
      styles: {
        halign: "center",
        valign: "middle",
        lineWidth: 0.5,
        lineColor: [0, 0, 0],
      },
    });

    // Footer Section
    doc.setFontSize(10);
    doc.setTextColor("#000000");
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, doc.internal.pageSize.height - 10, { align: "center" });

    // Save PDF
    doc.save("Marks_Sheet.pdf");
  };

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Result </strong> <small>Searching</small>
          </CCardHeader>
          <CCardBody>
            <CForm className="row g-3 needs-validation">
              <CCol md={6}>
                <CFormLabel htmlFor="validationServer01">Select Class</CFormLabel>
                <Select1
                  value={CurrentData.class || ''}
                  onChange={(event) => handleFormChange(event, 'class')}
                  options={ListClassOption}
                  placeholder="Select Class"
                  isSearchable
                />
                {errors.class && <span className="validationerror">{errors.class}</span>}
              </CCol>
              {CurrentData.class && (
                <CCol md={6}>
                  <CFormLabel htmlFor="validationServer01">Select Name</CFormLabel>
                  <Select1
                    value={CurrentData.student || ''}
                    onChange={(event) => handleFormChange(event, 'student')}
                    options={ListStudentOption}
                    placeholder="Select Name"
                    isSearchable
                  />
                  {errors.student && <span className="validationerror">{errors.student}</span>}
                </CCol>
              )}
              <CCol xs={12} className="row">
                <CCol xs={6}>
                  <CButton color="primary" type="button" onClick={handleFormSubmit}>
                    Fetch Result
                  </CButton>
                </CCol>
              </CCol>
            </CForm>
          </CCardBody>
        </CCard>
        {ShowResult && (
          <CCard className="mb-4">
            <CCardHeader>
              <strong>View Result</strong>
            </CCardHeader>
            <CCardBody>
              <CRow>
                <CCol xs="6">
                  <strong>Name:</strong> {currentResult?.name}
                </CCol>
                <CCol xs="6" className="text-right">
                  <strong>Roll No:</strong> {String(currentResult?.rollno)?.slice(1)}
                </CCol>
              </CRow>
              <CRow className="mt-4">
                <CCol xs="6">
                  <strong>Fathers Name:</strong> {currentResult?.fathersname}
                </CCol>
                <CCol xs="6" className="text-right">
                  <strong>DOB:</strong> {dayjs(new Date(currentResult?.dobActual.seconds * 1000)).format(dateFormat)}
                </CCol>
              </CRow>
              <CRow className="mt-4 mb-4">
                <CCol xs="6">
                  <strong>Mothers Name:</strong> {currentResult?.mothersname}
                </CCol>
                <CCol xs="6" className="text-right">
                  <strong>Admission No:</strong> {currentResult?.admissionno}
                </CCol>
              </CRow>
              <CTable color="success" bordered>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">Subject</CTableHeaderCell>
                    {SortedListofExams.map((exam, index) => (
                      <CTableHeaderCell key={index} scope="col" className="text-center">
                        {exam.replace(/^.*\$\$/, '')} <br />({FullClassDetails[CurrentData.class.value]?.['2024']?.['exams']?.[exam]?.Max})
                      </CTableHeaderCell>
                    ))}
                    <CTableHeaderCell scope="col" className="text-center align-top">Max Marks</CTableHeaderCell>
                    <CTableHeaderCell scope="col" className="text-center align-top">Marks Obtained</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {Object.entries(SubjectList).map(([subject, _]) => {
                    const marks = SortedListofExams.map(exam => currentResult?.['2024']?.[subject]?.[exam] || 0);
                    const maxMarks = SortedListofExams.reduce((total, exam) => Number(total) + Number(FullClassDetails[CurrentData.class.value]?.['2024']?.['exams']?.[exam]?.Max || 0), 0);
                    const marksObtained = marks.reduce((total, mark) => total + Number(mark), 0);
                    GrandMaxMarks=GrandMaxMarks+maxMarks;
                    GrandMarksObtained= GrandMarksObtained + marksObtained;
                    return (
                      <CTableRow key={subject}>
                        <CTableHeaderCell scope="col">{subject}</CTableHeaderCell>
                        {marks.map((mark, index) => (
                          <CTableDataCell key={index} className="text-center">{mark}</CTableDataCell>
                        ))}
                        <CTableDataCell className="text-center">{maxMarks}</CTableDataCell>
                        <CTableDataCell className="text-center">{marksObtained}</CTableDataCell>
                      </CTableRow>
                    );
                  })}
                  <CTableRow>
                    <CTableHeaderCell colSpan={SortedListofExams.length + 1} className="text-end">
                      Grand Total
                    </CTableHeaderCell>
                    <CTableHeaderCell className="text-center">{GrandMaxMarks}</CTableHeaderCell>
                    <CTableHeaderCell className="text-center">{GrandMarksObtained}</CTableHeaderCell>
                  </CTableRow>
                  <CTableRow>
                    <CTableHeaderCell colSpan={SortedListofExams.length + 1} className="text-end">
                      Performance
                    </CTableHeaderCell>
                    <CTableHeaderCell className="text-center" colSpan={2}>
                      {GrandMarksObtained / GrandMaxMarks * 100 >= 90
                        ? 'Grade A1'
                        : GrandMarksObtained / GrandMaxMarks * 100 >= 80
                        ? 'Grade A2'
                        : GrandMarksObtained / GrandMaxMarks * 100 >= 70
                        ? 'Grade B1'
                        : GrandMarksObtained / GrandMaxMarks * 100 >= 60
                        ? 'Grade B2'
                        : GrandMarksObtained / GrandMaxMarks * 100 >= 50
                        ? 'Grade C1'
                        : GrandMarksObtained / GrandMaxMarks * 100 >= 40
                        ? 'Grade C2'
                        : GrandMarksObtained / GrandMaxMarks * 100 >= 30
                        ? 'Grade D'
                        : 'Fail'}
                    </CTableHeaderCell>
                  </CTableRow>
                </CTableBody>
              </CTable>
              <CButton color="primary" type="button" onClick={generatePDF}>
                Download PDF
              </CButton>
            </CCardBody>
          </CCard>
        )}
      </CCol>
    </CRow>
  );
};

export default Validation;