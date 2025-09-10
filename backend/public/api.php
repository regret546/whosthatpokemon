<?php
require_once __DIR__ . '/../vendor/autoload.php';

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..', 'env.local');
$dotenv->load();

use App\Services\GoogleOAuthService;

// Set CORS headers
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Request-ID, Accept');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

try {
    if ($path === '/api/auth/google/url') {
        $oauth = new GoogleOAuthService();
        $url = $oauth->getAuthUrl();
        
        echo json_encode([
            'success' => true,
            'data' => ['url' => $url],
            'message' => 'OK'
        ]);
    } elseif ($path === '/api/auth/google/callback' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $code = $input['code'] ?? null;
        
        error_log("Google OAuth Callback - Received code: " . ($code ? substr($code, 0, 20) . '...' : 'NULL'));
        error_log("Google OAuth Callback - Full input: " . json_encode($input));
        
        if (!$code) {
            throw new Exception('Missing authorization code');
        }
        
        $oauth = new GoogleOAuthService();
        $tokens = $oauth->exchangeCode($code);
        $info = $oauth->getUserInfo($tokens['access_token']);
        
        // Format user data for frontend
        $user = [
            'id' => $info['sub'] ?? 'google_' . time(),
            'username' => $info['name'] ?? $info['email'] ?? 'Google User',
            'email' => $info['email'] ?? '',
            'isGuest' => false,
            'avatar' => $info['picture'] ?? null,
            'createdAt' => date('c'),
            'lastActive' => date('c'),
            'pokeEnergy' => 10,
            'isVerified' => true
        ];
        
        echo json_encode([
            'success' => true,
            'data' => [
                'user' => $user,
                'token' => 'dummy-token',
                'refreshToken' => 'dummy-refresh-token'
            ],
            'message' => 'Google login successful'
        ]);
    } else {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'error' => 'Not found'
        ]);
    }
} catch (Exception $e) {
    http_response_code(500);
    error_log("API Error: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'details' => $e->getTraceAsString()
    ]);
}
