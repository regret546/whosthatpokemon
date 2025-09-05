-- Who's That Pokémon Database Schema
-- MySQL 8.0+

-- Create database
CREATE DATABASE IF NOT EXISTS whosthatpokemon CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE whosthatpokemon;

-- Users table
CREATE TABLE users (
    id CHAR(36) PRIMARY KEY,
    google_id VARCHAR(255) UNIQUE NULL,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(255) UNIQUE NULL,
    password_hash VARCHAR(255) NULL,
    is_guest BOOLEAN DEFAULT FALSE,
    avatar_url VARCHAR(500) NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255) NULL,
    password_reset_token VARCHAR(255) NULL,
    password_reset_expires_at TIMESTAMP NULL,
    last_active_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_google_id (google_id),
    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_created_at (created_at)
);

-- Game sessions table
CREATE TABLE game_sessions (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    pokemon_id INT NOT NULL,
    correct_guess BOOLEAN,
    selected_answer VARCHAR(100) NULL,
    time_taken DECIMAL(5,2) NULL,
    score INT DEFAULT 0,
    streak INT DEFAULT 0,
    difficulty ENUM('easy', 'medium', 'hard', 'expert') DEFAULT 'medium',
    game_mode ENUM('classic', 'speed', 'streak', 'daily') DEFAULT 'classic',
    generation INT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_pokemon_id (pokemon_id),
    INDEX idx_difficulty (difficulty),
    INDEX idx_game_mode (game_mode),
    INDEX idx_started_at (started_at),
    INDEX idx_completed_at (completed_at)
);

-- Leaderboards table
CREATE TABLE leaderboards (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    period ENUM('daily', 'weekly', 'monthly', 'alltime') NOT NULL,
    score INT NOT NULL,
    `rank` INT NULL,
    correct_guesses INT DEFAULT 0,
    total_games INT DEFAULT 0,
    average_time DECIMAL(5,2) NULL,
    best_streak INT DEFAULT 0,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_period (user_id, period, period_start),
    INDEX idx_period (period),
    INDEX idx_score (score DESC),
    INDEX idx_rank (`rank`),
    INDEX idx_period_start (period_start)
);

-- Achievements table
CREATE TABLE achievements (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(100) NOT NULL,
    category ENUM('streak', 'score', 'speed', 'accuracy', 'collection', 'special') NOT NULL,
    rarity ENUM('common', 'uncommon', 'rare', 'epic', 'legendary') DEFAULT 'common',
    requirements JSON NOT NULL,
    rewards JSON NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_category (category),
    INDEX idx_rarity (rarity),
    INDEX idx_is_active (is_active)
);

-- User achievements table
CREATE TABLE user_achievements (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    achievement_id CHAR(36) NOT NULL,
    progress INT DEFAULT 0,
    max_progress INT NOT NULL,
    is_unlocked BOOLEAN DEFAULT FALSE,
    unlocked_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_achievement (user_id, achievement_id),
    INDEX idx_user_id (user_id),
    INDEX idx_achievement_id (achievement_id),
    INDEX idx_is_unlocked (is_unlocked)
);

-- Pokemon cache table
CREATE TABLE pokemon_cache (
    id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    sprite_url VARCHAR(500) NOT NULL,
    types JSON NOT NULL,
    stats JSON NOT NULL,
    abilities JSON NOT NULL,
    height INT NOT NULL,
    weight INT NOT NULL,
    base_experience INT NOT NULL,
    is_legendary BOOLEAN DEFAULT FALSE,
    is_mythical BOOLEAN DEFAULT FALSE,
    generation INT NOT NULL,
    cry_url VARCHAR(500) NULL,
    cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    
    INDEX idx_name (name),
    INDEX idx_generation (generation),
    INDEX idx_is_legendary (is_legendary),
    INDEX idx_is_mythical (is_mythical),
    INDEX idx_expires_at (expires_at)
);

-- User settings table
CREATE TABLE user_settings (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    settings JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_settings (user_id)
);

-- Game challenges table
CREATE TABLE game_challenges (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    type ENUM('daily', 'weekly', 'monthly', 'special') NOT NULL,
    difficulty ENUM('easy', 'medium', 'hard', 'expert') NOT NULL,
    requirements JSON NOT NULL,
    rewards JSON NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_type (type),
    INDEX idx_difficulty (difficulty),
    INDEX idx_start_date (start_date),
    INDEX idx_end_date (end_date),
    INDEX idx_is_active (is_active)
);

