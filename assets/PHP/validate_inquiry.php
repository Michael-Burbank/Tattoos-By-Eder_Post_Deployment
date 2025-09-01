<?php
// Validation and sanitization for inquiry form
function validate_inquiry_inputs(array $post, array $files) {
    $result = [
        'errors' => [],
        'data' => [],
        'attachments' => []
    ];

    // --- reCAPTCHA Verification ---
    $recaptcha_response = isset($post['g-recaptcha-response']) ? $post['g-recaptcha-response'] : '';
    if (empty($recaptcha_response)) {
        $result['errors'][] = 'Please complete the reCAPTCHA verification.';
        return $result;
    }
    $secret = $_ENV['RECAPTCHA_SECRET_KEY'];
    $verify = file_get_contents("https://www.google.com/recaptcha/api/siteverify?secret={$secret}&response={$recaptcha_response}&remoteip=" . $_SERVER['REMOTE_ADDR']);
    $captcha_success = json_decode($verify);
    if (empty($captcha_success->success)) {
        $result['errors'][] = 'reCAPTCHA verification failed. Please try again.';
        return $result;
    }

    // Sanitize and validate inputs
    $name = isset($post['name']) ? trim(filter_var($post['name'], FILTER_SANITIZE_FULL_SPECIAL_CHARS)) : '';
    $current_age = isset($post['current_age']) ? filter_var($post['current_age'], FILTER_VALIDATE_INT, ["options" => ["min_range" => 18, "max_range" => 120]]) : '';
    $phone_number = isset($post['phone_number']) ? preg_replace('/[^0-9+\-() ]/', '', $post['phone_number']) : '';
    $email = isset($post['email']) ? filter_var($post['email'], FILTER_VALIDATE_EMAIL) : '';
    $tattoo_placement = isset($post['tattoo_placement']) ? trim(filter_var($post['tattoo_placement'], FILTER_SANITIZE_FULL_SPECIAL_CHARS)) : '';
    $estimated_size = isset($post['estimated_size']) ? trim(filter_var($post['estimated_size'], FILTER_SANITIZE_FULL_SPECIAL_CHARS)) : '';
    $tattoo_description = isset($post['tattoo_description']) ? trim(filter_var($post['tattoo_description'], FILTER_SANITIZE_FULL_SPECIAL_CHARS)) : '';
    $style = isset($post['style']) ? trim($post['style']) : '';

    $allowed_styles = ['Portrait', 'Lettering', 'Traditional', 'Color', 'BlackGrey'];
    if (!in_array($style, $allowed_styles, true)) {
        $result['errors'][] = 'Invalid tattoo style selected.';
    }

    $referral_source = isset($post['referral_source']) ? trim($post['referral_source']) : '';
    $allowed_referral_sources = ['Instagram', 'Facebook', 'TikTok', 'Google', 'Family/Friend', 'Other'];
    if (!in_array($referral_source, $allowed_referral_sources, true)) {
        $result['errors'][] = 'Invalid referral source selected.';
    }

    if (empty($name) || empty($current_age) || empty($phone_number) || empty($email) || empty($estimated_size) || empty($style)) {
        $result['errors'][] = 'Invalid input. Please fill out all required fields.';
    }
    if (!preg_match('/^[0-9+\-() ]{7,20}$/', $phone_number)) {
        $result['errors'][] = 'Invalid phone number format.';
    }
    if (!$email) {
        $result['errors'][] = 'Invalid email address.';
    }

    // Handle file uploads with security checks
    $attachments = [];
    // Increase upload limit to 25MB (server PHP settings must also allow this)
    $maxFileSize = 25 * 1024 * 1024; // 25MB
    $allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    foreach ([
        'ref_image_input',
        'placement_image_input'
    ] as $fileField) {
        if (isset($files[$fileField]) && $files[$fileField]['error'] === UPLOAD_ERR_OK) {
            $tmpName = $files[$fileField]['tmp_name'];
            $originalName = basename($files[$fileField]['name']);
            $fileSize = $files[$fileField]['size'];
            $fileType = mime_content_type($tmpName);
            $ext = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
            if (!in_array($fileType, $allowedMimeTypes, true) || !in_array($ext, $allowedExtensions, true)) {
                $result['errors'][] = 'Invalid file type for upload.';
                continue;
            }
            if ($fileSize > $maxFileSize) {
                $result['errors'][] = 'File too large. Maximum allowed size is 25MB.';
                continue;
            }
            $attachments[] = ['tmp_name' => $tmpName, 'name' => $originalName];
        }
    }

    $result['data'] = compact(
        'name',
        'current_age',
        'phone_number',
        'email',
        'tattoo_placement',
        'estimated_size',
        'tattoo_description',
        'style',
        'referral_source'
    );
    $result['attachments'] = $attachments;
    return $result;
}
