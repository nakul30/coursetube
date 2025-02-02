import React, { useState, useEffect } from "react";
import { app, db } from "../../config/firebase-config";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import styles from "../../styles/CourseCard.module.css";
import CourseCard from "../../components/CourseCard";
import { getDoc, doc } from "firebase/firestore";
function MyCourses() {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const { uid, name } = useSelector((state) => state.user.value);
    useEffect(() => {
        if (uid === null || uid === "") {
            navigate("/login");
        }
        // console.log("In My courses page");
        async function getChapters() {
            const docRef = doc(db, "users", uid);
            const docSnap = await getDoc(docRef);
            const data = docSnap.data();
            // console.log(docSnap.data());
            // console.log(Object.keys(data.courses));
            var courseList = [];
            Object.keys(data.courses).forEach((key) => {
                // console.log(key);
                // console.log(data.courses[key]);
                courseList.push(data.courses[key]);
            });
            // console.log(courseList);
            setCourses(courseList);
        }
        getChapters();
    }, []);
    return (
        <div className={styles.grid}>
            {courses.length > 0 &&
                courses.map((course) => (
                    <CourseCard
                        course={course}
                        key={course.videoId}
                    ></CourseCard>
                ))}
        </div>
    )
}

export default MyCourses
