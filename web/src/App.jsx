import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import AppSidebar from "./components/sidebar";
import ConversationFiles from "./pages/Library";
import FileUpload from "./pages/FileUpload";
import Metrics from "./pages/Metric";
import Reports from "./pages/Reports";
import { LoginForm } from "./pages/Login";
import LandingPage from "./pages/LandingPage/LandingPage";
import { RegisterForm } from "./pages/Register";
import { Button } from "@/components/components/ui/button";
import { setNavigate } from "./services/navigationService";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/hooks/use-toast";
import WebSocketProvider from "./provider/websocketProvider";
import { getToken } from "./config/utils";
import Conversation from "./pages/Conversation";

const AppWrapper = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [token, setToken] = useState();

  const location = useLocation();

  const excludeSidebarRoutes = [
    "/login", // Static route
    "/register", // Static route
    "/conversation/", // Dynamic route prefix
  ];

  const excludeTokenCheckRoutes = ["/login", "/register"];

  const isConverstaionScreen = location.pathname.startsWith("/conversation/");

  // Check if the route should exclude the sidebar
  const shouldShowSidebar = !excludeSidebarRoutes.some(
    (route) => location.pathname.startsWith(route) || location.pathname === "/"
  );

  // Check if the route requires token validation
  const shouldCheckToken = !excludeTokenCheckRoutes.some((route) =>
    location.pathname.startsWith(route)
  );

  React.useEffect(() => {
    setNavigate(navigate); // Set the navigation function globally
  }, [navigate]);

  React.useEffect(() => {
    setToken(getToken());
  }, [shouldCheckToken]);

  return (
    <WebSocketProvider token={token}>
      <div
        className={`${shouldShowSidebar ? "flex min-h-screen w-screen" : ""}`}
      >
        {shouldShowSidebar && <AppSidebar />}
        <div
          className={`${
            shouldShowSidebar
              ? "flex-1 flex justify-center items-center"
              : isConverstaionScreen
              ? "w-screen"
              : "w-screen px-4" // Add padding for non-sidebar pages
          }`}
        >
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/library" element={<ConversationFiles />} />
            <Route path="/file-upload" element={<FileUpload />} />
            <Route path="/metrics" element={<Metrics />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/conversation/:id" element={<Conversation />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </div>
    </WebSocketProvider>
  );
};

const App = () => {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
};

export default App;
