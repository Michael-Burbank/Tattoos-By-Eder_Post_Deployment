<?php
// filepath: /Users/mike/Desktop/Dev/Eder/Eder-Sanchez/login/dashboard.php

session_start();

// Set timezone to Central Time (Dallas, Texas)
date_default_timezone_set('America/Chicago');

// Check if user is logged in
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header("Location: index.html?error=unauthorized");
    exit;
}

// Check session timeout (1 hour = 3600 seconds)
if (isset($_SESSION['login_time']) && (time() - $_SESSION['login_time']) > 3600) {
    session_destroy();
    header("Location: index.html?error=timeout");
    exit;
}

require __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../assets/PHP/DatabaseManager.php';
require_once __DIR__ . '/../assets/PHP/EncryptionHelper.php';

use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

// Get database records (DECRYPTED)
$db = new DatabaseManager();
$inquiries = [];
$totalRecords = 0;
$error = null;

try {
    $inquiries = $db->getAllInquiriesDecrypted();
    $totalRecords = count($inquiries);
} catch (Exception $e) {
    $error = $e->getMessage();
}

// Pagination
$recordsPerPage = 10;
$currentPage = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
$totalPages = ceil($totalRecords / $recordsPerPage);
$offset = ($currentPage - 1) * $recordsPerPage;
$pagedInquiries = array_slice($inquiries, $offset, $recordsPerPage);

// FIXED: Function to properly convert UTC database time to Central Time
function convertUTCToCentral($utcDateString)
{
    if (empty($utcDateString)) return null;
    try {
        $utcDate = new DateTime($utcDateString, new DateTimeZone('UTC'));
        $centralDate = $utcDate->setTimezone(new DateTimeZone('America/Chicago'));
        return $centralDate;
    } catch (Exception $e) {
        error_log("Date conversion error: " . $e->getMessage());
        return null;
    }
}

// FIXED: Calculate stats with proper UTC to Central conversion
$thisMonth = array_filter($inquiries, function ($inquiry) {
    if (!isset($inquiry['Submitted_at'])) return false;
    $centralDate = convertUTCToCentral($inquiry['Submitted_at']);
    if (!$centralDate) return false;
    return $centralDate->format('Y-m') === date('Y-m');
});

$thisWeek = array_filter($inquiries, function ($inquiry) {
    if (!isset($inquiry['Submitted_at'])) return false;
    $centralDate = convertUTCToCentral($inquiry['Submitted_at']);
    if (!$centralDate) return false;
    return $centralDate->format('Y-W') === date('Y-W');
});

$today = array_filter($inquiries, function ($inquiry) {
    if (!isset($inquiry['Submitted_at'])) return false;
    $centralDate = convertUTCToCentral($inquiry['Submitted_at']);
    if (!$centralDate) return false;
    return $centralDate->format('Y-m-d') === date('Y-m-d');
});

// FIXED: Function to format UTC database time as Central Time
function formatCentralTime($utcDateString)
{
    if (empty($utcDateString)) return 'N/A';
    $centralDate = convertUTCToCentral($utcDateString);
    if (!$centralDate) return 'Invalid Date';
    return $centralDate->format('M j, Y g:i A T'); // Example: "Jan 8, 2025 2:30 PM CST"
}

// Get current timezone abbreviation for display
$currentTimezone = date('T'); // CST or CDT
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - Tattoos by Eder</title>
    <!-- <link rel="stylesheet" href="../assets/css/General.css"> -->
    <link rel="stylesheet" href="dashboard.css">
    <link href="https://cdn.jsdelivr.net/npm/remixicon@4.5.0/fonts/remixicon.css" rel="stylesheet">

    <!-- Favicon links -->
  <link rel="apple-touch-icon" href="/assets/media/favicon_io/apple-touch-icon.png" />
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/media/favicon_io/favicon-32x32.png" />
  <link rel="icon" type="image/png" sizes="16x16" href="/assets/media/favicon_io/favicon-16x16.png" />
  <link rel="manifest" href="/assets/media/favicon_io/site.webmanifest" />

  <link rel="icon" type="image/x-icon" href="/assets/media/favicon_io/favicon.ico" />

  <link rel="icon" type="image/png" sizes="192x192" href="/assets/media/favicon_io/android-chrome-192x192.png" />
  <link rel="icon" type="image/png" sizes="512x512" href="/assets/media/favicon_io/android-chrome-512x512.png" />
</head>

