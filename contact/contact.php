<?php
header('X-Powered-By: OMSS', true);
class OMSSContactForm {
    static public function isWebRequest() {
        return !empty($_SERVER['GATEWAY_INTERFACE']) &&
               !empty($_SERVER['HTTP_HOST']) &&
               !empty($_SERVER['REQUEST_METHOD']);
    }
    static public function isSelf() {
        return !self::isIncluded();
    }
    static public function isIncluded() {
        if (self::isWebRequest()) {
            if ($_SERVER['SCRIPT_FILENAME'] === __FILE__) {
                return false; // is self
            } else {
                return true; // is included
            }
        } else {
            // CLI request
            if ($_SERVER['PWD'].'/'.$_SERVER['SCRIPT_FILENAME'] === __FILE__) {
                return false; // is self
            } else {
                return true; // is included
            }
        }
    }

    public static function checkEmail($email) {
        return preg_match( '/^\w+[\w\-\.+]*\w@[a-z0-9][a-z0-9\-\.]+\.[a-z]{2,16}$/i', $email );
    }
    public static function checkPhone($phone) {
        // phone could have formatting characters for international numbers +
        //   or readability .-() space
        $value = trim($phone);
        $isMatch = preg_match( '/^[a-z\d\+ \-()\.]+$/i', $value);
        if (!$isMatch) {
            return array(false, 'Phone does not look right');
        }
        $digits = preg_replace( '/\D/', '', $phone );
        if (empty($digits)) {
            return array(false, 'Phone does not contain digits');
        }
        if (strlen($digits) < 10) {
            return array(false, 'Phone is too short');
        }

        return array(true, false);
    }

    public static function Submit() {
        $errors = [];

        $name = trim( strip_tags( $_POST['name'] ) );
        $name = mb_substr( $name, 0, 100 ); // char limit
        $name = mb_ereg_replace( '[^\w\., \-\'\"]', '', $name );
        if ( empty( $name ) ) {
            $errors[] = 'Name is blank';
        }

        $email = trim( strip_tags( $_POST['email'] ) );
        $email = substr( $email, 0, 100 ); // char limit
        if ( ! self::checkEmail($email)) {
            $email    = '';
            $errors[] = 'Email does not look right';
        } else if ( empty( $email ) ) {
            $errors[] = 'Email is blank';
        }

        $phone = trim( strip_tags( $_POST['phone'] ) );
        $phone = substr( $phone, 0, 50 ); // char limit
        list($phoneOk, $phoneError) = self::checkPhone($phone);
        if (!$phoneOk && !empty($phoneError)) {
            $errors[] = $phoneError;
        }



        $subject = trim( strip_tags( $_POST['subject'] ) );
        $subject = substr( $subject, 0, 200 ); // char limit
// subject text: very limited char set (no quotes)
        $subject = mb_ereg_replace( '[^ \w\-,\.]', ' ', $subject );
        if ( empty( $subject ) ) {
            $errors[] = 'Subject is blank';
        }

        $message = trim( strip_tags( $_POST['message'] ) );
        $message = substr( $message, 0, 1000 ); // char limit
// regular text can have any character except ` \
        $message = mb_ereg_replace( '[^ !@#$%&*()_+\-=:";\',./?\w]', '', $message );
        if ( empty( $message ) ) {
            $errors[] = 'Message is blank';
        }
        if ( ! empty( $errors ) ) {

        } else {
            $message = <<< EOMSG
Name: $name
Email: $email
Phone: $phone
---
$message
EOMSG;
            mail( 'vanecat@gmail.com', 'OMSS Contact Form: ' . $subject, $message );
        }

        header( 'Content-type: application/json' );
        echo json_encode( array(
              "error" => $errors,
              "form"  => array(
                    $name,
                    $email,
                    $phone,
                    $subject,
                    $message
              )
        ) );
    }
}
if (OMSSContactForm::isWebRequest() && OMSSContactForm::isSelf()) {
    OMSSContactForm::Submit();
}
