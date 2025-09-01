<?php
// filepath: /Users/mike/Desktop/Dev/Eder/Eder-Sanchez/assets/PHP/EncryptionHelper.php

/**
 * EncryptionHelper
 * 
 * Secure AES-256-GCM encryption/decryption for sensitive data at rest.
 * - Uses a 32-byte key from environment variable ENCRYPTION_KEY (base64 encoded).
 * - No hardcoded keys.
 * - Proper IV and tag handling.
 * - Throws exceptions on failure.
 * 
 * PHP 7.1+ required.
 */

class EncryptionHelper
{
    /**
     * Get the encryption key from environment (base64 encoded).
     * @return string
     * @throws Exception
     */
    private static function getKey()
    {
        $envKey = getenv('ENCRYPTION_KEY');
        $key = $_ENV['ENCRYPTION_KEY'] ?? null;
        error_log('ENCRYPTION_KEY in EncryptionHelper: ' . ($key ? $key : '[not set]'));
        if (!$key) {
            throw new Exception('Encryption key not set in environment');
        }
        // If base64 encoded, decode
        if (preg_match('/^[A-Za-z0-9+\/]+={0,2}$/', $key) && strlen($key) === 44) {
            $decoded = base64_decode($key, true);
            if ($decoded !== false && strlen($decoded) === 32) {
                $key = $decoded;
            }
        }
        if (strlen($key) !== 32) {
            throw new Exception('Encryption key must be a valid base64-encoded 32-byte string');
        }
        return $key;
    }

    /**
     * Encrypt plaintext using AES-256-GCM.
     * @param string $plaintext
     * @return string base64-encoded (IV + tag + ciphertext)
     * @throws Exception
     */
    public static function encrypt($plaintext)
    {
        $key = self::getKey();
        $method = 'aes-256-gcm';
        $ivlen = openssl_cipher_iv_length($method);
        $iv = random_bytes($ivlen);
        $tag = '';
        $ciphertext = openssl_encrypt(
            $plaintext,
            $method,
            $key,
            OPENSSL_RAW_DATA,
            $iv,
            $tag,
            '', // AAD (optional)
            16  // tag length
        );
        if ($ciphertext === false) {
            throw new Exception('Encryption failed');
        }
        // Store: IV + tag + ciphertext (all base64 encoded)
        return base64_encode($iv . $tag . $ciphertext);
    }

    /**
     * Decrypt ciphertext using AES-256-GCM.
     * @param string $encrypted base64-encoded (IV + tag + ciphertext)
     * @return string|false
     * @throws Exception
     */
    public static function decrypt($encrypted)
    {
        $key = self::getKey();
        $method = 'aes-256-gcm';
        $data = base64_decode($encrypted, true);
        if ($data === false) {
            throw new Exception('Invalid base64 input for decryption');
        }
        $ivlen = openssl_cipher_iv_length($method);
        if (strlen($data) < $ivlen + 16) {
            throw new Exception('Encrypted data is too short');
        }
        $iv = substr($data, 0, $ivlen);
        $tag = substr($data, $ivlen, 16);
        $ciphertext = substr($data, $ivlen + 16);
        $plaintext = openssl_decrypt(
            $ciphertext,
            $method,
            $key,
            OPENSSL_RAW_DATA,
            $iv,
            $tag,
            '' // AAD (optional)
        );
        if ($plaintext === false) {
            throw new Exception('Decryption failed');
        }
        return $plaintext;
    }
}
