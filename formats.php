<?php
include('header.php');
$get_formats = $myPDO->query("select distinct format from data");
?>
<h1 class='bg-info text-white text-center p-2'> Formats </h1>
<div class="container">
    <?php
    $i = 0;
    echo "<table class='table w-100'>";
    foreach ($get_formats as $format) {
        $format_name = $format['format'];
        $i++;
        echo "<tr>
            <td>$i</td>
            <td><a href='search.php?t=format&s=$format_name'>$format_name</a></td>
        </tr>";
    }
    echo "</table>";
    ?>
</div>
<?php include('footer.php'); ?>