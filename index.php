
    <?php
        include('header.php');
        $limit = 100;
        $hi_bo_no = 0;
        $highest_book_no = $myPDO->query("select id as highest_book_no from books order by id desc limit 1");
        
        foreach($highest_book_no as $hbn){
            $hi_bo_no = $hbn['highest_book_no'];
        }

        $total_books = $myPDO->query("select count(*)  as total from books");
        
        foreach($total_books as $total){
            $total = $total['total'];
        }
        $total = $hi_bo_no;
        // $total_pages = ceil($total / $limit);
        $total_pages = ceil($hi_bo_no / $limit);
        $page = min($total_pages, filter_input(INPUT_GET, 'page', FILTER_VALIDATE_INT, array(
            'options' => array(
                'default'   => 1,
                'min_range' => 1,
            ),
        )));
        
        $offset = ($page - 1) * $limit;

        $start = $offset + 1;
        $end = min(($offset + $limit), $total);
        $prevLink = ($page > 1) ? '<span style="background: #0040d9; padding: 0;" class="btn">
        <a class="text-white display-5 p-3" href="?page=1" title="First page"   data-toggle="tooltip">
            <i class="fas fa-angle-double-left"></i>
        </a> 
        </span>
        <span style="background: #0040d9; padding:0px" class="mr-2 btn">
        <a class="text-white p-3" href="?page=' . ($page - 1) . '" title="Previous page"  data-toggle="tooltip">
            <i class="fas fa-angle-left"></i>
        </a> 
        </span>
        '
        : '<span style="background: #0040d9; padding:0" class="mr-2 btn disabled text-white">
            <a class="p-3" href="#">
                <i class="fas fa-angle-double-left"></i>
            </a>
        </span> 
        <span style="background: #0040d9; padding:0px" class="mr-2 btn disabled  text-white">
            <a class="p-3" href="#">
                <i class="fas fa-angle-left"></i>
            </a>
        </span>';
        $nextlink = ($page < $total_pages) ? '
        <span style="background: #0040d9; padding:0px" class="mr-1 btn">
        <a class="text-white p-3" href="?page=' . ($page + 1) . '" title="Next page" data-toggle="tooltip">
            <i class="fas fa-angle-right"></i>
        </a> 
        </span>
        <span style="background: #0040d9; padding:0px" class="mr-2 btn">
        <a class="text-white p-3" href="?page=' . $total_pages . '" title="Last page"  data-toggle="tooltip">
            <i class="fas fa-angle-double-right"></i>
        </a>
        </span>
        ' : '<span style="background: #0040d9; padding:1px" class="mr-2 btn disabled text-white" >
            <a class="p-3" href="#">
                <i class="fas fa-angle-right"></i>
            </a>
        </span> 
        <span style="background: #0040d9; padding:0px" class="mr-2 btn disabled text-white">
            <a class="p-3" href="#">
                <i class="fas fa-angle-double-right"></i>
            </a>
        </span>';
        
        $books = $myPDO->query("select * from books where id >= $start and id <= $end limit $limit ");
        $data =  $myPDO->query("select * from data limit $limit"); // id = book, name = pdf name
        $prevLink1 = "";
        echo '
        <div id="paging" style="background-color:#829fe3;" class="text-center w-100 text-white my-2 p-2">
            <p class="m-0">', $prevLink, ' Page ', $page, ' of ', $total_pages, ' ', $start, '-', $end, ' of ', $total, ' results ', $nextlink, ' 
                <input id="page-no" type="text" class="text-center form-control " style="width:60px;display: inline;" value=', $page, '>
                <button onClick="openLink()" class="btn btn-primary my-2" href="#', $page , '" data-toggle="tooltip" title="Goto Page"><i class="fas fa-bolt"></i></i></button>
            </p>
        </div>';
        
        echo '<div class="container">';

        // Prepare the paged query
        if($view_type == 'list'){
            include('list-view.php');
        }else{
            include('grid-view.php');
        }
        
    ?>

    </div>
    <?php include('footer.php');