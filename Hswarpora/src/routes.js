import React from 'react'

const Login = React.lazy(() => import('./views/pages/login/Login'))


const Settings = React.lazy(() => import('./views/superadmin/Settings'))
const AddClass = React.lazy(() => import('./views/superadmin/AddClass'))
const ClassSubjectMaping = React.lazy(() => import('./views/superadmin/ClassSubjectMaping'))
const ListClasses = React.lazy(() => import('./views/superadmin/ListClasses'))
const ListExamination = React.lazy(() => import('./views/superadmin/ListExamination'))
const ListTeachers = React.lazy(() => import('./views/superadmin/ListTeachers'))
const CurrentYear = React.lazy(() => import('./views/superadmin/CurrentYear'))
const AddTeacher = React.lazy(() => import('./views/superadmin/AddTeacher'))
const AddExams = React.lazy(() => import('./views/superadmin/AddExams'))
const ListDdos = React.lazy(() => import('./views/superadmin/ListDdos'))
const AddUser = React.lazy(() => import('./views/superadmin/AddUser'))
const ViewUsers = React.lazy(() => import('./views/superadmin/ViewUsers'))
const ImportExcel = React.lazy(() => import('./views/superadmin/ImportExcel'))
const MarksSheet = React.lazy(() => import('./views/superadmin/MarksSheet'))
const FindResult = React.lazy(() => import('./views/superadmin/FindResult'))
const GenerateMS = React.lazy(() => import('./views/superadmin/GenerateMS'))
const GenerateMarksCard = React.lazy(() => import('./views/superadmin/GenerateMarksCard'))


const ChangePassword = React.lazy(() => import('./views/admin/ChangePassword'))
const AddLead = React.lazy(() => import('./views/admin/AddLead'))
const AddResult = React.lazy(() => import('./views/admin/AddResult'))
const AddStudent = React.lazy(() => import('./views/admin/AddStudent'))
const Progression = React.lazy(() => import('./views/admin/Progression'))
const ViewLeads = React.lazy(() => import('./views/admin/ViewLeads'))
const UpdateLead = React.lazy(() => import('./views/admin/UpdateLead'))



const routes = {"public":[
  { path: '/login', name: 'Login', element: Login },
  {path: '/results/findresult/:yearPar?/:classPar?/:studentPar?', name: 'FindResult',exact: true, element: FindResult},
],
"SuperAdmin":[

  {path: '/admin/importexcel', name: 'ImportExcel',exact: true, element: ImportExcel},
  {path: '/superadmin/addteacher/:cid', name: 'AddTeacher',exact: true, element: AddTeacher},
  {path: '/superadmin/addexams/:cid', name: 'AddExams',exact: true, element: AddExams},
  {path: '/admin/addresult/:tid/:currentyearget?', name: 'AddResult',exact: true, element: AddResult },
  {path: '/admin/progression/', name: 'Progression',exact: true, element: Progression },
  {path: '/admin/addstudent/', name: 'AddStudent',exact: true, element: AddStudent },
  {path: '/superadmin/classsubjectmaping/', name: 'ClassSubjectMaping',exact: true, element: ClassSubjectMaping},
  {path: '/superadmin/list/classes', name: 'ListClasses',exact: true, element: ListClasses},
  {path: '/superadmin/list/exams', name: 'ListExamination',exact: true, element: ListExamination},
  {path: '/superadmin/list/teachers', name: 'ListTeachers',exact: true, element: ListTeachers},
  {path: '/superadmin/changeyear', name: 'CurrentYear',exact: true, element: CurrentYear},
  {path: '/admin/leads/viewleads', name: 'ViewLeads',exact: true, element: ViewLeads},
  {path: '/admin/adduser', name: 'Final',exact: true, element: AddUser},
  {path: '/admin/viewusers', name: 'ViewUsers',exact: true, element: ViewUsers},
  {path: '/admin/leads/updatelead/:leadid', name: 'UpdateLead',exact: true, element: UpdateLead},
  {path: '/superadmin/results/markssheet', name: 'MarksSheet',exact: true, element: MarksSheet},
  {path: '/results/findresult/:yearPar?/:classPar?/:studentPar?', name: 'FindResult',exact: true, element: FindResult},
  {path: '/results/markscard/:yearPar?/:classPar?/:studentPar?', name: 'GenerateMarksCard',exact: true, element: GenerateMarksCard},
  {path: '/superadmin/results/markssheetg', name: 'GenerateMS',exact: true, element: GenerateMS},
],
"Teacher":[
{ path: '/admin/changepassword', name: 'ChangePassword',exact: true, element: ChangePassword },
{ path: '/admin/addresult/:tid/:currentyearget?', name: 'AddResult',exact: true, element: AddResult },
{ path: '/admin/addresult/', name: 'AddResult',exact: true, element: AddResult },
{ path: '/admin/progression/', name: 'Progression',exact: true, element: Progression },
{ path: '/admin/leads/addlead', name: 'AddLead',exact: true, element: AddLead },
{ path: '/admin/leads/viewleads', name: 'ViewLeads',exact: true, element: ViewLeads },
{ path: '/admin/leads/updatelead/:leadid', name: 'UpdateLead',exact: true, element: UpdateLead },
{path: '/results/findresult', name: 'FindResult',exact: true, element: FindResult},
]
}

export default routes
