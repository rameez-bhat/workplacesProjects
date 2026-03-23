import React, { useState, useEffect, useRef } from 'react';
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
  CNav,
  CNavItem,
  CTabContent,
  CTabPane,
  CNavLink,
  CInputGroupText,
  CRow,
  CToaster,
  CToast,
  CToastBody,
  CToastHeader
} from '@coreui/react';
import { DatePicker } from "antd";
import Select1 from 'react-select';
import dayjs from 'dayjs';
import { useLoading } from '../../layout/LoadingContext';
import { DocsExample } from 'src/components';
import { countryData } from "../../apis/countryData";
import { medicalSchoolOptions } from "../../apis/MedicalSchools";
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { Timestamp } from 'firebase/firestore';

const CountryOption = ({ label, flag }) => (
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <img src={flag} alt="" style={{ width: 20, height: 20, marginRight: 5 }} />
    {label}
  </div>
);

const allCountries = countryData.map(country => ({
  value: country.value,
  label: "(" + country.phoneCode + ")" + country.value,
  flag: country.flag,
  phoneCode: country.phoneCode,
}));

const countryOfMedicalCollege = countryData.map(country => ({
  value: country.value,
  label: country.label,
  flag: country.flag,
  phoneCode: country.phoneCode,
  "FieldName": "CountryOfMedicalSchool",
}));

let AdminOptionsList = [];

const interestedin = [
  { value: 'rotation', label: 'Rotation' },
  { value: 'research', label: 'Research' },
  { value: 'match', label: 'Match' },
  { value: 'steps preparation', label: 'STEPs preparation' },
  { value: 'usmle guidance', label: 'USMLE guidance' },
  { value: 'interview preparations', label: 'Interview Preparations' },
];

