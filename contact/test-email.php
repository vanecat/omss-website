<?php
require_once 'contact.php';
$tests = [
  'ivan' => 0,
  'ivan@asdff' => 0,
  'ivan.asdasd.ad.s@' => 0,
  'ivan.asdasd.ad@asdasd.com' => 1,
  'ivan.asdasd.ad.1@asdasd.com' => 1,
  'ivan_asd--asd+123s@asdasd.com' => 1,
  'ivan_asd--asd+123s@asd-asd.com' => 1,
  'ivan_asd--asd+123s@12-asd.com' => 1,
  'ivan_asd--asd+123s@12as-d.asd-csd.com' => 1,
  'ivan-@asdasd.com' => 0,
  'ivan+@asdasd.com' => 0,
  'ivan.@asdasd.com' => 0,
  'ivan@asdasd.c' => 0,
  'ivan@asdasd.ce' => 1,
  'ivan_asd--asd+123s@12asd.com' => 1,
];
$errors = [];
foreach($tests as $testValue=>$expectedResult) {

    $result = OMSSContactForm::checkEmail($testValue);
    if ($result !== $expectedResult) {
        $errors = 'ERROR: '.$testValue.' is '.($result ? 'Valid' : 'INvalid').' but it is supposed to be '.($expectedResult ? 'VALID' : 'INvalid');
    }
}
echo "\n";
if (!empty($errors)) {
    print_r($errors);
} else {
    echo "OK";
}
echo "\n";
echo "\n";
