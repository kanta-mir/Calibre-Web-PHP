<?php
include('header.php');
$get_authors = $myPDO->query("select * from authors");

?>
<h1 class='bg-info text-white text-center p-2'> Authors </h1>
<div class="container">

    <?php
    $i = 0;
    echo "<table class='table w-100'>";
    foreach ($get_authors as $author) {
        $author_name = $author['name'];
        $author_id = $author['id'];
        $i++;
        echo "<tr>
            <td>$i</td>
            <td><a href='search.php?t=author&s=$author_name'>$author_name</a></td>
        </tr>";
    }
    echo "</table>";
    ?>
</div>
<?php include('footer.php'); ?>