const Validation = () => {
  const [errors, seterrors] = useState(false);
  const [CurrentData, setCurrentData] = useState({});
  const [ActionResult, setActionResult] = useState({});
  const [medicalSchoolOptionsList, setMedicalSchoolOptionsList] = useState([]);
  const { showLoading, hideLoading, firestoreQueries, ShowToast, TooltipsPopovers,DatabaseName } = useLoading();

  const [toast, addToast] = useState(0);
  const toaster = useRef();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
  console.log("errors--->",errors)
    if (CurrentData['countryofmedicalcollege']) {
      if (CurrentData['countryofmedicalcollege']?.label !== "Others") {
        const filtered = medicalSchoolOptions.filter(college => college.includes(", " + CurrentData['countryofmedicalcollege'].label));
        setMedicalSchoolOptionsList([
          ...filtered.map(college => ({ value: college, label: college })),
          { value: 'Others', label: 'Others' }
        ]);
      }
    }
  }, [CurrentData,errors]);

  const fetchData = async () => {
    const adminlist = await firestoreQueries.FetchDataFromCollection(DatabaseName, "users", 100, "role", "==", "Customer Support");
    adminlist.map((item) => {
      AdminOptionsList.push({ label: item.name, value: item.uid, name: item.name });
      return null;
    });
  }

  const handleFormChange = async (event, name = "",level=null,sublevel=null) => {
    let value;
    if (event.target) {
      value = event.target.value;
    } else if (event.$d) {
      value = event.toLocaleString('en-GB', { timeZone: 'GMT' });
      value = Timestamp.fromDate(new Date(value));
    } else if (event.label) {
      value = event;
    } else if (event?.[0]?.['label']) {
      value = event;
    } else {
      value = event.label;
    }

    if (name === "step1result" && value === "not taken") {
      setCurrentData(prevValues => ({
        ...prevValues,
        step2ckresult: value,
        step3ckresult: value,
      }));
    }
   if (sublevel !== null) {
      setCurrentData(prevValues => ({
        ...prevValues,
        [level]: {
          ...prevValues[level],
          [sublevel]: {
            ...prevValues[level][sublevel],
            [name]: value,
          }
        }
      }));
    } else if (level !== null) {
      setCurrentData(prevValues => ({
        ...prevValues,
        [level]: {
          ...prevValues[level],
          [name]: value,
        }
      }));
    } else {
      setCurrentData(prevValues => ({
        ...prevValues,
        [name]: value,
      }));
    }

  }

  const formValidate = async () => {
    const errors = {};
    if (!CurrentData.firstname)
    {
      errors.firstname = "Please Enter First Name.";
    }
    if (!CurrentData.lastname)
    {
      errors.lastname = "Please Enter Last Name.";
    }
    if (!CurrentData.email)
    {
      errors.email = "Please Enter Email.";
    }
    else if (CurrentData.email && !validateEmail(CurrentData.email))
    {
      errors.email = "Please Enter A Valid Email.";
    }
    if (CurrentData.phonecountrycode && !CurrentData.phone) {
      errors.phone = "Please Enter A Valid Phone.";
    } else if (!CurrentData.phonecountrycode && CurrentData.phone) {
      errors.phonecountrycode = "Please Select Country Code.";
    } else if (CurrentData.phonecountrycode && CurrentData.phone && !validatePhoneNumber(CurrentData.phone, CurrentData.phonecountrycode.value)) {
      errors.phone = "Please Enter A Valid Phone.";
    }

    return errors;
  }

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePhoneNumber = (phoneNumber, countrycode) => {
    const validLengths = [7, 8, 9, 10, 11, 12, 13, 14];
    const cleanedNumber = phoneNumber.replace(/\D/g, '');
    if (!validLengths.includes(cleanedNumber.length)) {
      return false;
    }
    try {
      const parsedNumber = parsePhoneNumberFromString(cleanedNumber, countrycode);
      return parsedNumber && parsedNumber.isValid();
    } catch (e) {
      return false;
    }
  };



  const handleFormSubmit = async () => {
    showLoading();
    const validationErrors = await formValidate();
    seterrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      const CheckExists = await firestoreQueries.FetchDataFromCollection(DatabaseName, "leads", 100, "email", "==", CurrentData.email);
      if (CheckExists.length)
      {
        const uidl = CheckExists[0].id;
        const messageHead = `For Details Of User Please <a href='/admin/leads/updatelead/${uidl}'>Click Here</a>`;
        TooltipsPopovers("Error", messageHead, "Already Exists");
      }
      else
      {
        CurrentData.createTime=firestoreQueries.Timestamp.fromDate(new Date());
        CurrentData.updateTime=firestoreQueries.Timestamp.fromDate(new Date());
        //firestoreQueries.updateOrCreateByField("LeadTracker", "leads","email","==" ,CurrentData.email, CurrentData).then((result)
        firestoreQueries.updateOrCreateByField(DatabaseName, "leads",[{fieldName:'email',operator:'==',value:CurrentData.email}], CurrentData).then((result) =>
        {
        TooltipsPopovers(result.status, result.message, result.status);
        hideLoading()
      })
      }
      hideLoading();
    } else {
      hideLoading();
    }
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Lead</strong> <small>Addition</small>
          </CCardHeader>
          <CCardBody>
            <p className="text-body-secondary small">
            </p>
            <CForm className="row g-3 needs-validation">
              {/* Form fields here */}
              <CCol md={6}>
                <CFormLabel htmlFor="validationServer01">First Name</CFormLabel>
                <CFormInput
                  type="text"
                  placeholder="First Name"
                  value={CurrentData?.firstname}
                  invalid={!!errors.firstname}
                  valid={!errors.firstname && !!CurrentData?.firstname}
                  required
                  onChange={(event) => handleFormChange(event, 'firstname')}
                />
                {errors.firstname && (
                  <CFormFeedback invalid>{errors.firstname}</CFormFeedback>
                )}
              </CCol>
              <CCol md={6}>
                <CFormLabel >Last Name</CFormLabel>
                <CFormInput
                  type="text"
                  placeholder="Last Name"
                  value={CurrentData?.lastname}
                  invalid={!!errors.lastname}
                  valid={!errors.firstname && !!CurrentData?.lastname}
                  required
                  onChange={(event) => handleFormChange(event, 'lastname')}
                />
                {errors.lastname && (
                  <CFormFeedback invalid>{errors.lastname}</CFormFeedback>
                )}
              </CCol>
              <CCol md={6}>
                <CFormLabel >Email</CFormLabel>
                <CFormInput
                  type="text"
                  value={CurrentData?.email}
                  placeholder="Email"
                  invalid={!!errors.email}
                  valid={!errors.email && !!CurrentData?.email}
                  required
                  onChange={(event) => handleFormChange(event, 'email')}
                />
                {errors.email && (
                  <CFormFeedback invalid>{errors.email}</CFormFeedback>
                )}
              </CCol>
              <CCol md={6}>
                <CInputGroup className="mb-3">
                  <CCol md={2.2}>
                    <CFormLabel >Country Code</CFormLabel>
                    <Select1
                      value={CurrentData?.phonecountrycode}
                      onChange={(event) => handleFormChange(event, 'phonecountrycode')}
                      options={allCountries}
                      placeholder="Country Code"
                      invalid={!!errors.phonecountrycode}
                      valid={!errors.phonecountrycode && !!CurrentData?.phonecountrycode}
                      isSearchable
                      formatOptionLabel={CountryOption}
                    />
                    {errors.phonecountrycode && (
                      <CFormFeedback invalid>{errors.phonecountrycode}</CFormFeedback>
                    )}
                  </CCol>
                  <CCol md={0.1}>
                    <CFormLabel>-</CFormLabel>
                    <CInputGroupText>-</CInputGroupText>
                  </CCol>
                  <CCol md={1.7}>
                    <CFormLabel >Phone Without Country Code</CFormLabel>
                    <CFormInput
                      type="text"
                      value={CurrentData?.phone}
                      placeholder="Phone Without Country Code"
                      invalid={!!errors.phone}
                      valid={!errors.phone && CurrentData?.phone}
                      required
                      onChange={(event) => handleFormChange(event, 'phone')}
                    />
                    {errors.phone && (
                      <CFormFeedback invalid>{errors.phone}</CFormFeedback>
                    )}
                  </CCol>
                </CInputGroup>
              </CCol>
              <CCol md={6}>
                <CFormLabel >Sarthi Student</CFormLabel>
                <CFormSelect value={CurrentData?.sarthistudent}
                  placeholder="Sarthi Student"
                  invalid={!!errors.sarthistudent}
                  valid={!errors.sarthistudent && !!CurrentData?.sarthistudent}
                  required
                  onChange={(event) => handleFormChange(event, 'sarthistudent')}>
                  <option value='yes'>Yes</option>
                  <option value='no'>No</option>
                  <option value='do not know'>Do Not Know</option>
                </CFormSelect>
                {errors.sarthistudent && (
                  <CFormFeedback invalid>{errors.sarthistudent}</CFormFeedback>
                )}
              </CCol>
              <CCol md={6}>
                <CFormLabel >Source</CFormLabel>
                <CFormSelect value={CurrentData?.source}
                  placeholder="Source"
                  invalid={!!errors.source}
                  valid={!errors.source && CurrentData?.source}
                  required
                  onChange={(event) => handleFormChange(event, 'source')}>
                  <option value='rotation inquery'>Rotation Inquiry</option>
                  <option value='whatsapp'>WhatsApp</option>
                  <option value='calendly'>Calendly</option>
                  <option value='webinar'>Webinar</option>
                  <option value='contact us page'>Contact Us Page</option>
                  <option value='enroll email'>Enroll Email</option>
                  <option value='call'>Call</option>
                  <option value='marketing'>Marketing</option>
                  <option value='via team member'>Via team member</option>
                  <option value='webinar/workshop/events'>Webinar/workshop/Events</option>
                  <option value='other'>Other</option>
                </CFormSelect>
                {errors.source && (
                  <CFormFeedback invalid>{errors.source}</CFormFeedback>
                )}
              </CCol>
              {(CurrentData.source === "webinar/workshop/events" || CurrentData.source === "other") && (
                <CCol md={6}>
                  <CFormLabel >Source({CurrentData.source}) Define</CFormLabel>
                  <CFormTextarea
                    type="text"
                    placeholder="sourceother"
                    rows="4"
                    value={CurrentData?.sourceother}
                    invalid={!!errors.sourceother}
                    valid={!errors.sourceother && !!CurrentData?.sourceother}
                    required
                    onChange={(event) => handleFormChange(event, 'sourceother')}
                  />
                  {errors.sourceother && (
                    <CFormFeedback invalid>{errors.sourceother}</CFormFeedback>
                  )}
                </CCol>
              )}
              <CCol md={6}>
                <CFormLabel >Interested In</CFormLabel>
                <Select1 value={CurrentData?.interestedin}
                  placeholder="Interested In"
                  invalid={!!errors.interestedin}
                  valid={!errors.interestedin && CurrentData?.interestedin}
                  required
                  isMulti
                  closeMenuOnSelect={false}
                  options={interestedin}
                  onChange={(event) => handleFormChange(event, 'interestedin')}>
                </Select1>
                {errors.interestedin && (
                  <CFormFeedback invalid>{errors.interestedin}</CFormFeedback>
                )}
              </CCol>
              <CCol md={6}>
                <CFormLabel >Status</CFormLabel>
                <CFormSelect value={CurrentData?.status}
                  placeholder="Status"
                  invalid={!!errors.status}
                  valid={!errors.status && CurrentData?.status}
                  required
                  onChange={(event) => handleFormChange(event, 'status')}>
                  <option value='enrolled'>Enrolled</option>
                  <option value='hot'>Hot</option>
                  <option value='active'>Active</option>
                  <option value='not responding'>Not Responding</option>
                  <option value='Dead'>Dead</option>
                  <option value='do not disturb'>Do Not Disturb</option>
                </CFormSelect>
                {errors.status && (
                  <CFormFeedback invalid>{errors.status}</CFormFeedback>
                )}
              </CCol>
              <CCol md={6}>
                <CFormLabel >Lead Created By</CFormLabel>
                <Select1 value={CurrentData?.leadcreatedby}
                  placeholder="Lead Created By"
                  invalid={!!errors.leadcreatedby}
                  valid={!errors.leadcreatedby && CurrentData?.leadcreatedby}
                  required
                  closeMenuOnSelect={false}
                  options={AdminOptionsList}
                  onChange={(event) => handleFormChange(event, 'leadcreatedby')}>
                </Select1>
                {errors.leadcreatedby && (
                  <CFormFeedback invalid>{errors.leadcreatedby}</CFormFeedback>
                )}
              </CCol>
              <CCol md={6}>
                <CFormLabel >Lead Owner</CFormLabel>
                <Select1 value={CurrentData?.leadowner}
                  placeholder="Lead Owner"
                  invalid={!!errors.leadowner}
                  valid={!errors.leadowner && CurrentData?.leadowner}
                  required
                  closeMenuOnSelect={false}
                  options={AdminOptionsList}
                  onChange={(event) => handleFormChange(event, 'leadowner')}>
                </Select1>
                {errors.leadowner && (
                  <CFormFeedback invalid>{errors.leadowner}</CFormFeedback>
                )}
              </CCol>
              <CCol md={6}>
                <CFormLabel >YOG</CFormLabel>
                <DatePicker className="DatePicker"
                  defaultValue={CurrentData?.yog ? dayjs(CurrentData?.yog?.toDate().toISOString()) : null}
                  onChange={(event) => handleFormChange(event, 'yog')}
                  dateFormat="dd/mm/yyyy"
                  scrollableYearDropdown
                  yearDropdownItemNumber={50}
                  picker="date"
                  label="YOG"
                  variant="outlined"
                />
                {errors.yog && (
                  <CFormFeedback invalid>{errors.yog}</CFormFeedback>
                )}
              </CCol>
              <CCol md={6}>
                <CFormLabel >Step 1 Result</CFormLabel>
                <CFormSelect value={CurrentData?.step1result}
                  placeholder="Step 1 Result"
                  invalid={!!errors.step1result}
                  valid={!errors.step1result && !!CurrentData?.step1result}
                  required
                  onChange={(event) => handleFormChange(event, 'step1result')}>
                  <option value=''>=Select=</option>
                  <option value='score'>Score</option>
                  <option value='pass'>Pass</option>
                  <option value='fail'>Fail</option>
                  <option value='not taken'>Not Taken</option>
                </CFormSelect>
                {errors.step1result && (
                  <CFormFeedback invalid>{errors.step1result}</CFormFeedback>
                )}
              </CCol>
              {CurrentData?.step1result === 'score' && (
                <CCol md={6}>
                  <CFormLabel >Step 1 Score</CFormLabel>
                  <CFormInput
                    type="text"
                    value={CurrentData?.step1score}
                    placeholder="Step 1 Score"
                    invalid={!!errors.step1score}
                    valid={!errors.step1score && !!CurrentData?.step1score}
                    required
                    onChange={(event) => handleFormChange(event, 'step1score')}
                  />
                  {errors.step1score && (
                    <CFormFeedback invalid>{errors.step1score}</CFormFeedback>
                  )}
                </CCol>
              )}
              <CCol md={6}>
                <CFormLabel >Step 2 CK Result</CFormLabel>
                <CFormSelect value={CurrentData?.step2ckresult}
                  placeholder="Step 2 CK Result"
                  invalid={!!errors.step2ckresult}
                  valid={!errors.step2ckresult && !!CurrentData?.step2ckresult}
                  required
                  onChange={(event) => handleFormChange(event, 'step2ckresult')}>
                  <option value=''>=Select=</option>
                  <option value='score'>Score</option>
                  <option value='not taken'>Not Taken</option>
                </CFormSelect>
                {errors.step2ckresult && (
                  <CFormFeedback invalid>{errors.step2ckresult}</CFormFeedback>
                )}
              </CCol>
              {CurrentData?.step2ckresult === 'score' && (
                <CCol md={6}>
                  <CFormLabel >Step 2 CK Score</CFormLabel>
                  <CFormInput
                    type="text"
                    value={CurrentData?.step2ckscore}
                    placeholder="Step 2 CK Score"
                    invalid={!!errors.step2ckscore}
                    valid={!errors.step2ckscore && !!CurrentData?.step2ckscore}
                    required
                    onChange={(event) => handleFormChange(event, 'step2ckscore')}
                  />
                  {errors.step2ckscore && (
                    <CFormFeedback invalid>{errors.step2ckscore}</CFormFeedback>
                  )}
                </CCol>
              )}
              <CCol md={6}>
                <CFormLabel >Step 3 CK Result</CFormLabel>
                <CFormSelect value={CurrentData?.step3ckresult}
                  placeholder="Step 3 CK Result"
                  invalid={!!errors.step3ckresult}
                  valid={!errors.step3ckresult && !!CurrentData?.step3ckresult}
                  required
                  onChange={(event) => handleFormChange(event, 'step3ckresult')}>
                  <option value=''>=Select=</option>
                  <option value='score'>Score</option>
                  <option value='not taken'>Not Taken</option>
                </CFormSelect>
                {errors.step3ckresult && (
                  <CFormFeedback invalid>{errors.step3ckresult}</CFormFeedback>
                )}
              </CCol>
              {CurrentData?.step3ckresult === 'score' && (
                <CCol md={6}>
                  <CFormLabel >Step 3 CK Score</CFormLabel>
                  <CFormInput
                    type="text"
                    value={CurrentData?.step3ckscore}
                    placeholder="Step 3 CK Score"
                    invalid={!!errors.step3ckscore}
                    valid={!errors.step3ckscore && !!CurrentData?.step3ckscore}
                    required
                    onChange={(event) => handleFormChange(event, 'step3ckscore')}
                  />
                  {errors.step3ckscore && (
                    <CFormFeedback invalid>{errors.step3ckscore}</CFormFeedback>
                  )}
                </CCol>
              )}
              <CCol md={6}>
                <CFormLabel >Country Of Medical College</CFormLabel>
                <Select1
                  value={CurrentData?.countryofmedicalcollege}
                  onChange={(event) => handleFormChange(event, 'countryofmedicalcollege')}
                  options={countryOfMedicalCollege}
                  placeholder="Country Code"
                  invalid={!!errors.countryofmedicalcollege}
                  valid={!errors.countryofmedicalcollege && CurrentData?.countryofmedicalcollege}
                  isSearchable
                  formatOptionLabel={CountryOption}
                />
                {errors.countryofmedicalcollege && (
                  <CFormFeedback invalid>{errors.countryofmedicalcollege}</CFormFeedback>
                )}
              </CCol>
              <CCol md={6}>
                <CFormLabel >Medical college name</CFormLabel>
                <Select1
                  value={CurrentData?.nameofmedicalcollege || ''}
                  onChange={(event) => handleFormChange(event, 'nameofmedicalcollege')}
                  variant="outlined"
                  invalid={!!errors.nameofmedicalcollege}
                  valid={!errors.nameofmedicalcollege && CurrentData?.nameofmedicalcollege}
                  options={medicalSchoolOptionsList}
                  placeholder="Name of Medical School"
                  label="Name of Medical School"
                  title="Name of Medical School"
                  isSearchable
                />
                {errors.nameofmedicalcollege && (
                  <CFormFeedback invalid>{errors.nameofmedicalcollege}</CFormFeedback>
                )}
              </CCol>
              {CurrentData?.['nameofmedicalcollege']?.['value'] === 'Others' && (
                <CCol md={6}>
                  <CFormLabel >Other Name</CFormLabel>
                  <CFormInput
                    type="text"
                    value={CurrentData?.nameofmedicalschoolother}
                    placeholder="Other Name"

                    invalid={!!errors.nameofmedicalschoolother}
                    valid={!errors.nameofmedicalschoolother && CurrentData?.nameofmedicalschoolother}
                    required
                    onChange={(event) => handleFormChange(event, 'nameofmedicalschoolother')}
                  />
                  {errors.nameofmedicalschoolother && (
                    <CFormFeedback invalid>{errors.nameofmedicalschoolother}</CFormFeedback>
                  )}
                </CCol>
              )}
              <CCol md={6}>
                <CFormLabel >Visa Status</CFormLabel>
                <CFormSelect value={CurrentData?.visastatus}
                  placeholder="Visa Status"
                  invalid={!!errors.visastatus}
                  valid={!errors.visastatus && CurrentData?.visastatus}
                  required
                  onChange={(event) => handleFormChange(event, 'visastatus')}>
                  <option value='required'>Required</option>
                  <option value='not required'>Not Required</option>
                </CFormSelect>
                {errors.visastatus && (
                  <CFormFeedback invalid>{errors.visastatus}</CFormFeedback>
                )}
              </CCol>
              <CCol md={12}>
                <CButton color="primary" type="button"
                  onClick={(event) => handleFormSubmit()}>
                  Add Lead Profile
                </CButton>
              </CCol>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>


    </CRow>
  )
}

export default Validation;
