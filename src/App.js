import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import LinkInput from "./components/LinkInput";
import MyCourses from "./pages/home/MyCourses";
import {app} from "./config/firebase-config";
import Course from "./pages/home/Course";
import Header from "./components/Header";
function App() {
  return (
    <Router>
      <Header/>
      <Routes>
        <Route path="/" element={<LinkInput/>} />
        <Route path="/register" element={<Register/>} />
        <Route path="/login" element={<Login/>} />
        <Route path = "/mycourses" element = { <MyCourses/> } />
        <Route path = "/player" element = { <Course/> } />
      </Routes>
    </Router>
  );
}

export default App;
