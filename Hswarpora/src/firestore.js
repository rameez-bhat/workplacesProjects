import {
  doc,
  setDoc,
  collection,
  getDocs,
  addDoc,
  query,
  where,
  limit,
  deleteDoc,
  updateDoc,
  getDoc,
  deleteField,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
const Databasecollection="Hswarpora"
// Define your main database names for websites

// Helper function to update or create document by field
const firestoreQueries = {
Timestamp:Timestamp,
async handleUpdate(databaseName,CollectionName,docId,data) {
    try {
      //await collection(db,CollectionName).doc(docId).update(data);
       const docRef = doc(db,Databasecollection,databaseName, CollectionName, docId);
      //await updateDoc(docRef, data);
      await setDoc(docRef, data, { merge: true });
      return {
      'status':'success',
      'message':'Updated Successfully'
      };
    } catch (error) {
      return {
      'status':'error',
      'message':error
      };
    }
  },
  async  deleteFieldFromDocument(databaseName,collectionName, documentId, fieldName) {
  const docRef = doc(db,Databasecollection,databaseName, collectionName, documentId);
  let  result={};
  try {
    await updateDoc(docRef, {
      [fieldName]: deleteField(),
    });

    result={status:"success","message":"Field Deleted Successfully"}
  } catch (error) {

    result={status:"error","message":error}
  }
  return result;
},
async  deleteDynamicField(databaseName, collectionName, documentId, fieldPath) {
  const docRef = doc(db,Databasecollection, databaseName, collectionName, documentId);
  let result = {};

  try {
    // Step 1: Retrieve the document data
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // Get a deep copy of the data to manipulate
      const data = docSnap.data();

      // Step 2: Split the fieldPath into an array to handle dynamic paths
      const pathArray = fieldPath.split('.');

      // Navigate through the object to remove the field dynamically
      let current = data;
      for (let i = 0; i < pathArray.length - 1; i++) {
        if (current[pathArray[i]]) {
          current = current[pathArray[i]];
        } else {
          result = { status: "error", message: `Path '${pathArray[i]}' does not exist.` };
          return result; // Path not found
        }
      }

      // Step 3: Delete the last field in the path
      const lastKey = pathArray[pathArray.length - 1];
      if (current[lastKey]) {
        delete current[lastKey]; // Delete the field
      } else {
        result = { status: "error", message: `Field '${fieldPath}' not found.` };
        return result; // Field to delete not found
      }

      // Step 4: Overwrite the document with the modified data
      await setDoc(docRef, data);

      result = { status: "success", message: `Field '${fieldPath}' deleted successfully.` };
    } else {
      result = { status: "error", message: "Document not found." };
    }
  } catch (error) {
    result = { status: "error", message: error.message };
  }

  return result;
},
async copyCollection(databaseName,sourceCollection, targetCollection) {
  try {
    // Step 1: Fetch all documents from the source collection
    const querySnapshot = await getDocs(collection(db, Databasecollection, databaseName,sourceCollection));

    // Step 2: Iterate over each document in the source collection
    querySnapshot.forEach(async (document) => {
      const docData = document.data(); // Get document data
      /*delete docData?.['2024']?.['F1'];
      delete docData?.['2024']?.['F2'];
      delete docData?.['2024']?.['F3'];
      delete docData?.['2024']?.['F5'];
      delete docData?.['2024']?.['F6'];
      delete docData?.['2024']?.['F7'];
      let DataSend = {
  2024: {
    subjects: docData?.['2024'] || {},
    particulars:{currentclass:docData?.['currentclass'],rollno:docData?.['rollno']}
  },
  admissionno:docData?.['admissionno'],
  category:docData?.['category'],
  dob:docData?.['dob'],
  dobActual:docData?.['dobActual'],
  fathersname:docData?.['fathersname'],
  id:docData?.['id'],
  mothersname:docData?.['mothersname'],
  name:docData?.['name'],

};*/
      // Step 3: Prepare the document for saving in the target collection
      //const convertedDataForSaving = convertRotationsArrayToMap(docData);

      // Step 4: Set the document in the target collection (same doc id)
      const targetDocRef = doc(db, Databasecollection, databaseName,targetCollection, document.id);
      await setDoc(targetDocRef, docData, { merge: true });

      console.log(`Document ${document.id} copied successfully.`);
    });

    console.log("All documents copied successfully.");
  } catch (error) {
    console.error("Error copying collection: ", error);
  }
},
async updateWhereFieldEquals(databaseName,CollectionName, fieldName, fieldCondition,fieldValue, newData) {
  try {
    const q = query(collection(db,Databasecollection,databaseName, CollectionName), where(fieldName, fieldCondition, fieldValue));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { status: "error", message: "No matching document found." };
    }

    // Loop through all matching docs (can limit to first match if needed)
    for (const docSnap of querySnapshot.docs) {
      const docRef = doc(db,Databasecollection,databaseName, CollectionName, docSnap.id);
      await setDoc(docRef, newData, { merge: true });
    }

    return { status: "success", message: "Updated successfully." };
  } catch (error) {
    return { status: "error", message: error.message || error };
  }
},
  async updateOrCreateById(databaseName, collectionName, documentId, data) {
  try {
    // Reference to the specific document by its ID (documentId)

    const docRef = doc(db,Databasecollection, databaseName, collectionName, documentId);
    // Check if the document with the given ID exists
    const docSnapshot = await getDoc(docRef);
console.log("data---->",data)
console.log("documentId---->",documentId)
    if (docSnapshot.exists()) {
      // Document exists, update it
      await setDoc(docRef, { ...data, id: documentId }, { merge: true });
      return { status: 'success', message: 'Updated Successfully' };
    } else {
      // Document does not exist, create it
      await setDoc(docRef, { ...data, id: documentId });
      return { status: 'success', message: 'Created new document successfully', docId: documentId };
    }
  } catch (error) {
    console.log("error======>",error)
    return { status: 'error', message: error.message };
  }
},
async FetchUniqueData (databaseName,mainCollectionName,uniquecolumn){
  let uniqueStates=[];
      try {
        const mainCollectionRef = collection(db,Databasecollection, databaseName,mainCollectionName); // replace 'mainCollectionName' with your collection name
        const querySnapshot = await getDocs(mainCollectionRef);
        const states = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data[uniquecolumn]) {
            states.push(data[uniquecolumn]);
          }
        });

        // Get unique states
        uniqueStates = [...new Set(states)];
        return uniqueStates;
      } catch (error) {
        return uniqueStates;
      }
    },
    async updateOrCreateByField(databaseName, collectionName, conditions, data) {
  try {
    const collectionRef = collection(db, Databasecollection, databaseName, collectionName);

    // Apply multiple conditions to the query
    let queryRef = collectionRef;
    conditions.forEach(condition => {
      queryRef = query(queryRef, where(condition.fieldName, condition.operator, condition.value));
    });

    const querySnapshot = await getDocs(queryRef);

    if (!querySnapshot.empty) {
      // Update existing documents
      await Promise.all(querySnapshot.docs.map(async (docSnapshot) => {
        const docRef = doc(db, Databasecollection, databaseName, collectionName, docSnapshot.id);
        await setDoc(docRef, { ...data, id: docSnapshot.id }, { merge: true });
      }));
      return { status: 'success', message: 'Updated Successfully', docId: querySnapshot.docs[0].id };
    } else {
      // Create a new document if none matches the query
      const newDocRef = await addDoc(collectionRef, {
        ...data,
        ...conditions.reduce((acc, cond) => ({ ...acc, [cond.fieldName]: cond.value }), {})
      });
      await setDoc(newDocRef, { id: newDocRef.id }, { merge: true });
      return { status: 'success', message: 'Created new lead successfully', docId: newDocRef.id };
    }
  } catch (error) {
    return { status: 'error', message: error.message };
  }
},
  async updateOrCreateByFieldBK(databaseName, collectionName, fieldName, operatorValue,fieldValue, data) {
    try {
      const collectionRef = collection(db,Databasecollection, databaseName, collectionName);
      const querySnapshot = await getDocs(query(collectionRef, where(fieldName, operatorValue, fieldValue)));

      if (!querySnapshot.empty) {
        querySnapshot.forEach(async (docSnapshot) => {
          const docRef = doc(db, Databasecollection,databaseName, collectionName, docSnapshot.id);
          await setDoc(docRef, { ...data, id: docSnapshot.id }, { merge: true });
        });
        return { status: 'success', message: 'Updated Successfully' };
      } else {
        const newDocRef = await addDoc(collectionRef, {
          ...data,
          [fieldName]: fieldValue,
        });
        await setDoc(newDocRef, { id: newDocRef.id }, { merge: true });
        return { status: 'success', message: 'Created new lead successfully', docId: newDocRef.id };
      }
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  },
async  SelectWithComplexConditions(databaseName,mainCollectionName, conditionsArray, joinCollection,leftfield,rightfiled)  {
  try {
    // Step 1: Create queries for each OR clause in conditionsArray
    const queries = conditionsArray.map(orClause => {
      // Build a query for each OR clause using its AND conditions
      let orQuery = collection(db,Databasecollection, databaseName, mainCollectionName);
      orClause.forEach(andCondition => {
    	if(andCondition.condition==="contains")
    	{
    		const startPrefix = andCondition.value;
  			const endPrefix = andCondition.value + '\uf8ff';
    		 orQuery = query(orQuery, where(andCondition.name, ">=", startPrefix),where(andCondition.name, '<=', endPrefix));
    	}
    	else
    	{
    		 orQuery = query(orQuery, where(andCondition.name, andCondition.condition, andCondition.value));
    	}

      });
      return orQuery;
    });
    // Step 2: Execute all OR queries in parallel
    const querySnapshots = await Promise.all(queries.map(q => getDocs(q)));

    // Step 3: Collect all results from each OR query
    let finalResults = [];
    querySnapshots.forEach(snapshot => {
      snapshot.forEach(doc => {
        finalResults.push({ id: doc.id, ...doc.data() });
      });
    });

    // Step 4: Deduplicate results based on document ID
    const uniqueResults = finalResults.reduce((acc, current) => {
      if (!acc.some(doc => doc.id === current.id)) {
        acc.push(current);
      }
      return acc;
    }, []);

    // Step 5: Enrich results with profile data if available
    if(typeof joinCollection!=="undefined" && joinCollection!=="")
    {
    	const enrichedResults = await Promise.all(
      uniqueResults.map(async (result) => {
        if (result[leftfield]) {
          // Fetch profile data from the profile collection using the uid
          const joinData = await this.FetchDataFromCollection(databaseName,joinCollection, 10, rightfiled, "==", result[leftfield], null);
          // If profile data is found, attach it to the result
          if (joinData.length > 0) {
            return { ...result, joinData: joinData };
          }
        }
        return result; // Return the result even if no profile data is found
      })
    );
    	return { status: "success", data: enrichedResults };
    }
    else
    {
    	return { status: "success", data: uniqueResults };
    }



  } catch (error) {
    console.error("Error fetching documents: ", error);
    return { status: "fail", data: [] };
  }
},
async SelectedWithComplexConditions(databaseName,mainCollectionName,conditionsArray,profileCollection,orderByField = null, orderDirection = 'asc',limitResults = null,lastDoc =null) 
{
  try {
    // Step 1: Create queries for each OR clause in conditionsArray
    const queries = conditionsArray.map(orClause => {
      // Build a query for each OR clause using its AND conditions
      let orQuery = collection(db, Databasecollection, databaseName,mainCollectionName);
      orClause.forEach(andCondition => {
        orQuery = query(orQuery, where(andCondition.name, andCondition.condition, andCondition.value));
      });

      // Apply ordering if specified
      if (orderByField) {
        orQuery = query(orQuery, orderBy(orderByField, orderDirection));
      }
      if (lastDoc) {
        orQuery = query(orQuery, startAfter(lastDoc));
      }
      // Apply limit if specified
      if (limitResults) {
        orQuery = query(orQuery, limit(limitResults));
      }

      return orQuery;
    });
    // Step 2: Execute all OR queries in parallel
    const querySnapshots = await Promise.all(queries.map(q => getDocs(q)));
 console.log("querySnapshots--->",querySnapshots)
  console.log("queries--->",queries)
    // Step 3: Collect all results from each OR query
    let allResults = [];
    let lastVisibleDocs = [];
    let finalResults = [];
    querySnapshots.forEach(snapshot => {
      snapshot.forEach(doc => {
        finalResults.push({ id: doc.id, ...doc.data() });
      });
      if (!lastDoc && snapshot.docs.length > 0) {
        lastVisibleDocs.push(snapshot.docs[snapshot.docs.length - 1]);
      }
    });
    console.log("finalResults--->",finalResults)
    // Step 4: Deduplicate results based on document ID
    const uniqueResults = finalResults.reduce((acc, current) => {
      if (!acc.some(doc => doc.id === current.id)) {
        acc.push(current);
      }
      return acc;
    }, []);
    let ListOfProfiles={};
    let userId="";
    // Step 5: Enrich results with profile data if available
    if (typeof profileCollection !== "undefined" && profileCollection !== "") {
      const enrichedResults = await Promise.all(
        uniqueResults.map(async (result) => {
          
          if (result.uid) {
          userId=result.uid
          }
          else if(result.UId)
          {
            userId=result.UId
          }
          if (userId!="") 
          {
            // Fetch profile data from the profile collection using the uid
            if(typeof ListOfProfiles[userId]=="undefined")
            {
              const profileData = await this.FetchDataFromCollection(profileCollection, 10, "__name__", "==", userId, null);
              // If profile data is found, attach it to the result
              if (profileData.length > 0) 
              {
                ListOfProfiles[userId]=profileData[0];
                return { ...result, profile: profileData[0] };
              }
            }
            else
            {
              return { ...result, profile: ListOfProfiles[userId] };
            }
            
          }
          return result; // Return the result even if no profile data is found
        })
      );
      return { status: "success", data: enrichedResults,lastDoc: lastVisibleDocs.length > 0 ? lastVisibleDocs[lastVisibleDocs.length - 1] : null };
    } else {
      return { status: "success", data: uniqueResults,lastDoc: lastVisibleDocs.length > 0 ? lastVisibleDocs[lastVisibleDocs.length - 1] : null };
    }
  } catch (error) {
    console.log("Error fetching documents: ", error);
    return { status: "fail", data: [] };
  }
},

  // Delete document by ID
  async deleteDocumentById(databaseName, collectionName, documentId) {
    const docRef = doc(db, Databasecollection,databaseName, collectionName, documentId);
    await deleteDoc(docRef);
  },

  // Fetch data from specific collection (paginated and with filtering options)
  async FetchDataFromCollection(databaseName, collectionName, pageSize, filterField, filterCondition, filterValue, orderByField,orderByDirection)
  {
    try {
      const collectionRef = collection(db, Databasecollection,databaseName, collectionName);
      const queryConstraints = [limit(pageSize)];

      if (filterField && (filterValue || filterValue === "")) {
        queryConstraints.push(where(filterField, filterCondition, filterValue));
      }
      	if (orderByField) {
      queryConstraints.push(orderBy(orderByField, orderByDirection || 'asc')); // Default to ascending if no direction is provided
    }
      const q = query(collectionRef, ...queryConstraints);
      const querySnapshot = await getDocs(q);
      const mainCollectionData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        documentid: doc.id,
        ...doc.data(),
      }));

      return mainCollectionData;
    } catch (error) {
      console.error('Error fetching data: ', error);
      throw error;
    }
  },

  // Fetch data with filtering and pagination
  async fetchData(databaseName, collectionName, pageSize, filterField, filterCondition, filterValue) {
    try {
    const collectionRef = collection(db, Databasecollection,databaseName, collectionName);
    const queryConstraints = [limit(pageSize)];

    if (filterField && filterValue) {
      queryConstraints.push(where(filterField, filterCondition, filterValue));
    }

    const q = query(collectionRef, ...queryConstraints);
    const querySnapshot = await getDocs(q);

    const data = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    	return { status: "success", data: data };
    } catch (error) {
    console.error("Error fetching documents: ", error);
    return { status: "fail", data: [] };
  }
  },
};

export default firestoreQueries;
