<?php
try {
    $pdo = new PDO('mysql:host=localhost;port=3306;dbname=whosthatpokemon;charset=utf8mb4', 'root', '', [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);
    echo "Database connection successful\n";
    
    // Test if users table exists
    $stmt = $pdo->query("SHOW TABLES LIKE 'users'");
    if ($stmt->rowCount() > 0) {
        echo "Users table exists\n";
        
        // Check if google_id column exists
        $stmt = $pdo->query("DESCRIBE users");
        $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
        if (in_array('google_id', $columns)) {
            echo "google_id column exists\n";
        } else {
            echo "google_id column missing\n";
        }
        
        if (in_array('poke_energy', $columns)) {
            echo "poke_energy column exists\n";
        } else {
            echo "poke_energy column missing\n";
        }
    } else {
        echo "Users table does not exist\n";
    }
} catch (Exception $e) {
    echo "Database error: " . $e->getMessage() . "\n";
}
