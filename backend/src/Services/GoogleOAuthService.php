<?php

declare(strict_types=1);

namespace App\Services;

class GoogleOAuthService
{
    private string $clientId;
    private string $clientSecret;
    private string $redirectUri;

    public function __construct()
    {
        $this->clientId = $_ENV['GOOGLE_CLIENT_ID'] ?? '';
        $this->clientSecret = $_ENV['GOOGLE_CLIENT_SECRET'] ?? '';
        // Support both names, prefer GOOGLE_REDIRECT_URI and fallback to GOOGLE_OAUTH_REDIRECT_URI
        $this->redirectUri = $_ENV['GOOGLE_REDIRECT_URI'] ?? ($_ENV['GOOGLE_OAUTH_REDIRECT_URI'] ?? '');
    }

    public function getAuthUrl(?string $state = null): string
    {
        $base = 'https://accounts.google.com/o/oauth2/v2/auth';
        $params = [
            'client_id' => $this->clientId,
            'redirect_uri' => $this->redirectUri,
            'response_type' => 'code',
            'scope' => 'openid email profile',
            'access_type' => 'offline',
            'prompt' => 'consent',
        ];
        if ($state) {
            $params['state'] = $state;
        }
        return $base . '?' . http_build_query($params);
    }

    public function exchangeCode(string $code): array
    {
        $url = 'https://oauth2.googleapis.com/token';
        $data = [
            'code' => $code,
            'client_id' => $this->clientId,
            'client_secret' => $this->clientSecret,
            'redirect_uri' => $this->redirectUri,
            'grant_type' => 'authorization_code',
        ];

        $response = $this->postForm($url, $data);
        if (!is_array($response) || empty($response['access_token'])) {
            throw new \RuntimeException('Failed to exchange authorization code for tokens');
        }
        return $response;
    }

    public function getUserInfo(string $accessToken): array
    {
        $ch = curl_init('https://openidconnect.googleapis.com/v1/userinfo');
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                'Authorization: Bearer ' . $accessToken,
                'Accept: application/json',
            ],
            CURLOPT_TIMEOUT => 10,
        ]);
        $result = curl_exec($ch);
        if ($result === false) {
            $err = curl_error($ch);
            curl_close($ch);
            throw new \RuntimeException('Failed to fetch Google user info: ' . $err);
        }
        $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        $data = json_decode($result, true);
        if ($status >= 400) {
            throw new \RuntimeException('Google userinfo error: ' . ($data['error'] ?? 'unknown'));
        }
        return $data ?? [];
    }

    private function postForm(string $url, array $data): array
    {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => http_build_query($data),
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/x-www-form-urlencoded',
                'Accept: application/json',
            ],
            CURLOPT_TIMEOUT => 10,
        ]);
        $result = curl_exec($ch);
        if ($result === false) {
            $err = curl_error($ch);
            curl_close($ch);
            throw new \RuntimeException('Google token request failed: ' . $err);
        }
        $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        $data = json_decode($result, true);
        if ($status >= 400) {
            $error = $data['error'] ?? 'unknown';
            $errorDescription = $data['error_description'] ?? '';
            
            if ($error === 'invalid_grant') {
                throw new \RuntimeException('Authorization code has already been used or has expired. Please try logging in again.');
            }
            
            throw new \RuntimeException('Google token response error: ' . $error . ($errorDescription ? ' - ' . $errorDescription : ''));
        }
        return $data ?? [];
    }
}

