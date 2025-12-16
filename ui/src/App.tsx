import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ProtoTest from "./ProtoTest";
import SystemInfoView from "./SystemInfoView";
import MemeEditor from "./MemeEditor";

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="App antialiased">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<ProtoTest />} />
            <Route path="/system" element={<SystemInfoView />} />
            <Route path="/editor" element={<MemeEditor />} />
          </Routes>
        </BrowserRouter>
      </div>
    </QueryClientProvider>
  );
};

export default App;
