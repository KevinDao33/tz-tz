import React, {useEffect, useState} from "react";
import {NavLink, useNavigate} from "react-router-dom";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  doc,
} from "firebase/firestore";
import PropTypes from "prop-types";

import {
  NavbarBlank,
  NavbarWrapper,
  LogoWrapper,
  NavLefttWrapper,
  NavRightWrapper,
  Notify,
  MemberPictureWrapper,
  AllNotificationWrapper,
  NotificationTitle,
  NotificationWrapper,
  AuthorImageWrapper,
  NotificationMessageWrapper,
  NotificationIsReadMark,
  NoNotification,
  NavTitle,
} from "../styles/Navbar.module";

function Navbar({db, uid}) {
  const [isShowNotification, setIsShowNotofication] = useState(false);
  const [notificationData, setNotificationData] = useState([]);
  const [isUnRead, setIsUnRead] = useState(false);
  const [pageNow, setPageNow] = useState("");

  const redirect = useNavigate();

  const handleIsShowNotification = () => {
    setIsShowNotofication((prev) => !prev);
  };

  const listen2NewNotification = async () => {
    const allNotificationDataRef = query(
      collection(db, "user", uid, "notification"),
      orderBy("timeStamp")
    );

    onSnapshot(allNotificationDataRef, (querySnapshot) => {
      let allNotifications = [];
      querySnapshot.forEach((doc) => {
        allNotifications.push(doc.data());
      });

      setNotificationData(allNotifications.reverse());
    });
  };

  useEffect(() => {
    uid && listen2NewNotification();
  }, [uid]);

  const upDateNotificationIsRead = async (notiId) => {
    const allNotificationDataRef = doc(db, "user", uid, "notification", notiId);
    await updateDoc(allNotificationDataRef, {
      isRead: true,
    });
    setNotificationData((prev) => [...prev, {isRead: true}]);
  };

  useEffect(() => {
    notificationData.length > 0 &&
      notificationData.map((noti) => {
        !noti.isRead && setIsUnRead(true);
      });
  }, [notificationData]);

  const getPageNow = () => {
    const url = window.location.href;
    const decodeUrl = decodeURI(url);
    const lastSegment = decodeUrl.split("/").pop();
    setPageNow(lastSegment);
  };

  useEffect(() => {
    getPageNow();
  }, [window.location.href]);

  return (
    <>
      <NavbarBlank />
      <NavbarWrapper>
        <NavLefttWrapper>
          <NavLink to='/'>
            <LogoWrapper />
          </NavLink>

          <NavLink to='/' style={{textDecoration: "none", color: "inherit"}}>
            <NavTitle $isPageNow={pageNow == ""}>Tattoos</NavTitle>
          </NavLink>

          <NavLink
            to='/tattoo-plan'
            style={{textDecoration: "none", color: "inherit"}}>
            <NavTitle $isPageNow={pageNow == "tattoo-plan"}>Plans</NavTitle>
          </NavLink>
        </NavLefttWrapper>

        <NavRightWrapper>
          <Notify onClick={handleIsShowNotification} $isUnRead={isUnRead} />
          <NavLink to='/profile'>
            <MemberPictureWrapper />
          </NavLink>

          <AllNotificationWrapper $showNoti={isShowNotification}>
            <NotificationTitle>Notifications</NotificationTitle>
            {notificationData.length > 0 ? (
              notificationData.map((noti) => (
                <NotificationWrapper
                  id='NotificationWrapper'
                  key={noti.pinId}
                  onClick={async () => {
                    !noti.isRead &&
                      (await upDateNotificationIsRead(noti.notificationId));

                    redirect(`/pin-detail/${noti.pinId}`);
                  }}>
                  <AuthorImageWrapper src={noti.authorPic} />
                  <NotificationMessageWrapper>
                    {`${noti.authorName} just created a new pin`}
                  </NotificationMessageWrapper>
                  {noti.isRead ? <></> : <NotificationIsReadMark />}
                </NotificationWrapper>
              ))
            ) : (
              <NotificationWrapper>
                <NoNotification>No Notification :(</NoNotification>
              </NotificationWrapper>
            )}
          </AllNotificationWrapper>
        </NavRightWrapper>
      </NavbarWrapper>
    </>
  );
}

Navbar.propTypes = {
  db: PropTypes.object,
  uid: PropTypes.string,
};

export default Navbar;
