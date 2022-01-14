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

    public static function Submit($config) {
        $errors = [];


        $grecaptcha = trim( strip_tags( $_POST['recaptcha'] ) );
        $grecaptcha = urlencode(str_replace(["'", '$', '\\'], '', $grecaptcha));
        $curlCmdTemplate = <<<CURL
        curl 
            --request POST  
            --data 'secret=%s&response=%s&remoteip=%s' 
            https://www.google.com/recaptcha/api/siteverify 
            2>/dev/null
CURL;
        $curlCmd = sprintf($curlCmdTemplate, $config->recaptcha->server_key, $grecaptcha, $_SERVER['REMOTE_ADDR']);
        $curlCmd = str_replace("\n", " ", $curlCmd); // remove new lines to be sure
        /*
         * Sample Verification Response
            {
              "success": true|false,
              "challenge_ts": timestamp,  // timestamp of the challenge load (ISO format yyyy-MM-dd'T'HH:mm:ssZZ)
              "hostname": string,         // the hostname of the site where the reCAPTCHA was solved
              "error-codes": [...]        // optional
            }

            Sample error codes:
                missing-input-secret	The secret parameter is missing.
                invalid-input-secret	The secret parameter is invalid or malformed.
                missing-input-response	The response parameter is missing.
                invalid-input-response	The response parameter is invalid or malformed.
                bad-request	The request is invalid or malformed.
                timeout-or-duplicate	The response is no longer valid: either is too old or has been used previously.
        */
        error_log($curlCmd);
        $response = json_decode(shell_exec($curlCmd));
        if (empty($response)) {
            $errors[] = 'Recaptcha is having issues';
        } else if (!empty($response->{'error-codes'})) {
            if (in_array('timeout-or-duplicate', $response->{'error-codes'})) {
                $errors[] = 'Anti-spam/robot validation expired';
            }
            if (in_array('missing-input-response', $response->{'error-codes'}) ||
                in_array('invalid-input-response', $response->{'error-codes'})) {
                $errors[] = 'Anti-spam/robot validation is not incomplete/missing';
            }
        }


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
            mail( 'office@oaklandmss.com', 'OMSS Contact Form: ' . $subject, $message );
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
    $config = json_decode(file_get_contents('config.json'));
    OMSSContactForm::Submit($config);
}
