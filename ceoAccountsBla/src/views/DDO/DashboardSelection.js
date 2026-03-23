import React, { useEffect, useState,useRef } from 'react';
import { Link,useParams } from 'react-router-dom';
import {
  CCard, CCardBody, CCardHeader, CCol, CTable, CTableBody, CTableDataCell,CFormSelect,
  CTableHead, CFormInput, CTableHeaderCell, CTableRow, CButton, CAlert, CNav, CNavItem, CNavLink, CTabContent, CTabPane
} from '@coreui/react';
import axios from 'axios';
import { gapi } from "gapi-script";
import * as XLSX from 'xlsx';
import { useLoading } from '../../layout/LoadingContext';
let sheetName="";
let sheetID="";
let dataShown=[];
let SubmissionIsOver=false;
const GoogleSheetTable = ({ ActualUser, AuthUser }) => {

  return (
  <CCol xs={12}>
    <CCard className="mb-4">
      <CCardHeader>
        <strong>Selection Which Section Information You Have To Add/Update</strong>
      </CCardHeader>
      <CCardBody>
       <div className="mb-3 d-flex gap-3 flex-wrap">
  <a href="/ddo/adddata/accountssection" className="btn btn-outline-primary">Account Section</a>
  <a href="/ddo/adddata/nonteachingsection" className="btn btn-outline-primary">Non-Teaching Section</a>
  <a href="/ddo/adddata/teachingsection" className="btn btn-outline-primary">Teaching Section</a>
  <a href="/ddo/adddata/gazettedsection" className="btn btn-outline-primary">Gazetted Section</a>
</div>
      </CCardBody>
    </CCard>
  </CCol>
);
};

export default GoogleSheetTable;
