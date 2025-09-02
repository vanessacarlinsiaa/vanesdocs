import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Detail from "./pages/Detail";
import AddEdit from "./pages/AddEdit";

function NotFound() {
  return <main style={{ padding: 16 }}>Halaman tidak ditemukan</main>;
}

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/doc/new" element={<AddEdit />} />
        <Route path="/doc/:id" element={<Detail />} />
        <Route path="/doc/:id/edit" element={<AddEdit />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
