<?php
include('header.php');
$get_tags = $myPDO->query("select * from tags");

?>
<h1 class='bg-info text-white text-center p-2'> Tags </h1>
<div class="container">
    <?php
    $i = 0;
    echo "<table class='table w-100'>";
    foreach ($get_tags as $tag) {
        $tag_name = $tag['name'];
        $tag_id = $tag['id'];
        $i++;
        echo "<tr>
            <td>$i</td>
            <td><a href='search.php?t=tags&s=$tag_id'>$tag_name</a></td>
        </tr>";
    }
    echo "</table>";
    ?>
</div>
<?php include('footer.php'); ?>