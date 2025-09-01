<?php
// filepath: /Users/mike/Desktop/Dev/Eder/Eder-Sanchez/login/logout.php

// Start output buffering to prevent header issues
ob_start();

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Security headers
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');
header('Referrer-Policy: strict-origin-when-cross-origin');

/**
 * Get client IP address with proxy support
 */
function getClientIP() {
    $ipKeys = [
        'HTTP_CF_CONNECTING_IP',     // Cloudflare
        'HTTP_CLIENT_IP',            // Proxy
        'HTTP_X_FORWARDED_FOR',      // Load balancer/proxy
        'HTTP_X_FORWARDED',          // Proxy
        'HTTP_X_CLUSTER_CLIENT_IP',  // Cluster
        'HTTP_FORWARDED_FOR',        // Proxy
        'HTTP_FORWARDED',            // Proxy
        'REMOTE_ADDR'                // Standard
    ];
    
    foreach ($ipKeys as $key) {
        if (array_key_exists($key, $_SERVER) && !empty($_SERVER[$key])) {
            $ips = explode(',', $_SERVER[$key]);
            $ip = trim($ips[0]);
            
            // Validate IP address
            if (filter_var($ip, FILTER_VALIDATE_IP, 
                FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                return $ip;
            }
        }
    }
    
    return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
}

/**
 * Get user agent with length limit
 */
function getUserAgent() {
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
    return substr($userAgent, 0, 255); // Limit length for logging
}

/**
 * Log logout activity
 */
function logLogoutActivity($wasLoggedIn, $sessionData = []) {
    $clientIP = getClientIP();
    $userAgent = getUserAgent();
    $timestamp = date('Y-m-d H:i:s');
    $sessionId = session_id();
    
    // Create log entry
    $logEntry = [
        'timestamp' => $timestamp,
        'event' => $wasLoggedIn ? 'ADMIN_LOGOUT_SUCCESS' : 'LOGOUT_ATTEMPT_NO_SESSION',
        'ip_address' => $clientIP,
        'user_agent' => $userAgent,
        'session_id' => substr($sessionId, 0, 8) . '...', // Partial session ID for privacy
        'was_logged_in' => $wasLoggedIn,
        'session_duration' => null,
        'referer' => $_SERVER['HTTP_REFERER'] ?? 'direct'
    ];
    
    // Calculate session duration if login time is available
    if (isset($sessionData['login_time'])) {
        $loginTime = $sessionData['login_time'];
        $logoutTime = time();
        $duration = $logoutTime - $loginTime;
        $logEntry['session_duration'] = $duration . ' seconds';
    }
    
    // Format log message
    $logMessage = sprintf(
        "%s | %s | IP: %s | Session: %s | Duration: %s | Referer: %s | UA: %s",
        $logEntry['timestamp'],
        $logEntry['event'],
        $logEntry['ip_address'],
        $logEntry['session_id'],
        $logEntry['session_duration'] ?? 'unknown',
        $logEntry['referer'],
        substr($logEntry['user_agent'], 0, 100) . '...'
    );
    
    // Log to error log
    error_log($logMessage);
    
    // Optionally log to separate file (uncomment if needed)
    /*
    $logFile = __DIR__ . '/logs/logout.log';
    $logDir = dirname($logFile);
    
    if (!is_dir($logDir)) {
        mkdir($logDir, 0755, true);
    }
    
    file_put_contents(
        $logFile, 
        $logMessage . PHP_EOL, 
        FILE_APPEND | LOCK_EX
    );
    */
    
    return $logEntry;
}

/**
 * Destroy session completely
 */
function destroySession() {
    try {
        // Unset all session variables
        $_SESSION = [];
        
        // Delete session cookie if it exists
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(
                session_name(), 
                '', 
                time() - 42000,
                $params["path"], 
                $params["domain"],
                $params["secure"], 
                $params["httponly"]
            );
        }
        
        // Destroy the session
        if (session_status() === PHP_SESSION_ACTIVE) {
            session_destroy();
        }
        
        return true;
        
    } catch (Exception $e) {
        error_log("Session destruction error: " . $e->getMessage());
        return false;
    }
}

/**
 * Clear additional cookies that might be set
 */
