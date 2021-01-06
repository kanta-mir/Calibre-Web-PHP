<?php
include('header.php');
$get_languages = $myPDO->query("select distinct lang_code from books_languages_link");

?>
<h1 class='bg-info text-white text-center p-2'> Languages </h1>
<div class="container">
    <?php
    $i = 0;
    echo "<table class='table w-100'>";
    foreach ($get_languages as $language) {
        $language_code = $language['lang_code'];
        switch ($language_code) {
            case "1":
                $language_name = "English";
                break;
            case "3":
                $language_name = "Urdu";
                break;
            case "5":
                $language_name = "Arabic";
                break;
            case "6":
                $language_name = "Persian";
                break;
            default:
        }
        // $language_id = $language['id'];
        $i++;
        echo "<tr>
            <td>$i</td>
            <td><a href='search.php?t=language&s=$language_code'>$language_name</a></td>
        </tr>";
    }
    echo "</table>";
    ?>
</div>
<?php include('footer.php'); ?>