<body>
    <div class="dashboard-container">
        <header class="dashboard-header">
            <div class="header-content">
                <div class="header-left">
                    <img src="https://res.cloudinary.com/dbbedy5lo/image/upload/w_100,q_auto,f_auto/v1741267070/logo_white_sqp5fn.png" alt="Logo" width="50" height="50">
                    <h1>Admin Dashboard</h1>
                </div>
                <div class="user-info">
                    <span class="welcome-text">Welcome, <?php echo htmlspecialchars($_SESSION['admin_username']); ?></span>
                    <span class="timezone-info">Central Time (<?php echo $currentTimezone; ?>)</span>
                    <a href="logout.php" class="logout-btn">
                        <i class="ri-logout-box-line"></i> Logout
                    </a>
                </div>
            </div>
        </header>

        <main class="dashboard-main">
            <!-- Stats Dashboard -->
            <div class="stats-section">
                <h2>Inquiry Statistics</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="ri-file-list-3-line"></i>
                        </div>
                        <div class="stat-info">
                            <h3>Total Inquiries</h3>
                            <p class="stat-number"><?php echo $totalRecords; ?></p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="ri-calendar-month-line"></i>
                        </div>
                        <div class="stat-info">
                            <h3>This Month</h3>
                            <p class="stat-number"><?php echo count($thisMonth); ?></p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="ri-calendar-week-line"></i>
                        </div>
                        <div class="stat-info">
                            <h3>This Week</h3>
                            <p class="stat-number"><?php echo count($thisWeek); ?></p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="ri-calendar-today-line"></i>
                        </div>
                        <div class="stat-info">
                            <h3>Today</h3>
                            <p class="stat-number"><?php echo count($today); ?></p>
                        </div>
                    </div>
                </div>
            </div>

            <?php if ($error): ?>
                <div class="error-section">
                    <div class="error-message">
                        <i class="ri-error-warning-line"></i>
                        <p>Error loading data: <?php echo htmlspecialchars($error); ?></p>
                    </div>
                </div>
            <?php else: ?>
                <!-- Inquiries Table -->
                <div class="inquiries-section">
                    <div class="section-header">
                        <h2>Recent Inquiries</h2>
                        <div class="header-actions">
                            <button class="refresh-btn" onclick="location.reload()">
                                <i class="ri-refresh-line"></i> Refresh
                            </button>
                        </div>
                    </div>

                    <div class="table-container">
                        <table class="inquiries-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Age</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Referral Source</th>
                                    <th>Submitted (Central Time)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php if (empty($pagedInquiries)): ?>
                                    <tr>
                                        <td colspan="6" class="no-data">No inquiries found</td>
                                    </tr>
                                <?php else: ?>
                                    <?php foreach ($pagedInquiries as $inquiry): ?>
                                        <tr>
                                            <td><?php echo htmlspecialchars($inquiry['id'] ?? ''); ?></td>
                                            <td class="name-cell"><?php echo htmlspecialchars($inquiry['Name'] ?? ''); ?></td>
                                            <td><?php echo htmlspecialchars($inquiry['Age'] ?? ''); ?></td>
                                            <td class="email-cell">
                                                <a href="mailto:<?php echo htmlspecialchars($inquiry['Email'] ?? ''); ?>">
                                                    <?php echo htmlspecialchars($inquiry['Email'] ?? ''); ?>
                                                </a>
                                            </td>
                                            <td class="phone-cell">
                                                <a href="tel:<?php echo htmlspecialchars($inquiry['Phone_Number'] ?? ''); ?>">
                                                    <?php echo htmlspecialchars($inquiry['Phone_Number'] ?? ''); ?>
                                                </a>
                                            </td>
                                            <td class="referral-source-cell">
                                                <?php echo htmlspecialchars($inquiry['Referral_Source'] ?? ''); ?>
                                            </td>
                                            <td class="date-cell">
                                                <?php echo formatCentralTime($inquiry['Submitted_at'] ?? ''); ?>
                                            </td>
                                        </tr>
                                    <?php endforeach; ?>
                                <?php endif; ?>
                            </tbody>
                        </table>
                    </div>

                    <!-- Pagination -->
                    <?php if ($totalPages > 1): ?>
                        <div class="pagination">
                            <?php if ($currentPage > 1): ?>
                                <a href="?page=<?php echo $currentPage - 1; ?>" class="page-btn">
                                    <i class="ri-arrow-left-line"></i> Previous
                                </a>
                            <?php endif; ?>

                            <?php for ($i = 1; $i <= $totalPages; $i++): ?>
                                <a href="?page=<?php echo $i; ?>"
                                    class="page-btn <?php echo $i === $currentPage ? 'active' : ''; ?>">
                                    <?php echo $i; ?>
                                </a>
                            <?php endfor; ?>

                            <?php if ($currentPage < $totalPages): ?>
                                <a href="?page=<?php echo $currentPage + 1; ?>" class="page-btn">
                                    Next <i class="ri-arrow-right-line"></i>
                                </a>
                            <?php endif; ?>
                        </div>
                    <?php endif; ?>
                </div>
            <?php endif; ?>
        </main>

        <!-- Quick Actions Footer -->
        <div class="quick-actions">
            <a href="https://tattoosbyeder.com/" class="action-btn">
                <i class="ri-home-line"></i> Back to Website
            </a>
        </div>
    </div>

    <script>
        // Auto-refresh every 5 minutes (300,000ms)
        setTimeout(() => {
            location.reload();
        }, 300000);

        // Add current time display that updates every second
        function updateCurrentTime() {
            const now = new Date();
            const options = {
                timeZone: 'America/Chicago',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZoneName: 'short'
            };

        }

        // Update time every second
        setInterval(updateCurrentTime, 1000);

        // Add loading state to refresh button
        document.querySelector('.refresh-btn')?.addEventListener('click', function() {
            this.innerHTML = '<i class="ri-loader-4-line"></i> Refreshing...';
        });

        // Show loading indicator for table
        function showLoading() {
            const tbody = document.querySelector('.inquiries-table tbody');
            if (tbody) {
                tbody.innerHTML = '<tr><td colspan="6" class="no-data"><i class="ri-loader-4-line"></i> Loading...</td></tr>';
            }
        }
    </script>
</body>

</html>