-- User challenge progress table
CREATE TABLE user_challenge_progress (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    challenge_id CHAR(36) NOT NULL,
    progress INT DEFAULT 0,
    max_progress INT NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (challenge_id) REFERENCES game_challenges(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_challenge (user_id, challenge_id),
    INDEX idx_user_id (user_id),
    INDEX idx_challenge_id (challenge_id),
    INDEX idx_is_completed (is_completed)
);

-- Tournaments table
CREATE TABLE tournaments (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    type ENUM('elimination', 'round_robin', 'swiss', 'bracket') NOT NULL,
    status ENUM('upcoming', 'active', 'completed', 'cancelled') DEFAULT 'upcoming',
    max_participants INT NOT NULL,
    entry_fee INT DEFAULT 0,
    prize_pool JSON NOT NULL,
    rules JSON NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_type (type),
    INDEX idx_status (status),
    INDEX idx_start_date (start_date),
    INDEX idx_end_date (end_date)
);

-- Tournament participants table
CREATE TABLE tournament_participants (
    id CHAR(36) PRIMARY KEY,
    tournament_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    score INT DEFAULT 0,
    `rank` INT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_tournament_user (tournament_id, user_id),
    INDEX idx_tournament_id (tournament_id),
    INDEX idx_user_id (user_id),
    INDEX idx_score (score DESC)
);

-- System logs table
CREATE TABLE system_logs (
    id CHAR(36) PRIMARY KEY,
    level ENUM('debug', 'info', 'warning', 'error', 'critical') NOT NULL,
    message TEXT NOT NULL,
    context JSON NULL,
    user_id CHAR(36) NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_level (level),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
);

-- Insert default achievements
INSERT INTO achievements (id, name, description, icon, category, rarity, requirements, rewards) VALUES
('ach-001', 'First Steps', 'Complete your first game', '🎯', 'special', 'common', '{"type": "games_played", "value": 1}', '{"score": 100, "experience": 50}'),
('ach-002', 'Streak Master', 'Get a streak of 10 or more', '🔥', 'streak', 'uncommon', '{"type": "streak", "value": 10}', '{"score": 500, "experience": 200}'),
('ach-003', 'Speed Demon', 'Guess correctly in under 5 seconds', '⚡', 'speed', 'rare', '{"type": "time", "value": 5}', '{"score": 300, "experience": 150}'),
('ach-004', 'Pokémon Expert', 'Guess 100 Pokémon correctly', '🎓', 'collection', 'epic', '{"type": "correct_guesses", "value": 100}', '{"score": 1000, "experience": 500}'),
('ach-005', 'Legendary Hunter', 'Guess 10 legendary Pokémon', '👑', 'collection', 'legendary', '{"type": "legendary_guesses", "value": 10}', '{"score": 2000, "experience": 1000}');

-- Create views for common queries
CREATE VIEW user_stats AS
SELECT 
    u.id,
    u.username,
    u.is_guest,
    COUNT(gs.id) as total_games,
    SUM(CASE WHEN gs.correct_guess = 1 THEN 1 ELSE 0 END) as correct_guesses,
    SUM(gs.score) as total_score,
    MAX(gs.streak) as best_streak,
    AVG(gs.time_taken) as average_time,
    ROUND((SUM(CASE WHEN gs.correct_guess = 1 THEN 1 ELSE 0 END) / COUNT(gs.id)) * 100, 2) as accuracy
FROM users u
LEFT JOIN game_sessions gs ON u.id = gs.user_id AND gs.is_completed = 1
GROUP BY u.id, u.username, u.is_guest;

-- Create indexes for performance
CREATE INDEX idx_game_sessions_user_score ON game_sessions(user_id, score DESC);
CREATE INDEX idx_game_sessions_correct_guess ON game_sessions(correct_guess);
CREATE INDEX idx_leaderboards_period_score ON leaderboards(period, score DESC);
CREATE INDEX idx_leaderboards_rank ON leaderboards(`rank`);
CREATE INDEX idx_user_achievements_progress ON user_achievements(progress, max_progress);
