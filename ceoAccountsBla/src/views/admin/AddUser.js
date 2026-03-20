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
  CToastBody,
  CToastClose,
  CToastHeader,
  CToaster,
  CRow,
} from '@coreui/react'
import { DatePicker} from "antd";
import dayjs from 'dayjs';
import Select1 from 'react-select';
import axios from 'axios';
import { useLoading } from '../../layout/LoadingContext';
import { DocsExample } from 'src/components'
import * as XLSX from "xlsx";

import { parsePhoneNumberFromString } from 'libphonenumber-js';
let AdminOptionsList=[];
const interestedin = [
    { value: 'rotation', label: 'Rotation' },
    { value: 'research', label: 'Research' },
    { value: 'match', label: 'Match' },
    { value: 'steps preparation', label: 'STEPs preparation' },
    { value: 'usmle guidance', label: 'USMLE guidance' },
    { value: 'interview preparations', label: 'Interview Preparations' },
  ];
const schools = [
    { value: "BLAEDU0001", label: "HS NADIHAL", zone: "BLA" },
    { value: "BLAEDU0002", label: "GHS DELINA", zone: "S.K" },
    { value: "BLAEDU0003", label: "HS KANISPORA", zone: "S.K" },
    { value: "BLAEDU0004", label: "HS BINNER", zone: "BLA" },
    { value: "BLAEDU0006", label: "HS KHAWAJA BAGH", zone: "BLA" },
    { value: "BLAEDU0008", label: "BHSS BARAMULLA", zone: "BLA" },
    { value: "BLAEDU0011", label: "HS SINGPORA (k)", zone: "S.K" },
    { value: "BLAEDU0014", label: "GHSS BARAMULLA", zone: "BLA" },
    { value: "BLAEDU0015", label: "ZEO SINGPORA KALAN", zone: "S.K" },
    { value: "BLAEDU0017", label: "ZEO BARAMULLA", zone: "BLA" },
    { value: "BLAEDU0020", label: "CEO BARAMULLA", zone: "BLA" },
    { value: "BLAEDU0022", label: "HS DEWAN BAGH", zone: "BLA" },
    { value: "BLAEDU0024", label: "GHS FATEGARH", zone: "FATEH" },
    { value: "BLAEDU0027", label: "CHS BARAMULLA", zone: "BLA" },
    { value: "BLAEDU0033", label: "HS FATEHPORA", zone: "S.K" },
    { value: "BLAEDU0036", label: "HSS DELINA", zone: "S.K" },
    { value: "BLAEDU0038", label: "HSS SINGPORA KALAN", zone: "S.K" },
    { value: "BLAEDU0039", label: "HS USHKARA", zone: "BLA" },
    { value: "BLAEDU0042", label: "HS CHAKLOO", zone: "BLA" },
    { value: "BLAEDU0043", label: "HS KITCHAMA", zone: "FATEH" },
    { value: "BLAEDU0044", label: "HS KHADNIYAR", zone: "BLA" },
    { value: "BLAEDU0046", label: "HSS TOWN BALA", zone: "BLA" },
    { value: "BLAEDU0047", label: "HS NAJIBHAT", zone: "S.K" },
    { value: "BLAEDU0048", label: "HS VOHLUTRA", zone: "BLA" },
    { value: "BLAEDU0049", label: "HS KATIANWALI", zone: "S.K" },
    { value: "BLAEDU0050", label: "HS JAHAMA", zone: "S.K" },
    { value: "BLAEDU0051", label: "HS SANGRI TOP", zone: "BLA" },
    { value: "BLAEDU0052", label: "HS HAJIBAL", zone: "BLA" },
    { value: "BONEDU0001", label: "HS SALAMABAD DACHINA", zone: "CHAND" },
    { value: "BONEDU0002", label: "HS TRIKANJAN", zone: "BONE" },
    { value: "BONEDU0003", label: "HSS PAHLIPORA", zone: "BONE" },
    { value: "BONEDU0004", label: "ZEO Boniyar", zone: "BONE" },
    { value: "BONEDU0005", label: "HS LACHIPORA", zone: "CHAND" },
    { value: "BONEDU0006", label: "HS BIMYAR", zone: "BONE" },
    { value: "BONEDU0007", label: "ZEO CHANDANWARI", zone: "CHAND" },
    { value: "BONEDU0008", label: "HS LIMBER", zone: "CHAND" },
    { value: "BONEDU0009", label: "HSS.BIJHAMA", zone: "CHAND" },
    { value: "BONEDU0010", label: "HSS BONIYAR", zone: "BONE" },
    { value: "BONEDU0011", label: "HS NOWSHERA", zone: "BONE" },
    { value: "BONEDU0012", label: "HS ZEHAMPORA", zone: "BONE" },
    { value: "BONEDU0013", label: "GHS NOORKHAH", zone: "CHAND" },
    { value: "BONEDU0014", label: "HS MUQAM PIRAN", zone: "CHAND" },
    { value: "BONEDU0015", label: "HS ZAMBOOR PATAN", zone: "CHAND" },
    { value: "BONEDU0016", label: "HS BERNATE", zone: "BONE" },
    { value: "BONEDU0017", label: "HS KHOSHMARG BAGNA", zone: "CHAND" },
    { value: "CDSEDU0001", label: "ZEO FATEGARH", zone: "FATEH" },
    { value: "CDSEDU0002", label: "HSS FATEGARH", zone: "FATEH" },
    { value: "CDSEDU0003", label: "HSS CHANDOOSA", zone: "CNDS" },
    { value: "CDSEDU0004", label: "HSS AUDOORA", zone: "FATEH" },
    { value: "CDSEDU0005", label: "HSS NOWGAM KANDI", zone: "CNDS" },
    { value: "CDSEDU0008", label: "HSS KACHWA MUQAM", zone: "WGR" },
    { value: "CDSEDU0009", label: "HS GOHAN", zone: "CNDS" },
    { value: "CDSEDU0010", label: "HSS LARRIDORA", zone: "FATEH" },
    { value: "CDSEDU0011", label: "ZEO CHANDOOSA", zone: "CNDS" },
    { value: "CDSEDU0012", label: "HS SULTANPORA KANDI", zone: "CNDS" },
    { value: "CDSEDU0013", label: "HS BANDI BALA", zone: "CNDS" },
    { value: "CDSEDU0014", label: "HS HUDPORA", zone: "S.K" },
    { value: "CDSEDU0015", label: "HS HEEWAN", zone: "FATEH" },
    { value: "CDSEDU0016", label: "HS DANDMOH", zone: "CNDS" },
    { value: "CDSEDU0017", label: "HS SHIRPORA", zone: "CNDS" },
    { value: "CDSEDU0018", label: "HS WALRAMAN", zone: "CNDS" },
    { value: "CDSEDU0019", label: "HS SHUMLARAN", zone: "CNDS" },
    { value: "CDSEDU0020", label: "HSS KHAITANGAN", zone: "S.K" },
    { value: "CDSEDU0021", label: "HS TARIPORA", zone: "FATEH" },
    { value: "CDSEDU0022", label: "GHS KAWHAR BALA", zone: "CNDS" },
    { value: "DWHEDU0001", label: "HSS BEHRAMPORA", zone: "DHGW" },
    { value: "DWHEDU0002", label: "GHS DANGIWACHA", zone: "DHGW" },
    { value: "DWHEDU0003", label: "HSS DANGIWACHA", zone: "DHGW" },
    { value: "DWHEDU0004", label: "ZEO DANGIWACHA", zone: "DHGW" },
    { value: "DWHEDU0005", label: "HSS CHATOOSA", zone: "DHGW" },
    { value: "DWHEDU0007", label: "HS HARDUCHANAM", zone: "DHGW" },
    { value: "DWHEDU0008", label: "HSS HADIPORA", zone: "ROH" },
    { value: "DWHEDU0009", label: "HS SOIN SYEDNAR", zone: "DHGW" },
    { value: "DWHEDU0010", label: "HS HIB DANGERPORA", zone: "DHGW" },
    { value: "DWHEDU0011", label: "HSS ZETHAN", zone: "DHGW" },
    { value: "DWHEDU0012", label: "HS HAMAM", zone: "DHGW" },
    { value: "DWHEDU0013", label: "GHS KANGROOSA", zone: "DHGW" },
    { value: "DWHEDU0015", label: "HS RAWOOCHA", zone: "DHGW" },
    { value: "KNZEDU0001", label: "HSS KUNZER", zone: "KNZ" },
    { value: "KNZEDU0002", label: "HSS Hardushoora", zone: "KNZ" },
    { value: "KNZEDU0003", label: "HSS TARHAMA", zone: "KNZ" },
    { value: "KNZEDU0005", label: "GHS KRALWETH", zone: "KNZ" },
    { value: "KNZEDU0006", label: "HS OGMUNA", zone: "KNZ" },
    { value: "KNZEDU0007", label: "HS KAWARHAMA", zone: "KNZ" },
    { value: "KNZEDU0008", label: "HSS LALPORA", zone: "KNZ" },
    { value: "KNZEDU0009", label: "HS DEVBUGH", zone: "KNZ" },
    { value: "KNZEDU0010", label: "ZEO KUNZER", zone: "KNZ" },
    { value: "KNZEDU0011", label: "HS YALL", zone: "NLP" },
    { value: "KNZEDU0012", label: "HS WAILOO", zone: "NLP" },
    { value: "KNZEDU0014", label: "HS DHOBIWAN", zone: "KNZ" },
    { value: "KNZEDU0015", label: "HS HARD ABOORA", zone: "KNZ" },
    { value: "KNZEDU0017", label: "GHS KUNZER", zone: "KNZ" },
    { value: "KNZEDU0018", label: "HS GOGALDARA", zone: "TMG" },
    { value: "KRIEDU0002", label: "GHS SHRAKWARA", zone: "WGR" },
    { value: "KRIEDU0003", label: "HSS NOWPORA", zone: "WGR" },
    { value: "KRIEDU0004", label: "BHSS WAGOORA", zone: "WGR" },
    { value: "KRIEDU0005", label: "ZEO WAGOORA", zone: "WGR" },
    { value: "KRIEDU0006", label: "HSS ATHOORA", zone: "WGR" },
    { value: "KRIEDU0007", label: "GHS KREERI", zone: "WGR" },
    { value: "KRIEDU0008", label: "HSS KREERI", zone: "WGR" },
    { value: "KRIEDU0010", label: "HSS BANDI PAYEEN", zone: "CNDS" },
    { value: "KRIEDU0011", label: "HS KALANTRA PAYEEN", zone: "WGR" },
    { value: "KRIEDU0012", label: "HS SALOOSA", zone: "WGR" },
    { value: "KRIEDU0014", label: "HSS SHEIKHPORA", zone: "WGR" },
    { value: "KRIEDU0015", label: "HS WATERGAM", zone: "WGR" },
    { value: "KRIEDU0016", label: "GHS WAGOORA", zone: "WGR" },
    { value: "KRIEDU0017", label: "HSS MANAGAM", zone: "WGR" },
    { value: "KRIEDU0019", label: "HS KAKAWATHAL", zone: "WGR" },
    { value: "KRIEDU0020", label: "HM HS Waripora Bala", zone: "NLP" },
    { value: "KRIEDU0021", label: "HS Vizer", zone: "WGR" },
    { value: "PTNEDU0002", label: "ZEO NEHALPORA", zone: "NLP" },
    { value: "PTNEDU0003", label: "GHS PATTAN", zone: "PTN" },
    { value: "PTNEDU0004", label: "HSS PALHALLAN", zone: "PTN" },
    { value: "PTNEDU0005", label: "HS HANJIWEERA PAYEEN", zone: "SP" },
    { value: "PTNEDU0006", label: "HS SINGPORA", zone: "SP" },
    { value: "PTNEDU0007", label: "HSS PATTAN", zone: "PTN" },
    { value: "PTNEDU0008", label: "ZEO SINGPORA PATTAN", zone: "SP" },
    { value: "PTNEDU0009", label: "ZEO PATTAN", zone: "PTN" },
    { value: "PTNEDU0011", label: "HSS MIRGUND", zone: "SP" },
    { value: "PTNEDU0012", label: "HS WANIGAM PAYEEN", zone: "NLP" },
    { value: "PTNEDU0013", label: "BHS ANDERGAM", zone: "PTN" },
    { value: "PTNEDU0015", label: "HSS G.K.QASIM", zone: "SP" },
    { value: "PTNEDU0017", label: "HSS TILGAM", zone: "NLP" },
    { value: "PTNEDU0020", label: "HSS HYGAM", zone: "SOP" },
    { value: "PTNEDU0021", label: "GHS SHIRPORA", zone: "PTN" },
    { value: "PTNEDU0022", label: "HS CHUKER", zone: "NLP" },
    { value: "PTNEDU0023", label: "HS DIVER", zone: "SP" },
    { value: "PTNEDU0025", label: "BHSS GOSHBUGH", zone: "PTN" },
    { value: "PTNEDU0026", label: "HSS SHEERABAD", zone: "SP" },
    { value: "PTNEDU0032", label: "BHS HAMRAY", zone: "PTN" },
    { value: "PTNEDU0033", label: "HS HANJIWIRA BALA", zone: "SP" },
    { value: "PTNEDU0034", label: "HSS AHMADPORA", zone: "SP" },
    { value: "PTNEDU0035", label: "BHS TANGPORA", zone: "PTN" },
    { value: "PTNEDU0036", label: "BHSS SULTAN PORA", zone: "PTN" },
    { value: "PTNEDU0037", label: "HS MAMOOSA", zone: "NLP" },
    { value: "PTNEDU0038", label: "BHS TAPER WARIPRA", zone: "PTN" },
    { value: "PTNEDU0039", label: "HS T.K BALA", zone: "SP" },
    { value: "PTNEDU0040", label: "HS MALMOH", zone: "SP" },
    { value: "PTNEDU0041", label: "HS ARCHANDERHAMA", zone: "SP" },
    { value: "PTNEDU0042", label: "HS SOUCH PAL PORA", zone: "NLP" },
    { value: "PTNEDU0044", label: "HSS NEHALPORA", zone: "NLP" },
    { value: "PTNEDU0045", label: "BHS ARAMPORA", zone: "SP" },
    { value: "PTNEDU0046", label: "HS MATIPORA", zone: "SP" },
    { value: "PTNEDU0048", label: "HS Checksari", zone: "NLP" },
    { value: "ROHEDU0001", label: "ZEO ROHAMA", zone: "ROH" },
    { value: "ROHEDU0002", label: "HSS KHAMOH", zone: "ROH" },
    { value: "ROHEDU0003", label: "HS ACHABAL", zone: "ROH" },
    { value: "ROHEDU0004", label: "GHS ROHAMA", zone: "ROH" },
    { value: "ROHEDU0005", label: "HS BALHAMA", zone: "ROH" },
    { value: "ROHEDU0007", label: "HSS SHUTLOO", zone: "BLA" },
    { value: "ROHEDU0008", label: "HSS DOABAGH", zone: "ROH" },
    { value: "ROHEDU0009", label: "GHS WATERGAM", zone: "DHGW" },
    { value: "ROHEDU0010", label: "HSS ROHAMA", zone: "ROH" },
    { value: "ROHEDU0011", label: "HS LADU LADOORA", zone: "ROH" },
    { value: "ROHEDU0012", label: "HS SARIPORA", zone: "ROH" },
    { value: "ROHEDU0013", label: "HS SAILKOTE", zone: "ROH" },
    { value: "ROHEDU0014", label: "HS BRAMAN", zone: "ROH" },
    { value: "ROHEDU0015", label: "BHS TRAGPORA ROHAMA", zone: "ROH" },
    { value: "ROHEDU0016", label: "HS PANZALLA", zone: "ROH" },
    { value: "ROHEDU0017", label: "GHS Ladoora", zone: "ROH" },
    { value: "SPREDU0002", label: "HS DUROO", zone: "DNG" },
    { value: "SPREDU0003", label: "GHS BOMAI", zone: "DNG" },
    { value: "SPREDU0004", label: "GHS ARAMPORA", zone: "SOP" },
    { value: "SPREDU0006", label: "GHS HATHISHAH", zone: "SOP" },
    { value: "SPREDU0011", label: "HSS ZALOORA", zone: "DNG" },
    { value: "SPREDU0013", label: "HS SEELOO", zone: "DNG" },
    { value: "SPREDU0026", label: "DIET SOPORE", zone: "DNG" },
    { value: "SPREDU0015", label: "BHS NOWPORA", zone: "SOP" },
    { value: "SPREDU0016", label: "BHS JAMIA QADEEM", zone: "SOP" },
    { value: "SPREDU0018", label: "BHS BABA YOUSUF", zone: "SOP" },
    { value: "SPREDU0019", label: "ZEO DANGERPORA", zone: "DNG" },
    { value: "SPREDU0022", label: "BHSS SOPORE", zone: "SOP" },
    { value: "SPREDU0024", label: "BHS TAKIYABAL", zone: "SOP" },
    { value: "SPREDU0025", label: "GHSS SOPORE", zone: "SOP" },
    { value: "SPREDU0027", label: "BHS CHANKHAN", zone: "SOP" },
    { value: "SPREDU0028", label: "ZEO SOPORE", zone: "SOP" },
    { value: "SPREDU0029", label: "HS SHIVA", zone: "DNG" },
    { value: "SPREDU0030", label: "HSS BOMAI", zone: "DNG" },
    { value: "SPREDU0031", label: "BHS SEER JAGIR", zone: "SOP" },
    { value: "SPREDU0033", label: "HS RAMPORA", zone: "DNG" },
    { value: "SPREDU0034", label: "BHS SANGRAMA", zone: "SOP" },
    { value: "SPREDU0036", label: "GHS Doabgah", zone: "ROH" },
    { value: "SPREDU0039", label: "HSS DANGERPORA", zone: "DNG" },
    { value: "SPREDU0040", label: "HS AMARGARH", zone: "SOP" },
    { value: "SPREDU0041", label: "BHS TARZOO PANZPORA", zone: "SOP" },
    { value: "SPREDU0042", label: "HS TUJJAR", zone: "DNG" },
    { value: "SPREDU0043", label: "HS BRATH KALAN", zone: "DNG" },
    { value: "SPREDU0044", label: "HS REBAN", zone: "ROH" },
    { value: "SPREDU0045", label: "HS WARPORA", zone: "DNG" },
    { value: "SPREDU0048", label: "HSS BOTINGOO", zone: "DNG" },
    { value: "SPREDU0049", label: "HS SAGIPORA", zone: "DNG" },
    { value: "SPREDU0050", label: "HS RADAYGAM", zone: "SOP" },
    { value: "SPREDU0051", label: "HS CHOORA", zone: "SOP" },
    { value: "SPREDU0052", label: "HS HARWAN", zone: "DNG" },
    { value: "SPREDU0053", label: "HS HATHLANGOO", zone: "DNG" },
    { value: "SPREDU0054", label: "HS ADIPORA", zone: "DNG" },
    { value: "SPREDU0055", label: "GHS TARZOO", zone: "SOP" },
    { value: "SPREDU0056", label: "HS YEMBERZALWARI", zone: "DNG" },
    { value: "SPREDU0057", label: "HS WADOORA PAYEEN", zone: "DNG" },
    { value: "SPREDU0058", label: "HS Saidpora", zone: "DNG" },
    { value: "TMGEDU0002", label: "ZEO TANGMARG", zone: "TMG" },
    { value: "TMGEDU0003", label: "HSS CHANDILORA", zone: "TMG" },
    { value: "TMGEDU0005", label: "GHS CHANDILORA", zone: "TMG" },
    { value: "TMGEDU0010", label: "HS CHANDIL WANIGAM", zone: "TMG" },
    { value: "TMGEDU0011", label: "HS FEROZPORA", zone: "TMG" },
    { value: "TMGEDU0017", label: "HS WARPORA (TANGMARG)", zone: "TMG" },
    { value: "TMGEDU0021", label: "HS PATIHEER TANGMARG", zone: "TMG" },
    { value: "TMGEDU0023", label: "HS HARDU MADAM", zone: "TMG" },
    { value: "TMGEDU0024", label: "HS CHANTI PATHRI", zone: "TMG" },
    { value: "TMGEDU0025", label: "HS KATIPORA", zone: "TMG" },
    { value: "TMGEDU0026", label: "HSS KHAIPORA", zone: "TMG" },
    { value: "TMGEDU0027", label: "HS SIKH KHANIMA", zone: "TMG" },
    { value: "URIEDU0001", label: "HS ISHAM", zone: "JULLA" },
    { value: "URIEDU0003", label: "HSS GINGAL", zone: "CHAND" },
    { value: "URIEDU0007", label: "HSS NAMBLA", zone: "URI" },
    { value: "URIEDU0008", label: "ZEO JHULLAH", zone: "JULLA" },
    { value: "URIEDU0011", label: "HS KANDI KALLER", zone: "URI" },
    { value: "URIEDU0013", label: "GHSS URI", zone: "URI" },
    { value: "URIEDU0017", label: "HS BALKOTE", zone: "URI" },
    { value: "URIEDU0019", label: "HS DHANI SYEDIAN", zone: "CHAND" },
    { value: "URIEDU0020", label: "ZEO URI", zone: "URI" },
    { value: "URIEDU0021", label: "HSS SALAMABAD", zone: "JULLA" },
    { value: "URIEDU0026", label: "HS KAMALKOTE URI", zone: "JULLA" },
    { value: "URIEDU0030", label: "BHSS URI", zone: "URI" },
    { value: "URIEDU0031", label: "GHS BANDI KAMALKOTE", zone: "JULLA" },
    { value: "URIEDU0032", label: "HS GOHALLAN", zone: "JULLA" },
    { value: "URIEDU0033", label: "HS PARINPILLAN", zone: "JULLA" },
    { value: "URIEDU0035", label: "HS DARDKOTE", zone: "JULLA" },
    { value: "URIEDU0036", label: "BHS SHAHDARA", zone: "JULLA" },
    { value: "URIEDU0038", label: "HS GOWALTA URI", zone: "JULLA" },
    { value: "URIEDU0039", label: "HSS SULTANDAKI", zone: "JULLA" },
];
const Validation =  () => {
const [errors, seterrors] = useState(false)
const [CurrentData, setCurrentData] = useState({})
const [ActionResult, setActionResult] = useState({})
const [medicalSchoolOptionsList, setMedicalSchoolOptionsList] = useState([]);
const { showLoading, hideLoading,firestoreQueries,DatabaseName } = useLoading();
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
    const SettingsGot=await firestoreQueries.FetchDataFromCollection(DatabaseName, "settings", 100, "sid", "==", 1);
    if(SettingsGot.length)
    {
      console.log("SettingsGot[0]====>",SettingsGot[0])
      //setCurrentData(SettingsGot[0])
    }
    //setAdminList()

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
    console.log("event====>",event)
    console.log("value====>",value)
    if(name==="step1result" && value==="not taken")
    {
      setCurrentData((prevValues) => ({
    ...prevValues,
    step2ckresult: value,
    step3ckresult: value,
  }));
    }
    setCurrentData((prevValues) => ({
    ...prevValues,
    [name]: value,
  }));
  }
  const formValidate = async()=>
  {
    const errors = {};
     console.log("CurrentData====> ",CurrentData)
    if(typeof CurrentData?.ddocode?.value==="undefined")
    {
    	errors.ddocode="Please Select DDO.";
    }
    if(!CurrentData.email)
    {
    	errors.email="Please Enter Student Email.";
    }
    else if(CurrentData.email && !validateEmail(CurrentData.email))
    {
    	errors.email="Please Enter A Valid Student Email.";
    }
    if(!CurrentData.password)
    {
    	errors.password="Please Enter Password.";
    }



    return errors;
  }
  const isGoogleSheetUrl = (url) =>
  {
    const googleSheetRegex = /https:\/\/docs\.google\.com\/spreadsheets\/d\/[a-zA-Z0-9-_]+/;
    return googleSheetRegex.test(url);
  };
  const validateEmail = (email) =>
	{
  		const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  		return regex.test(email);
	};

	const validatePhoneNumber = (phoneNumber,countrycode) => {
    // List of possible phone number lengths for different countries (excluding country code)
    const validLengths = [7, 8, 9, 10, 11, 12, 13, 14];

    // Remove all non-digit characters from the input
    const cleanedNumber = phoneNumber.replace(/\D/g, '');
    // Check if the length of the cleaned number is valid
    if (!validLengths.includes(cleanedNumber.length)) {
      return false;
    }

    try {
      // Use a dummy country code 'US' for parsing the number as libphonenumber-js requires a country code
      const parsedNumber = parsePhoneNumberFromString(cleanedNumber, countrycode);
      return parsedNumber && parsedNumber.isValid();

    } catch (e) {
      return false;
    }
  };
  const handleExcelUpload = async (event) => 
  {
  const file = event.target.files[0];
  if (!file) return;

  showLoading();

  const reader = new FileReader();

  reader.onload = async (e) => {

    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    console.log("Excel rows:", jsonData);

    await processBulkUsers(jsonData);

    hideLoading();
  };

  reader.readAsArrayBuffer(file);
};
const processBulkUsers = async (rows) => {
console.log("rows---->",rows)
  for (const row of rows) {

    try {

      const lowerCaseEmail = row.email.toLowerCase();

      const createUserRes = await axios.post(
        "https://us-central1-ceoaccountsbla.cloudfunctions.net/createUser",
        {
          StudentEmail: lowerCaseEmail,
          password: row.Password,
          StudentName: row["Name of the School"],
        }
      );

      const uid = createUserRes.data.data.uid;

      const firestoreData = {
        uid: uid,
        email: lowerCaseEmail,
        name: row["NameoftheSchool"],
        id:uid,
        ddocode: row.UDISE,
        role: "ZONELEVEL",
        userType: "zonelevel",
        zone: row["ZONE"],
        village: row["VILLAGENAME"],
        panchayat: row["PANCHAYATNAME"],
        tehsil: row.TEHSIL,
        listoflinks:{[row.UDISE]:row.UDISE},
        cluster: row.CLUSTER,
        createTime: firestoreQueries.Timestamp.fromDate(new Date()),
        updateTime: firestoreQueries.Timestamp.fromDate(new Date()),
      };

      await firestoreQueries.updateOrCreateById(
        DatabaseName,
        "users",
        uid,
        firestoreData
      );

      console.log("Created:", row.email);

    } catch (error) {

      console.log("User exists:", row.email);

      const uid = error?.response?.data?.user?.uid;

      if (uid) {

        await firestoreQueries.updateOrCreateById(
          DatabaseName,
          "users",
          uid,
          {
            email: row.email,
            name: row["Name of the School"],
            ddocode: row.UDISE,
          }
        );
      }
    }
  }

  alert("Bulk users imported successfully");
};
  const handleFormSubmit = async () =>
  {
    showLoading()
    const validationErrors = await formValidate();
    console.log("validationErrors====> ",validationErrors)
    seterrors(validationErrors);
     if (Object.keys(validationErrors).length === 0)
     {
       CurrentData.createTime=firestoreQueries.Timestamp.fromDate(new Date());
       CurrentData.updateTime=firestoreQueries.Timestamp.fromDate(new Date());
       CurrentData.sid=1;
        const lowerCaseEmail = CurrentData.email.toLowerCase();
         let dataTobesend = {
            ddocode: CurrentData.ddocode.value,
            name: CurrentData.ddocode.label,
            email: lowerCaseEmail,
            columntoverify:[1],
            zone: CurrentData.ddocode.zone,
            role: "DDO",
            userType:"district",
            listoflinks: { [CurrentData.ddocode.value]: CurrentData.ddocode.value },
          };
        try {
            // Post request to create a new user

            const response = await axios.post('https://us-central1-ceoaccountsbla.cloudfunctions.net/createUser', { StudentEmail: lowerCaseEmail, password:CurrentData.password, StudentName: '' });
            console.log("response---->",response)
            console.log("response---->",dataTobesend)
            let uid = response.data.data.uid; // Get the generated uid
            dataTobesend['uid'] = uid;
            const CheckUserAlready=await firestoreQueries.FetchDataFromCollection(DatabaseName, "users", 400, "ddocode", "==", CurrentData.ddocode.value);
             if(CheckUserAlready.length)
             {
                await firestoreQueries.deleteDocumentsByField(DatabaseName, "users", "ddocode",CurrentData.ddocode.value)
             }
            await firestoreQueries.updateOrCreateById(DatabaseName, "users",  uid, dataTobesend);
            const exampleToast = (
    <CToast title="CoreUI for React.js">
      <CToastHeader closeButton>
        <svg
          className="rounded me-2"
          width="20"
          height="20"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
          focusable="false"
          role="img"
        >
          <rect width="100%" height="100%" fill="#007aff"></rect>
        </svg>
        <strong className="me-auto">{response.data.status}</strong>
        <small></small>
      </CToastHeader>
      <CToastBody>Successfully Created</CToastBody>
    </CToast>
  )
       // setActionResult(result)
       setCurrentData({});
        addToast(exampleToast)
        hideLoading()
          } catch (error) {
          console.log("error---->",error)
            // Handle existing user case
            let uid = error.response?.data?.user?.uid; // Use optional chaining to handle cases without a uid

            dataTobesend['uid'] = uid;
            // Add link for existing user
            if (uid) {
              let updateData = { listoflinks: { [CurrentData.ddocode.value]: CurrentData.ddocode.value } };
              let res12=await firestoreQueries.updateOrCreateById(DatabaseName, "users",  uid, dataTobesend);
            }
            setCurrentData({});
            const exampleToast = (
    <CToast title="CoreUI for React.js">
      <CToastHeader closeButton>
        <svg
          className="rounded me-2"
          width="20"
          height="20"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
          focusable="false"
          role="img"
        >
          <rect width="100%" height="100%" fill="#007aff"></rect>
        </svg>
        <strong className="me-auto">Error</strong>
        <small></small>
      </CToastHeader>
      <CToastBody>User Already Exists</CToastBody>
    </CToast>
  )
        setActionResult({status:"error",message:"User Already Exists."})
        addToast(exampleToast)
         hideLoading()
          }

     }
     else
     {
       hideLoading()
     }
  }

  return (
  <>
  <CRow>

      <CCol xs={12}>
        <CCard className="mb-4">
         <CToaster ref={toaster} push={toast} placement="top-end" />
          <CCardHeader>
            <strong>User</strong> <small>Bulk Addition</small>
          </CCardHeader>
          <CCardBody>
            <p className="text-body-secondary small">
            </p>
              <CForm className="row g-3 needs-validation">
              <CCol md={12}>
  <CFormLabel>Import Excel</CFormLabel>
  <CFormInput
    type="file"
    accept=".xlsx,.xls"
    onChange={handleExcelUpload}
  />
</CCol>
</CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
    <CRow>

      <CCol xs={12}>
        <CCard className="mb-4">
         <CToaster ref={toaster} push={toast} placement="top-end" />
          <CCardHeader>
            <strong>User</strong> <small>Addition</small>
          </CCardHeader>
          <CCardBody>
            <p className="text-body-secondary small">
            </p>
              <CForm className="row g-3 needs-validation">
              
              <CCol md={6}>
                <CFormLabel >DDO Code</CFormLabel>
                <Select1
        value={CurrentData.ddocode || ''}
        onChange={(event) => handleFormChange(event,'ddocode')}
        options={schools}
        placeholder="DDO Code"
        isSearchable
      />


                {errors.ddocode && (
                      <CFormFeedback invalid>{errors.ddocode}</CFormFeedback>
                  )}
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="validationServer01">Email Address</CFormLabel>
                <CFormInput
                    type="text"
                    placeholder="Email Address"
                    value={CurrentData?.email || ''}
                    invalid={!!errors.email} // Set `invalid` if there's an error
                    valid={!errors.email && !!CurrentData?.email} // Set `valid` if no error and value exists
                    required
                    onChange={(event) => handleFormChange(event,'email' )}
                />
                {errors.email && (
                      <CFormFeedback invalid>{errors.email}</CFormFeedback>
                  )}
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="validationServer01">Password</CFormLabel>
                <CFormInput
                    type="text"
                    placeholder="Password"
                    value={CurrentData?.password || ''}
                    invalid={!!errors.password} // Set `invalid` if there's an error
                    valid={!errors.email && !!CurrentData?.password} // Set `valid` if no error and value exists
                    required
                    onChange={(event) => handleFormChange(event,'password' )}
                />
                {errors.password && (
                      <CFormFeedback invalid>{errors.password}</CFormFeedback>
                  )}
              </CCol>





                <CCol xs={12}>
                  <CButton color="primary" type="button"
                   onClick={(event) => handleFormSubmit()}
                   >

                    Add User
                  </CButton>
                </CCol>
              </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
    </>
  )
}

export default Validation
