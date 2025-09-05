<?php

declare(strict_types=1);

namespace App\Services;

use PDO;
use PDOException;

class GameService
{
    private PDO $db;

    public function __construct()
    {
        $this->db = $this->getDatabase();
    }

    public function startGame(string $userId, string $gameMode, string $difficulty, ?int $generation, int $timeLimit): array
    {
        try {
            $sessionId = $this->generateUuid();
            
            // Get random Pokémon based on criteria
            $pokemonService = new PokemonService();
            $pokemonData = $pokemonService->getRandom($difficulty, $generation);
            
            // Create game session
            $stmt = $this->db->prepare("
                INSERT INTO game_sessions 
                (id, user_id, pokemon_id, difficulty, game_mode, generation, time_limit, started_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
            ");
            $stmt->execute([
                $sessionId,
                $userId,
                $pokemonData['pokemon']['id'],
                $difficulty,
                $gameMode,
                $generation,
                $timeLimit
            ]);

            return [
                'sessionId' => $sessionId,
                'pokemon' => $pokemonData['pokemon'],
                'choices' => $pokemonData['choices'],
                'correctAnswer' => $pokemonData['correctAnswer'],
                'timeLimit' => $timeLimit,
                'config' => [
                    'difficulty' => $difficulty,
                    'gameMode' => $gameMode,
                    'generation' => $generation
                ]
            ];
        } catch (PDOException $e) {
            throw new \Exception('Database error: ' . $e->getMessage());
        }
    }

    public function submitGuess(string $userId, string $sessionId, string $guess, float $timeTaken): array
    {
        try {
            // Get game session
            $stmt = $this->db->prepare("
                SELECT gs.*, pc.name as pokemon_name
                FROM game_sessions gs
                JOIN pokemon_cache pc ON gs.pokemon_id = pc.id
                WHERE gs.id = ? AND gs.user_id = ? AND gs.is_completed = 0
            ");
            $stmt->execute([$sessionId, $userId]);
            $session = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$session) {
                throw new \Exception('Game session not found');
            }

            $isCorrect = strtolower($guess) === strtolower($session['pokemon_name']);
            $score = $this->calculateScore($isCorrect, $timeTaken, $session['difficulty']);
            
            // Update session
            $stmt = $this->db->prepare("
                UPDATE game_sessions 
                SET correct_guess = ?, selected_answer = ?, time_taken = ?, score = ?, 
                    streak = streak + ?, completed_at = NOW(), is_completed = 1
                WHERE id = ?
            ");
            $stmt->execute([
                $isCorrect ? 1 : 0,
                $guess,
                $timeTaken,
                $score,
                $isCorrect ? 1 : 0,
                $sessionId
            ]);

            // Get updated streak
            $stmt = $this->db->prepare("
                SELECT streak FROM game_sessions 
                WHERE user_id = ? 
                ORDER BY completed_at DESC 
                LIMIT 1
            ");
            $stmt->execute([$userId]);
            $currentStreak = $stmt->fetch(PDO::FETCH_ASSOC)['streak'] ?? 0;

            // Check for achievements
            $achievements = $this->checkAchievements($userId, $isCorrect, $currentStreak, $score);

            return [
                'correct' => $isCorrect,
                'score' => $score,
                'streak' => $currentStreak,
                'achievements' => $achievements,
                'isGameOver' => true // For now, each guess ends the game
            ];
        } catch (PDOException $e) {
            throw new \Exception('Database error: ' . $e->getMessage());
        }
    }

    public function endGame(string $userId, string $sessionId, int $finalScore, int $totalTime, int $correctGuesses, int $totalGuesses): array
    {
        try {
            // Update final game stats
            $stmt = $this->db->prepare("
                UPDATE game_sessions 
                SET score = ?, time_taken = ?, completed_at = NOW(), is_completed = 1
                WHERE id = ? AND user_id = ?
            ");
            $stmt->execute([$finalScore, $totalTime, $sessionId, $userId]);

            // Update leaderboard
            $this->updateLeaderboard($userId, $finalScore, $correctGuesses, $totalGuesses);

            // Check for new achievements
            $achievements = $this->checkAchievements($userId, true, 0, $finalScore);

            return [
                'finalScore' => $finalScore,
                'rank' => $this->getUserRank($userId),
                'achievements' => $achievements,
                'newRecords' => $this->checkNewRecords($userId, $finalScore)
            ];
        } catch (PDOException $e) {
            throw new \Exception('Database error: ' . $e->getMessage());
        }
    }

    public function getGameHistory(string $userId, int $page = 1, int $limit = 20): array
    {
        try {
            $offset = ($page - 1) * $limit;
            
            $stmt = $this->db->prepare("
                SELECT gs.*, pc.name as pokemon_name, pc.sprite_url
                FROM game_sessions gs
                JOIN pokemon_cache pc ON gs.pokemon_id = pc.id
                WHERE gs.user_id = ? AND gs.is_completed = 1
                ORDER BY gs.completed_at DESC
                LIMIT ? OFFSET ?
            ");
            $stmt->execute([$userId, $limit, $offset]);
            $history = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return $history;
        } catch (PDOException $e) {
            throw new \Exception('Database error: ' . $e->getMessage());
        }
    }

    public function getGameStats(string $userId): array
    {
        try {
            $stmt = $this->db->prepare("
                SELECT 
                    COUNT(*) as total_games,
                    SUM(CASE WHEN correct_guess = 1 THEN 1 ELSE 0 END) as correct_guesses,
                    SUM(score) as total_score,
                    MAX(streak) as best_streak,
                    AVG(time_taken) as average_time,
                    ROUND((SUM(CASE WHEN correct_guess = 1 THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) as accuracy
                FROM game_sessions 
                WHERE user_id = ? AND is_completed = 1
            ");
            $stmt->execute([$userId]);
            $stats = $stmt->fetch(PDO::FETCH_ASSOC);

            return $stats ?: [
                'total_games' => 0,
                'correct_guesses' => 0,
                'total_score' => 0,
                'best_streak' => 0,
                'average_time' => 0,
                'accuracy' => 0
            ];
        } catch (PDOException $e) {
            throw new \Exception('Database error: ' . $e->getMessage());
        }
    }

    public function getLeaderboard(string $period = 'daily', int $page = 1, int $limit = 20, ?string $gameMode = null, ?string $difficulty = null): array
    {
        try {
            $offset = ($page - 1) * $limit;
            
            // Calculate period dates
            $periodDates = $this->getPeriodDates($period);
            
            $stmt = $this->db->prepare("
                SELECT 
                    u.id, u.username, u.is_guest, u.avatar_url,
                    SUM(gs.score) as total_score,
                    MAX(gs.streak) as best_streak,
                    COUNT(gs.id) as total_games,
                    SUM(CASE WHEN gs.correct_guess = 1 THEN 1 ELSE 0 END) as correct_guesses,
                    AVG(gs.time_taken) as average_time
                FROM users u
                JOIN game_sessions gs ON u.id = gs.user_id
                WHERE gs.completed_at BETWEEN ? AND ?
                " . ($gameMode ? "AND gs.game_mode = ?" : "") . "
                " . ($difficulty ? "AND gs.difficulty = ?" : "") . "
                GROUP BY u.id, u.username, u.is_guest, u.avatar_url
                ORDER BY total_score DESC
                LIMIT ? OFFSET ?
            ");

            $params = [$periodDates['start'], $periodDates['end']];
            if ($gameMode) $params[] = $gameMode;
            if ($difficulty) $params[] = $difficulty;
            $params[] = $limit;
            $params[] = $offset;

            $stmt->execute($params);
            $leaderboard = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Add ranks
            foreach ($leaderboard as $index => &$entry) {
                $entry['rank'] = $offset + $index + 1;
            }

            return $leaderboard;
        } catch (PDOException $e) {
            throw new \Exception('Database error: ' . $e->getMessage());
        }
    }

    public function getAchievements(string $userId): array
    {
        try {
            $stmt = $this->db->prepare("
                SELECT a.*, ua.progress, ua.is_unlocked, ua.unlocked_at
                FROM achievements a
                LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?
                WHERE a.is_active = 1
                ORDER BY a.category, a.rarity
            ");
            $stmt->execute([$userId]);
            $achievements = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return $achievements;
        } catch (PDOException $e) {
            throw new \Exception('Database error: ' . $e->getMessage());
        }
    }

    private function calculateScore(bool $isCorrect, float $timeTaken, string $difficulty): int
    {
        if (!$isCorrect) {
            return 0;
        }

        $baseScore = 100;
        $timeBonus = max(0, 30 - $timeTaken) * 2;
        $difficultyMultiplier = $this->getDifficultyMultiplier($difficulty);
        
        return (int) (($baseScore + $timeBonus) * $difficultyMultiplier);
    }

    private function getDifficultyMultiplier(string $difficulty): float
    {
        return match ($difficulty) {
            'easy' => 1.0,
            'medium' => 1.5,
            'hard' => 2.0,
            'expert' => 3.0,
            default => 1.0
        };
    }

    private function checkAchievements(string $userId, bool $isCorrect, int $streak, int $score): array
    {
        // This is a simplified version - in a real implementation,
        // you'd have more sophisticated achievement checking logic
        $achievements = [];
        
        // Example: First correct guess achievement
        if ($isCorrect) {
            $stmt = $this->db->prepare("
                SELECT COUNT(*) as count FROM game_sessions 
                WHERE user_id = ? AND correct_guess = 1
            ");
            $stmt->execute([$userId]);
            $correctCount = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

            if ($correctCount === 1) {
                $achievements[] = [
                    'id' => 'first-correct',
                    'name' => 'First Steps',
                    'description' => 'Make your first correct guess!'
                ];
            }
        }

        return $achievements;
    }

    private function updateLeaderboard(string $userId, int $score, int $correctGuesses, int $totalGuesses): void
    {
        // Update daily leaderboard
        $this->updatePeriodLeaderboard($userId, 'daily', $score, $correctGuesses, $totalGuesses);
        
        // Update weekly leaderboard
        $this->updatePeriodLeaderboard($userId, 'weekly', $score, $correctGuesses, $totalGuesses);
        
        // Update monthly leaderboard
        $this->updatePeriodLeaderboard($userId, 'monthly', $score, $correctGuesses, $totalGuesses);
    }

    private function updatePeriodLeaderboard(string $userId, string $period, int $score, int $correctGuesses, int $totalGuesses): void
    {
        $periodDates = $this->getPeriodDates($period);
        
        $stmt = $this->db->prepare("
            INSERT INTO leaderboards 
            (id, user_id, period, score, correct_guesses, total_games, period_start, period_end)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            score = score + VALUES(score),
            correct_guesses = correct_guesses + VALUES(correct_guesses),
            total_games = total_games + VALUES(total_games)
        ");
        
        $stmt->execute([
            $this->generateUuid(),
            $userId,
            $period,
            $score,
            $correctGuesses,
            $totalGuesses,
            $periodDates['start'],
            $periodDates['end']
        ]);
    }

    private function getPeriodDates(string $period): array
    {
        $now = new \DateTime();
        
        return match ($period) {
            'daily' => [
                'start' => $now->format('Y-m-d 00:00:00'),
                'end' => $now->format('Y-m-d 23:59:59')
            ],
            'weekly' => [
                'start' => $now->modify('monday this week')->format('Y-m-d 00:00:00'),
                'end' => $now->modify('sunday this week')->format('Y-m-d 23:59:59')
            ],
            'monthly' => [
                'start' => $now->modify('first day of this month')->format('Y-m-d 00:00:00'),
                'end' => $now->modify('last day of this month')->format('Y-m-d 23:59:59')
            ],
            default => [
                'start' => '1970-01-01 00:00:00',
                'end' => '2099-12-31 23:59:59'
            ]
        };
    }

    private function getUserRank(string $userId): int
    {
        // Simplified rank calculation
        return 1; // In a real implementation, you'd calculate actual rank
    }

    private function checkNewRecords(string $userId, int $score): array
    {
        // Simplified new records check
        return []; // In a real implementation, you'd check for personal bests
    }

    private function generateUuid(): string
    {
        return sprintf(
            '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
    }

    private function getDatabase(): PDO
    {
        $host = $_ENV['DB_HOST'] ?? 'localhost';
        $port = $_ENV['DB_PORT'] ?? '3306';
        $dbname = $_ENV['DB_DATABASE'] ?? 'whosthatpokemon';
        $username = $_ENV['DB_USERNAME'] ?? 'root';
        $password = $_ENV['DB_PASSWORD'] ?? '';

        $dsn = "mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4";

        return new PDO($dsn, $username, $password, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    }
}
