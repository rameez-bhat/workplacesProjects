import React, { createContext, useState, useContext } from 'react';
import firestoreQueries from 'src/firestore'
// Create the context
const LoadingContext = createContext();
const allCountries=[];
const countryOfMedicalCollege=[];
const API_KEY = 'AIzaSyBAYjaOcvwnm2cZWxCGEjI0ysOOTHKS4AY';  // From Google Cloud Console
const DatabaseName="DDOSDATA";
// Create a provider component

export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);

  const showLoading = () => setLoading(true);
  const hideLoading = () => setLoading(false);

  return (
    <LoadingContext.Provider value={{ loading,DatabaseName, showLoading, hideLoading,firestoreQueries,API_KEY}}>
      {children}
    </LoadingContext.Provider>
  );
};

// Custom hook to use the Loading context
export const useLoading = () => {
  return useContext(LoadingContext);
};
