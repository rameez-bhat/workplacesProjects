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
  cilTransfer,
  cilVoiceOverRecord,
  cilVolumeHigh,
  cilAddressBook,
  cilMoney,
  cilPencil,
  cilPuzzle,
  cilSpeedometer,
  cilUserPlus,
  cilStar,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const getNavigation = (user) => {
  let navigation = [];
  // SuperAdmin role navigation
  let fetchName="";
  let zeocode="";

  if(user.name)
  {
    fetchName=user.name.toLowerCase()
  }
  if(user.ddocode)
  {
    zeocode=user.ddocode
  }
  if (user?.role === "SuperAdmin" && !fetchName.startsWith("zeo")) {
    navigation = [
      {
        component: CNavItem,
        name: 'Dashboard',
        to: '/ddo/dashboardselection',
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
        name: 'Profile',
        to: '/base',
        icon: <CIcon icon={cilAddressBook} customClassName="nav-icon" />,
        items: [
          {
            component: CNavItem,
            name: 'Change Password',
            to: '/ddo/changepassword',
          },
          {
            component: CNavItem,
            icon: <CIcon icon={cilUserPlus} customClassName="nav-icon" />,
            name: 'Add User',
            to: '/admin/adduser',
          },
          {
            component: CNavItem,
             icon: <CIcon icon={cilUserPlus} customClassName="nav-icon" />,
            name: 'Update User Password',
            to: '/admin/updateuserpassword',
          }
        ],
      },
      {
        component: CNavGroup,
        name: 'Accounts Section12',
        to: '/base',
        icon: <CIcon icon={cilMoney} customClassName="nav-icon" />,
        items: [

          {
            component: CNavItem,
            name: 'List DDOs',
            to: '/admin/listddos/accountssection',
          },
          {
            component: CNavItem,
            name: 'Add Settings',
            to: '/admin/addsettings/accountssection',
          }

        ],
      },
      {
        component: CNavGroup,
        name: 'Non Teaching Section',
        to: '/base',
        icon: <CIcon icon={cilTransfer} customClassName="nav-icon" />,
        items: [

          {
            component: CNavItem,
            name: 'List DDOs',
            to: '/admin/listddos/nonteachingsection',
          },
          {
            component: CNavItem,
            name: 'Add Settings',
            to: '/admin/addsettings/nonteachingsection',
          }

        ],
      },
      {
        component: CNavGroup,
        name: 'Teaching Section',
        to: '/base',
        icon: <CIcon icon={cilVoiceOverRecord} customClassName="nav-icon" />,
        items: [

          {
            component: CNavItem,
            name: 'List DDOs',
            to: '/admin/listddos/teachingsection',
          },
          {
            component: CNavItem,
            name: 'Add Settings',
            to: '/admin/addsettings/teachingsection',
          }

        ],
      },
      {
        component: CNavGroup,
        name: 'Gazetted Section',
        to: '/base',
        icon: <CIcon icon={cilVolumeHigh} customClassName="nav-icon" />,
        items: [

          {
            component: CNavItem,
            name: 'List DDOs',
            to: '/admin/listddos/gazettedsection',
          },
          {
            component: CNavItem,
            name: 'Add Settings',
            to: '/admin/addsettings/gazettedsection',
          }

        ],
      },
      {
        component: CNavGroup,
        name: 'Zone Level',
        to: '/base',
        icon: <CIcon icon={cilVolumeHigh} customClassName="nav-icon" />,
        items: [

          {
            component: CNavItem,
            name: 'List DDOs',
            to: '/admin/listddoszonelevel',
          },
          {
            component: CNavItem,
            name: 'Add Settings',
            to: `/admin/addsettingszonelevel/${zeocode}`,
          }

        ],
      }
    ];
    
  }
  if (user?.role === "DDO" && fetchName.startsWith("zeo")) {
    navigation = [
      {
        component: CNavItem,
        name: 'Dashboard',
        to: '/ddo/dashboardselection',
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
        name: 'Profile',
        to: '/base',
        icon: <CIcon icon={cilAddressBook} customClassName="nav-icon" />,
        items: [
          {
            component: CNavItem,
            name: 'Change Password',
            to: '/ddo/changepassword',
          }
        ],
      },
      {
        component: CNavGroup,
        name: 'Accounts Section',
        to: '/base',
        icon: <CIcon icon={cilMoney} customClassName="nav-icon" />,
        items: [

          {
            component: CNavItem,
            name: 'List DDOs',
            to: '/admin/listddos/accountssection',
          }

        ],
      },
      {
        component: CNavGroup,
        name: 'Non Teaching Section',
        to: '/base',
        icon: <CIcon icon={cilTransfer} customClassName="nav-icon" />,
        items: [

          {
            component: CNavItem,
            name: 'List DDOs',
            to: '/admin/listddos/nonteachingsection',
          }

        ],
      },
      {
        component: CNavGroup,
        name: 'Teaching Section',
        to: '/base',
        icon: <CIcon icon={cilVoiceOverRecord} customClassName="nav-icon" />,
        items: [

          {
            component: CNavItem,
            name: 'List DDOs',
            to: '/admin/listddos/teachingsections',
          }

        ],
      },
      {
        component: CNavGroup,
        name: 'Gazetted Section',
        to: '/base',
        icon: <CIcon icon={cilVolumeHigh} customClassName="nav-icon" />,
        items: [
          {
            component: CNavItem,
            name: 'List DDOs',
            to: '/admin/listddos/gezettedsection',
          }
        ],
      },
    ];
     if (fetchName.startsWith("zeo")) 
     {
      navigation.push({
        component: CNavGroup,
        name: 'Zone Level',
        to: '/base',
        icon: <CIcon icon={cilVolumeHigh} customClassName="nav-icon" />,
        items: [

          {
            component: CNavItem,
            name: 'List DDOs',
            to: '/admin/listddoszonelevel',
          },
          {
            component: CNavItem,
            name: 'Add Settings',
            to: `/admin/addsettingszonelevel/${zeocode}`,
          }

        ],
      });
     }
  }

  // Admin role navigation
  if (user?.role === "DDO"  && !fetchName.startsWith("zeo")) {
    navigation = [
      {
        component: CNavItem,
        name: 'Dashboard',
        to: '/ddo/dashboardselection',
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
        name: 'Profile',
        to: '/base',
        icon: <CIcon icon={cilAddressBook} customClassName="nav-icon" />,
       items: [
          {
            component: CNavItem,
            name: 'Change Password',
            to: '/ddo/changepassword',
          }
        ],
      },
      {
        component: CNavGroup,
        name: 'Accounts Section',
        to: '/base',
        icon: <CIcon icon={cilMoney} customClassName="nav-icon" />,
        items: [
          {
            component: CNavItem,
            name: 'Add Data',
            to: '/ddo/adddata/accountssection',
          }
        ],
      },
      {
        component: CNavGroup,
        name: 'Non Teaching Section',
        to: '/base',
        icon: <CIcon icon={cilTransfer} customClassName="nav-icon" />,
        items: [

          {
            component: CNavItem,
            name: 'Add Data',
            to: '/ddo/adddata/nonteachingsection',
          }

        ],
      },
      {
        component: CNavGroup,
        name: 'Teaching Section',
        to: '/base',
        icon: <CIcon icon={cilVoiceOverRecord} customClassName="nav-icon" />,
        items: [

          {
            component: CNavItem,
            name: 'Add Data',
            to: '/ddo/adddata/teachingsection',
          }

        ],
      },
      {
        component: CNavGroup,
        name: 'Gazetted Section',
        to: '/base',
        icon: <CIcon icon={cilVolumeHigh} customClassName="nav-icon" />,
        items: [
          {
            component: CNavItem,
            name: 'Add Data',
            to: '/ddo/adddata/gazettedsection',
          }
        ],
      },
    ];
  }
  if (user?.role === "ZONELEVEL") {
    navigation = [
     
      {
        component: CNavGroup,
        name: 'Zone Level',
        to: '/base',
        icon: <CIcon icon={cilVolumeHigh} customClassName="nav-icon" />,
        items: [
          {
            component: CNavItem,
            name: 'Add Data',
            to: '/ddo/adddatazonelevel',
          }
        ],
      },
    ];
  }

  return navigation;
};

export default getNavigation;
