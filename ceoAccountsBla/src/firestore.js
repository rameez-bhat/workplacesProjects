import {
  doc,
  setDoc,
  collection,
  getDoc,
  getDocs,
  addDoc,
  query,
  where,
  limit,
  deleteDoc,
  updateDoc,
  deleteField,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
const Databasecollection="CeoBla"
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
  async  deleteFieldWithCondition(databaseName, collectionName, fieldName, conditionField,conditionOperatior, conditionValue) {
  const collectionRef = collection(db,Databasecollection, databaseName, collectionName);
  const q = query(collectionRef, where(conditionField, "==", conditionValue));
  let result = {};

  try {
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      result = { status: "error", message: "No documents found matching the condition" };
      return result;
    }

    const updatePromises = querySnapshot.docs.map(async (docSnapshot) => {
      const docRef = docSnapshot.ref;
      await updateDoc(docRef, {
        [fieldName]: deleteField(),
      });
    });

    await Promise.all(updatePromises);

    result = { status: "success", message: "Field deleted successfully from all matching documents" };
  } catch (error) {
    result = { status: "error", message: error.message };
  }

  return result;
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
  async updateOrCreateById(databaseName, collectionName, documentId, data) {
  try {
    // Reference to the specific document by its ID (documentId)
    const docRef = doc(db,Databasecollection, databaseName, collectionName, documentId);

    // Check if the document with the given ID exists
    const docSnapshot = await getDoc(docRef);

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
  async updateOrCreateByField(databaseName, collectionName, fieldName, operatorValue,fieldValue, data) {
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
        return { status: 'success', message: 'Created successfully', docId: newDocRef.id };
      }
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  },

  // Delete document by ID
  async deleteDocumentById(databaseName, collectionName, documentId) {
    const docRef = doc(db, Databasecollection,databaseName, collectionName, documentId);
    await deleteDoc(docRef);
  },
  async deleteDocumentsByField(databaseName, collectionName, fieldName, fieldValue) {
    const colRef = collection(db,Databasecollection, databaseName, collectionName);
    const q = query(colRef, where(fieldName, '==', fieldValue));

    const querySnapshot = await getDocs(q);

    // Check if there are documents to delete
    if (querySnapshot.empty) {
        console.log('No matching documents found.');
        return;
    }

    // Iterate over each document found and delete it
    const deletePromises = querySnapshot.docs.map(async (docSnapshot) => {
        const docRef = doc(db,Databasecollection, databaseName, collectionName, docSnapshot.id);
        await deleteDoc(docRef);
        console.log(`Deleted document with ID: ${docSnapshot.id}`);
    });

    // Wait for all delete operations to complete
    await Promise.all(deletePromises);
},

  // Fetch data from specific collection (paginated and with filtering options)
  async FetchDataFromCollection(databaseName, collectionName, pageSize, filterField, filterCondition, filterValue, orderByField,orderByDirection,orderByField1=null,orderByDirection1=null) {
    try {
      const collectionRef = collection(db, Databasecollection,databaseName, collectionName);
      const queryConstraints = [limit(pageSize)];

      if (filterField && (filterValue || filterValue === "")) {
        queryConstraints.push(where(filterField, filterCondition, filterValue));
      }
		if (orderByField) {
      queryConstraints.push(orderBy(orderByField, orderByDirection || 'asc')); // Default to ascending if no direction is provided

    }
    if (orderByField1!=null) {
      queryConstraints.push(orderBy(orderByField1, orderByDirection1 || 'asc')); // Default to ascending if no direction is provided

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

    return data;
  },
  async updateFieldForAllDocuments(databaseName, collectionName, fieldName, fieldValue) 
  {
    const collectionRef = collection(db, Databasecollection, databaseName, collectionName);
    let result = {};
    try {
      const querySnapshot = await getDocs(collectionRef);
      if (querySnapshot.empty) 
      {
        return {
          status : "error",
          message : "No documents found in collection",
        };
      }
      const updatePromises = querySnapshot.docs.map(async (docSnapshot) => 
      {
        const docRef = docSnapshot.ref;
        await updateDoc(docRef, {
          [fieldName]: fieldValue
        });

      });
      await Promise.all(updatePromises);
      result = 
      {
        status: "success",
        message: "Field updated successfully for all documents"
      };

    } catch (error) {

      result = {
        status: "error",
        message: error.message
      };
    }
    return result;
  },
  async updateFieldForDocumentsWithCondition(
  databaseName,
  collectionName,
  conditionField,
  conditionOperator,
  conditionValue,
  updateField,
  updateValue
) {
  const collectionRef = collection(db, Databasecollection, databaseName, collectionName);
  let result = {};

  try {

    const q = query(
      collectionRef,
      where(conditionField, conditionOperator, conditionValue)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return {
        status: "error",
        message: "No documents found matching condition"
      };
    }

    const updatePromises = querySnapshot.docs.map(async (docSnapshot) => {

      const docRef = docSnapshot.ref;
//console.log("docRef--->",docRef)
      await updateDoc(docRef, {
        [updateField]: updateValue
      });

    });
    //console.log("updatePromises--->",updatePromises)

    await Promise.all(updatePromises);

    result = {
      status: "success",
      message: `Updated ${querySnapshot.size} documents successfully`
    };

  } catch (error) {

    result = {
      status: "error",
      message: error.message
    };

  }

  return result;
},
  async copyCollection (databaseName,sourceCollection, targetCollection,AlreadyData){
  try {
    // Step 1: Fetch all documents from the source collection
    const querySnapshot = await getDocs(collection(db,Databasecollection,databaseName, sourceCollection));
      let KeyD="";
    // Step 2: Iterate over each document in the source collection
    querySnapshot.forEach(async (document) => {
      const docData = document.data(); // Get document data
      if(typeof docData.Frieda=="undefined")
      {
         KeyD=docData.HId+"_"+docData.PId;
         console.log("docData=====>",docData)
        docData.Frieda=AlreadyData[KeyD].Frieda;
        // Step 3: Prepare the document for saving in the target collection
        //const convertedDataForSaving = convertRotationsArrayToMap(docData);

        // Step 4: Set the document in the target collection (same doc id)

        const targetDocRef = doc(db,  Databasecollection, databaseName, targetCollection, document.id);
        await setDoc(targetDocRef, docData, { merge: true });

        console.log(`Document ${document.id} copied successfully.`);
      }

    });

    console.log("All documents copied successfully.");
  } catch (error) {
    console.error("Error copying collection: ", error);
  }
},
};

export default firestoreQueries;
