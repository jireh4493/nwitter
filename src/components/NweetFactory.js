import React, { useRef, useState } from "react";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { dbService, storageService } from "../fbase";
import { addDoc, collection } from "firebase/firestore";

const NweetFactory = ({ userObj }) => {
  const [nweet, setNweet] = useState("");
  const [attachment, setAttachment] = useState("");
  const fileInput = useRef();

  const onSubmit = async (event) => {
    event.preventDefault();
    let attachmentUrl = "";
    if (attachment !== "") {
      const attachmentRef = ref(storageService, `${userObj.uid}/${uuidv4()}`);
      const response = await uploadString(attachmentRef, attachment, "data_url");
      attachmentUrl = await getDownloadURL(response.ref);
    }

    const nweetFrame = {
      text: nweet,
      createdAt: Date.now(),
      creatorId: userObj.uid,
      attachmentUrl,
    }
    await addDoc(collection(dbService, "nweets"), (nweetFrame));
    setNweet("");
    setAttachment("");
    fileInput.current.value = "";
  };
  const onChange = (event) => {
    const { target: { value } } = event;
    setNweet(value);
  };
  const onFileChange = async (event) => {
    const { target: { files } } = event;
    const theFile = files[0];
    const reader = new FileReader();
    reader.onloadend = (finishedEvent) => {
      const { currentTarget: { result } } = finishedEvent;
      setAttachment(result);
    }
    await reader.readAsDataURL(theFile);
  };
  const onClearPhotoClick = () => {
    setAttachment(null)
    fileInput.current.value = "";
  };

  return (
    <>
      <form onSubmit={onSubmit}>
        <input value={nweet} onChange={onChange} type="text" placeholder="What's on your mind" maxLength={120} />
        <input onChange={onFileChange} ref={fileInput} type="file" accept="image/*" />
        <input type="submit" value="Nweet" />
        {attachment && (<div>
          <img src={attachment} width="50px" height="50px" alt="preview" />
          <button onClick={onClearPhotoClick} >Clear</button>
        </div>)}
      </form>
    </>
  )
}

export default NweetFactory;
