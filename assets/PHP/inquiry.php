<?php
// filepath: /Users/mike/Desktop/Dev/Eder/Eder-Sanchez/assets/PHP/inquiry.php

require __DIR__ . '/../../vendor/autoload.php';
require_once __DIR__ . '/validate_inquiry.php';
require_once __DIR__ . '/DatabaseManager.php';
require_once __DIR__ . '/EncryptionHelper.php';

use Dotenv\Dotenv;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Load environment variables BEFORE any use of EncryptionHelper
try {
    $dotenv = Dotenv::createImmutable(__DIR__ . '/../../');
    $dotenv->load();
    // Debug: Log the ENCRYPTION_KEY value after loading
    error_log('ENCRYPTION_KEY: ' . getenv('ENCRYPTION_KEY'));
} catch (Exception $e) {
    error_log("Failed to load the .env file: " . $e->getMessage());
    die('Environment configuration error.');
}


// Validate and sanitize all inputs
$validation = validate_inquiry_inputs($_POST, $_FILES);
if (!empty($validation['errors'])) {
    foreach ($validation['errors'] as $err) {
        error_log($err);
    }
    die(implode(' ', $validation['errors']));
}

extract($validation['data']);
$attachments = $validation['attachments'];

// Encrypt sensitive fields before saving to the database
try {
    $encrypted_name  = EncryptionHelper::encrypt($name);
    $encrypted_age   = EncryptionHelper::encrypt((string)$current_age);
    $encrypted_email = EncryptionHelper::encrypt($email);
    $encrypted_phone = EncryptionHelper::encrypt($phone_number);
} catch (Exception $e) {
    error_log("Encryption failed: " . $e->getMessage());
    die('Encryption error. Please try again later.');
}

// Save to MariaDB database (only Name, Age, Email, Phone_Number)
$inquiryId = null;
try {
    $db = new DatabaseManager();
    if (!$db->testConnection()) {
        throw new Exception("Database connection test failed");
    }
    $inquiryId = $db->insertInquiry(
        $encrypted_name,
        $encrypted_age,
        $encrypted_email,
        $encrypted_phone,
        $referral_source
    );
    error_log("SUCCESS: Contact info saved to MariaDB with ID: $inquiryId");
} catch (Exception $e) {
    error_log("MariaDB database error: " . $e->getMessage());
    // Continue with email even if database fails
}

$mail = new PHPMailer(true);
try {
    // SMTP settings (use $_ENV for reliability)
    $mail->isSMTP();
    $mail->Host       = $_ENV['SMTP_HOST'] ?? '';
    $mail->SMTPAuth   = filter_var($_ENV['SMTPAuth'] ?? 'false', FILTER_VALIDATE_BOOLEAN);
    $mail->Username   = $_ENV['USERNAME'] ?? '';
    $mail->Password   = $_ENV['PASSWORD'] ?? '';
    $mail->SMTPSecure = $_ENV['SMTPSecure'] ?? '';
    $mail->Port       = (int)($_ENV['SMTP_PORT'] ?? 0);

    // Recipients
    $mail->setFrom($_ENV['SENDER_EMAIL'] ?? '', $_ENV['SENDER_NAME'] ?? '');
    $mail->addAddress($_ENV['RECIPIENT_EMAIL'] ?? '', $_ENV['RECIPIENT_NAME'] ?? '');
    $mail->addReplyTo($_ENV['REPLY_TO_EMAIL'] ?? '', $_ENV['REPLY_TO_NAME'] ?? '');

    // Attach files
    foreach ($attachments as $file) {
        $mail->addAttachment($file['tmp_name'], $file['name']);
    }

    // Decrypt for email display (admin sees plain text)
    try {
        $plain_name  = EncryptionHelper::decrypt($encrypted_name);
        $plain_age   = EncryptionHelper::decrypt($encrypted_age);
        $plain_email = EncryptionHelper::decrypt($encrypted_email);
        $plain_phone = EncryptionHelper::decrypt($encrypted_phone);
    } catch (Exception $e) {
        $plain_name = $plain_age = $plain_email = $plain_phone = '[decryption error]';
        error_log("Decryption failed for email: " . $e->getMessage());
    }

    // Email content (with database ID)
    $mail->isHTML(true);
    $mail->Subject = 'New Tattoo Inquiry' . ($inquiryId ? " DB ID: $inquiryId" : '');
    $mail->Body = "
        <h4>Hello Eder,<br>You have a new tattoo inquiry!</h4>
        " . ($inquiryId ? "<p><strong>Database Record ID:</strong> $inquiryId</p>" : "<p><em>Database save failed - check logs</em></p>") . "
        <br>
        <h4><u>Contact Details <br>(Saved to Database): </u></h4>
        <p><strong>Name:</strong> $plain_name</p>
        <p><strong>Current Age:</strong> $plain_age</p>
        <p><strong>Phone Number:</strong> $plain_phone</p>
        <p><strong>Email:</strong> $plain_email</p>
        <br>
        <h4><u>Tattoo Details <br>(Email Only): </u></h4>
        <p><strong>Tattoo Placement:</strong> $tattoo_placement</p>
        <p><strong>Estimated Size(inches):</strong> $estimated_size</p>
        <p><strong>Description:</strong> $tattoo_description</p>
        <p><strong>Preferred Style:</strong> $style</p>
        <p><strong>Referral Source:</strong> $referral_source</p>
        <br>
        <h4><u>Images: </u></h4>
        <p><strong>Reference Image:</strong> " . (isset($attachments[0]) ? $attachments[0]['name'] : 'No image provided.') . "</p>
        <p><strong>Placement Image:</strong> " . (isset($attachments[1]) ? $attachments[1]['name'] : 'No image provided.') . "</p>
    ";
    $mail->AltBody = "
New Tattoo Inquiry" . ($inquiryId ? " - Database ID: $inquiryId" : '') . "

Contact Details (Saved to Database):
Name: $plain_name
Current Age: $plain_age
Phone Number: $plain_phone
Email: $plain_email

Tattoo Details (Email Only):
Tattoo Placement: $tattoo_placement
Estimated Size: $estimated_size
Description: $tattoo_description
Preferred Style: $style
Referral Source: $referral_source
Reference Image: " . (isset($attachments[0]) ? $attachments[0]['name'] : 'No image provided.') . "
Placement Image: " . (isset($attachments[1]) ? $attachments[1]['name'] : 'No image provided.') . "
    ";

    $mail->send();
    echo 'Message has been sent';
} catch (Exception $e) {
    error_log("Failed to send email: " . $e->getMessage());
    echo 'Message could not be sent. Please try again later.';
}