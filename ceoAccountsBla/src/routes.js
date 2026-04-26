import React from 'react'

const Login = React.lazy(() => import('./views/pages/login/Login'))


const Settings = React.lazy(() => import('./views/admin/Settings'))
const ListDdos = React.lazy(() => import('./views/admin/ListDdos'))

const AddUser = React.lazy(() => import('./views/admin/AddUser'))
const ImportExcel = React.lazy(() => import('./views/admin/ImportExcel'))
const ListDdoszonelevel = React.lazy(() => import('./views/admin/ListDdoszonelevel'))
const Settingszonelevel = React.lazy(() => import('./views/admin/Settingszonelevel'))
const UpdateUserPassword = React.lazy(() => import('./views/admin/UpdateUserPassword'))


const AddData = React.lazy(() => import('./views/DDO/AddData'))
const DashboardSelection = React.lazy(() => import('./views/DDO/DashboardSelection'))
const ChangePassword = React.lazy(() => import('./views/DDO/ChangePassword'))
const AddDatazonelevel = React.lazy(() => import('./views/DDO/AddDatazonelevel'))



const routes = {"public":[
  { path: '/login', name: 'Login', element: Login },
],
"SuperAdmin":[
  { path: '/admin/addsettings/:settingtype/', name: 'Settings',exact: true, element: Settings },
  { path: '/admin/importexcel', name: 'ImportExcel',exact: true, element: ImportExcel },
  { path: '/admin/listddos/:settingtype', name: 'Final',exact: true, element: ListDdos },
  { path: '/admin/adduser', name: 'Final',exact: true, element: AddUser},
  { path: '/ddo/adddata/:settingtype/:ddoid?', name: 'AddData',exact: true, element: AddData },
  { path: '/ddo/changepassword', name: 'ChangePassword',exact: true, element: ChangePassword },
  { path: '/ddo/dashboardselection', name: 'DashboardSelection',exact: true, element: DashboardSelection },
  { path: '/admin/listddoszonelevel/:zoneddocode?', name: 'List DDOs Zone Level',exact: true, element: ListDdoszonelevel },
  { path: '/admin/addsettingszonelevel/:zoneddocode?', name: 'Settings Zone Level',exact: true, element: Settingszonelevel },
  { path: '/ddo/adddatazonelevel/:zoneddocode?/:ddoid?', name: 'Add Data Zone Level',exact: true, element: AddDatazonelevel },
  { path: '/admin/updateuserpassword', name: 'Update User Password',exact: true, element: UpdateUserPassword },
],
"DDO":[
{ path: '/ddo/changepassword', name: 'ChangePassword',exact: true, element: ChangePassword },
{ path: '/ddo/adddata/:settingtype/:ddoid?', name: 'AddData',exact: true, element: AddData },
{ path: '/ddo/adddata', name: 'AddData',exact: true, element: AddData },
{ path: '/ddo/dashboardselection', name: 'DashboardSelection',exact: true, element: DashboardSelection },

],
"ZONELEVEL":[
{ path: '/ddo/adddatazonelevel/:zoneddocode?/:ddoid?', name: 'Add Data Zone Level',exact: true, element: AddDatazonelevel },
{ path: '/ddo/adddata/:settingtype/:ddoid?', name: 'AddData',exact: true, element: AddData },
],
"DDOZEO":[
{ path: '/ddo/changepassword', name: 'ChangePassword',exact: true, element: ChangePassword },
{ path: '/ddo/adddata/:settingtype/:ddoid?', name: 'AddData',exact: true, element: AddData },
{ path: '/ddo/adddata', name: 'AddData',exact: true, element: AddData },
{ path: '/admin/listddos/:settingtype', name: 'ListDdos',exact: true, element: ListDdos },
{ path: '/admin/listddoszonelevel/:zoneddocode?', name: 'List DDOs Zone Level',exact: true, element: ListDdoszonelevel },
{ path: '/admin/addsettingszonelevel/:zoneddocode?', name: 'Settings Zone Level',exact: true, element: Settingszonelevel },
{ path: '/ddo/adddatazonelevel/:zoneddocode?/:ddoid?', name: 'Add Data Zone Level',exact: true, element: AddDatazonelevel },
{ path: '/ddo/dashboardselection', name: 'DashboardSelection',exact: true, element: DashboardSelection },
]

}

export default routes
