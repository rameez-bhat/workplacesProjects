import React, { useState,useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  CForm,
  CFormInput,
  CFormLabel,
  CButton,
  CFormSelect,
  CRow,
  CCol,
  CAlert,
} from "@coreui/react";
import { useLoading } from '../../layout/LoadingContext';
let currentYear=new Date().getFullYear();
let PreviousYearSelected='';
let classeslistwithinitials={};
// Helper function to format date as DD-MM-YYYY
const formatDate = (date) => {
  if (!date) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const StudentForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    fatherName: "",
    motherName: "",
    dob: null,
    admissionNo: "",
    class: "",
    rollNo: "",
    cat:'',
  });

  const [errors, setErrors] = useState({});
  const {showLoading,hideLoading,firestoreQueries,DatabaseName,TooltipsPopovers} = useLoading();
  useEffect(() => {
loadform();


  }, []);
const loadform = async ()=>{
 const SettingsListed=await firestoreQueries.FetchDataFromCollection(DatabaseName, "settings", 1000, 'settingtype', '==', "currentyear","currentyear","asc");
    if(SettingsListed.length)
    {
    	currentYear=SettingsListed[0].currentyear;
    	PreviousYearSelected=String(currentYear)-1;
    }
     const ListClasses=await firestoreQueries.FetchDataFromCollection(DatabaseName,"classes", 10000, 'id', '!=', "11th","class","asc");
    if(ListClasses.length)
    {
    	ListClasses.forEach(cls => {
    			classeslistwithinitials[cls.class] = cls;
  		});

    }
};
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDateChange = (date) => {
    setFormData({ ...formData, dob: date });
  };

  const validateForm = () => {
    let newErrors = {};
    Object.keys(formData).forEach((key) => {
      if (!formData[key] || (key === "dob" && formData.dob === null)) {
        newErrors[key] = "This field is required";
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
  showLoading()
    e.preventDefault();
    if (validateForm()) {

    	let row=formData;
    	row['rollNo'] = row['rollNo']?.toString().padStart(2, "0");
       	  const dob = new Date(row['dob']).toLocaleDateString();
          const dobActual1=firestoreQueries.Timestamp.fromDate(new Date(row['dob']));
          console.log("classeslistwithinitials--->",classeslistwithinitials)
		  const Initial=classeslistwithinitials[row['class']].initial;
		  const rollnowithinitial=Number(Initial+""+row['rollNo'])
          let admissionnumber="Student_"+row['admissionNo'];
          let dataTobesend={
            name:row['name'],
            fathersname:row["fatherName"],
            mothersname:row["motherName"],
            dob:dob,
            dobActual:dobActual1,
            admissionno:row['admissionNo'],
            category:row['cat'],
            currentclass:row['class'],
            id:admissionnumber
          }
          dataTobesend[currentYear]={};
          dataTobesend[currentYear]['particulars']={currentclass:row['class'],rollno:Number(rollnowithinitial)}
          let FieldToCheckCurrentClass=currentYear+".particulars.currentclass";
          let FieldToCheckCurrentRoll=currentYear+".particulars.rollno";
          let conditionsArray =
    		[
  				[
  					{ name: FieldToCheckCurrentClass, condition: "==", value: row['class'] },
  					{ name: FieldToCheckCurrentRoll, condition: "==", value: Number(rollnowithinitial) }
  				]
			];
    	console.log("conditionsArray---->",conditionsArray)
		
		const ListClasses=await firestoreQueries.FetchDataFromCollection(DatabaseName,"students", 10000, 'admissionno', '==', Number(row['admissionNo']),"admissionno","asc");
		 if(ListClasses.length)
    	{
    		TooltipsPopovers("Message:", "Admission No ="+row['admissionNo']+" Already Exists for Name="+ListClasses[0].name , "Error");
    	}
    	else
    	{
    		let result =await firestoreQueries.SelectedWithComplexConditions(DatabaseName,"students",conditionsArray);
    		console.log("result--->",result)
    		if(result.status=="success")
    		{
    			if(!result.data.length)
    			{
					let responseAdd= await firestoreQueries.updateOrCreateById(DatabaseName, "students",  admissionnumber, dataTobesend);
					console.log("responseAdd--->",responseAdd)
					if(responseAdd.status=="success")
			 		{
			 			TooltipsPopovers("Message:", responseAdd.message  , "Success");
			 		}
			 		else
			 		{
			 			TooltipsPopovers("Message:", responseAdd.message  , "Error");
			 		}
    				/*firestoreQueries.updateOrCreateByField(DatabaseName, "students", Condt, dataTobesend).then((resultInside) => 
    				{
			 			console.log("resultInside:", resultInside);
			 			if(resultInside.status=="success")
			 			{
			 				TooltipsPopovers("Message:", "Student Successfully Added"  , "Success");
			 			}
    				})*/
    			}
    			else
    			{
    				TooltipsPopovers("Message:", "Class Roll No ="+row['rollNo']+" Already Exists for Name="+result.data[0].name , "Error");
    			}
    		}
    	}
      	console.log("ListClasses--->",ListClasses)
    }
    hideLoading()
  };

  return (
    <CForm onSubmit={handleSubmit} className="p-4 shadow rounded bg-light">
      <CRow className="mb-3">
        <CCol md={6}>
          <CFormLabel>Name</CFormLabel>
          <CFormInput
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
          {errors.name && <CAlert color="danger">{errors.name}</CAlert>}
        </CCol>
        <CCol md={6}>
          <CFormLabel>Father's Name</CFormLabel>
          <CFormInput
            name="fatherName"
            value={formData.fatherName}
            onChange={handleChange}
          />
          {errors.fatherName && <CAlert color="danger">{errors.fatherName}</CAlert>}
        </CCol>
      </CRow>

      <CRow className="mb-3">
        <CCol md={4}>
          <CFormLabel>Mother's Name</CFormLabel>
          <CFormInput
            name="motherName"
            value={formData.motherName}
            onChange={handleChange}
          />
          {errors.motherName && <CAlert color="danger">{errors.motherName}</CAlert>}
        </CCol>
        <CCol md={4}>
          <CFormLabel>Date of Birth</CFormLabel>
          <DatePicker
            selected={formData.dob}
            onChange={handleDateChange}
            dateFormat="dd-MM-yyyy"
            placeholderText="DD-MM-YYYY"
            showYearDropdown
            scrollableYearDropdown
            yearDropdownItemNumber={100}
            className="form-control w-100"
          />
          {errors.dob && <CAlert color="danger">{errors.dob}</CAlert>}
        </CCol>
        <CCol md={4}>
          <CFormLabel>Category</CFormLabel>
          <CFormSelect
            name="cat"
            value={formData.cat}
            onChange={handleChange}
            invalid={!!errors.cat}
          >
            <option value="">Select Category</option>
            <option value="OM">General</option>
            <option value="EWS">EWS</option>
            <option value="ST">ST</option>
            <option value="SC">SC</option>
            <option value="Other">Other</option>
            {/* add more as needed */}
          </CFormSelect>
          {errors.cat && <CAlert color="danger">{errors.cat}</CAlert>}
        </CCol>
      </CRow>
	 
      <CRow className="mb-3">
        <CCol md={4}>
          <CFormLabel>Admission No</CFormLabel>
          <CFormInput
            name="admissionNo"
            value={formData.admissionNo}
            onChange={handleChange}
          />
          {errors.admissionNo && <CAlert color="danger">{errors.admissionNo}</CAlert>}
        </CCol>
        <CCol md={4}>
          <CFormLabel>Class</CFormLabel>
          <CFormSelect
            name="class"
            value={formData.class}
            onChange={handleChange}
            invalid={!!errors.class}
          >
            <option value="">Select Class</option>
            <option value="nursery">Nursery</option>
            <option value="lkg">LKG</option>
            <option value="ukg">UKG</option>
            <option value="ist">Ist</option>
            <option value="2nd">2nd</option>
            <option value="3rd">3rd</option>
            <option value="3rd">3rd</option>
            <option value="3rd">3rd</option>
            <option value="4th">4th</option>
            <option value="5th">5th</option>
            <option value="6th">6th</option>
            <option value="7th">7th</option>
            <option value="8th">8th</option>
            <option value="9th">9th</option>
            <option value="10th">10th</option>
            {/* add more as needed */}
          </CFormSelect>
          {errors.class && <CAlert color="danger">{errors.class}</CAlert>}
        </CCol>
        <CCol md={4}>
          <CFormLabel>Class Roll No</CFormLabel>
          <CFormInput
            name="rollNo"
            value={formData.rollNo}
            onChange={handleChange}
          />
          {errors.rollNo && <CAlert color="danger">{errors.rollNo}</CAlert>}
        </CCol>
      </CRow>

      <CButton type="submit" color="primary">
        Submit
      </CButton>
    </CForm>
  );
};

export default StudentForm;
