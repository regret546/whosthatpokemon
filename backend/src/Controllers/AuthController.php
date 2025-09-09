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

    public function getCurrentUser(ServerRequestInterface $request, ResponseInterface $response): ResponseInterface
    {
        $user = $this->getCurrentUser($request);

        if (!$user) {
            return $this->errorResponse($response, 'User not found', 404);
        }

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
        if (!$code) {
            return $this->errorResponse($response, 'Missing authorization code', 400);
        }

        try {
            $oauth = new GoogleOAuthService();
            $tokens = $oauth->exchangeCode($code);
            $info = $oauth->getUserInfo($tokens['access_token']);

            $result = $this->authService->loginWithGoogleProfile($info);
            return $this->successResponse($response, $result, 'Google login successful');
        } catch (\Throwable $e) {
            return $this->errorResponse($response, $e->getMessage(), 400);
        }
    }

}
