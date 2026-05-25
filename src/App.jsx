import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Music from "./pages/Music";
import Series from "./pages/Series";
import Epubs from "./pages/Epubs";
import ManageUsers from "./pages/ManageUsers";
function App() {
  return (
    <>
      <Toaster position="top-right" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />}>
            <Route path="music" element={<Music />} />
            <Route path="series" element={<Series />} />
            <Route path="epubs" element={<Epubs />} />
            <Route path="users" element={<ManageUsers />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
