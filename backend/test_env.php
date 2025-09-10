<?php
// Load environment variables
if (file_exists(__DIR__ . '/.env')) {
    $lines = file(__DIR__ . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        list($name, $value) = explode('=', $line, 2);
        $_ENV[trim($name)] = trim($value);
    }
}

echo "Environment variables:\n";
echo "GOOGLE_CLIENT_ID: " . ($_ENV['GOOGLE_CLIENT_ID'] ?? 'NOT SET') . "\n";
echo "GOOGLE_CLIENT_SECRET: " . (isset($_ENV['GOOGLE_CLIENT_SECRET']) ? 'SET' : 'NOT SET') . "\n";
echo "GOOGLE_OAUTH_REDIRECT_URI: " . ($_ENV['GOOGLE_OAUTH_REDIRECT_URI'] ?? 'NOT SET') . "\n";
echo "GOOGLE_REDIRECT_URI: " . ($_ENV['GOOGLE_REDIRECT_URI'] ?? 'NOT SET') . "\n";
echo "CORS_ORIGINS: " . ($_ENV['CORS_ORIGINS'] ?? 'NOT SET') . "\n";
