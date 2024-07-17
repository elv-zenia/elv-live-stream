import {Navigate, Route, Routes} from "react-router-dom";
import {observer} from "mobx-react-lite";
import Create from "@/pages/create/Create.jsx";
import Streams from "@/pages/streams/Streams.jsx";
import Monitor from "@/pages/monitor/Monitor.jsx";
import StreamPreview from "@/pages/streams/StreamPreview.jsx";
import StreamDetailsPage from "@/pages/stream-details/StreamDetailsPage";

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
