import React, { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import toast from "react-hot-toast";

// Global set to track used authorization codes
const usedCodes = new Set<string>();

const AuthCallbackPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { loginWithGoogle, isAuthenticated } = useAuthStore();

  const handledRef = useRef(false);
  const processingRef = useRef(false);

  useEffect(() => {
    // If already authenticated, redirect to game immediately
    if (isAuthenticated) {
      console.log(
        "AuthCallbackPage: Already authenticated, redirecting to game"
      );
      navigate("/game", { replace: true });
      return;
    }

    // Prevent double-run in React StrictMode
    if (handledRef.current) {
      console.log("AuthCallbackPage: Already handled, skipping");
      return;
    }

    // Prevent concurrent processing
    if (processingRef.current) {
      console.log(
        "AuthCallbackPage: Already processing, skipping duplicate call"
      );
      return;
    }

    console.log("AuthCallbackPage: URL search params:", location.search);
    const params = new URLSearchParams(location.search);
    const code = params.get("code");
    const error = params.get("error");

    console.log("AuthCallbackPage: Code:", code, "Error:", error);
    console.log("AuthCallbackPage: Full URL:", window.location.href);

    if (error) {
      console.error("AuthCallbackPage: OAuth error:", error);
      toast.error(`OAuth error: ${error}`);
      navigate("/");
      return;
    }

    if (!code) {
      console.error("AuthCallbackPage: Missing authorization code");
      toast.error("Missing authorization code.");
      navigate("/");
      return;
    }

    // Check if this code has already been used
    if (usedCodes.has(code)) {
      console.log("AuthCallbackPage: Code already used, skipping");
      navigate("/game", { replace: true });
      return;
    }

    // Mark code as used immediately
    usedCodes.add(code);

    handledRef.current = true;
    processingRef.current = true;

    const processGoogleCallback = async () => {
      try {
        console.log(
          "AuthCallbackPage: Starting Google OAuth process with code:",
          code
        );

        // Use the auth store's loginWithGoogle method
        await loginWithGoogle(code);

        console.log("AuthCallbackPage: Google login successful");
        console.log("AuthCallbackPage: Navigating to game page");
        navigate("/game", { replace: true });
      } catch (error) {
        console.error("AuthCallbackPage: Google login error:", error);
        toast.error("Google login failed. Please try again.");
        navigate("/", { replace: true });
      } finally {
        processingRef.current = false;
      }
    };

    processGoogleCallback();
  }, [location.search, navigate, loginWithGoogle, isAuthenticated]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <LoadingSpinner size="lg" />
    </div>
  );
};

export default AuthCallbackPage;
