<?php
/**
 * contact.php — Procesa el formulario de contacto de BULK 3D STUDIO.
 *
 * - Valida los campos del lado servidor.
 * - Anti-spam con honeypot (campo "website" oculto).
 * - Envía el mail con mail().
 * - Redirige de vuelta a la landing con ?sent=1 (éxito) o ?error=... (error).
 *
 * Para usar SMTP en vez de mail(), mirá la nota al final del archivo.
 */

/* ------------------------------------------------------------------
   CONFIGURACIÓN — editá estos valores
------------------------------------------------------------------ */
$DESTINO  = "hola@bulk3dstudio.com";        // ← dónde recibís los mensajes
$ASUNTO   = "Nuevo presupuesto — BULK 3D STUDIO";
$REDIRECT = "index.php#contacto";            // adónde volver tras enviar

/* ------------------------------------------------------------------
   Helpers
------------------------------------------------------------------ */
function redirect_with($params) {
    global $REDIRECT;
    $base = strtok($REDIRECT, '#');
    $hash = strpos($REDIRECT, '#') !== false ? substr($REDIRECT, strpos($REDIRECT, '#')) : '';
    $query = http_build_query($params);
    header("Location: {$base}?{$query}{$hash}");
    exit;
}
function fail($msg) {
    redirect_with(['error' => $msg]);
}

/* ------------------------------------------------------------------
   Solo aceptamos POST
------------------------------------------------------------------ */
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect_with(['error' => 'Método no permitido.']);
}

/* ------------------------------------------------------------------
   Honeypot: si el campo oculto viene completo, es un bot.
   Respondemos "éxito" silencioso para no darle pistas.
------------------------------------------------------------------ */
if (!empty($_POST['website'])) {
    redirect_with(['sent' => '1']);
}

/* ------------------------------------------------------------------
   Recolectar y limpiar datos
------------------------------------------------------------------ */
$name    = isset($_POST['name'])    ? trim($_POST['name'])    : '';
$email   = isset($_POST['email'])   ? trim($_POST['email'])   : '';
$message = isset($_POST['message']) ? trim($_POST['message']) : '';

/* ------------------------------------------------------------------
   Validación del lado servidor
------------------------------------------------------------------ */
if (mb_strlen($name) < 2) {
    fail('Ingresá tu nombre.');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    fail('Ingresá un email válido.');
}
if (mb_strlen($message) < 10) {
    fail('El mensaje es demasiado corto.');
}
// Prevención básica de header injection
if (preg_match('/[\r\n]/', $name . $email)) {
    fail('Datos inválidos.');
}

/* ------------------------------------------------------------------
   Armar y enviar el mail
------------------------------------------------------------------ */
$safe_name    = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
$safe_email   = htmlspecialchars($email, ENT_QUOTES, 'UTF-8');
$safe_message = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');

$body  = "Nuevo mensaje desde bulk3dstudio.com\n";
$body .= "----------------------------------------\n\n";
$body .= "Nombre:  {$name}\n";
$body .= "Email:   {$email}\n\n";
$body .= "Mensaje:\n{$message}\n\n";
$body .= "----------------------------------------\n";
$body .= "Enviado: " . date('Y-m-d H:i:s') . "\n";
$body .= "IP: " . ($_SERVER['REMOTE_ADDR'] ?? 'desconocida') . "\n";

// Headers. From debe ser un dominio propio para no caer en spam.
$from = "no-reply@bulk3dstudio.com";
$headers  = "From: BULK 3D STUDIO <{$from}>\r\n";
$headers .= "Reply-To: {$safe_name} <{$email}>\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";

$asunto_enc = "=?UTF-8?B?" . base64_encode($ASUNTO) . "?=";

$enviado = @mail($DESTINO, $asunto_enc, $body, $headers);

if ($enviado) {
    redirect_with(['sent' => '1']);
} else {
    fail('No pudimos enviar el mensaje. Probá de nuevo o escribinos por WhatsApp.');
}

/* ======================================================================
   NOTA — ¿mail() no funciona en tu hosting? Usá SMTP con PHPMailer:

   1) Descargá PHPMailer (sin Composer):
      https://github.com/PHPMailer/PHPMailer  →  carpeta src/ al proyecto.
   2) Reemplazá el bloque "Armar y enviar el mail" por:

      require 'PHPMailer/src/PHPMailer.php';
      require 'PHPMailer/src/SMTP.php';
      require 'PHPMailer/src/Exception.php';
      use PHPMailer\PHPMailer\PHPMailer;

      $mail = new PHPMailer(true);
      $mail->isSMTP();
      $mail->Host       = 'smtp.tuproveedor.com';
      $mail->SMTPAuth   = true;
      $mail->Username   = 'usuario@bulk3dstudio.com';
      $mail->Password   = 'TU_PASSWORD';
      $mail->SMTPSecure = 'tls';
      $mail->Port       = 587;
      $mail->CharSet    = 'UTF-8';
      $mail->setFrom('no-reply@bulk3dstudio.com', 'BULK 3D STUDIO');
      $mail->addAddress($DESTINO);
      $mail->addReplyTo($email, $name);
      $mail->Subject = $ASUNTO;
      $mail->Body    = $body;
      $enviado = $mail->send();
   ====================================================================== */
