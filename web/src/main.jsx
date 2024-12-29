import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "@/components/components/ui/toaster";
import ErrorBoundary from "./components/components/ui/ErrorBoundary";
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
      <Toaster />
    </GoogleOAuthProvider>
  </StrictMode>
);