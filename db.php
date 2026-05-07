<?php
function getDb() {
    $db = new PDO('sqlite:projet.db');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    return $db;
}
?>