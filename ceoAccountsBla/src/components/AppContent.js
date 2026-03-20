import React, { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { CContainer, CSpinner } from '@coreui/react';

// routes config
import routes from '../routes';
import NotFound from '../views/pages/page404/Page404';

const AppContent = ({ Logout,isUserLoggedIn,ActualUser,AuthUser }) => {
let fetchName="";
  if(ActualUser?.name)
  {
    fetchName=ActualUser.name.toLowerCase()
  }
  let actualRoute=ActualUser?.role;
  if(fetchName.startsWith("zeo"))
  {
  	actualRoute=actualRoute+"ZEO";
  }
  return (
    <CContainer className="px-4" lg>
      <Suspense fallback={<CSpinner color="primary" />}>
        <Routes>
          {/* Render restricted routes for logged-in users */}
          {isUserLoggedIn ? (
            routes[actualRoute].map((route, idx) => {
              return (
                route.element && (
                  <Route
                    key={idx}
                    path={route.path}
                    exact={route.exact}
                    name={route.name}
                    ActualUser={ActualUser}
                    AuthUser={AuthUser}
                   element={React.cloneElement(<route.element />, { ActualUser, AuthUser })}
                  />
                )
              );
            })
          ) : (
            // Render public routes for non-logged-in users
            routes.public.map((route, idx) => {
              return (
                route.element && (
                  <Route
                    key={idx}
                    path={route.path}
                    exact={route.exact}
                    name={route.name}
                    element={<route.element />}
                  />
                )
              );
            })
          )}


          <Route
  path="/"
  element={
    isUserLoggedIn ? (
      <Navigate to={ActualUser?.role === "DDO" ? "/ddo/dashboardselection" : "/admin/listddos"}  AuthUser={AuthUser} replace />
    ) : (
      <Navigate to="/login" replace />
    )
  }
/>
 <Route
  path="*"
  element={
    isUserLoggedIn ? (
      <Navigate to={ActualUser?.role === "DDO" ? "/ddo/dashboardselection" : "/admin/listddos"} replace />
    ) : (
      <Navigate to="/login" replace />
    )
  }
/>
        </Routes>
      </Suspense>
    </CContainer>
  );
};

export default React.memo(AppContent);
