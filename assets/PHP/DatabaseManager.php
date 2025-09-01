<?php
// filepath: /Users/mike/Desktop/Dev/Eder/Eder-Sanchez/assets/PHP/DatabaseManager.php

require_once __DIR__ . '/EncryptionHelper.php';

class DatabaseManager
{
    private $pdo;

    public function __construct()
    {
        $this->connect();
    }

    private function connect()
    {
        try {
            // MariaDB connection for Hostinger
            $dsn = "mysql:host=" . $_ENV['DB_HOST'] .
                ";port=" . ($_ENV['DB_PORT'] ?? 3306) .
                ";dbname=" . $_ENV['DB_NAME'] .
                ";charset=utf8mb4";

            $this->pdo = new PDO($dsn, $_ENV['DB_USER'], $_ENV['DB_PASSWORD'], [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);

            // MariaDB compatibility settings
            $this->pdo->exec("SET SESSION sql_mode = 'TRADITIONAL'");
            $this->pdo->exec("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci");

            error_log("Connected to Hostinger MariaDB successfully");
        } catch (PDOException $e) {
            error_log("MariaDB connection failed: " . $e->getMessage());
            throw new Exception("Database connection failed");
        }
    }

    private function formatPhoneNumber($phone)
    {
        // Remove all non-numeric characters
        $phone = preg_replace('/[^0-9]/', '', $phone);

        // Format based on length
        if (strlen($phone) == 10) {
            // Format as XXX-XXX-XXXX
            return substr($phone, 0, 3) . '-' . substr($phone, 3, 3) . '-' . substr($phone, 6);
        } elseif (strlen($phone) == 11 && substr($phone, 0, 1) == '1') {
            // Format as 1-XXX-XXX-XXXX
            return '1-' . substr($phone, 1, 3) . '-' . substr($phone, 4, 3) . '-' . substr($phone, 7);
        } else {
            // Return as-is if it doesn't match standard US format
            return $phone;
        }
    }

    /**
    /**
     * Insert a new inquiry (expects encrypted values).
     * @param string $name
     * @param string $age
     * @param string $email
     * @param string $phone_number
     * @param string $referral_source
     * @return int|false Inserted inquiry ID or false on failure
     */
    public function insertInquiry($name, $age, $email, $phone_number, $referral_source)
    {
        try {
            // Format phone number before inserting (already encrypted, so skip formatting)
            // Insert only the 4 required columns
            $sql = "INSERT INTO Inquiries (Name, Age, Email, Phone_Number, Referral_Source) VALUES (?, ?, ?, ?, ?)";
            $stmt = $this->pdo->prepare($sql);

            $result = $stmt->execute([
                trim($name),
                trim($age),
                trim($email),
                trim($phone_number),
                trim($referral_source)
            ]);

            if ($result) {
                $inquiryId = $this->pdo->lastInsertId();
                error_log("Inquiry saved to MariaDB with ID: $inquiryId");
                return $inquiryId;
            } else {
                throw new Exception("Failed to execute insert statement");
            }
        } catch (PDOException $e) {
            error_log("MariaDB insert failed: " . $e->getMessage());
            throw new Exception("Failed to save inquiry to database");
        }
    }

    /**
     * Get all inquiries, decrypted for dashboard display.
     */
    public function getAllInquiriesDecrypted()
    {
        try {
            $sql = "SELECT * FROM Inquiries ORDER BY submitted_at DESC";
            $stmt = $this->pdo->query($sql);
            $rows = $stmt->fetchAll();

            // Decrypt sensitive fields for admin/dashboard
            foreach ($rows as &$row) {
                try {
                    $row['Name'] = EncryptionHelper::decrypt($row['Name']);
                    $row['Age'] = EncryptionHelper::decrypt($row['Age']);
                    $row['Email'] = EncryptionHelper::decrypt($row['Email']);
                    $row['Phone_Number'] = EncryptionHelper::decrypt($row['Phone_Number']);
                } catch (Exception $e) {
                    $row['Name'] = $row['Age'] = $row['Email'] = $row['Phone_Number'] = '[decryption error]';
                    error_log("Decryption failed for inquiry ID {$row['id']}: " . $e->getMessage());
                }
            }
            return $rows;
        } catch (PDOException $e) {
            error_log("Failed to fetch inquiries: " . $e->getMessage());
            throw new Exception("Failed to fetch inquiries");
        }
    }

    /**
     * Get all inquiries (raw, encrypted).
     */
    public function getAllInquiries()
    {
        try {
            $sql = "SELECT * FROM Inquiries ORDER BY submitted_at DESC";
            $stmt = $this->pdo->query($sql);
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            error_log("Failed to fetch inquiries: " . $e->getMessage());
            throw new Exception("Failed to fetch inquiries");
        }
    }

    public function testConnection()
    {
        try {
            $sql = "SELECT COUNT(*) as total FROM Inquiries";
            $stmt = $this->pdo->query($sql);
            $result = $stmt->fetch();
            return true;
        } catch (PDOException $e) {
            error_log("Database test failed: " . $e->getMessage());
            return false;
        }
    }
}