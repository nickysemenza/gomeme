import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProtoTest from "./ProtoTest";
import SystemInfoView from "./SystemInfoView";

const App: React.FC = () => {
  return (
    <div className="App antialiased">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ProtoTest />} />
          <Route path="/system" element={<SystemInfoView />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
