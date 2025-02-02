import axios from "axios";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useRef, useEffect, useState } from "react";
import styles from "../styles/Welcome.module.css";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase-config";
import {
  setInitialState,
  setURL,
  setDetails,
  setChapters,
} from "../config/playerSlice";
import { setCourses } from "../config/userSlice";
function LinkInput() {
  var inputRef = useRef(null);
  let navigate = useNavigate();
  const dispatch = useDispatch();

  var key = process.env.YOUTUBE_API_KEY;
  var baseURL = "https://www.googleapis.com/youtube/v3/videos";
  const { uid, name, courses } = useSelector((state) => state.user.value);
  const CourseData = useSelector((state) => state.player.value);
  const [chapters, setchapters] = useState(null);
  const [title, setTitle] = useState("");
  const [channel, setChannel] = useState("");
  const [thumbnail, setThumbnail] = useState("");

  function getVideoId(url) {
    let regex = /https\:\/\/www\.youtube\.com\/watch\?v=([\w-]{11})/;

    const id = url.match(regex)[1];
    return id;
  }
  function parseDescription(desc) {
    var list_of_chapters = [];
    var file = [];

    file = desc.split("\n");
    for (var l in file) {
      var line = file[l].trim();
      var result = "";
      var chapter = "";

      result = line.match(/\(?(\d+[:]\d+[:]\d+)\)?/);

      if (result === null) {
        result = line.match(/\(?(\d+[:]\d+)\)?/);
      }

      if (result === null) continue;
      chapter = line.split(result[1]);
      list_of_chapters.push([result[1], chapter[1]]);
    }

    return list_of_chapters;
  }

  async function loadDescription() {
    var url = inputRef.current.value;
    // console.log(url);
    let videoID = getVideoId(url);
    // console.log(videoID);
    // console.log(courses);
    if (courses.includes(videoID)) {
      const docRef = doc(db, "users", uid);
      // console.log("Docref",docRef);
      const docSnap = await getDoc(docRef);
      // console.log(docSnap);
      const data = docSnap.data();
      // console.log(data);
      dispatch(setChapters(data.courses[videoID].chapters));
      dispatch(
        setDetails({
          title: data.courses[videoID].title,
          channel: data.courses[videoID].channel,
        })
      );
      // console.log("already there!");
      navigate("/player");
      return;
    }
    dispatch(setCourses(videoID));
    axios
      .get(baseURL, {
        params: {
          part: "snippet",
          key: key,
          id: videoID,
        },
      })
      .then((result) => {
        // console.log("Result from axios", result);
        const data = parseDescription(result.data.items[0].snippet.description);
        // console.log("data from axios ",data);
        setTitle(result.data.items[0].snippet.title);
        setChannel(result.data.items[0].snippet.channelTitle);
        setThumbnail(result.data.items[0].snippet.thumbnails.high.url);

        dispatch(
          setDetails({
            title: result.data.items[0].snippet.title,
            channel: result.data.items[0].snippet.channelTitle,
          })
        );
        // console.log("console. fron axios ",data);

        var cplist = {};
        for (var i in data) {
          var time = data[i][0].split(":");
          var seconds = 0;
          if (time.length === 2) {
            seconds = parseInt(time[0]) * 60 + parseInt(time[1]);
          } else {
            seconds =
              parseInt(time[0]) * 3600 +
              parseInt(time[1]) * 60 +
              parseInt(time[2]);
          }

          cplist[i] = {
            time: seconds,
            title: data[i][1],
            played: false,
          };
        }

        const numChapters = Object.keys(cplist).length;

        for (var j = 1; j < numChapters; j++) {
          cplist[j - 1]["end"] = cplist[j]["time"];
        }

        // console.log("----------------------", numChapters);
        setchapters(cplist);
        dispatch(setChapters(cplist));
      })
      .catch((err) => {
        // console.log("Error from Axios", err);
      });
  }
  const handleButtonClick = async (e) => {
    e.preventDefault();
    // console.log("handlbutton");
    dispatch(setInitialState());
    dispatch(setURL(inputRef.current.value));
    await loadDescription();
    // console.log(" fomr handle click button", inputRef.current.value);
  };
  useEffect(() => {
    if (chapters != null) {
      var url = inputRef.current.value;
      let videoID = getVideoId(url);

      async function sendData() {
        // console.log("hello world");
        // console.log(chapters);
        await updateDoc(doc(db, "users", uid), {
          [`courses.${videoID}`]: {
            videoID: videoID,
            chapters: chapters,
            title: title,
            channel: channel,
            thumbnail: thumbnail,
          },
        });
        navigate("/player");
      }
      sendData();
    }
  }, [chapters]);

  useEffect(() => {
    if (uid === null || uid === "") {
      navigate("/login");
    }
  }, []);
  // [] empty array means it will only run once when the component is mounted
  // no array means after every render
  // [a] whenever a changes

  return (
    <div>
      <form className={styles.linkinput}>
        <h1>Welcome {name} </h1>
        <input ref={inputRef} type="text" name="url"></input>
        <button onClick={handleButtonClick}>Proceed</button>
      </form>
    </div>
  );
}

export default LinkInput;
