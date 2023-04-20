import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import React, { useState } from "react";
import { dbService, storageService } from "../fbase";
import { deleteObject, ref } from "firebase/storage";

const Nweet = ({ nweetObj, isOwner }) => {
  const [editing, setEditing] = useState(false);
  const [newNweet, setNewNweet] = useState(nweetObj.text);
  const onChange = (event) => {
    const {target:{value}} = event;
    setNewNweet(value);
  }
  const onSubmit = async (event) => {
    event.preventDefault();
    await updateDoc(doc(dbService, "nweets", `${nweetObj.id}`), {text: newNweet});
    setEditing(false);
  }
  const onDeleteClick = async () => {
    const ok = window.confirm("Are you sure you want to delete this Nweet?");
    if (ok) {
      await deleteDoc(doc(dbService, "nweets", `${nweetObj.id}`));
      if (nweetObj.attachmentUrl !== "") {
        await deleteObject(ref(storageService, nweetObj.attachmentUrl));
      }
    }
  };
  const toggleEditing = () => setEditing((prev) => !prev);

  return (
    <div>
      { editing ? (
        <>
          <form onSubmit={onSubmit}>
            <input type="text" placeholder="Edit Your Nweet" onChange={onChange} value={newNweet} required />
            <input type="submit" value="Update Nweet" />
          </form>
          <button onClick={toggleEditing} >Cancel</button>
        </>
      ) : (
        <>
          <h6>{nweetObj.creatorId}</h6>
          <h4>{nweetObj.text}</h4>
          { nweetObj.attachmentUrl && (<img src={nweetObj.attachmentUrl} alt="attachment" height="100px" width="100px" />)}
          <p></p>
          {isOwner && (
            <>
              <button onClick={onDeleteClick} >Delete Nweet</button>
              <button onClick={toggleEditing} >Edit Nweet</button>
            </>
          )}
        </>
      )}
    </div>
  )
}

export default Nweet;