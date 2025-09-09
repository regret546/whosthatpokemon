import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import toast from "react-hot-toast";

// Function to exchange authorization code for user info
async function exchangeCodeForUserInfo(code: string) {
  const clientId = (import.meta as any).env.VITE_GOOGLE_CLIENT_ID;
  const clientSecret = (import.meta as any).env.VITE_GOOGLE_CLIENT_SECRET;
  const redirectUri = "http://localhost:5173/auth/callback";

  // Step 1: Exchange code for access token
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code: code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenResponse.ok) {
    const error = await tokenResponse.text();
    throw new Error(`Token exchange failed: ${error}`);
  }

  const tokenData = await tokenResponse.json();
  const accessToken = tokenData.access_token;

  // Step 2: Get user info from Google
  const userInfoResponse = await fetch(
    "https://openidconnect.googleapis.com/v1/userinfo",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!userInfoResponse.ok) {
    const error = await userInfoResponse.text();
    throw new Error(`User info fetch failed: ${error}`);
  }

  return await userInfoResponse.json();
}

const AuthCallbackPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { loginWithGoogle, isLoading } = useAuthStore();

  useEffect(() => {
    console.log("AuthCallbackPage: URL search params:", location.search);
    const params = new URLSearchParams(location.search);
    const code = params.get("code");
    const error = params.get("error");

    console.log("AuthCallbackPage: Code:", code, "Error:", error);

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

    (async () => {
      try {
        console.log(
          "AuthCallbackPage: Starting Google OAuth process with code:",
          code
        );

        // Exchange the authorization code for user info directly from Google
        const userInfo = await exchangeCodeForUserInfo(code);

        console.log(
          "AuthCallbackPage: Received user info from Google:",
          userInfo
        );

        // Create user object from Google response
        const user = {
          id: userInfo.sub || `google_${Date.now()}`,
          username:
            userInfo.name || userInfo.email?.split("@")[0] || "Google User",
          email: userInfo.email || "",
          isGuest: false,
          isVerified: true,
          avatarUrl: userInfo.picture || null,
          pokeEnergy: 10,
          createdAt: new Date().toISOString(),
          lastActiveAt: new Date().toISOString(),
          lastActive: new Date().toISOString(),
        };

        console.log("AuthCallbackPage: Created user object:", user);

        // Update the store with real user data
        useAuthStore.setState({
          user: user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        console.log("AuthCallbackPage: Updated store state");
        toast.success(`Welcome, ${user.username}!`);
        console.log("AuthCallbackPage: Navigating to game page");
        navigate("/game", { replace: true });
      } catch (error) {
        console.error("AuthCallbackPage: Google login error:", error);
        toast.error("Google login failed. Please try again.");
        navigate("/", { replace: true });
      }
    })();
  }, [location.search, loginWithGoogle, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <LoadingSpinner size="lg" />
    </div>
  );
};

export default AuthCallbackPage;
