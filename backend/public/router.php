<?php
// Router script for PHP built-in server
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// If the file exists and it's not a PHP file, serve it directly
if ($uri !== '/' && file_exists(__DIR__ . $uri) && !str_ends_with($uri, '.php')) {
    return false;
}

// Otherwise, route everything to index.php
$_SERVER['REQUEST_URI'] = $uri;
require_once __DIR__ . '/index.php';
