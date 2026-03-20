import React, { useState,useEffect,useRef,useCallback } from 'react'
//import QRCode from "qrcode.react";
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
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CTableBody,
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
import QRCode from "qrcode";
import { DatePicker} from "antd";
import dayjs from 'dayjs';
import Select1 from 'react-select';
import axios from 'axios';
import { useLoading } from '../../layout/LoadingContext';
import { DocsExample } from 'src/components'
import jsPDF from 'jspdf';
import 'jspdf-autotable';
const dateFormat = "DD-MM-YYYY";
import { parsePhoneNumberFromString } from 'libphonenumber-js';
let AdminOptionsList=[];
let ListClassOption1=[];
let ListStudentsOption1=[];
let BaseUrl="https://hswarporasopore.web.app/results/findresult/";
let FullStudentResult={};
let FullClassDetails={};
let SubjectList={};
let currentResult={};
let StudentSelected=0;
let YearToBeSelected=2024;
let CurrentClass="";
let CurrentClassSel="";
let SortedListofExams=[];
let ShowResult=false;
let AutoSelected=false;
let CurrentYear=0;
let MaximumMarks=0;
let MarksObtained=0;
let GrandMaxMarks=0;
let GrandMarksObtained=0;
let ListOfSubjectFullObject={};
const Validation =  () => {
const { cid,yearPar,classPar,studentPar } = useParams();

console.log("yearPar----->",yearPar)
console.log("classPar----->",classPar)
console.log("studentPar----->",studentPar)
const [errors, seterrors] = useState(false);
const [qrCodeUrl, setQrCodeUrl] = useState("");
const [ListClassOption, setListClassOption] = useState([])
const [ListClassOptionFull, setListClassOptionFull] = useState([])
const [ListStudentOption, setListStudentOption] = useState([])
const [ListSubjectOption, setListSubjectOption] = useState([])
const [ListTeacherOptionFull, setListTeacherOptionFull] = useState([])
const [CurrentData, setCurrentData] = useState({})
const [ActionResult, setActionResult] = useState({})
const [medicalSchoolOptionsList, setMedicalSchoolOptionsList] = useState([]);
const {showLoading,hideLoading,firestoreQueries,DatabaseName,TooltipsPopovers} = useLoading();
const [toast, addToast] = useState(0)
const toaster = useRef()

if(typeof yearPar!=="undefined")
{
  YearToBeSelected=decodeURIComponent(escape(atob(yearPar)));
  if(typeof classPar!=="undefined")
  {
    CurrentClass=decodeURIComponent(escape(atob(classPar)));
    /*setCurrentData((prevValues) => 
    ({
      ...prevValues,
      ['class']: {value:CurrentClass,label:CurrentClass},
    }));*/
    if(typeof studentPar!=="undefined")
    {
      StudentSelected=decodeURIComponent(escape(atob(studentPar)));
      // const ListOfStudents=await firestoreQueries.FetchDataFromCollection(DatabaseName, "studentsBK", 1000, "id", '==', StudentSelected,"name","asc");
      /*setCurrentData((prevValues) => ({
        ...prevValues,
        ['student']: {value:CurrentClass,label:CurrentClass},
      }));*/
      AutoSelected=true;
    }
  }

}
const fetchStudentsDefault = useCallback(async () => {
setCurrentData((prevValues) => 
    ({
      ...prevValues,
      ['class']: {value:CurrentClass,label:CurrentClass}
    }));
    const ListOfClasses=await firestoreQueries.FetchDataFromCollection(DatabaseName, "classes", 1000, "id","==" , CurrentClass,"FieldOrderCol","asc");
    //const ListOfTeachers=await firestoreQueries.FetchDataFromCollection(DatabaseName, "users", 1000, 'role', '==', "Teacher","name","asc");
    console.log("ListOfClasses--->",ListOfClasses)

     ListClassOption1 = [
      ...ListOfClasses.map(classes => {
      ListOfSubjectFullObject[classes.class]=classes?.[classes.currentyear]?.['teachers'] ? {"TeacherList":classes?.[classes.currentyear]?.['teachers'],"SubjectList":classes?.subjects} :{"TeacherList":{},"SubjectList":classes?.subjects};
      FullClassDetails[classes.class]=classes;
      return{ value: classes.class, label: classes.class };

      }),
    ];
  let ClassFiledMap=YearToBeSelected+".particulars.currentclass";
    const ListOfStudents=await firestoreQueries.FetchDataFromCollection(DatabaseName, "students", 1000, "id", '==', StudentSelected,"name","asc");
    ListStudentsOption1 = [
      ...ListOfStudents.map(stud => {
      console.log("stud--->",stud[YearToBeSelected])
      FullStudentResult[stud.id]={"particulars":stud[YearToBeSelected]["particulars"],"subjects":stud[YearToBeSelected]["subjects"],"admissionno":stud["admissionno"],"category":stud["category"],"dob":stud["dob"],
      "dobActual":stud["dobActual"],"fathersname":stud["fathersname"],"id":stud["id"],"mothersname":stud["mothersname"],"name":stud["name"]};
      return{ value: stud.id, label: stud.name,rollno:stud.id };

      }),
    ];
    console.log("ListStudentsOption1---->",ListStudentsOption1?.[0])
    console.log("FullStudentResult---->",FullStudentResult)
    console.log("FullClassDetails---->",FullClassDetails)
    setCurrentData((prevValues) => 
    ({
      ...prevValues,
      ['student']: ListStudentsOption1?.[0]
    }));
    setListStudentOption(ListStudentsOption1)
    console.log("CurrentData---->",CurrentData.class)
     CurrentClassSel=CurrentClass;
      currentResult=FullStudentResult[ListStudentsOption1?.[0].value];
      SubjectList=FullClassDetails[CurrentClass]['subjects'];
      //SubjectList?.['english'] && currentResult
      console.log("SubjectList---->",SubjectList)
      console.log("currentResult---->",currentResult)
      ShowResult=true;
}, [CurrentData]);
useEffect(() => {
console.log("useEffect---->")
if(AutoSelected)
{
  fetchStudentsDefault();
}
else
{
  fetchData();
}

console.log("useEffect---->")

  }, []);
  useEffect(() => {
 
console.log("CurrentData=================>",CurrentData.class)
  }, [CurrentData]);
  const generateQRCode = async () => {
      try {
        const url = await QRCode.toDataURL(
          "http://localhost:3001/results/findresult/2024/7th/"
        );
        setQrCodeUrl(url);
      } catch (err) {
        console.error("Error generating QR code", err);
      }
    };
  const fetchStudents = async () =>
  {
    let ClassFiledMap=YearToBeSelected+".particulars.currentclass";
    const ListOfStudents=await firestoreQueries.FetchDataFromCollection(DatabaseName, "students", 1000, ClassFiledMap, '==', CurrentClass,"name","asc");
    ListStudentsOption1 = [
      ...ListOfStudents.map(stud => {
      console.log("stud--->",stud[YearToBeSelected])
      FullStudentResult[stud.id]={"particulars":stud[YearToBeSelected]["particulars"],"subjects":stud[YearToBeSelected]["subjects"],"admissionno":stud["admissionno"],"category":stud["category"],"dob":stud["dob"],
      "dobActual":stud["dobActual"],"fathersname":stud["fathersname"],"id":stud["id"],"mothersname":stud["mothersname"],"name":stud["name"]};
      return{ value: stud.id, label: stud.name,rollno:stud.id };

      }),
    ];
    console.log("ListStudentsOption1---->",ListStudentsOption1)
    setListStudentOption(ListStudentsOption1)
  }
  
  const fetchData = async () => {
   //await firestoreQueries.copyCollection(DatabaseName,"studentsBK","students");
    const ListOfClasses=await firestoreQueries.FetchDataFromCollection(DatabaseName, "classes", 1000, null, null, "DDO","FieldOrderCol","asc");
    //const ListOfTeachers=await firestoreQueries.FetchDataFromCollection(DatabaseName, "users", 1000, 'role', '==', "Teacher","name","asc");
    console.log("ListOfClasses--->",ListOfClasses)
    generateQRCode();

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
    console.log("value====>",value)
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
    if(!CurrentData.student)
    {
    	errors.subject="Please Select Student.";
    }

    return errors;
  }


const generatePDF = async () => {
    const doc = new jsPDF();
let GrandMaxMarks=0;
let GrandMarksObtained=0;
    // Header Section
    doc.setFont("times", "bold");
    doc.setFontSize(30);
    doc.setTextColor("#8C183B");
    doc.text("Govt. Boys High School Warpora", 105, 12, { align: "center" });
    doc.setFontSize(12);
    doc.setTextColor("#8C183B");
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
    doc.setDrawColor(0, 0, 0);
    doc.rect(1, 40, 208, 252)
    //doc.text(`Name: ${currentResult?.name}`, 15, 60);
    doc.setFont("helvetica", "normal");
    doc.setTextColor("#8C183B");
    doc.text("Name: ", 15, 60);
    doc.setFont("helvetica", "bold"); // Bold font
    doc.setTextColor("#000000");
    doc.text(`${currentResult?.name}`, doc.getTextWidth("Name: ") + 15, 60);
    //doc.text(`Roll Number: ${String(currentResult?.rollno)?.slice(1)}`, 105, 60, { align: "left" });
    doc.setFont("helvetica", "normal");
    doc.setTextColor("#8C183B");
    doc.text("Roll Number: ", 105, 60);
    doc.setFont("helvetica", "bold"); // Bold font
    doc.setTextColor("#000000");
    doc.text(`${String(currentResult?.particulars?.rollno)?.slice(1)}`, doc.getTextWidth("Roll Number: ") + 105, 60);
    //doc.text(`Father's Name': ${currentResult?.fathersname}`, 15, 70);
    doc.setFont("helvetica", "normal");
    doc.setTextColor("#8C183B");
    doc.text("Father's Name: ", 15, 70);
    doc.setFont("helvetica", "bold"); 
    doc.setTextColor("#000000");
    doc.text(`${currentResult?.fathersname}`, doc.getTextWidth("Father's Name: ") + 15, 70);
    //doc.text(`D.O.B: ${dayjs(new Date(currentResult?.dobActual.seconds * 1000)).format(dateFormat)}`, 105, 70, { align: "left" });
    doc.setFont("helvetica", "normal");
    doc.setTextColor("#8C183B");
    doc.text("D.O.B: ", 105, 70);
    doc.setFont("helvetica", "bold"); 
    doc.setTextColor("#000000");
    doc.text(`${dayjs(new Date(currentResult?.dobActual.seconds * 1000)).format(dateFormat)}`, doc.getTextWidth("D.O.B: ") + 105, 70);
    //doc.text(`Mother's Name': ${currentResult?.mothersname}`, 15, 80);
    doc.setFont("helvetica", "normal");
    doc.setTextColor("#8C183B");
    doc.text("Mother's Name: ", 15, 80);
    doc.setFont("helvetica", "bold"); 
    doc.setTextColor("#000000");
    doc.text(`${currentResult?.mothersname}`, doc.getTextWidth("Mother's Name: ") + 15, 80);
    //doc.text(`Admission No: ${currentResult?.admissionno}`, 105, 80, { align: "left" });
    doc.setFont("helvetica", "normal");
    doc.setTextColor("#8C183B");
    doc.text("Admission No: ", 105, 80);
    doc.setFont("helvetica", "bold"); 
    doc.setTextColor("#000000");
    doc.text(`${currentResult?.admissionno}`, doc.getTextWidth("Admission No: ") + 105, 80);
    //doc.text(`Class: ${CurrentData.class?.label}`, 15, 90);
    doc.setFont("helvetica", "normal");
    doc.setTextColor("#8C183B");
    doc.text("Class: ", 15, 90);
    doc.setFont("helvetica", "bold"); 
    doc.setTextColor("#000000");
    doc.text(`${CurrentData.class?.label}`, doc.getTextWidth("Class: ") + 15, 90);
    //doc.text(`Session: 2024`, 105, 90, { align: "left" });
    let Ysel=btoa(unescape(encodeURIComponent(YearToBeSelected)));
    let Csel=btoa(unescape(encodeURIComponent(CurrentData.class?.label)));
    let Ssel=btoa(unescape(encodeURIComponent(currentResult?.id)));
    const qrData=BaseUrl+Ysel+"/"+Csel+"/"+Ssel;
    // Section Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor("#007bff");
    doc.text("Student Marks Sheet", 105, 100, { align: "center" });

    // Table Content
   // const tableColumn = ["Subject", ...SortedListofExams.map(exam => exam.replace(/^.*\$\$/, '')), "Max Marks", "Marks Obtained"];
    let HeadRowsG=["Subject"];
     {Object.entries(FullClassDetails?.[CurrentClassSel]?.[YearToBeSelected]?.['exams']|| {}).sort(([keyA], [keyB]) => keyA.localeCompare(keyB)).map(([key, value]) => {
                        HeadRowsG.push(key.replace(/^.*\$\$/, '')+"\n("+Number(value.Max)+")")
        })}
        HeadRowsG.push("Max Marks");
        HeadRowsG.push("Marks Obtained");
        let BodyRowGMain=[];
        let BodyRowG=[];
        {SubjectList?.['english'] && currentResult?.["subjects"]?.['english']?.[SortedListofExams[0]] && (() => {
    GrandMaxMarks += Number(MaximumMarks);

    const MarksObtained = SortedListofExams.reduce(
      (total, exam) => total + Number(currentResult?.["subjects"]?.['english']?.[exam] || 0),
      0
    );

    GrandMarksObtained += Number(MarksObtained);
    BodyRowG.push("English");
    {SortedListofExams.map((exam, index) => {
     BodyRowG.push(Number(currentResult?.["subjects"]?.['english']?.[exam]));

        })}
        BodyRowG.push(Number(MaximumMarks));
        BodyRowG.push(Number(MarksObtained));
        BodyRowGMain.push(BodyRowG)
    // Render the table row
  })()}
  BodyRowG=[];
   {SubjectList?.['math'] && currentResult?.["subjects"]?.['math']?.[SortedListofExams[0]] && (() => {
    GrandMaxMarks += Number(MaximumMarks);

    const MarksObtained = SortedListofExams.reduce(
      (total, exam) => total + Number(currentResult?.["subjects"]?.['math']?.[exam] || 0),
      0
    );

    GrandMarksObtained += Number(MarksObtained);
    BodyRowG.push("Math");
    {SortedListofExams.map((exam, index) => {
     BodyRowG.push(Number(currentResult?.["subjects"]?.['math']?.[exam]));

        })}
        BodyRowG.push(Number(MaximumMarks));
        BodyRowG.push(Number(MarksObtained));
    // Render the table row
    BodyRowGMain.push(BodyRowG)
  })()}
  BodyRowG=[];
  {SubjectList?.['urdu'] && currentResult?.["subjects"]?.['urdu']?.[SortedListofExams[0]] && (() => {
    GrandMaxMarks += Number(MaximumMarks);

    const MarksObtained = SortedListofExams.reduce(
      (total, exam) => total + Number(currentResult?.["subjects"]?.['urdu']?.[exam] || 0),
      0
    );

    GrandMarksObtained += Number(MarksObtained);
    BodyRowG.push("Urdu");
    {SortedListofExams.map((exam, index) => {
     BodyRowG.push(Number(currentResult?.["subjects"]?.['urdu']?.[exam]));

        })}
        BodyRowG.push(Number(MaximumMarks));
        BodyRowG.push(Number(MarksObtained));
        BodyRowGMain.push(BodyRowG)
    // Render the table row
  })()}
  BodyRowG=[];
  {SubjectList?.['kashmiri'] && currentResult?.["subjects"]?.['kashmiri']?.[SortedListofExams[0]] && (() => {
    GrandMaxMarks += Number(MaximumMarks);

    const MarksObtained = SortedListofExams.reduce(
      (total, exam) => total + Number(currentResult?.["subjects"]?.['kashmiri']?.[exam] || 0),
      0
    );

    GrandMarksObtained += Number(MarksObtained);
    BodyRowG.push("Kashmiri");
    {SortedListofExams.map((exam, index) => {
     BodyRowG.push(Number(currentResult?.["subjects"]?.['kashmiri']?.[exam]));

        })}
        BodyRowG.push(Number(MaximumMarks));
        BodyRowG.push(Number(MarksObtained));
        BodyRowGMain.push(BodyRowG)
    // Render the table row
  })()}
  BodyRowG=[];
  {SubjectList?.['science'] && currentResult?.["subjects"]?.['science']?.[SortedListofExams[0]] && (() => {
    GrandMaxMarks += Number(MaximumMarks);

    const MarksObtained = SortedListofExams.reduce(
      (total, exam) => total + Number(currentResult?.["subjects"]?.['science']?.[exam] || 0),
      0
    );

    GrandMarksObtained += Number(MarksObtained);
    BodyRowG.push("Science");
    {SortedListofExams.map((exam, index) => {
     BodyRowG.push(Number(currentResult?.["subjects"]?.['science']?.[exam]));

        })}
        BodyRowG.push(Number(MaximumMarks));
        BodyRowG.push(Number(MarksObtained));
        BodyRowGMain.push(BodyRowG)
    // Render the table row
  })()}
  BodyRowG=[];
  {SubjectList?.['s_science'] && currentResult?.["subjects"]?.['s_science']?.[SortedListofExams[0]] && (() => {
    GrandMaxMarks += Number(MaximumMarks);

    const MarksObtained = SortedListofExams.reduce(
      (total, exam) => total + Number(currentResult?.["subjects"]?.['s_science']?.[exam] || 0),
      0
    );

    GrandMarksObtained += Number(MarksObtained);
    BodyRowG.push("S.Science");
    {SortedListofExams.map((exam, index) => {
     BodyRowG.push(Number(currentResult?.["subjects"]?.['s_science']?.[exam]));

        })}
        BodyRowG.push(Number(MaximumMarks));
        BodyRowG.push(Number(MarksObtained));
        BodyRowGMain.push(BodyRowG)
    // Render the table row
  })()}
  BodyRowG=[];
  {SubjectList?.['co-curricular-activities'] && currentResult?.["subjects"]?.['co-curricular-activities']?.[SortedListofExams[0]] && (() => {
    GrandMaxMarks += Number(MaximumMarks);

    const MarksObtained = SortedListofExams.reduce(
      (total, exam) => total + Number(currentResult?.["subjects"]?.['co-curricular-activities']?.[exam] || 0),
      0
    );

    GrandMarksObtained += Number(MarksObtained);
    BodyRowG.push("Co.Curricular");
    {SortedListofExams.map((exam, index) => {
     BodyRowG.push(Number(currentResult?.["subjects"]?.['co-curricular-activities']?.[exam]));

        })}
        BodyRowG.push(Number(MaximumMarks));
        BodyRowG.push(Number(MarksObtained));
        BodyRowGMain.push(BodyRowG)
    // Render the table row
  })()}
  BodyRowG=[];
  {SubjectList?.['apparel'] && currentResult?.["subjects"]?.['apparel']?.[SortedListofExams[0]] && (() => {
    GrandMaxMarks += Number(MaximumMarks);

    const MarksObtained = SortedListofExams.reduce(
      (total, exam) => total + Number(currentResult?.["subjects"]?.['apparel']?.[exam] || 0),
      0
    );

    GrandMarksObtained += Number(MarksObtained);
    BodyRowG.push("Vocational(Apparels)");
    {SortedListofExams.map((exam, index) => {
     BodyRowG.push(Number(currentResult?.["subjects"]?.['apparel']?.[exam]));

        })}
        BodyRowG.push(Number(MaximumMarks));
        BodyRowG.push(Number(MarksObtained));
        BodyRowGMain.push(BodyRowG)
    // Render the table row
  })()}
  BodyRowG=[];
  {SubjectList?.['retail'] && currentResult?.["subjects"]?.['retail']?.[SortedListofExams[0]] && (() => {
    GrandMaxMarks += Number(MaximumMarks);

    const MarksObtained = SortedListofExams.reduce(
      (total, exam) => total + Number(currentResult?.["subjects"]?.['retail']?.[exam] || 0),
      0
    );

    GrandMarksObtained += Number(MarksObtained);
    BodyRowG.push("Vocational(Retail)");
    {SortedListofExams.map((exam, index) => {
     BodyRowG.push(Number(currentResult?.["subjects"]?.['retail']?.[exam]));

        })}
        BodyRowG.push(Number(MaximumMarks));
        BodyRowG.push(Number(MarksObtained));
        BodyRowGMain.push(BodyRowG)
    // Render the table row
  })()}
  BodyRowG=[];
  let GreadS="";

  if(GrandMarksObtained / GrandMaxMarks * 100 >= 90)
  {
    GreadS="Grade A1";
  }
  else if(GrandMarksObtained / GrandMaxMarks * 100 >= 80)
  {
    GreadS="Grade A2";
  }
  else if(GrandMarksObtained / GrandMaxMarks * 100 >= 70)
  {
    GreadS="Grade B1";
  }
  else if(GrandMarksObtained / GrandMaxMarks * 100 >= 60)
  {
    GreadS="Grade B2";
  }
  else if(GrandMarksObtained / GrandMaxMarks * 100 >= 50)
  {
    GreadS="Grade C1";
  }
  else if(GrandMarksObtained / GrandMaxMarks * 100 >= 40)
  {
    GreadS="Grade C2";
  }
  else if(GrandMarksObtained / GrandMaxMarks * 100 >= 30)
  {
    GreadS="Grade D";
  }
  else
  {
    GreadS="Fail";
  }
    BodyRowGMain.push([{ content: "Grand Total", colSpan: 9, styles: { halign: "center", fontStyle: "bold" } },GrandMaxMarks,GrandMarksObtained]);
     BodyRowGMain.push([{ content: "Performance", colSpan: 9, styles: { halign: "center", fontStyle: "bold" } },{ content: GreadS, colSpan: 2, styles: { halign: "center", fontStyle: "bold" } }]);   

    // Table with Borders
    doc.autoTable({
      startY: 105,
      margin: { left: 2 },
      head: [HeadRowsG],
      body: BodyRowGMain,
      theme: "grid",
      tableWidth: 205,
      headStyles: {
        fillColor: [192,192,192],
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
      didParseCell: function (data) {
    if (data.section === "body") {
      data.cell.styles.minCellHeight = 13; // Set row height
    }
  },
    });
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.text("Teacher I/C: ", 15, 250);
    doc.setFont("helvetica", "normal");
    doc.text("Checked By: ", 80, 250);
    doc.text("Headmaster: ", 150, 250);
    try {
    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, { width: 100 });

    // Add QR code to PDF
    doc.addImage(qrCodeDataUrl, "PNG", 155, 45, 40, 40); // Adjust position and size as needed
  } catch (error) {
    console.error("Error generating QR code:", error);
  }
    //doc.setFont("helvetica", "bold"); 
    //doc.text(`${currentResult?.fathersname}`, doc.getTextWidth("Father's Name: ") + 15, 70);
    // Footer Section
    doc.setFontSize(10);
    doc.setTextColor("#000000");
    doc.text(`System Generated on: ${new Date().toLocaleDateString()}`, 105, doc.internal.pageSize.height - 10, { align: "center" });

    // Save PDF
    doc.save("Marks_Sheet.pdf");
  };

  const handleFormSubmit = async () =>
  {
    showLoading()
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
      console.log("CurrentData=====>",CurrentData)
      console.log("FullStudentResult=====>",FullStudentResult)
      currentResult=FullStudentResult[CurrentData.student.value];
      console.log("currentResult=====>",currentResult)
      console.log("CurrentClass=====>",CurrentClass)
      console.log("FullClassDetails=====>",FullClassDetails[CurrentClass])
      SubjectList=FullClassDetails[CurrentClass]['subjects'];
      console.log("SubjectList=====>",SubjectList)
      ShowResult=true;
 hideLoading()

    }
    else
    {
      hideLoading()
    }
  }

  return (
    <CRow>
      <CCol xs={12}>
      {!AutoSelected && (
        <CCard className="mb-4">
         <CToaster ref={toaster} push={toast} placement="top-end" />
          <CCardHeader>
            <strong>Result </strong> <small>Searching</small>
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
              	{(typeof CurrentData['class']!=="undefined" &&  CurrentData['class']!=="") && (
              	<CCol md={6}>
              <CFormLabel htmlFor="validationServer01">Select Name</CFormLabel>
              <Grid item xs={6}>

                <Select1
        value={CurrentData['student'] || ''}
        onChange={(event) => handleFormChange(event,'student')}
        variant="outlined"
        options={ListStudentOption}
        placeholder="Select Name"
        label="Select Name"
        title="Select Name"
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
              	)}







                <CCol xs={12} className="row">
                <p></p>
                <CCol xs={6}>
                  <CButton color="primary" type="button"
                   onClick={(event) => handleFormSubmit()}
                   >

                    Fetch Result
                  </CButton>
                  </CCol>
                </CCol>
              </CForm>
          </CCardBody>
        </CCard>
        )}
        {ShowResult &&(
        <CCard className="mb-4">
          <CCardHeader>
            <strong>View Result</strong> <small></small>
          </CCardHeader>
          <CCardBody>
          <div style={{ 
    backgroundColor: "#f8f9fa", 
    padding: "15px", 
    borderRadius: "8px", 
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", 
    textAlign: "center" 
  }}>
    <div style={{
          marginBottom: "5px",
          color: "rgb(44, 62, 80)",
          fontWeight: "bold",
          fontSize: "4vw", // Responsive font size based on viewport width
        }}>Govt Boys High School Warpora</div>
    <h5 style={{ marginBottom: "3px", color: "#34495e" }}>Zone Dangerpora</h5>
    <p style={{ marginBottom: "0", color: "#7f8c8d", fontSize: "14px" }}>
      Udise+: <strong>01020501103</strong>
    </p>
  </div>
            <p className="text-body-secondary small">
            </p>
             <CRow>
          <CCol xs="6">
            <strong>Name:</strong> {currentResult?.name}
          </CCol>
          <CCol xs="6" className="text-right">
            <strong>Roll No:</strong> {String(currentResult?.particulars?.rollno)?.slice(1)}
          </CCol>
        </CRow>
        <CRow className="mt-4">

          <CCol xs="6" >
            <strong>Fathers Name:</strong> {currentResult?.fathersname}
          </CCol>
          <CCol xs="6" className="text-right">
            <strong>DOB:</strong> {dayjs(new Date(currentResult?.dobActual.seconds * 1000)).format(dateFormat)}
          </CCol>
        </CRow>
        <CRow className="mt-4 mb-4">

          <CCol xs="6" >
            <strong>Mothers Name:</strong> {currentResult?.mothersname}
          </CCol>
          <CCol xs="6" className="text-right">
            <strong>Admission No:</strong> {currentResult?.admissionno}
          </CCol>
        </CRow>
            <CTable color="success"  bordered>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">Subject</CTableHeaderCell>
                     {Object.entries(FullClassDetails?.[CurrentClassSel]?.[YearToBeSelected]?.['exams']|| {}).sort(([keyA], [keyB]) => keyA.localeCompare(keyB)).map(([key, value]) => {
                        SortedListofExams.push(key)
                        console.log("SortedListofExams=====>",SortedListofExams)
                        MaximumMarks=Number(MaximumMarks)+Number(value.Max);
                        return (
                        <CTableHeaderCell scope="col" className="text-center">{key.replace(/^.*\$\$/, '')} <br></br>{"("+Number(value.Max)+")"}</CTableHeaderCell>
                        )

                     })


                     }
                    <CTableHeaderCell scope="col" className="text-center align-top">Max Marks</CTableHeaderCell>
                    <CTableHeaderCell scope="col" className="text-center align-top">Marks Obtained</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>

                <CTableBody>
 {SubjectList?.['english'] && currentResult?.["subjects"]?.['english']?.[SortedListofExams[0]] && (() => {
   console.log("SortedListofExams====>",SortedListofExams)
    GrandMaxMarks += Number(MaximumMarks);

    const MarksObtained = SortedListofExams.reduce(
      (total, exam) => total + Number(currentResult?.["subjects"]?.['english']?.[exam] || 0),
      0
    );

    GrandMarksObtained += Number(MarksObtained);

    // Render the table row
    return (
      <CTableRow>
        <CTableHeaderCell scope="col">English</CTableHeaderCell>
        {SortedListofExams.map((exam, index) => (
          <CTableDataCell key={index} className="text-center">
            {Number(currentResult?.["subjects"]?.['english']?.[exam])}
          </CTableDataCell>
        ))}

        <CTableDataCell className="text-center">{MaximumMarks}</CTableDataCell>
        <CTableDataCell className="text-center">{MarksObtained}</CTableDataCell>
      </CTableRow>
    );
  })()}
  {SubjectList?.['math'] && currentResult?.["subjects"]?.['math']?.[SortedListofExams[0]] && (() => {

    GrandMaxMarks += Number(MaximumMarks);

    const MarksObtained = SortedListofExams.reduce(
      (total, exam) => total + Number(currentResult?.["subjects"]?.['math']?.[exam] || 0),
      0
    );

    GrandMarksObtained += Number(MarksObtained);

    // Render the table row
    return (
      <CTableRow>
        <CTableHeaderCell scope="col">Math</CTableHeaderCell>
        {SortedListofExams.map((exam, index) => (
          <CTableDataCell key={index} className="text-center">
            {Number(currentResult?.["subjects"]?.['math']?.[exam])}
          </CTableDataCell>
        ))}

        <CTableDataCell className="text-center">{MaximumMarks}</CTableDataCell>
        <CTableDataCell className="text-center">{MarksObtained}</CTableDataCell>
      </CTableRow>
    );
  })()}
 {SubjectList?.['urdu'] && currentResult?.["subjects"]?.['urdu']?.[SortedListofExams[0]] && (() => {

    GrandMaxMarks += Number(MaximumMarks);

    const MarksObtained = SortedListofExams.reduce(
      (total, exam) => total + Number(currentResult?.["subjects"]?.['urdu']?.[exam] || 0),
      0
    );

    GrandMarksObtained += Number(MarksObtained);

    // Render the table row
    return (
      <CTableRow>
        <CTableHeaderCell scope="col">Urdu</CTableHeaderCell>
        {SortedListofExams.map((exam, index) => (
          <CTableDataCell key={index} className="text-center">
            {Number(currentResult?.["subjects"]?.['urdu']?.[exam])}
          </CTableDataCell>
        ))}

        <CTableDataCell className="text-center">{MaximumMarks}</CTableDataCell>
        <CTableDataCell className="text-center">{MarksObtained}</CTableDataCell>
      </CTableRow>
    );
  })()}
  {SubjectList?.['kashmiri'] && currentResult?.["subjects"]?.['kashmiri']?.[SortedListofExams[0]] && (() => {

    GrandMaxMarks += Number(MaximumMarks);

    const MarksObtained = SortedListofExams.reduce(
      (total, exam) => total + Number(currentResult?.["subjects"]?.['kashmiri']?.[exam] || 0),
      0
    );

    GrandMarksObtained += Number(MarksObtained);

    // Render the table row
    return (
      <CTableRow>
        <CTableHeaderCell scope="col">Kashmiri</CTableHeaderCell>
        {SortedListofExams.map((exam, index) => (
          <CTableDataCell key={index} className="text-center">
            {Number(currentResult?.["subjects"]?.['kashmiri']?.[exam])}
          </CTableDataCell>
        ))}

        <CTableDataCell className="text-center">{MaximumMarks}</CTableDataCell>
        <CTableDataCell className="text-center">{MarksObtained}</CTableDataCell>
      </CTableRow>
    );
  })()}
   {SubjectList?.['science'] && currentResult?.["subjects"]?.['science']?.[SortedListofExams[0]] && (() => {

    GrandMaxMarks += Number(MaximumMarks);

    const MarksObtained = SortedListofExams.reduce(
      (total, exam) => total + Number(currentResult?.["subjects"]?.['science']?.[exam] || 0),
      0
    );

    GrandMarksObtained += Number(MarksObtained);

    // Render the table row
    return (
      <CTableRow>
        <CTableHeaderCell scope="col">Science</CTableHeaderCell>
        {SortedListofExams.map((exam, index) => (
          <CTableDataCell key={index} className="text-center">
            {Number(currentResult?.["subjects"]?.['science']?.[exam])}
          </CTableDataCell>
        ))}

        <CTableDataCell className="text-center">{MaximumMarks}</CTableDataCell>
        <CTableDataCell className="text-center">{MarksObtained}</CTableDataCell>
      </CTableRow>
    );
  })()}
  {SubjectList?.['s_science'] && currentResult?.["subjects"]?.['s_science']?.[SortedListofExams[0]] && (() => {

    GrandMaxMarks += Number(MaximumMarks);

    const MarksObtained = SortedListofExams.reduce(
      (total, exam) => total + Number(currentResult?.["subjects"]?.['s_science']?.[exam] || 0),
      0
    );

    GrandMarksObtained += Number(MarksObtained);

    // Render the table row
    return (
      <CTableRow>
        <CTableHeaderCell scope="col">S.Science</CTableHeaderCell>
        {SortedListofExams.map((exam, index) => (
          <CTableDataCell key={index} className="text-center">
            {Number(currentResult?.["subjects"]?.['s_science']?.[exam])}
          </CTableDataCell>
        ))}

        <CTableDataCell className="text-center">{MaximumMarks}</CTableDataCell>
        <CTableDataCell className="text-center">{MarksObtained}</CTableDataCell>
      </CTableRow>
    );
  })()}
   {SubjectList?.['co-curricular-activities'] && currentResult?.["subjects"]?.['co-curricular-activities']?.[SortedListofExams[0]] && (() => {

    GrandMaxMarks += Number(MaximumMarks);

    const MarksObtained = SortedListofExams.reduce(
      (total, exam) => total + Number(currentResult?.["subjects"]?.['co-curricular-activities']?.[exam] || 0),
      0
    );

    GrandMarksObtained += Number(MarksObtained);

    // Render the table row
    return (
      <CTableRow>
        <CTableHeaderCell scope="col">S.Science</CTableHeaderCell>
        {SortedListofExams.map((exam, index) => (
          <CTableDataCell key={index} className="text-center">
            {Number(currentResult?.["subjects"]?.['co-curricular-activities']?.[exam])}
          </CTableDataCell>
        ))}

        <CTableDataCell className="text-center">{MaximumMarks}</CTableDataCell>
        <CTableDataCell className="text-center">{MarksObtained}</CTableDataCell>
      </CTableRow>
    );
  })()}
  {SubjectList?.['apparel'] && currentResult?.["subjects"]?.['apparel']?.[SortedListofExams[0]] && (() => {

    GrandMaxMarks += Number(MaximumMarks);

    const MarksObtained = SortedListofExams.reduce(
      (total, exam) => total + Number(currentResult?.["subjects"]?.['apparel']?.[exam] || 0),
      0
    );

    GrandMarksObtained += Number(MarksObtained);

    // Render the table row
    return (
      <CTableRow>
        <CTableHeaderCell scope="col">Vocational(Apparels)</CTableHeaderCell>
        {SortedListofExams.map((exam, index) => (
          <CTableDataCell key={index} className="text-center">
            {Number(currentResult?.["subjects"]?.['apparel']?.[exam])}
          </CTableDataCell>
        ))}

        <CTableDataCell className="text-center">{MaximumMarks}</CTableDataCell>
        <CTableDataCell className="text-center">{MarksObtained}</CTableDataCell>
      </CTableRow>
    );
  })()}
  {SubjectList?.['retail'] && currentResult?.["subjects"]?.['retail']?.[SortedListofExams[0]] && (() => {

    GrandMaxMarks += Number(MaximumMarks);

    const MarksObtained = SortedListofExams.reduce(
      (total, exam) => total + Number(currentResult?.["subjects"]?.['retail']?.[exam] || 0),
      0
    );

    GrandMarksObtained += Number(MarksObtained);

    // Render the table row
    return (
      <CTableRow>
        <CTableHeaderCell scope="col">Vocational(Retail)</CTableHeaderCell>
        {SortedListofExams.map((exam, index) => (
          <CTableDataCell key={index} className="text-center">
            {Number(currentResult?.["subjects"]?.['retail']?.[exam])}
          </CTableDataCell>
        ))}

        <CTableDataCell className="text-center">{MaximumMarks}</CTableDataCell>
        <CTableDataCell className="text-center">{MarksObtained}</CTableDataCell>
      </CTableRow>
    );
  })()}

                <CTableRow>
                 <CTableHeaderCell colSpan={SortedListofExams.length+1} className="text-end">
                  Grand Total
                 </CTableHeaderCell>
                  <CTableHeaderCell  className="text-center">
                  {GrandMaxMarks}
                 </CTableHeaderCell>
                  <CTableHeaderCell  className="text-center">
                  {GrandMarksObtained}
                 </CTableHeaderCell>
                </CTableRow>
                <CTableRow >
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
      : 'Fail'
      }
  </CTableHeaderCell>

</CTableRow>
                </CTableBody>
              </CTable>
              {/*<img src={qrCodeUrl} alt="QR Code" style={{ width: 200, height: 200 }} />
              <CButton color="primary" type="button" onClick={generatePDF}>
                Download PDF
              </CButton>*/}
            </CCardBody>
        </CCard>
        )}
      </CCol>
    </CRow>
  )
}

export default Validation
