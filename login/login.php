<?php
// filepath: /Users/mike/Desktop/Dev/Eder/Eder-Sanchez/login/login.php

session_start();
require __DIR__ . '/../vendor/autoload.php';

use Dotenv\Dotenv;

// Load environment variables
$dotenv = Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

// Enhanced input sanitization function
function sanitizeInput($input, $type = 'general') {
    // Remove null bytes and control characters
    $input = str_replace(chr(0), '', $input);
    
    switch ($type) {
        case 'username':
            // Username: only alphanumeric, underscore, hyphen
            $input = trim($input);
            $input = preg_replace('/[^a-zA-Z0-9_-]/', '', $input);
            break;
            
        case 'password':
            // Password: trim only (preserve special chars for security)
            $input = trim($input);
            break;
            
        default:
            $input = trim($input);
            $input = htmlspecialchars($input, ENT_QUOTES | ENT_HTML5, 'UTF-8');
            break;
    }
    
    return $input;
}

// Enhanced validation function
function validateInput($username, $password) {
    $errors = [];
    
    // Check for empty inputs
    if (empty($username)) {
        $errors[] = 'Username is required';
    }
    
    if (empty($password)) {
        $errors[] = 'Password is required';
    }
    
    // Username validation
    if (strlen($username) < 3) {
        $errors[] = 'Username too short';
    }
    
    if (strlen($username) > 50) {
        $errors[] = 'Username too long';
    }
    
    // Check for valid username pattern with proper anchors
    if (!empty($username) && !preg_match('/\A[a-zA-Z0-9_-]+\z/', $username)) {
        $errors[] = 'Username contains invalid characters';
    }
    
    // Password validation
    if (strlen($password) < 8) {
        $errors[] = 'Password too short';
    }
    
    if (strlen($password) > 255) {
        $errors[] = 'Password too long';
    }
    
    // Check for suspicious patterns
    $suspicious_patterns = [
        '/\bscript\b/i',
        '/<[^>]*>/u',
        '/javascript:/i',
        '/data:/i',
        '/vbscript:/i',
        '/\bon\w+\s*=/i',
        '/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/',
    ];
    
    foreach ($suspicious_patterns as $pattern) {
        if (preg_match($pattern, $username . $password)) {
            $errors[] = 'Suspicious input detected';
            break;
        }
    }
    
    return $errors;
}

// Get client IP with proper fallback for proxies/CDNs
function getClientIP() {
    $ipKeys = ['HTTP_X_FORWARDED_FOR', 'HTTP_X_REAL_IP', 'HTTP_CLIENT_IP', 'REMOTE_ADDR'];
    
    foreach ($ipKeys as $key) {
        if (!empty($_SERVER[$key])) {
            $ips = explode(',', $_SERVER[$key]);
            $ip = trim($ips[0]);
            
            // Validate IP address
            if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                return $ip;
            }
        }
    }
    
    return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
}

// Verify reCAPTCHA response
function verifyRecaptcha($response) {
    $secretKey = $_ENV['RECAPTCHA_SECRET_KEY'] ?? '';
    
    if (empty($secretKey)) {
        error_log("SECURITY: reCAPTCHA secret key not configured");
        return false;
    }
    
    if (empty($response)) {
        return false;
    }
    
    $verifyURL = 'https://www.google.com/recaptcha/api/siteverify';
    $data = [
        'secret' => $secretKey,
        'response' => $response,
        'remoteip' => getClientIP()
    ];
    
    $options = [
        'http' => [
            'header' => "Content-type: application/x-www-form-urlencoded\r\n",
            'method' => 'POST',
            'content' => http_build_query($data),
            'timeout' => 10
        ]
    ];
    
    $context = stream_context_create($options);
    $result = file_get_contents($verifyURL, false, $context);
    
    if ($result === false) {
        error_log("SECURITY: reCAPTCHA verification request failed");
        return false;
    }
    
    $resultJson = json_decode($result, true);
    
    return isset($resultJson['success']) && $resultJson['success'] === true;
}

// Security: Rate limiting
if (!isset($_SESSION['login_attempts'])) {
    $_SESSION['login_attempts'] = 0;
    $_SESSION['last_attempt'] = 0;
}

// Security: IP-based rate limiting
$clientIP = getClientIP();
if (!isset($_SESSION['ip_attempts'])) {
    $_SESSION['ip_attempts'] = [];
}
if (!isset($_SESSION['ip_attempts'][$clientIP])) {
    $_SESSION['ip_attempts'][$clientIP] = 0;
}

