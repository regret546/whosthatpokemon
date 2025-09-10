<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Services\AuthService;
use App\Services\GoogleOAuthService;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;

class AuthController extends BaseController
{
    private AuthService $authService;

    public function __construct()
    {
        $this->authService = new AuthService();
    }

    public function login(ServerRequestInterface $request, ResponseInterface $response): ResponseInterface
    {
        $data = $this->getJsonBody($request);

        try {
            $result = $this->authService->login($data['email'] ?? '', $data['password'] ?? '');

            if (!$result) {
                return $this->errorResponse($response, 'Invalid credentials', 401);
            }

            return $this->successResponse($response, $result, 'Login successful');
        } catch (\Exception $e) {
            return $this->errorResponse($response, $e->getMessage(), 500);
        }
    }

    public function register(ServerRequestInterface $request, ResponseInterface $response): ResponseInterface
    {
        $data = $this->getJsonBody($request);

        try {
            $result = $this->authService->register(
                $data['username'] ?? '',
                $data['email'] ?? '',
                $data['password'] ?? ''
            );

            if (!$result) {
                return $this->errorResponse($response, 'Registration failed', 400);
            }

            return $this->successResponse($response, $result, 'Registration successful', 201);
        } catch (\Exception $e) {
            return $this->errorResponse($response, $e->getMessage(), 500);
        }
    }

    public function guestLogin(ServerRequestInterface $request, ResponseInterface $response): ResponseInterface
    {
        $data = $this->getJsonBody($request);

        try {
            $result = $this->authService->guestLogin($data['username'] ?? '');

            if (!$result) {
                return $this->errorResponse($response, 'Guest login failed', 400);
            }

            return $this->successResponse($response, $result, 'Guest login successful');
        } catch (\Exception $e) {
            return $this->errorResponse($response, $e->getMessage(), 500);
        }
    }

    public function refreshToken(ServerRequestInterface $request, ResponseInterface $response): ResponseInterface
    {
        $data = $this->getJsonBody($request);

        try {
            $result = $this->authService->refreshToken($data['refreshToken'] ?? '');

            if (!$result) {
                return $this->errorResponse($response, 'Token refresh failed', 401);
            }

            return $this->successResponse($response, $result, 'Token refreshed successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($response, $e->getMessage(), 401);
        }
    }

    public function logout(ServerRequestInterface $request, ResponseInterface $response): ResponseInterface
    {
        try {
            $this->authService->logout();
            return $this->successResponse($response, null, 'Logout successful');
        } catch (\Exception $e) {
            return $this->errorResponse($response, $e->getMessage(), 500);
        }
    }

    public function me(ServerRequestInterface $request, ResponseInterface $response): ResponseInterface
    {
        $current = parent::getCurrentUser($request);
        if (!$current) {
            return $this->errorResponse($response, 'User not found', 404);
        }
        // Ensure daily energy is reset and return formatted user
        $user = $this->authService->getUserWithDailyEnergy($current['id']);
        return $this->successResponse($response, $user, 'User retrieved successfully');
    }

    public function updateProfile(ServerRequestInterface $request, ResponseInterface $response): ResponseInterface
    {
        $user = $this->getCurrentUser($request);
        $data = $this->getJsonBody($request);

        if (!$user) {
            return $this->errorResponse($response, 'User not found', 404);
        }

        try {
            $result = $this->authService->updateProfile($user['id'], $data);

            if (!$result) {
                return $this->errorResponse($response, 'Profile update failed', 400);
            }

            return $this->successResponse($response, $result, 'Profile updated successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($response, $e->getMessage(), 500);
        }
    }

    public function googleUrl(ServerRequestInterface $request, ResponseInterface $response): ResponseInterface
    {
        try {
            $oauth = new GoogleOAuthService();
            $url = $oauth->getAuthUrl();
            return $this->successResponse($response, ['url' => $url], 'OK');
        } catch (\Throwable $e) {
            return $this->errorResponse($response, $e->getMessage(), 500);
        }
    }

    public function googleCallback(ServerRequestInterface $request, ResponseInterface $response): ResponseInterface
    {
        $data = $this->getJsonBody($request);
        $code = $data['code'] ?? null;

        // Debug logging
        error_log("Google callback received data: " . json_encode($data));
        error_log("Request ID: " . ($_SERVER['HTTP_X_REQUEST_ID'] ?? 'none'));

        if (!$code) {
            error_log("Missing authorization code in Google callback");
            return $this->errorResponse($response, 'Missing authorization code', 400);
        }

        // Check if this code has already been processed recently
        $cacheKey = 'google_code_' . md5($code);
        
        // Use APCu if available, otherwise fall back to session
        if (function_exists('apcu_exists') && apcu_exists($cacheKey)) {
            error_log("Authorization code already processed recently (APCu): " . substr($code, 0, 10) . "...");
            return $this->errorResponse($response, 'Authorization code has already been used. Please try logging in again.', 400);
        }
        
        // Fallback to session-based caching
        session_start();
        if (isset($_SESSION[$cacheKey]) && (time() - $_SESSION[$cacheKey]) < 300) {
            error_log("Authorization code already processed recently (Session): " . substr($code, 0, 10) . "...");
            return $this->errorResponse($response, 'Authorization code has already been used. Please try logging in again.', 400);
        }

        try {
            $oauth = new GoogleOAuthService();
            error_log("Exchanging code for tokens...");
            $tokens = $oauth->exchangeCode($code);
            error_log("Tokens received: " . json_encode(array_keys($tokens)));

            // Mark this code as processed for 5 minutes to prevent reuse
            if (function_exists('apcu_store')) {
                apcu_store($cacheKey, true, 300);
            } else {
                $_SESSION[$cacheKey] = time();
            }

            error_log("Getting user info...");
            $info = $oauth->getUserInfo($tokens['access_token']);
            error_log("User info received: " . json_encode($info));

            error_log("Logging in with Google profile...");
            $result = $this->authService->loginWithGoogleProfile($info);
            error_log("Login successful");

            return $this->successResponse($response, $result, 'Google login successful');
        } catch (\Throwable $e) {
            error_log("Google callback error: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            return $this->errorResponse($response, $e->getMessage(), 400);
        }
    }
}
