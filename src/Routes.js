import {Navigate, Route, Routes} from "react-router-dom";
import React from "react";
import {observer} from "mobx-react";
import Create from "Pages/create/Create";
import Streams from "Pages/streams/Streams";
import Monitor from "Pages/monitor/Monitor";
import StreamPreview from "Pages/streams/StreamPreview";
import StreamDetailsPage from "Pages/stream-details/StreamDetailsPage";

const AppRoutes = observer(() => {
  return (
    <Routes>
      <Route path="/" element={<Navigate replace to="/streams" />} />
      <Route path="/create" element={<Create />} />
      <Route path="/streams/:id" element={<StreamDetailsPage />} />
      <Route path="/streams" element={<Streams />} />
      <Route path="/monitor" element={<Monitor />} />
      <Route path="/streams/:id/preview" element={<StreamPreview />} />
    </Routes>
  );
});

export default AppRoutes;