// Check if locked out (global attempts)
if ($_SESSION['login_attempts'] >= 5 && (time() - $_SESSION['last_attempt']) < 900) {
    $remaining = 900 - (time() - $_SESSION['last_attempt']);
    header("Location: index.html?error=lockout&time=" . $remaining);
    exit;
}

// Check if IP is blocked (3 attempts per IP)
if ($_SESSION['ip_attempts'][$clientIP] >= 3) {
    error_log("SECURITY: Blocked IP $clientIP for excessive login attempts");
    header("Location: index.html?error=blocked");
    exit;
}

// Validate admin credentials function
function validateAdminCredentials($username, $password) {
    // Get admin users from environment variables
    $adminUsers = [];
    
    // Add Eder's account
    $ederUsername = $_ENV['EDER_USERNAME'] ?? '';
    $ederPasswordHash = $_ENV['EDER_PASSWORD_HASH'] ?? '';
    if (!empty($ederUsername) && !empty($ederPasswordHash)) {
        $adminUsers[$ederUsername] = $ederPasswordHash;
    }
    
    // Add Mike's account
    $mikeUsername = $_ENV['MIKE_USERNAME'] ?? '';
    $mikePasswordHash = $_ENV['MIKE_PASSWORD_HASH'] ?? '';
    if (!empty($mikeUsername) && !empty($mikePasswordHash)) {
        $adminUsers[$mikeUsername] = $mikePasswordHash;
    }
    
    // Check if any admin users are configured
    if (empty($adminUsers)) {
        error_log("SECURITY: No admin users configured in environment");
        return false;
    }
    
    // Validate credentials using timing-safe comparison
    if (isset($adminUsers[$username]) && !empty($adminUsers[$username])) {
        return password_verify($password, $adminUsers[$username]);
    }
    
    return false;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get raw input
    $rawUsername = $_POST['username'] ?? '';
    $rawPassword = $_POST['password'] ?? '';
    $recaptchaResponse = $_POST['g-recaptcha-response'] ?? '';
    
    // Verify reCAPTCHA FIRST
    if (!verifyRecaptcha($recaptchaResponse)) {
        $_SESSION['login_attempts']++;
        $_SESSION['ip_attempts'][$clientIP]++;
        $_SESSION['last_attempt'] = time();
        
        error_log("SECURITY: reCAPTCHA verification failed from IP: $clientIP");
        header("Location: index.html?error=recaptcha_failed");
        exit;
    }
    
    // Sanitize inputs
    $username = sanitizeInput($rawUsername, 'username');
    $password = sanitizeInput($rawPassword, 'password');
    
    // Validate inputs
    $validationErrors = validateInput($username, $password);
    
    if (!empty($validationErrors)) {
        $_SESSION['login_attempts']++;
        $_SESSION['ip_attempts'][$clientIP]++;
        $_SESSION['last_attempt'] = time();
        
        // Log without sensitive data
        error_log("LOGIN: Validation failed from IP: $clientIP - " . implode(', ', $validationErrors));
        header("Location: index.html?error=invalid_input");
        exit;
    }
    
    // Additional security checks
    if (strlen($username) === 0 || strlen($password) === 0) {
        $_SESSION['login_attempts']++;
        $_SESSION['ip_attempts'][$clientIP]++;
        $_SESSION['last_attempt'] = time();
        
        error_log("LOGIN: Empty credentials after sanitization from IP: $clientIP");
        header("Location: index.html?error=empty_fields");
        exit;
    }
    
    // Validate credentials using secure hash comparison
    if (validateAdminCredentials($username, $password)) {
        // Successful login
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['admin_username'] = $username;
        $_SESSION['login_time'] = time();
        $_SESSION['login_attempts'] = 0; // Reset global attempts
        $_SESSION['ip_attempts'][$clientIP] = 0; // Reset IP attempts
        
        // Regenerate session ID to prevent session fixation attacks
        session_regenerate_id(true);
        
        // Log successful login (no username for privacy)
        error_log("ADMIN LOGIN: User authenticated at " . date('Y-m-d H:i:s') . " from IP: $clientIP");
        
        // Redirect to dashboard
        header("Location: dashboard.php");
        exit;
    } else {
        // Failed login
        $_SESSION['login_attempts']++;
        $_SESSION['ip_attempts'][$clientIP]++;
        $_SESSION['last_attempt'] = time();
        
        // Log failed attempt WITHOUT username (privacy/security)
        error_log("FAILED LOGIN: Invalid credentials at " . date('Y-m-d H:i:s') . " from IP: $clientIP");
        
        // Add small delay to slow down brute force attempts
        usleep(500000); // 0.5 second delay
        
        header("Location: index.html?error=invalid");
        exit;
    }
} else {
    // Direct access to login.php without POST
    header("Location: index.html");
    exit;
}