function clearAdditionalCookies() {
    $cookiesToClear = [
        'remember_me',
        'admin_token',
        'csrf_token',
        'last_activity'
    ];
    
    foreach ($cookiesToClear as $cookieName) {
        if (isset($_COOKIE[$cookieName])) {
            setcookie($cookieName, '', time() - 3600, '/');
            setcookie($cookieName, '', time() - 3600, '/', $_SERVER['HTTP_HOST']);
        }
    }
}

/**
 * Validate request method and referrer
 */
function validateLogoutRequest() {
    // Allow both GET and POST requests for logout
    $allowedMethods = ['GET', 'POST'];
    $requestMethod = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    
    if (!in_array($requestMethod, $allowedMethods)) {
        return false;
    }
    
    // Optional: Validate referrer for POST requests
    if ($requestMethod === 'POST') {
        $referer = $_SERVER['HTTP_REFERER'] ?? '';
        $currentDomain = $_SERVER['HTTP_HOST'] ?? '';
        
        if (!empty($referer) && !empty($currentDomain)) {
            $refererHost = parse_url($referer, PHP_URL_HOST);
            if ($refererHost !== $currentDomain) {
                error_log("Logout attempt from invalid referer: $referer");
                return false;
            }
        }
    }
    
    return true;
}

/**
 * Main logout process
 */
function processLogout() {
    // Validate the logout request
    if (!validateLogoutRequest()) {
        error_log("Invalid logout request from IP: " . getClientIP());
        header("Location: index.html?error=invalid_request");
        exit;
    }
    
    // Check if user was actually logged in
    $wasLoggedIn = isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true;
    
    // Store session data for logging before destruction
    $sessionData = [];
    if ($wasLoggedIn) {
        $sessionData = [
            'username' => $_SESSION['username'] ?? 'unknown',
            'login_time' => $_SESSION['login_time'] ?? null,
            'last_activity' => $_SESSION['last_activity'] ?? null,
            'ip_address' => $_SESSION['ip_address'] ?? 'unknown'
        ];
    }
    
    // Log the logout attempt
    $logEntry = logLogoutActivity($wasLoggedIn, $sessionData);
    
    // Clear additional cookies
    clearAdditionalCookies();
    
    // Destroy the session
    $sessionDestroyed = destroySession();
    
    if (!$sessionDestroyed) {
        error_log("Failed to destroy session during logout");
    }
    
    // Determine redirect destination
    if ($wasLoggedIn) {
        // If user was logged in, show modal first, then redirect
        $redirectUrl = "https://tattoosbyeder.com/";
        
        // Log successful logout
        error_log(sprintf(
            "LOGOUT SUCCESS: User '%s' logged out successfully from IP: %s",
            $sessionData['username'] ?? 'unknown',
            getClientIP()
        ));
        
    } else {
        // If user wasn't logged in, redirect directly to main site
        $redirectUrl = "https://tattoosbyeder.com/";
        
        // Log logout attempt without session
        error_log(sprintf(
            "LOGOUT ATTEMPT: No active session found for IP: %s",
            getClientIP()
        ));
    }
    
    return $redirectUrl;
}

/**
 * Handle any errors that might occur
 */
function handleLogoutError($error) {
    $clientIP = getClientIP();
    $errorMessage = "LOGOUT ERROR: $error from IP: $clientIP";
    error_log($errorMessage);
    
    // Redirect to login with error
    header("Location: index.html?error=logout_error");
    exit;
}

// Main execution
try {
    // Set default timezone if not set
    if (!ini_get('date.timezone')) {
        date_default_timezone_set('America/Chicago');
    }
    
    // Process the logout
    $redirectUrl = processLogout();
    
    // Additional security: Clear any output buffer
    while (ob_get_level()) {
        ob_end_clean();
    }
    
    // Set cache control headers to prevent caching
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Cache-Control: post-check=0, pre-check=0', false);
    header('Pragma: no-cache');
    header('Expires: Sat, 01 Jan 2000 00:00:00 GMT');
    
    // Perform the redirect
    header("Location: $redirectUrl");
    exit;
    
} catch (Exception $e) {
    handleLogoutError($e->getMessage());
    
} catch (Error $e) {
    handleLogoutError("Fatal error: " . $e->getMessage());
    
} finally {
    // Ensure any remaining output is cleared
    while (ob_get_level()) {
        ob_end_clean();
    }
}

// Fallback redirect (should never reach here)
header("Location: index.html?error=unexpected");
exit;
?>