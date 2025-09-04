import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Detail from "./pages/Detail";
import AddEdit from "./pages/AddEdit";
import { RequireAuth } from "./routes/RequireAuth";

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/doc/:id" element={<Detail />} />
        <Route
          path="/doc/new"
          element={
            <RequireAuth>
              <AddEdit />
            </RequireAuth>
          }
        />
        <Route
          path="/doc/:id/edit"
          element={
            <RequireAuth>
              <AddEdit />
            </RequireAuth>
          }
        />
      </Routes>
    </Router>
  );
}
