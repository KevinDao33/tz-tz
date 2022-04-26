/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
/* eslint-disable no-undef */
import React, {useState, useEffect} from "react";
import {initializeApp} from "firebase/app";
import {useNavigate} from "react-router-dom";
import {getStorage, ref, uploadBytes, getDownloadURL} from "firebase/storage";
import {
  getFirestore,
  // collection,
  // getDocs,
  onSnapshot,
  doc,
  updateDoc,
  // setDoc,
} from "firebase/firestore";
// import {useNavigate} from "react-router-dom";

import {
  EditWrapper,
  EditNavAllWrapper,
  EditNavLeftWrapper,
  EditNavRightWrapper,
  BackButton,
  EditTitle,
  CancelButton,
  SaveButton,
  InputTextWrapper,
  InputDescTextWrapper,
  InputTextTitle,
  InputText,
  InputFileWrapper,
  InputFileTitle,
  LabelFile,
  PhotoDisplay,
  InputFile,
  InputDesc,
} from "../styles/EditProfile.module";
// import {async} from "@firebase/util";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_APIKEY,
  authDomain: process.env.REACT_APP_FIREBASE_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECTID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGEBUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGINGSENDERID,
  appId: process.env.REACT_APP_FIREBASE_APPID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENTID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

function EditProfile(props) {
  const [userData, setUserData] = useState("");
  const [displayPhoto, setDisplayPhoto] = useState("");
  const [selectedFile, setSelectedFile] = useState("");
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newLink, setNewLink] = useState("");
  const [newUserPhotoName, setNewUserPhotoName] = useState("");

  const redirect = useNavigate();

  const getUserData = (userId) => {
    // eslint-disable-next-line no-unused-vars
    const unsub = onSnapshot(doc(db, "user", userId), (doc) => {
      if (!props.uid) {
        return;
      } else if (props.uid && !userData) {
        setUserData({
          name: doc.data().name,
          email: doc.data().email,
          role: doc.data().role,
          following: doc.data().following,
          follower: doc.data().follower,
          pic: doc.data().pic,
          id: doc.data().uid,
          link: doc.data().link,
          desc: doc.data().desc,
        });
        setDisplayPhoto(doc.data().pic);
        setNewDescription(doc.data().desc);
        setNewName(doc.data().name);
        setNewLink(doc.data().link);
        return;
      }
      return;
    });
  };

  useEffect(() => {
    props.uid && !userData && getUserData(props.uid);
  }, [props.uid]);

  const handleImageUpload = async (e) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const imageFile = e.target.files[0];
    setSelectedFile(imageFile);

    const imageName = imageFile.name.split(".");
    // localStorage.setItem("newUserPhotoName", imageName[0]);
    setNewUserPhotoName(imageName[0]);
  };

  useEffect(() => {
    if (!selectedFile) {
      return;
    }
    const objectUrl = URL.createObjectURL(selectedFile);
    setDisplayPhoto(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const handleNewName = (e) => {
    setNewName(e.target.value);
  };
  const handleNewDesc = (e) => {
    setNewDescription(e.target.value);
  };
  const handleNewLink = (e) => {
    setNewLink(e.target.value);
  };

  const back2Profile = () => {
    const leave = confirm("user data not changed, do you want to leave?");
    if (leave) {
      redirect("/profile");
    }
  };

  const cancelDataChange = () => {
    if (!userData) {
      alert("something went wrong, please try again later");

      return;
    }
    const cancel = confirm("data not saved, do you want to cancel update?");
    if (cancel) {
      setDisplayPhoto(userData.pic);
      setSelectedFile("");
      setNewName(userData.name);
      setNewLink(userData.link);
      setNewDescription(userData.desc);
    }
  };
  // =======================================
  const updateUserData = async () => {
    const userRef = doc(db, "user", props.uid);
    updateDoc(userRef, {
      name: newName,
      link: newLink,
      desc: newDescription,
    });
  };

  const getUserImageUrl = async (name) => {
    getDownloadURL(ref(storage, `profileImages/${name}`))
      .then((url) => {
        const userRef = doc(db, "user", props.uid);
        updateDoc(userRef, {
          pic: url,
        });
      })
      .then(() => {
        alert("profile updated!");
        redirect("/profile");
      });
  };

  async function uploadNewUserPhotoImage() {
    const storageRef = ref(storage, `profileImages/${newUserPhotoName}`);

    try {
      uploadBytes(storageRef, selectedFile).then(() =>
        getUserImageUrl(newUserPhotoName)
      );
    } catch (error) {
      console.log(error);
    }
  }

  const submitNewUserData = async () => {
    if (!newName && !newDescription && !newLink && !selectedFile) {
      alert("if not updating, press the leave-button on the left");

      return;
    } else if (newName || newDescription || newLink || selectedFile) {
      console.log("there are changes");
      if (selectedFile && !newName && !newDescription && !newLink) {
        // only new photo
        await uploadNewUserPhotoImage();
      } else if ((newName || newDescription || newLink) && !selectedFile) {
        // no new photo but other updates
        updateUserData();
      } else if ((newName || newDescription || newLink) && selectedFile) {
        // new photo and other updates
        //first upload new data to firestore
        await updateUserData();
        //then upload image and redirect to profile
        await uploadNewUserPhotoImage();
      }
    }
  };
  // =======================================

  return userData ? (
    <EditWrapper>
      <EditNavAllWrapper>
        <EditNavLeftWrapper>
          <BackButton onClick={back2Profile}>{"<-"}</BackButton>
          <EditTitle>Settings</EditTitle>
        </EditNavLeftWrapper>

        <EditNavRightWrapper>
          <CancelButton onClick={cancelDataChange}>Cancel</CancelButton>
          <SaveButton onClick={submitNewUserData}>Save</SaveButton>
        </EditNavRightWrapper>
      </EditNavAllWrapper>

      <InputFileWrapper>
        <LabelFile>
          <PhotoDisplay src={displayPhoto} />
          <InputFile
            type='file'
            accept='image/gif, image/jpeg, image/png, image/webp'
            multiple={false}
            onChange={handleImageUpload}></InputFile>
        </LabelFile>
        <InputFileTitle>{userData.name}</InputFileTitle>
      </InputFileWrapper>

      <InputTextWrapper>
        <InputTextTitle>Name</InputTextTitle>
        <InputText
          type='text'
          value={newName}
          onChange={handleNewName}></InputText>
      </InputTextWrapper>

      <InputTextWrapper>
        <InputTextTitle>Link</InputTextTitle>
        <InputText
          type='text'
          value={newLink}
          onChange={handleNewLink}></InputText>
      </InputTextWrapper>

      <InputDescTextWrapper>
        <InputTextTitle>About Me</InputTextTitle>
        <InputDesc
          type='text'
          value={newDescription}
          onChange={handleNewDesc}></InputDesc>
      </InputDescTextWrapper>
    </EditWrapper>
  ) : (
    <div>Loading</div>
  );
}

export default EditProfile;
