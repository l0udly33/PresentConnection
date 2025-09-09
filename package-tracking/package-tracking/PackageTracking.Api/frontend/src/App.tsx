import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PackageList from "./components/PackageList";
import PackageDetail from "./components/PackageDetail.tsx";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PackageList />} />
        <Route path="/packages/:id" element={<PackageDetail />} />
      </Routes>
    </Router>
  );
}


