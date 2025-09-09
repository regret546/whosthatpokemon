<?php

declare(strict_types=1);

namespace App\Services;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use PDO;
use PDOException;

class AuthService
{
    private PDO $db;
    private string $jwtSecret;
    private int $jwtExpiration;

    public function __construct()
    {
        $this->db = $this->getDatabase();
        $this->jwtSecret = $_ENV['JWT_SECRET'] ?? 'default-secret-key';
        $this->jwtExpiration = (int) ($_ENV['JWT_EXPIRATION'] ?? 3600);
    }

    public function login(string $email, string $password): ?array
    {
        try {
            $stmt = $this->db->prepare("
                SELECT id, username, email, password_hash, is_guest, avatar_url, is_verified
                FROM users 
                WHERE email = ? AND is_guest = 0
            ");
            $stmt->execute([$email]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$user || !password_verify($password, $user['password_hash'])) {
                return null;
            }

            return $this->generateTokenResponse($user);
        } catch (PDOException $e) {
            throw new \Exception('Database error: ' . $e->getMessage());
        }
    }

    public function register(string $username, string $email, string $password): ?array
    {
        try {
            // Check if user already exists
            $stmt = $this->db->prepare("SELECT id FROM users WHERE email = ? OR username = ?");
            $stmt->execute([$email, $username]);
            if ($stmt->fetch()) {
                throw new \Exception('User already exists');
            }

            $userId = $this->generateUuid();
            $passwordHash = password_hash($password, PASSWORD_DEFAULT);
            $verificationToken = $this->generateUuid();

            $stmt = $this->db->prepare("
                INSERT INTO users (id, username, email, password_hash, is_guest, is_verified, email_verification_token)
                VALUES (?, ?, ?, ?, 0, 0, ?)
            ");
            $stmt->execute([$userId, $username, $email, $passwordHash, $verificationToken]);

            $user = [
                'id' => $userId,
                'username' => $username,
                'email' => $email,
                'is_guest' => false,
                'avatar_url' => null,
                'is_verified' => false
            ];

            return $this->generateTokenResponse($user);
        } catch (PDOException $e) {
            throw new \Exception('Database error: ' . $e->getMessage());
        }
    }

    public function guestLogin(string $username): ?array
    {
        try {
            $userId = $this->generateUuid();

            $stmt = $this->db->prepare("
                INSERT INTO users (id, username, is_guest, is_verified)
                VALUES (?, ?, 1, 1)
            ");
            $stmt->execute([$userId, $username]);

            $user = [
                'id' => $userId,
                'username' => $username,
                'email' => null,
                'is_guest' => true,
                'avatar_url' => null,
                'is_verified' => true
            ];

            return $this->generateTokenResponse($user);
        } catch (PDOException $e) {
            throw new \Exception('Database error: ' . $e->getMessage());
        }
    }

    public function refreshToken(string $refreshToken): ?array
    {
        try {
            $decoded = JWT::decode($refreshToken, new Key($this->jwtSecret, 'HS256'));

            if ($decoded->type !== 'refresh') {
                return null;
            }

            $stmt = $this->db->prepare("SELECT * FROM users WHERE id = ?");
            $stmt->execute([$decoded->user_id]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$user) {
                return null;
            }

            return $this->generateTokenResponse($user);
        } catch (\Exception $e) {
            return null;
        }
    }

    public function validateToken(string $token): ?array
    {
        try {
            $decoded = JWT::decode($token, new Key($this->jwtSecret, 'HS256'));

            if ($decoded->type !== 'access') {
                return null;
            }

            $stmt = $this->db->prepare("SELECT * FROM users WHERE id = ?");
            $stmt->execute([$decoded->user_id]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            return $user ?: null;
        } catch (\Exception $e) {
            return null;
        }
    }

    public function logout(): void
    {
        // In a more sophisticated implementation, you might want to blacklist the token
        // For now, we'll just return success
    }

    /**
     * Login or register a user using Google profile info.
     * @param array $googleInfo expected keys: sub, email, name, picture
     */
    public function loginWithGoogleProfile(array $googleInfo): array
    {
        $googleId = $googleInfo['sub'] ?? null;
        if (!$googleId) {
            throw new \InvalidArgumentException('Missing Google subject (sub)');
        }
        $email = $googleInfo['email'] ?? null;
        $name = $googleInfo['name'] ?? null;
        $avatar = $googleInfo['picture'] ?? null;

        $this->db->beginTransaction();
        try {
            // Try by google_id first
            $stmt = $this->db->prepare("SELECT * FROM users WHERE google_id = ? LIMIT 1");
            $stmt->execute([$googleId]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user) {
                // Update profile details if changed
                $stmt = $this->db->prepare("UPDATE users SET username = COALESCE(?, username), avatar_url = COALESCE(?, avatar_url), last_active_at = NOW() WHERE id = ?");
                $stmt->execute([$name, $avatar, $user['id']]);
            } else {
                // If not linked, match by email if available
                if ($email) {
                    $stmt = $this->db->prepare("SELECT * FROM users WHERE email = ? LIMIT 1");
                    $stmt->execute([$email]);
                    $user = $stmt->fetch(PDO::FETCH_ASSOC);
                    if ($user) {
                        $stmt = $this->db->prepare("UPDATE users SET google_id = ?, username = COALESCE(?, username), avatar_url = COALESCE(?, avatar_url), is_guest = 0, is_verified = 1, last_active_at = NOW() WHERE id = ?");
                        $stmt->execute([$googleId, $name, $avatar, $user['id']]);
                    }
                }

                if (!$user) {
                    // Create new user
                    $userId = $this->generateUuid();
                    $username = $name ?: ($email ? explode('@', $email)[0] : ('trainer_' . substr($userId, 0, 6)));
                    $stmt = $this->db->prepare("INSERT INTO users (id, google_id, username, email, is_guest, is_verified, avatar_url, last_active_at) VALUES (?, ?, ?, ?, 0, 1, ?, NOW())");
                    $stmt->execute([$userId, $googleId, $username, $email, $avatar]);
                    $stmt = $this->db->prepare("SELECT * FROM users WHERE id = ?");
                    $stmt->execute([$userId]);
                    $user = $stmt->fetch(PDO::FETCH_ASSOC);
                } else {
                    // Reload after linking by email
                    $stmt = $this->db->prepare("SELECT * FROM users WHERE id = ?");
                    $stmt->execute([$user['id']]);
                    $user = $stmt->fetch(PDO::FETCH_ASSOC);
                }
            }

            $this->db->commit();
            return $this->generateTokenResponse($user);
        } catch (\Throwable $e) {
            $this->db->rollBack();
            throw new \Exception('Google login failed: ' . $e->getMessage());
        }
    }

    public function updateProfile(string $userId, array $data): ?array
    {
        try {
            $allowedFields = ['username', 'email', 'avatar_url'];
            $updateFields = [];
            $values = [];

            foreach ($allowedFields as $field) {
                if (isset($data[$field])) {
                    $updateFields[] = "$field = ?";
                    $values[] = $data[$field];
                }
            }

            if (empty($updateFields)) {
                throw new \Exception('No valid fields to update');
            }

            $values[] = $userId;
            $sql = "UPDATE users SET " . implode(', ', $updateFields) . " WHERE id = ?";

            $stmt = $this->db->prepare($sql);
            $stmt->execute($values);

            $stmt = $this->db->prepare("SELECT * FROM users WHERE id = ?");
            $stmt->execute([$userId]);
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new \Exception('Database error: ' . $e->getMessage());
        }
    }

    private function generateTokenResponse(array $user): array
    {
        $now = time();

        $accessToken = JWT::encode([
            'user_id' => $user['id'],
            'type' => 'access',
            'iat' => $now,
            'exp' => $now + $this->jwtExpiration
        ], $this->jwtSecret, 'HS256');

        $refreshToken = JWT::encode([
            'user_id' => $user['id'],
            'type' => 'refresh',
            'iat' => $now,
            'exp' => $now + (7 * 24 * 60 * 60) // 7 days
        ], $this->jwtSecret, 'HS256');

        return [
            'user' => $user,
            'token' => $accessToken,
            'refreshToken' => $refreshToken,
            'expiresIn' => $this->jwtExpiration
        ];
    }

    private function generateUuid(): string
    {
        return sprintf(
            '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0xffff)
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
