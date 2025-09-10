<?php

declare(strict_types=1);

namespace App;

use App\Middleware\CorsMiddleware;
use App\Middleware\ErrorHandlerMiddleware;
use App\Middleware\JsonMiddleware;
use App\Middleware\RateLimitMiddleware;
use App\Middleware\AuthMiddleware;
use Slim\Factory\AppFactory;
use Slim\App as SlimApp;

class Application
{
    private SlimApp $app;

    public function __construct()
    {
        $this->app = AppFactory::create();
        $this->setupMiddleware();
        $this->setupRoutes();
    }

    private function setupMiddleware(): void
    {
        // Add CORS middleware
        $this->app->add(new CorsMiddleware());

        // Add JSON parsing middleware
        $this->app->add(new JsonMiddleware());

        // Add error handling middleware
        $this->app->add(new ErrorHandlerMiddleware());
    }

    private function setupRoutes(): void
    {
        // Health check endpoint
        $this->app->get('/health', function ($request, $response) {
            $data = [
                'status' => 'healthy',
                'timestamp' => date('c'),
                'version' => $_ENV['APP_VERSION'] ?? '1.0.0'
            ];

            $response->getBody()->write(json_encode($data));
            return $response->withHeader('Content-Type', 'application/json');
        });

        // API routes
        $this->app->group('/api', function ($group) {

            // Auth routes
            $group->group('/auth', function ($group) {
                $group->post('/login', [\App\Controllers\AuthController::class, 'login']);
                $group->post('/register', [\App\Controllers\AuthController::class, 'register']);
                $group->post('/guest', [\App\Controllers\AuthController::class, 'guestLogin']);
                $group->post('/refresh', [\App\Controllers\AuthController::class, 'refreshToken']);
                $group->post('/logout', [\App\Controllers\AuthController::class, 'logout']);
                // Google OAuth
                $group->get('/google/url', [\App\Controllers\AuthController::class, 'googleUrl']);
                $group->post('/google/callback', [\App\Controllers\AuthController::class, 'googleCallback']);
                // Authenticated user routes
                $group->get('/me', [\App\Controllers\AuthController::class, 'me'])->add(new AuthMiddleware());
                $group->patch('/profile', [\App\Controllers\AuthController::class, 'updateProfile'])->add(new AuthMiddleware());
            });

            // Pokemon routes
            $group->group('/pokemon', function ($group) {
                $group->get('', [\App\Controllers\PokemonController::class, 'getList']);
                $group->get('/search', [\App\Controllers\PokemonController::class, 'search']);
                $group->get('/random', [\App\Controllers\PokemonController::class, 'getRandom']);
                $group->get('/types', [\App\Controllers\PokemonController::class, 'getTypes']);
                $group->get('/name/{name}', [\App\Controllers\PokemonController::class, 'getByName']);
                $group->get('/{id}', [\App\Controllers\PokemonController::class, 'getById']);
            });

            // Game routes
            $group->group('/game', function ($group) {
                $group->post('/start', [\App\Controllers\GameController::class, 'startGame'])->add(new AuthMiddleware());
                $group->post('/guess', [\App\Controllers\GameController::class, 'submitGuess'])->add(new AuthMiddleware());
                $group->post('/end', [\App\Controllers\GameController::class, 'endGame'])->add(new AuthMiddleware());
                $group->get('/history', [\App\Controllers\GameController::class, 'getGameHistory'])->add(new AuthMiddleware());
                $group->get('/stats', [\App\Controllers\GameController::class, 'getGameStats'])->add(new AuthMiddleware());
                $group->get('/leaderboard', [\App\Controllers\GameController::class, 'getLeaderboard']);
                $group->get('/achievements', [\App\Controllers\GameController::class, 'getAchievements'])->add(new AuthMiddleware());
            });
        });
    }

    public function run(): void
    {
        $this->app->run();
    }

    public function getApp(): SlimApp
    {
        return $this->app;
    }
}
