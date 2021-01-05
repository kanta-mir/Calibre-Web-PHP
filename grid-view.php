<?php
$doc_root = $_SERVER['HTTP_HOST'];
echo "<div class='row'>";
foreach ($books as $row) {
    $id         = $row['id'];
    $pdf_results =  $myPDO->query("select * from data where book = $id");

    foreach ($pdf_results as $pdf_result) {
        $pdf_name = $pdf_result['name'];
        $pdf_size = $pdf_result['uncompressed_size'];
        $pdf_format = $pdf_result['format'];
        $pdf_size = formatBytes($pdf_size);
    }
    // get book language 
    $lang_code = '';
    $pdf_language =  $myPDO->query("select * from books_languages_link where book = $id");
    foreach ($pdf_language as $pdf_lang) {
        $lang_no = $pdf_lang['lang_code'];
        $pdf_lang_name =  $myPDO->query("select * from languages where id = $lang_no");
        foreach ($pdf_lang_name as $pdf_lang_n) {
            $lang_code = $pdf_lang_n['lang_code'];
            // echo "lang_code: $lang_code";
        }
    }

    // get book rating
    $book_rating = '';
    $pdf_book_ratings =  $myPDO->query("select * from books_ratings_link where book = $id");
    foreach ($pdf_book_ratings as $book_ratings) {
        $book_rating_id = $book_ratings['rating'];
        $book_rating_counts =  $myPDO->query("select * from ratings where id = $book_rating_id");
        foreach ($book_rating_counts as $book_rating_count) {
            $book_rating = $book_rating_count['rating'];
            // echo "rating: $book_rating";
        }
    }

    // get book series
    $book_series = '';
    $book_series_id = '';

    $pdf_book_series =  $myPDO->query("select * from books_series_link where book = $id");
    foreach ($pdf_book_series as $book_serie) {
        $book_series_id = $book_serie['series'];
        $book_series_names =  $myPDO->query("select * from series where id = $book_series_id");
        foreach ($book_series_names as $bsn) {
            $book_series = $bsn['name'];
        }
    }

    // get book tags
    $book_tags = '';
    $book_tags_names = '';
    $pdf_book_tags =  $myPDO->query("select * from books_tags_link where book = $id");
    if ($pdf_book_tags != null) {
        // echo "data found";
    } else {
        echo "data not found";
    }
    foreach ($pdf_book_tags as $book_tag) {
        $book_tags_id = $book_tag['tag'];
        // echo "<br/> book_tags_id: $book_tags_id";
        $book_tags_names =  $myPDO->query("select * from tags where id = $book_tags_id");
        foreach ($book_tags_names as $btn) {
            $book_tags = $btn['name'];
            // echo "<br/> tags: $book_tags";
            //NOTE: book tags can be multiple- send as array
        }
    }

    // get book tags
    $book_publisher = '';
    $pdf_book_publishers =  $myPDO->query("select * from books_publishers_link where book = $id");
    if ($pdf_book_publishers != null) {
        // echo "data found";
    } else {
        echo "data not found";
    }
    foreach ($pdf_book_publishers as $book_publisher) {
        $book_publishers_id = $book_publisher['publisher'];
        $book_publisher_names =  $myPDO->query("select * from publishers where id = $book_publishers_id");
        foreach ($book_publisher_names as $bpn) {
            $book_publisher = $bpn['name'];
            // echo "pubs: $book_publisher";
            //NOTE: book tags can be multiple- send as array
        }
    }


    $title          = $row['title'];
    $sort           = $row['sort'];
    $timestamp      = date_format(date_create($row['timestamp']), 'd-m-Y');
    $pubdate        = date_format(date_create($row['pubdate']), 'd-m-Y');
    $series_index   = $row['series_index'];
    $author_sort    = $row['author_sort'];
    $isbn           = $row['isbn'];
    $lccn           = $row['lccn'];
    $path           = $row['path'];
    $path2          = filter_var($path, FILTER_SANITIZE_ADD_SLASHES);
    $flags          = $row['flags'];
    $uuid           = $row['uuid'];
    $has_cover      = $row['has_cover'];
    $last_modified  = date_format(date_create($row['last_modified']), 'd-m-Y');

    echo "<div class='col-sm text-center'>";
    echo "<p class='shadow bg-primary text-white m-0'> $id </p>";
    // if ($has_cover == 1) {
    if (true) {
        $pdf_link = "//$doc_root/caliber/$path2/$pdf_name.$pdf_format";
        $image_path = "//$doc_root/caliber/$path2/cover.jpg";
        if ($pdf_format == 'PDF') {
            // $pdf_link = "//$doc_root/caliber/$path2/$pdf_name.$pdf_format";
            echo "
                    <div class='' style='background-color: #f5f6f7;min-height:250px;min-width:200px'>
                        <a href='pdfjss/web/viewer.html?file=$pdf_link' class='thumbnail' target='_blank' data-toggle='popover' data-full='//$doc_root/caliber/$path2/cover.jpg'>
                            <img class=''  src='$image_path' width='150' title='Click to open'/>
                        </a>
                    </div>
                ";
        } else if ($pdf_format == 'DJVU') {
            // $pdf_link = "//$doc_root/caliber/$path2/$pdf_name.$pdf_format";
            echo "
                <div class='' style='background-color: #f5f6f7;min-height:250px;min-width:200px'>
                    <a href='djvu/index.php?f=$pdf_link' class='thumbnail' target='_blank' data-toggle='popover' data-full='//$doc_root/caliber/$path2/cover.jpg'>
                        <img class=''  src='$image_path' width='150' title='Click to open'/>
                    </a>
                </div>
            ";
        } else if ($pdf_format == 'DOCX') {
            // $pdf_link = "https://$doc_root/caliber/$path2/$pdf_name.$pdf_format";
            echo "
                <div class='' style='background-color: #f5f6f7;min-height:250px;min-width:200px'>
                    <a href='https://docs.google.com/gview?url=http:$pdf_link' class='thumbnail' target='_blank' data-toggle='popover' data-full='//$doc_root/caliber/$path2/cover.jpg'>
                        <img class=''  src='$image_path' width='150' title='Click to open'/>
                    </a>
                </div>
            ";
        } else if ($pdf_format == 'CBZ' || $pdf_format == 'CBR' || $pdf_format == 'EPUB') {
            // $pdf_link = "http://$doc_root/caliber/$path2/$pdf_name.$pdf_format";
            echo "
                <div class='' style='background-color: #f5f6f7;min-height:250px;min-width:200px'>
                    <a href='http://calibre.mscod.net/kthoom/index.html?bookUri=$pdf_link' class='thumbnail' target='_blank' data-toggle='popover' data-full='//$doc_root/caliber/$path2/cover.jpg'>
                        <img class=''  src='$image_path' width='150' title='Click to open'/>
                    </a>
                </div>
            ";
        } else {
            echo "
                <div class='' style='background-color: #f5f6f7;min-height:250px;min-width:200px'>
                    <a href='https://docs.google.com/gview?url=http:$pdf_link' class='thumbnail' target='_blank' data-toggle='popover' data-full='//$doc_root/caliber/$path2/cover.jpg'>
                        <img class=''  src='$image_path' width='150' title='Click to open'/>
                    </a>
                </div>
            ";
        }
    } else {
        echo "";
    }
    echo "<div class='bg-primary text-white p-2 shadow2'>";
    if ($pdf_format == 'PDF') {
        echo "
        <a class='text-white' title='View Raw Viewer' href='views.php?f=$pdf_link' target='_blank' >
            <i class='fa fa-book-reader mx-1' style='font-size:24px'></i>
        </a>";
    }

    echo "
                <a class='text-white' title='Download - $pdf_size' href='$pdf_link' target='_blank' download>
                    <i class='fa fa-download  mx-1' style='font-size:24px'></i>
                </a>
                <a class='text-white' title='Link' href='$pdf_link' target='_blank'>
                    <i class='fa fa-link  mx-1' style='font-size:24px'></i>
                </a>
                <a data-toggle='modal' class='text-white bookIndex' title='Book Index' href='#' data-target='bookIndex'>
                    <i class='fa fa-list  mx-1' style='font-size:24px'></i>
                </a>

                <a data-toggle='modal' 
                data-id         = '$id' 
                data-title      = '$title'
                data-pdfsize    = '$pdf_size'
                data-format     = '$pdf_format'
                data-thumb      = '$image_path'
                data-pubdate    = '$pubdate'
                data-lang       = '$lang_code'
                data-rating     = '$book_rating'
                data-series     = '$book_series'
                data-seriesid   = '$book_series_id'
                data-tags       = '$book_tags'
                data-publisher  = '$book_publisher'
                title='Book Details' class='open-AddBookDialog text-white' href='#' data-target='exampleModalCenter'>
                    <i class='fa fa-info  mx-2' style='font-size:24px'></i>
                </a>
            </div>";
    echo "<p class='bg-info text-white' style='min-height:50px;'><a class='text-white' href='search.php?t=author&s=$author_sort'> $author_sort </a></p>";
    echo "</div>";
}
echo "</div>";

