<?php
require_once 'contact.php';
$tests = [
  '123-123-123' => 0,
  '123-123-1212' => 1,
];

$errors = [];
foreach($tests as $testValue=>$expectedResult) {

    list($resultBool,$error) = OMSSContactForm::checkPhone($testValue);
    $result = $resultBool ? 1:0;
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
