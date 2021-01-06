<?php
include('header.php');
$books = '';
$limit_check = '';

if ($search_type == "name") {
    $books = $myPDO->query("select * from books where title like '%$search_text%'");
    $limit_check = $myPDO->query("select count(*) as count from books where title like '%$search_text%'");
} else if ($search_type == "id") {
    $books = $myPDO->query("select * from books where id = $search_text");
    $limit_check = $myPDO->query("select count(*) as count from books where id = $search_text");
} else if ($search_type == "author") {
    $books = $myPDO->query("select * from books where author_sort like '%$search_text%'");
    $limit_check = $myPDO->query("select count(*) as count from books where author_sort like '%$search_text%'");
} else if ($search_type == "published") {
    $search_text = date("Y-m-d", strtotime($search_text));
    $books = $myPDO->query("select * from books where pubdate like '%$search_text%'");
    $limit_check = $myPDO->query("select count(*) as count from books where pubdate like '%$search_text%'");
} else if ($search_type == "series") {
    $books = $myPDO->query("select *, books.id from books, books_series_link where books.id = books_series_link.book and books_series_link.series  = $search_text");
    $limit_check = $myPDO->query("select count(*) as count from books, books_series_link where books.id = books_series_link.book and books_series_link.series  = $search_text");
} else if ($search_type == "tags") {
    $books = $myPDO->query("select *, books.id from books, books_tags_link where books.id = books_tags_link.book and books_tags_link.tag  = $search_text");
    $limit_check = $myPDO->query("select count(*) as count from  books, books_tags_link where books.id = books_tags_link.book and books_tags_link.tag  = $search_text");
} else if ($search_type == "publisher") {
    $books = $myPDO->query("select *, books.id from books, books_publishers_link where books.id = books_publishers_link.book and books_publishers_link.publisher = $search_text");
    $limit_check = $myPDO->query("select count(*) as count from  books, books_publishers_link where books.id = books_publishers_link.book and books_publishers_link.publisher  = $search_text");
} else if ($search_type == "format") {
    $books = $myPDO->query("select *, books.id from books, data where books.id = data.book and data.format  like '%$search_text%'");
    $limit_check = $myPDO->query("select count(*) as count from books, data where books.id = data.book and data.format = '%$search_text%'");
} else if ($search_type == "language") {
    $books = $myPDO->query("select *, books.id from books, books_languages_link where books.id = books_languages_link.book and books_languages_link.lang_code  = $search_text");
    $limit_check = $myPDO->query("select count(*) as count from books, books_languages_link where books.id = books_languages_link.book and books_languages_link.lang_code = $search_text");
} else {
    // ------------ 
}
foreach ($limit_check as $lc) {
    $limit = $lc['count'];
}
// $limit = 100;
$data =  $myPDO->query("select * from data limit $limit"); // id = book, name = pdf name
?>
<div class="container">
    <div class='mt-2'></div>
    <?php include('grid-view.php'); ?>
</div>
<?php include('footer.php'); ?>