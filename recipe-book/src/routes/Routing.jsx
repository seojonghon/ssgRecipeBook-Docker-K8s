import { Routes, Route } from "react-router-dom";
import Signup from "../pages/auth/signup/Signup";
import Post from '../pages/post/Post';

function Routing() {
  return (
    <Routes>
      <Route path="/" element={<></>} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/posts/:id" element={<Post />} />
    </Routes>
  );
}

export default Routing;
