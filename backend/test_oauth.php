<?php
require_once __DIR__ . '/vendor/autoload.php';

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__, 'env.local');
$dotenv->load();

use App\Services\GoogleOAuthService;

try {
    $oauth = new GoogleOAuthService();
    $url = $oauth->getAuthUrl();
    echo "Google OAuth URL: " . $url . "\n";
    echo "Test successful!\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
