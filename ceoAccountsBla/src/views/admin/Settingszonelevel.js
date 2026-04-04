import React, { useState, useEffect, useRef } from 'react';
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormLabel,
  CFormInput,
  CFormFeedback,
  CFormSelect,
  CToaster,
  CToast,
  CToastBody,
  CToastHeader,
  CRow,
} from '@coreui/react';
import { DatePicker } from 'antd';
import { Link,useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import axios from 'axios';
import { useLoading } from '../../layout/LoadingContext';

const Validation = ({ ActualUser, AuthUser }) => {
console.log("ActualUser---->",ActualUser)
console.log("AuthUser---->",AuthUser)
  const [errors, setErrors] = useState({});
  const [CurrentData, setCurrentData] = useState({});
  const [SheetNameList, setSheetNameList] = useState([]);
  const { showLoading, hideLoading, API_KEY, DatabaseName, firestoreQueries } = useLoading();
  const [toast, setaddToast] = useState(0)
  const toaster = useRef();
  const { zoneddocode } = useParams();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const SettingsGot = await firestoreQueries.FetchDataFromCollection(DatabaseName, 'settings', 1000, 'settingtype', '==', zoneddocode);
    if (SettingsGot.length) {
      setCurrentData(SettingsGot[0]);
      console.log("SettingsGot[0].sheetname---->",SettingsGot[0].sheetname)
      if(Object.keys(SettingsGot[0].sheetname).length)
      {
        setSheetNameList(Object.values(SettingsGot[0].sheetname));
      }
    }
  };

  const extractSheetID = (url) => {
    const regex = /https:\/\/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const handleFormChange = async (event, name = '', nameindex = null) => {
    let value;
    if (name === 'columntoverify') {
      value = Array.from(event.target.selectedOptions, (option) => option.value);
    } else if (event.target) {
      value = event.target.value;
    } else if (event.$d) {
      value = firestoreQueries.Timestamp.fromDate(new Date(event.toLocaleString('en-GB', { timeZone: 'GMT' })));
    } else {
      value = event.label || event?.[0]?.label || event;
    }

    if (name === 'sheeturl') {
      showLoading();
      try {
                setCurrentData((prev) => ({
        ...prev,
        [name]: value,
      }));
        const Sheetid = extractSheetID(value);
        const response = await axios.get(`https://sheets.googleapis.com/v4/spreadsheets/${Sheetid}?key=${API_KEY}`);
        const sheetNames = response.data.sheets.map((sheet) => sheet.properties.title);
        console.log("sheetNames----->",sheetNames)
        setSheetNameList(sheetNames);
        setCurrentData((prev) => ({
          ...prev,
          sheetname: sheetNames.reduce((acc, title, index) => ({ ...acc, [index]: title }), {}),
        }));

      } catch (error) {
        console.error("Error fetching sheets:", error);
      }
      hideLoading();
    } else if (nameindex !== null) {
      setCurrentData((prev) => ({
        ...prev,
        [name]: {
          ...prev[name],
          [nameindex]: value,
        },
      }));
    } else {
      setCurrentData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const formValidate = async () => {
    const errors = {};
    if (!CurrentData.sheeturl) errors.sheeturl = 'Please Enter Google Sheet URL.';
    else if (!isGoogleSheetUrl(CurrentData.sheeturl)) errors.sheeturl = 'Please Enter A Valid Google Sheet URL.';

    if (!CurrentData.sheetname) errors.sheetname = 'Please Select Sheet Name.';
    if (!CurrentData.headerrows) errors.headerrows = 'Please Select Header Rows.';
    if (!CurrentData.labelcolumn) errors.labelcolumn = 'Please Select Label Column.';
    return errors;
  };

  const isGoogleSheetUrl = (url) => {
    const googleSheetRegex = /https:\/\/docs\.google\.com\/spreadsheets\/d\/[a-zA-Z0-9-_]+/;
    return googleSheetRegex.test(url);
  };

  const handleFormSubmit = async () => {
    showLoading();
    const validationErrors = await formValidate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
    console.log("CurrentData->",CurrentData)
    let tempCurrent = { ...CurrentData };

  // Loop through columntoverify to find keys with "ignore" value and delete from each related object
  Object.entries(tempCurrent?.columntoverify || {}).forEach(([key, value]) => {
  console.log("key---->",key)
  console.log("value---->",value)
  const str=value.toString();
    if (str.includes( "ignore")) 
    {
    	console.log("tempCurrent---->",tempCurrent)
      	delete tempCurrent.columntoverify[key];
      	delete tempCurrent.headerrows?.[key];
      	delete tempCurrent.sheetname?.[key];
    }
  });
  setCurrentData(tempCurrent);
      const dataToSave = {
        ...tempCurrent,
        columntoverify:[1],
        createTime: firestoreQueries.Timestamp.fromDate(new Date()),
        updateTime: firestoreQueries.Timestamp.fromDate(new Date()),
        sid: 3,
      };
     /*let result1= await firestoreQueries.deleteFieldWithCondition(DatabaseName, 'settings', "columntoverify",'sid', '==', 3);
      let result2= await firestoreQueries.deleteFieldWithCondition(DatabaseName, 'settings', "headerrows",'sid', '==', 3);
      let result3=await firestoreQueries.deleteFieldWithCondition(DatabaseName, 'settings', "labelcolumn",'sid', '==', 3);
      let result4=await firestoreQueries.deleteFieldWithCondition(DatabaseName, 'settings', "sheetname",'sid', '==', 3);
      console.log("result1----->",result1)
      console.log("result2----->",result2)
      console.log("result3----->",result3)
      console.log("result4----->",result4)*/
      const result = await firestoreQueries.updateOrCreateByField(DatabaseName, 'settings','settingtype', '==', zoneddocode, dataToSave);

      addToast({
        status: result.status,
        message: result.message,
      });
      hideLoading();
    } else {
      hideLoading();
    }
  };

  const addToast = (message) => {
    const exampleToast = (
      <CToast title="CoreUI for React.js">
        <CToastHeader closeButton>
          <svg className="rounded me-2" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="#007aff"></rect>
          </svg>
          <strong className="me-auto">{message.status}</strong>
        </CToastHeader>
        <CToastBody>{message.message}</CToastBody>
      </CToast>
    );
    setaddToast(exampleToast)
   // toaster.current.push(exampleToast);
  };

  function numberToAlphabet(num) {
    let result = '';
    while (num > 0) {
      num--;
      result = String.fromCharCode((num % 26) + 65) + result;
      num = Math.floor(num / 26);
    }
    return result;
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CToaster ref={toaster} placement="top-end" />
          <CToaster ref={toaster} push={toast} placement="top-end" />
          <CCardHeader>
            <strong>Lead</strong> <small>Addition</small>
          </CCardHeader>
          <CCardBody>
            <CCol md={12}>
              <CFormLabel>Google Sheet URL</CFormLabel>
              <CFormInput
                type="text"
                placeholder="Google Sheet URL"
                value={CurrentData.sheeturl || ''}
                invalid={!!errors.sheeturl}
                valid={!errors.sheeturl && !!CurrentData.sheeturl}
                required
                onChange={(event) => handleFormChange(event, 'sheeturl')}
              />
              {errors.sheeturl && <CFormFeedback invalid>{errors.sheeturl}</CFormFeedback>}
            </CCol>

            {SheetNameList.map((SheetName, index) => (
              <div className="SectionSele row" key={index}>
                <CCol md={6}>
                  <CFormLabel>Sheet Name</CFormLabel>
                  <CFormInput
                    type="text"
                    value={CurrentData.sheetname?.[index] || SheetName}
                    invalid={!!errors.sheetname?.[index]}
                    valid={!errors.sheetname?.[index] && !!CurrentData.sheetname?.[index]}
                    disabled
                    onChange={(event) => handleFormChange(event, 'sheetname', index)}
                  />
                  {errors.sheetname?.[index] && <CFormFeedback invalid>{errors.sheetname?.[index]}</CFormFeedback>}
                </CCol>
                <CCol md={6}>
                  <CFormLabel>Consider Or Not</CFormLabel>
                  <CFormSelect

                    kkkk={CurrentData.columntoverify?.[index]}
                    value={CurrentData.columntoverify?.[index] || ''}
                    onChange={(event) => handleFormChange(event, 'columntoverify', index)}
                  >
                    <option value="">=Select=</option>
                    <option value="ignore">Ignore This Sheet</option>
                   {/* {Array.from({ length: 100 }, (_, i) => (
                      <option key={i} value={i + 1}>
                        {numberToAlphabet(i + 1)}
                      </option>
                    ))}*/}
                  </CFormSelect>
                </CCol>
                <CCol md={6}>
                <CFormLabel >Header Rows</CFormLabel>
                <CFormSelect  value={CurrentData?.headerrows?.[index]}
                    placeholder="Header Rows"
                    invalid={!!errors.headerrows?.[index]} // Set `invalid` if there's an error
                    valid={!errors.headerrows?.[index] && !!CurrentData?.headerrows?.[index]} // Set `valid` if no error and value exists
                    required
                    onChange={(event) => handleFormChange(event,'headerrows',index )}>
                    <option value=''>Select</option>
                    <option value='1'>1</option>
                    <option value='2'>2</option>
                    <option value='3'>3</option>
                    <option value='4'>4</option>
                    <option value='5'>5</option>
                    <option value='6'>6</option>
                    <option value='7'>7</option>
                    <option value='8'>8</option>
                  </CFormSelect>

                {errors.headerrows?.[index] && (
                      <CFormFeedback invalid>{errors.headerrows?.[index]}</CFormFeedback>
                  )}
              </CCol>
               <CCol md={6}>
                <CFormLabel>Column As Label</CFormLabel>
                <CFormSelect  value={CurrentData?.labelcolumn?.[index]}
                    placeholder="Header Rows"
                    invalid={!!errors.labelcolumn?.[index]} // Set `invalid` if there's an error
                    valid={!errors.labelcolumn?.[index] && !!CurrentData?.labelcolumn?.[index]} // Set `valid` if no error and value exists
                    required
                    onChange={(event) => handleFormChange(event,'labelcolumn',index )}>
                    <option value=''>Select</option>
                    <option value='1'>1</option>
                    <option value='2'>2</option>
                    <option value='3'>3</option>
                    <option value='4'>4</option>
                    <option value='5'>5</option>
                    <option value='6'>6</option>
                    <option value='7'>7</option>
                    <option value='8'>8</option>
                  </CFormSelect>

                {errors.labelcolumn?.[index] && (
                      <CFormFeedback invalid>{errors.labelcolumn?.[index]}</CFormFeedback>
                  )}
              </CCol>
              </div>
            ))}
            <CCol md={12} className="mt-4">
          <CCol md={6}>
                <CFormLabel >Valid Till(Expiry)</CFormLabel>
                <DatePicker className="DatePicker"
        value={CurrentData?.expiry?dayjs(CurrentData?.expiry?.toDate().toISOString()):null}
        onChange={(event) => handleFormChange(event,'expiry' )}
        dateFormat="dd/mm/yyyy" // Customize date format as needed
        scrollableYearDropdown  // Make year dropdown scrollable
         yearDropdownItemNumber={4}
         picker="date"
          label="Valid Till(Expiry)"
  		variant="outlined"
      />

                {errors.leadowner && (
                      <CFormFeedback invalid>{errors.leadowner}</CFormFeedback>
                  )}
              </CCol>
            <CCol xs={12} className="mt-4">
              <CButton color="primary" onClick={handleFormSubmit}>
                Add Settings
              </CButton>
            </CCol>
            </CCol>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default Validation;
