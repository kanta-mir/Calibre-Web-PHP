<?php 
    // Change Calibre Database location as you have it.
    $myPDO = new PDO('sqlite:e:\Calibre-Server-Books\metadata.db'); 
    if( $myPDO != null){
        // echo 'Connected';
    }else{
         echo 'Connection failed';
    }
    foreach($myPDO as $row){
        print $row;
    }
?> 