import firestoreQueries from './firestore';
import React, { Suspense, useEffect,useState } from 'react'
import { BrowserRouter, Route, Routes,Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

import { CSpinner, useColorModes } from '@coreui/react'
import './scss/style.scss'
import { onAuthStateChanged } from "firebase/auth";
import { AuthProvider } from './authuser/AuthContext';
import { signOut,createUserWithEmailAndPassword } from "firebase/auth";
import auth from "./apis/auth";
import { LoadingProvider } from './layout/LoadingContext';
import SpinnerOverlay from './layout/SpinnerOverlay';
// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))
let ActualUser;
let AuthUser;
const DatabaseName="StudentData";
// Pages

const App = () => {
 const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')
  const storedTheme = useSelector((state) => state.theme)
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [AuthUserR, setAuthUserR] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.href.split('?')[1])
    const theme = urlParams.get('theme') && urlParams.get('theme').match(/^[A-Za-z0-9\s]+/)[0]
    //firestoreQueries.updateOrCreateByField("website1", "users", "email", "test@example.com", data);
     const unsubscribe = onAuthStateChanged  (auth, async (user) => {
      if (user) {
      AuthUser=user;
      setAuthUserR(AuthUser)
      let Class="10th";
      let Year="2024";
      let orderby="A"
       let data={"currentyear":Year};
      //let data={"currentyear":Year,"class":Class,"FieldOrderCol":orderby,"subjects":{"english":"english"},[Year]:{"teachers":{"english":{"teacher":"rameez","tid":"123"}}}};
     //const res1=await firestoreQueries.handleUpdate(DatabaseName, "classes",Class, data);
   const res=await firestoreQueries.FetchDataFromCollection(DatabaseName, "users",20,"uid","==",user.uid);

     if(res)
     {
      ActualUser=res[0];
     }
    console.log("res===>",res)
      	setIsUserLoggedIn(true);
      	  setLoading(false);


      } else {
        setIsUserLoggedIn(false);
         setLoading(false);
      }
     // setLoading(false); // Authentication check complete
    });
    if (theme) {
      setColorMode(theme)
    }
    else
    {
    	setColorMode(storedTheme)
    }
return () => unsubscribe();

  }, []) // eslint-disable-line react-hooks/exhaustive-deps





console.log("User logged in:", isUserLoggedIn);
if (loading) {
    // Show a spinner or loading indicator while checking auth state
    return (
      <div className="pt-3 text-center">
        <CSpinner color="primary" variant="grow" />
      </div>
    );
  }
  return (
  <LoadingProvider>
<SpinnerOverlay />
 <BrowserRouter>
<DefaultLayout  isUserLoggedIn={isUserLoggedIn} ActualUser={ActualUser} AuthUser={AuthUserR} />
    </BrowserRouter>
</LoadingProvider>
  );
}

export default App


