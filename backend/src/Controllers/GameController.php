<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Services\GameService;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;

class GameController extends BaseController
{
    private GameService $gameService;

    public function __construct()
    {
        $this->gameService = new GameService();
    }

    public function startGame(ServerRequestInterface $request, ResponseInterface $response): ResponseInterface
    {
        $user = $this->getCurrentUser($request);
        $data = $this->getJsonBody($request);
        
        try {
            $result = $this->gameService->startGame(
                $user['id'],
                $data['gameMode'] ?? 'classic',
                $data['difficulty'] ?? 'medium',
                $data['generation'] ?? null,
                $data['timeLimit'] ?? 30
            );

            return $this->successResponse($response, $result, 'Game started successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($response, $e->getMessage(), 500);
        }
    }

    public function submitGuess(ServerRequestInterface $request, ResponseInterface $response): ResponseInterface
    {
        $user = $this->getCurrentUser($request);
        $data = $this->getJsonBody($request);
        
        try {
            $result = $this->gameService->submitGuess(
                $user['id'],
                $data['sessionId'] ?? '',
                $data['guess'] ?? '',
                (float) ($data['timeTaken'] ?? 0)
            );

            return $this->successResponse($response, $result, 'Guess submitted successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($response, $e->getMessage(), 500);
        }
    }

    public function endGame(ServerRequestInterface $request, ResponseInterface $response): ResponseInterface
    {
        $user = $this->getCurrentUser($request);
        $data = $this->getJsonBody($request);
        
        try {
            $result = $this->gameService->endGame(
                $user['id'],
                $data['sessionId'] ?? '',
                (int) ($data['finalScore'] ?? 0),
                (int) ($data['totalTime'] ?? 0),
                (int) ($data['correctGuesses'] ?? 0),
                (int) ($data['totalGuesses'] ?? 0)
            );

            return $this->successResponse($response, $result, 'Game ended successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($response, $e->getMessage(), 500);
        }
    }

    public function getGameHistory(ServerRequestInterface $request, ResponseInterface $response): ResponseInterface
    {
        $user = $this->getCurrentUser($request);
        $queryParams = $request->getQueryParams();
        
        try {
            $history = $this->gameService->getGameHistory(
                $user['id'],
                (int) ($queryParams['page'] ?? 1),
                (int) ($queryParams['limit'] ?? 20)
            );

            return $this->successResponse($response, $history, 'Game history retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($response, $e->getMessage(), 500);
        }
    }

    public function getGameStats(ServerRequestInterface $request, ResponseInterface $response): ResponseInterface
    {
        $user = $this->getCurrentUser($request);
        
        try {
            $stats = $this->gameService->getGameStats($user['id']);
            return $this->successResponse($response, $stats, 'Game stats retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($response, $e->getMessage(), 500);
        }
    }

    public function getLeaderboard(ServerRequestInterface $request, ResponseInterface $response): ResponseInterface
    {
        $queryParams = $request->getQueryParams();
        
        try {
            $leaderboard = $this->gameService->getLeaderboard(
                $queryParams['period'] ?? 'daily',
                (int) ($queryParams['page'] ?? 1),
                (int) ($queryParams['limit'] ?? 20),
                $queryParams['gameMode'] ?? null,
                $queryParams['difficulty'] ?? null
            );

            return $this->successResponse($response, $leaderboard, 'Leaderboard retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($response, $e->getMessage(), 500);
        }
    }

    public function getAchievements(ServerRequestInterface $request, ResponseInterface $response): ResponseInterface
    {
        $user = $this->getCurrentUser($request);
        
        try {
            $achievements = $this->gameService->getAchievements($user['id']);
            return $this->successResponse($response, $achievements, 'Achievements retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($response, $e->getMessage(), 500);
        }
    }
}
