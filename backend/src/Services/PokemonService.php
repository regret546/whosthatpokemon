<?php

declare(strict_types=1);

namespace App\Services;

use PDO;
use PDOException;

class PokemonService
{
    private PDO $db;
    private string $pokeApiBaseUrl;

    public function __construct()
    {
        $this->db = $this->getDatabase();
        $this->pokeApiBaseUrl = $_ENV['POKEAPI_BASE_URL'] ?? 'https://pokeapi.co/api/v2';
    }

    public function getList(int $page = 1, int $limit = 20, ?int $generation = null, ?string $type = null, ?string $search = null): array
    {
        try {
            $offset = ($page - 1) * $limit;
            $whereConditions = [];
            $params = [];

            if ($generation) {
                $whereConditions[] = "generation = ?";
                $params[] = $generation;
            }

            if ($type) {
                $whereConditions[] = "JSON_CONTAINS(types, ?)";
                $params[] = json_encode([['name' => $type]]);
            }

            if ($search) {
                $whereConditions[] = "name LIKE ?";
                $params[] = "%$search%";
            }

            $whereClause = !empty($whereConditions) ? 'WHERE ' . implode(' AND ', $whereConditions) : '';

            $sql = "SELECT * FROM pokemon_cache $whereClause ORDER BY id LIMIT ? OFFSET ?";
            $params[] = $limit;
            $params[] = $offset;

            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
            $pokemon = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Get total count
            $countSql = "SELECT COUNT(*) as total FROM pokemon_cache $whereClause";
            $countStmt = $this->db->prepare($countSql);
            $countStmt->execute(array_slice($params, 0, -2));
            $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];

            return [
                'pokemon' => $pokemon,
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'total' => (int) $total,
                    'totalPages' => (int) ceil($total / $limit)
                ]
            ];
        } catch (PDOException $e) {
            throw new \Exception('Database error: ' . $e->getMessage());
        }
    }

    public function getById(int $id): ?array
    {
        try {
            $stmt = $this->db->prepare("SELECT * FROM pokemon_cache WHERE id = ?");
            $stmt->execute([$id]);
            $pokemon = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$pokemon) {
                // Try to fetch from PokéAPI and cache it
                $pokemon = $this->fetchFromPokeApi("pokemon/$id");
                if ($pokemon) {
                    $this->cachePokemon($pokemon);
                }
            }

            return $pokemon;
        } catch (PDOException $e) {
            throw new \Exception('Database error: ' . $e->getMessage());
        }
    }

    public function getByName(string $name): ?array
    {
        try {
            $stmt = $this->db->prepare("SELECT * FROM pokemon_cache WHERE name = ?");
            $stmt->execute([$name]);
            $pokemon = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$pokemon) {
                // Try to fetch from PokéAPI and cache it
                $pokemon = $this->fetchFromPokeApi("pokemon/$name");
                if ($pokemon) {
                    $this->cachePokemon($pokemon);
                }
            }

            return $pokemon;
        } catch (PDOException $e) {
            throw new \Exception('Database error: ' . $e->getMessage());
        }
    }

    public function search(string $query, int $limit = 20): array
    {
        try {
            $stmt = $this->db->prepare("
                SELECT id, name, sprite_url, types, generation, is_legendary, is_mythical
                FROM pokemon_cache 
                WHERE name LIKE ? 
                ORDER BY name 
                LIMIT ?
            ");
            $stmt->execute(["%$query%", $limit]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new \Exception('Database error: ' . $e->getMessage());
        }
    }

    public function getRandom(string $difficulty = 'medium', ?int $generation = null, ?string $type = null): array
    {
        try {
            $whereConditions = [];
            $params = [];

            // Add difficulty-based filtering
            switch ($difficulty) {
                case 'easy':
                    $whereConditions[] = "is_legendary = 0 AND is_mythical = 0 AND generation <= 2";
                    break;
                case 'medium':
                    $whereConditions[] = "is_legendary = 0 AND is_mythical = 0";
                    break;
                case 'hard':
                    $whereConditions[] = "is_legendary = 0";
                    break;
                case 'expert':
                    // No restrictions for expert mode
                    break;
            }

            if ($generation) {
                $whereConditions[] = "generation = ?";
                $params[] = $generation;
            }

            if ($type) {
                $whereConditions[] = "JSON_CONTAINS(types, ?)";
                $params[] = json_encode([['name' => $type]]);
            }

            $whereClause = !empty($whereConditions) ? 'WHERE ' . implode(' AND ', $whereConditions) : '';

            $sql = "SELECT * FROM pokemon_cache $whereClause ORDER BY RAND() LIMIT 1";
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
            $pokemon = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$pokemon) {
                throw new \Exception('No Pokémon found matching criteria');
            }

            // Generate multiple choice options
            $choices = $this->generateChoices($pokemon['name'], $pokemon['generation']);

            return [
                'pokemon' => $pokemon,
                'choices' => $choices,
                'correctAnswer' => $pokemon['name'],
                'hints' => $this->generateHints($pokemon)
            ];
        } catch (PDOException $e) {
            throw new \Exception('Database error: ' . $e->getMessage());
        }
    }

    public function getTypes(): array
    {
        return [
            'normal', 'fire', 'water', 'electric', 'grass', 'ice',
            'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
            'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
        ];
    }

    private function generateChoices(string $correctAnswer, int $generation): array
    {
        try {
            // Get 3 random Pokémon from the same generation
            $stmt = $this->db->prepare("
                SELECT name FROM pokemon_cache 
                WHERE generation = ? AND name != ? 
                ORDER BY RAND() 
                LIMIT 3
            ");
            $stmt->execute([$generation, $correctAnswer]);
            $otherPokemon = $stmt->fetchAll(PDO::FETCH_COLUMN);

            $choices = array_merge([$correctAnswer], $otherPokemon);
            shuffle($choices);

            return $choices;
        } catch (PDOException $e) {
            // Fallback to hardcoded choices if database fails
            return [$correctAnswer, 'Pikachu', 'Charizard', 'Blastoise'];
        }
    }

    private function generateHints(array $pokemon): array
    {
        $hints = [];

        if (!empty($pokemon['types'])) {
            $types = json_decode($pokemon['types'], true);
            if (!empty($types)) {
                $hints[] = [
                    'type' => 'type',
                    'content' => 'Type: ' . implode(', ', array_column($types, 'name')),
                    'cost' => 10
                ];
            }
        }

        if ($pokemon['generation']) {
            $hints[] = [
                'type' => 'generation',
                'content' => 'Generation: ' . $pokemon['generation'],
                'cost' => 5
            ];
        }

        return $hints;
    }

    private function fetchFromPokeApi(string $endpoint): ?array
    {
        $url = $this->pokeApiBaseUrl . '/' . $endpoint;
        
        $context = stream_context_create([
            'http' => [
                'timeout' => 10,
                'user_agent' => 'WhosThatPokemon/1.0'
            ]
        ]);

        $response = @file_get_contents($url, false, $context);
        
        if ($response === false) {
            return null;
        }

        $data = json_decode($response, true);
        
        if (!$data) {
            return null;
        }

        return $this->transformPokeApiData($data);
    }

    private function transformPokeApiData(array $data): array
    {
        $types = [];
        if (isset($data['types'])) {
            foreach ($data['types'] as $type) {
                $types[] = [
                    'name' => $type['type']['name'],
                    'color' => $this->getTypeColor($type['type']['name'])
                ];
            }
        }

        $stats = [];
        if (isset($data['stats'])) {
            foreach ($data['stats'] as $stat) {
                $stats[$stat['stat']['name']] = $stat['base_stat'];
            }
        }

        return [
            'id' => $data['id'],
            'name' => $data['name'],
            'sprite_url' => $data['sprites']['front_default'] ?? '',
            'types' => json_encode($types),
            'stats' => json_encode($stats),
            'abilities' => json_encode(array_column($data['abilities'] ?? [], 'ability')),
            'height' => $data['height'] ?? 0,
            'weight' => $data['weight'] ?? 0,
            'base_experience' => $data['base_experience'] ?? 0,
            'is_legendary' => $data['is_legendary'] ?? false,
            'is_mythical' => $data['is_mythical'] ?? false,
            'generation' => $this->getGenerationFromId($data['id']),
            'cached_at' => date('Y-m-d H:i:s'),
            'expires_at' => date('Y-m-d H:i:s', time() + 3600) // 1 hour cache
        ];
    }

    private function cachePokemon(array $pokemon): void
    {
        try {
            $stmt = $this->db->prepare("
                INSERT INTO pokemon_cache 
                (id, name, sprite_url, types, stats, abilities, height, weight, base_experience, 
                 is_legendary, is_mythical, generation, cached_at, expires_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                sprite_url = VALUES(sprite_url),
                types = VALUES(types),
                stats = VALUES(stats),
                abilities = VALUES(abilities),
                height = VALUES(height),
                weight = VALUES(weight),
                base_experience = VALUES(base_experience),
                is_legendary = VALUES(is_legendary),
                is_mythical = VALUES(is_mythical),
                cached_at = VALUES(cached_at),
                expires_at = VALUES(expires_at)
            ");

            $stmt->execute([
                $pokemon['id'],
                $pokemon['name'],
                $pokemon['sprite_url'],
                $pokemon['types'],
                $pokemon['stats'],
                $pokemon['abilities'],
                $pokemon['height'],
                $pokemon['weight'],
                $pokemon['base_experience'],
                $pokemon['is_legendary'],
                $pokemon['is_mythical'],
                $pokemon['generation'],
                $pokemon['cached_at'],
                $pokemon['expires_at']
            ]);
        } catch (PDOException $e) {
            // Log error but don't throw - caching is not critical
            error_log('Failed to cache Pokémon: ' . $e->getMessage());
        }
    }

    private function getTypeColor(string $type): string
    {
        $colors = [
            'normal' => '#A8A878',
            'fire' => '#F08030',
            'water' => '#6890F0',
            'electric' => '#F8D030',
            'grass' => '#78C850',
            'ice' => '#98D8D8',
            'fighting' => '#C03028',
            'poison' => '#A040A0',
            'ground' => '#E0C068',
            'flying' => '#A890F0',
            'psychic' => '#F85888',
            'bug' => '#A8B820',
            'rock' => '#B8A038',
            'ghost' => '#705898',
            'dragon' => '#7038F8',
            'dark' => '#705848',
            'steel' => '#B8B8D0',
            'fairy' => '#EE99AC'
        ];

        return $colors[$type] ?? '#A8A878';
    }

    private function getGenerationFromId(int $id): int
    {
        if ($id <= 151) return 1;
        if ($id <= 251) return 2;
        if ($id <= 386) return 3;
        if ($id <= 493) return 4;
        if ($id <= 649) return 5;
        if ($id <= 721) return 6;
        if ($id <= 809) return 7;
        if ($id <= 905) return 8;
        return 9;
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
