<?php

declare(strict_types=1);

use App\Application;

require_once __DIR__ . '/../vendor/autoload.php';

// Enable error logging
ini_set('log_errors', '1');
ini_set('error_log', __DIR__ . '/../logs/php_errors.log');

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

// Log incoming requests
error_log("Request: " . $_SERVER['REQUEST_METHOD'] . " " . $_SERVER['REQUEST_URI']);

// Create and run the application
$app = new Application();
$app->run();
