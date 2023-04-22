import React, { useState, useEffect } from "react";
import { authService, dbService } from "../fbase";
import { useHistory } from "react-router-dom";
import { signOut, updateProfile } from "firebase/auth";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";

const Profile = ({ userObj, refreshUser }) => {
  const [newDisplayName, setNewDisplayName] = useState(userObj.displayName);
  const history = useHistory();
  if (userObj.displayName === null) {
    const name = userObj.email.split('@')[0];
    userObj.displayName = name;
  }
  const onSubmit = async (event) => {
    event.preventDefault();
    if (userObj.displayName !== newDisplayName) {
      await updateProfile(authService.currentUser, {displayName: newDisplayName});
    }
    refreshUser();
  }
  const onChange = (event) => {
    const {target:{value}} = event;
    setNewDisplayName(value);
  }
  const onLogOutClick = () => {
    signOut(authService);
    history.push("/");
  };
  const getMyNweets = async () => {
    const userQuery = query(collection(dbService, "nweets"),
      where("creatorId", "==", userObj.uid),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(userQuery);
    querySnapshot.forEach((document) => {
      console.log(document.id, "=>", document.data());
    })
  }
  useEffect(() => {
    getMyNweets();
    // temporary solution!!!!!!!!!!!!!!!!!!!!!!!!!!
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <form onSubmit={onSubmit}>
        <input value={newDisplayName} onChange={onChange} type="text" placeholder="Display name" />
        <input type="submit" value="Update Profile" />
      </form>
      <button onClick={onLogOutClick}>Log Out</button>
    </>
  );
};

export default Profile;