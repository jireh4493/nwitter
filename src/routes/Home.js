import React, { useEffect, useRef, useState } from "react";
import { dbService, storageService } from "../fbase";
import { addDoc, collection, onSnapshot, orderBy, query } from "firebase/firestore";
import Nweet from "../components/Nweet";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

const Home = ({ userObj }) => {
  const [nweet, setNweet] = useState("");
  const [nweets, setNweets] = useState([]);
  const [attachment, setAttachment] = useState("");
  const fileInput = useRef();
  useEffect(() => {
    const orededQuery = query(collection(dbService, "nweets"), orderBy("createdAt", "desc"));
    onSnapshot(orededQuery, (snapshot) => {
      const nweetArray = snapshot.docs.map(document => ({
        id: document.id,
        ...document.data(),
      }));
      setNweets(nweetArray);
    });
  }, []);
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
    const { target : {value}} = event;
    setNweet(value);
  };
  const onFileChange = async (event) => {
    const { target: { files } } = event;
    const theFile = files[0];
    const reader = new FileReader();
    reader.onloadend = (finishedEvent) => {
      const {currentTarget:{result}} = finishedEvent;
      setAttachment(result);
    }
    await reader.readAsDataURL(theFile);
  };
  const onClearPhotoClick = () => {
    setAttachment(null)
    fileInput.current.value = "";
  };

  return (
    <div>
      <form onSubmit={onSubmit}>
        <input value={nweet} onChange={onChange} type="text" placeholder="What's on your mind" maxLength={120} />
        <input onChange={onFileChange} ref={fileInput} type="file" accept="image/*" />
        <input type="submit" value="Nweet" />
        { attachment && (<div>
          <img src={attachment} width="50px" height="50px" alt="preview" />
          <button onClick={onClearPhotoClick} >Clear</button>
        </div>)}
      </form>
      <div>
        {nweets.map((nweet) => (
          <Nweet key={nweet.id} nweetObj={nweet} isOwner={nweet.creatorId === userObj.uid} />  
        ))}
      </div>
    </div>
  )
};
export default Home;