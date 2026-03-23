import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilBell,
  cilCalculator,
  cilChartPie,
  cilCursor,
  cilDescription,
  cilDrop,
  cilNotes,
  cilPencil,
  cilPuzzle,
  cibSuperuser,
  cilSpeedometer,
  cilRoom,
  cibAddthis,
  cilList,
  cilUser,
  cilGroup,
  cilCreditCard,
  cilMap,
  cilSettings,
  cilCalendar,
  cibCassandra,
  cilStar,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const getNavigation = (user) => {
  let navigation = [];

  // SuperAdmin role navigation
  if (user?.role === "SuperAdmin") {
    navigation = [
      {
        component: CNavItem,
        name: 'Dashboard',
        to: '/admin/dashboard',
        icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
        badge: {
          color: 'info',
          text: 'NEW',
        },
      },
      {
        component: CNavTitle,
        name: 'Pages',
      },
       {
        component: CNavGroup,
        name: 'Settings',
        to: '/base',
        icon: <CIcon icon={cilSettings} customClassName="nav-icon" />,
       items: [
  
          {
            component: CNavItem,
            icon: <CIcon icon={cilCalendar} customClassName="nav-icon" />,
            name: 'Select Year',
            to: '/superadmin/changeyear',
          }
        ],
      },
       {
        component: CNavGroup,
        name: 'Students',
        to: '/base',
        icon: <CIcon icon={cilSettings} customClassName="nav-icon" />,
       items: [
  
          {
            component: CNavItem,
            icon: <CIcon icon={cilCalendar} customClassName="nav-icon" />,
            name: 'Promote Students',
            to: '/admin/progression',
          },
          {
            component: CNavItem,
            icon: <CIcon icon={cilCalendar} customClassName="nav-icon" />,
            name: 'Add Students',
            to: '/admin/addstudent',
          }
        ],
      },
      {
        component: CNavGroup,
        name: 'List',
        to: '/base',
        icon: <CIcon icon={cilList} customClassName="nav-icon" />,
       items: [
          {
            component: CNavItem,
            icon: <CIcon icon={cilRoom} customClassName="nav-icon" />,
            name: 'Assign Teachers To Class',
            to: '/superadmin/list/classes',
          },
          {
            component: CNavItem,
            icon: <CIcon icon={cilRoom} customClassName="nav-icon" />,
            name: 'Add Exams To Class',
            to: '/superadmin/list/exams',
          },
          {
            component: CNavItem,
            icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
            name: 'List Teachers',
            to: '/superadmin/list/teachers',
          }
        ],
      },
      
      {
        component: CNavGroup,
        name: 'Results',
        to: '/base',
        icon: <CIcon icon={cilCreditCard} customClassName="nav-icon" />,
       items: [
         /* {
            component: CNavItem,
            name: 'Change Password',
            to: '/admin/changepassword',
          },
          {
            component: CNavItem,
            icon: <CIcon icon={cilRoom} customClassName="nav-icon" />,
            name: 'Assign Teachers To Class',
            to: '/superadmin/results/markssheet',
          },
          {
            component: CNavItem,
            icon: <CIcon icon={cilRoom} customClassName="nav-icon" />,
            name: 'Add Exams To Class',
            to: '/superadmin/list/exams',
          },
          {
            component: CNavItem,
            icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
            name: 'List Teachers',
            to: '/superadmin/list/teachers',
          },*/
          {
            component: CNavItem,
            icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
            name: 'Print Marks Card',
            to: '/results/markscard',
          }
        ],
      }
      ,
      {
        component: CNavGroup,
        name: 'Maping',
        to: '/base',
        icon: <CIcon icon={cilMap} customClassName="nav-icon" />,
       items: [
          {
            component: CNavItem,
            icon: <CIcon icon={cilRoom} customClassName="nav-icon" />,
            name: 'Class Subject Maping',
            to: '/superadmin/classsubjectmaping',
          }
        ],
      },
      {
        component: CNavGroup,
        name: 'Users',
        to: '/base',
        icon: <CIcon icon={cibSuperuser} customClassName="nav-icon" />,
        items: [
          {
            component: CNavItem,
            icon: <CIcon icon={cibAddthis} customClassName="nav-icon" />,
            name: 'Add User',
            to: '/admin/adduser',
          },
          {
            component: CNavItem,
            icon: <CIcon icon={cilGroup} customClassName="nav-icon" />,
            name: 'View Users',
            to: '/admin/viewusers',
          },
        ],
      },
    ];
  }

  // Admin role navigation
  if (user?.role === "Teacher") {
    navigation = [
      {
        component: CNavItem,
        name: 'Dashboard',
        to: '/admin/addresult/',
        icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
        badge: {
          color: 'info',
          text: 'NEW',
        },
      },
      {
        component: CNavTitle,
        name: 'Pages',
      },
      {
        component: CNavGroup,
        name: 'Menu',
        to: '/admin/addresult/',
        icon: <CIcon icon={cibCassandra} customClassName="nav-icon" />,
       items: [
         /* {
            component: CNavItem,
            name: 'Change Password',
            to: '/admin/changepassword',
          },*/
          {
            component: CNavItem,
            icon: <CIcon icon={cibCassandra} customClassName="nav-icon" />,
            name: 'Add Results',
            to: '/admin/addresult/',
          }
        ],
      },
      {
        component: CNavGroup,
        name: 'Students',
        to: '/base',
        icon: <CIcon icon={cilSettings} customClassName="nav-icon" />,
       items: [
  
          {
            component: CNavItem,
            icon: <CIcon icon={cilCalendar} customClassName="nav-icon" />,
            name: 'Promote Students',
            to: '/admin/progression',
          },
          {
            component: CNavItem,
            icon: <CIcon icon={cilCalendar} customClassName="nav-icon" />,
            name: 'Add Students',
            to: '/admin/addstudent',
          }
        ],
      },,
    ];
  }

  return navigation;
};

export default getNavigation;
