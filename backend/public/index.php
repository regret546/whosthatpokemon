<?php

declare(strict_types=1);

use App\Application;

require_once __DIR__ . '/../vendor/autoload.php';

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..', 'env.local');
$dotenv->load();

// Create and run the application
$app = new Application();
$app->run();
