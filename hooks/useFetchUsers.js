import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/utils/firebaseUtils/firebase";

function useFetchUsers() {
  const [users, setUsers] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleScroll = async () => {
    if (loading || !lastDoc) {
      return;
    }

    setLoading(true);
    const query = collection(db, "users").startAfter(lastDoc).limit(20);
    const snapshot = await getDocs(query);

    const newUsers = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setUsers((prevUsers) => [...prevUsers, ...newUsers]);
    setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
    setLoading(false);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const UsersRef = collection(db, "users");
      const q = query(UsersRef, orderBy("name"), limit(5));
      const snapshot = await getDocs(q);

      const newUsers = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setUsers(newUsers);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setLoading(false);
    };

    fetchUsers();
  }, []);

  return { users, lastDoc, loading, handleScroll };
}

export default useFetchUsers;
