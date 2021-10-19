<?php


/**
 * Created by PhpStorm.
 * User: ivanvelev
 * Date: 2/16/17
 * Time: 7:09 PM
 */

define( 'WEBFORM_MAILER_FROM', '"OMSS Contact Form" <contact@oaklandmss.com>' );

define( "PHP_PACKAGES_DIR", $_SERVER['DOCUMENT_ROOT'] . '/contact/' );
$extraPackages = array(
      ''
      ,
      PHP_PACKAGES_DIR . 'PEAR-1.10.1/'
      ,
      PHP_PACKAGES_DIR . 'Net_SMTP-1.7.3/'
      ,
      PHP_PACKAGES_DIR . 'Net_Socket-1.0.14/'
      ,
      PHP_PACKAGES_DIR . 'Mail-1.3.0/'
);

set_include_path( get_include_path() . implode( PATH_SEPARATOR, $extraPackages ) );
include( 'Mail.php' );

function send_mail( $to, $subject, $body, $headers = '' ) {
    $recipients = explode( ",", $to );

    foreach ( $recipients as $r ) {
        if ( strpos( $r, '@oaklandmss.com' ) !== false ) {
            return send_mail_to_internal( $r, $subject, $body );
        } else {
            return send_mail_to_external( $r, $subject, $body );
        }
    }
}

function send_mail_to_external( $to, $subject, $body ) {
    // Please specify your Mail Server - Example: mail.yourdomain.com.
    ini_set( "SMTP", "external.emailserver.com" );
    // Please specify an SMTP Number 25 and 8889 are valid SMTP Ports.
    ini_set( "smtp_port", "25" );
    // Please specify the return address to use
    ini_set( 'sendmail_from', WEBFORM_MAILER_FROM );

    return mail( $to, $subject, $body ) ? true : 'Mail was not sent.';
}

function send_mail_to_internal( $to, $subject, $body ) {
    $smtp = Mail::factory( 'smtp',
          array(
                'host' => "inernal.emailserver.net",
                'port' => "25"
          ) );

    $headers            = array();
    $headers['Subject'] = $subject;
    $headers['From']    = WEBFORM_MAILER_FROM;

    $mail = $smtp->send( $to, $headers, $body );

    if ( PEAR::isError( $mail ) ) {
        return $mail->getCode() . $mail->getMessage();
    } else {
        return true;
    }
}