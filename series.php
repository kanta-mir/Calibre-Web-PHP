<?php
include('header.php');
$get_series = $myPDO->query("select * from series");

?>
<h1 class='bg-info text-white text-center p-2'> Series </h1>
<div class="container">
    <?php
    $i = 0;
    echo "<table class='table w-100'>";
    foreach ($get_series as $serie) {
        $series_name = $serie['name'];
        $book_id = $serie['id'];
        $i++;
        echo "<tr>
            <td>$i</td>
            <td><a href='search.php?t=series&s=$book_id'>$series_name</a></td>
        </tr>";
    }
    echo "</table>";
    ?>
</div>
<?php include('footer.php'); ?>