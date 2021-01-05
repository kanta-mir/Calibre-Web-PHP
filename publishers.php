<?php
include('header.php');
$get_publishers = $myPDO->query("select * from publishers");

?>
<h1 class='bg-info text-white text-center p-2'> Publishers </h1>
<div class="container">
    <?php
    $i = 0;
    echo "<table class='table w-100'>";
    foreach ($get_publishers as $publisher) {
        $publisher_name = $publisher['name'];
        $publisher_id = $publisher['id'];
        $i++;
        echo "<tr>
            <td>$i</td>
            <td><a href='search.php?t=publisher&s=$publisher_id'>$publisher_name</a></td>
        </tr>";
    }
    echo "</table>";
    ?>
</div>
<?php include('footer.php'); ?>