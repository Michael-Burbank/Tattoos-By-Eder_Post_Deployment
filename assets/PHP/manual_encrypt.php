<?php 
// filepath: /Users/mike/Desktop/Dev/Eder/Eder-Sanchez/assets/PHP/manual_encrypt.php

require_once __DIR__ . '/EncryptionHelper.php';
require_once __DIR__ . '/../../vendor/autoload.php';

// Load .env
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../../');
$dotenv->load();

// Replace these with your actual values
//TODO!: CD to this directory. Run php manual_encrypt.php
$name = '';
$age = '';
$email = '';
$phone = '';

// Encrypt each value
try {
    $enc_name = EncryptionHelper::encrypt($name);
    $enc_age = EncryptionHelper::encrypt($age);
    $enc_email = EncryptionHelper::encrypt($email);
    $enc_phone = EncryptionHelper::encrypt($phone);

    echo "Encrypted Name:   $enc_name\n";
    echo "Encrypted Age:    $enc_age\n";
    echo "Encrypted Email:  $enc_email\n";
    echo "Encrypted Phone:  $enc_phone\n";
} catch (Exception $e) {
    echo "Encryption failed: " . $e->getMessage();
}