?>

<!-- Modal Book Details -->
<div class="modal fade" id="exampleModalCenter" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLongTitle">Book Details</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body">
                <p name='bookTitle' id='bookTitle' class='text-center bg-info text-white p-2'></p>
                <div class="row">
                    <div class="col">
                        <img src='' name='bookThumb' id='bookThumb' width='200' />
                    </div>
                    <div class="col">
                        <table>
                            <tr>
                                <td>Id</td>
                                <td><span name='bookId' id='bookId'></span></td>
                            </tr>
                            <tr>
                                <td>Size</td>
                                <td><span name='bookPdfSize' id='bookPdfSize'></span></td>
                            </tr>
                            <tr>
                                <td>Published</td>
                                <td><span><a id='bookPubDateLink' href=''><span name='bookPubDate' id='bookPubDate'></span> </a> </span></td>
                            </tr>
                            <tr>
                                <td>Language</td>
                                <td><a href=''><span name='bookLang' id='bookLang'></span></a></td>
                            </tr>
                            <tr>
                                <td>Rating</td>
                                <td><span name='bookLang' id='bookRating'></span></td>
                            </tr>
                            <tr>
                                <td>Series</td>
                                <td><a href='' id='bookSeriesLink'><span name='bookSeries' id='bookSeries'></span></a></td>
                            </tr>
                            <tr>
                                <td>Tags</td>
                                <td><a href=''><span name='bookTags' id='bookTags'></span></a></td>
                            </tr>
                            <tr>
                                <td>Format</td>
                                <td><a href=''><span name='bookFormat' id='bookFormat'></span></a></td>
                            </tr>
                            <tr>
                                <td>Publisher</td>
                                <td><a href=''><span name='bookPublisher' id='bookPublisher'></span></a></td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-danger" data-dismiss="modal">Close</button>
            </div>
        </div>
    </div>
</div>
<!-- MOdel -->

<!-- Modal Book Index -->
<div class="modal fade bookIndex" id="bookIndex" tabindex="-1" role="dialog" aria-labelledby="bookIndex" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="bookIndexTitle">Book Index</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body">
                <table class="table w-100">
                    <tr>
                        <th>#</th>
                        <th>Subject</th>
                    </tr>
                    <tr>
                        <td>1</td>
                        <td><a href="#">Title Page</a></td>
                    </tr>
                </table>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-danger" data-dismiss="modal">Close</button>
            </div>
        </div>
    </div>
</div>
<!-- MOdel -->
<?php
function formatBytes($bytes, $precision = 2)
{
    $units = array('B', 'KB', 'MB', 'GB', 'TB');
    $bytes = max($bytes, 0);
    $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
    $pow = min($pow, count($units) - 1);
    // Uncomment one of the following alternatives
    $bytes /= pow(1024, $pow);
    // $bytes /= (1 <<script (10 * $pow)); 
    // echo "bytes: $bytes";
    return round($bytes, $precision) . ' ' . $units[$pow];
}
?>