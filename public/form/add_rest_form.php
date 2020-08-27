<?php
if(isset($_POST['addRestFrmSubmit']) && !empty($_POST['restName']) && !empty($_POST['restAddress']) && !empty($_POST['restCuisine'])){
    
    // Submitted form data
    $restName   = $_POST['restName'];
    $restAddress  = $_POST['restAddress'];
    $restCuisine= $_POST['restCuisine'];
    $restMessage= $_POST['restMessage'];
    
    /*
     * Send email to admin
     */
    $to     = 'hellobrfoodapp@gmail.com';
    $subject= 'Add Restaurant Request';
    
    $htmlContent = '
    <h4>A user has suggested the following restaurant be added:</h4>
    <table cellspacing="0" style="width: 300px; height: 200px;">
        <tr>
            <th>Restaurant Name:</th><td>'.$restName.'</td>
        </tr>

        <tr style="background-color: #e0e0e0;">
            <th>Restaurant Address:</th><td>'.$restAddress.'</td>
        </tr>

        <tr>
            <th>Restaurant Cuisine:</th><td>'.$restCuisine.'</td>
        </tr>

    </table>';
    
    // Set content-type header for sending HTML email
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    
    // Additional headers
    $headers .= 'From: Add Restaurant Form<ContactForm>' . "\r\n";
    
    // Send email
    if(mail($to,$subject,$htmlContent,$headers)){
        $status = 'ok';
    }else{
        $status = 'err';
    }
    
    // Output status
    echo $status;die;
}