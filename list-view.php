<?php 

        echo "<table width='100%'>";
        echo "
            <tr>
                <th>Id</th>
                <th>Title</th>
                <th>Published</th>
                <th>Series</th>
                <th>Author</th>
                <th>Thumb</th>
            </tr>
        ";
        // $doc_root = $_SERVER['SERVER_ADDR'];
        $doc_root = "home.mscod.net";
         
        foreach($books as $row){
            $id         = $row['id'];
            $title      = $row['title'];
            $sort       = $row['sort'];
            $timestamp  = date_format(date_create($row['timestamp']), 'd-m-Y');
            // $timestamp  = $row['timestamp'];
            // $pubdate    = $row['pubdate'];
            $pubdate  = date_format(date_create($row['pubdate']), 'd-m-Y');
            $series_index   = $row['series_index'];
            $author_sort    = $row['author_sort'];
            $isbn           = $row['isbn'];
            $lccn           = $row['lccn'];
            $path           = $row['path'];
            $path2          = filter_var($path, FILTER_SANITIZE_ADD_SLASHES);
            $flags          = $row['flags'];
            $uuid           = $row['uuid'];
            $has_cover      = $row['has_cover'];
            

            // $last_modified  = $row['last_modified'];
            $last_modified  = date_format(date_create($row['last_modified']), 'd-m-Y');
            echo "<tr>
                    <td>$id</td>
                    <td>$title</td>
                    <td>$pubdate</td>
                    <td>$series_index</td>
                    <td>$author_sort</td>
                    ";
                    if($has_cover == 1){
                        echo "
                            <td><img src='//$doc_root/caliber/$path2/cover.jpg' width='150'/>
                            ";
                    }else{ echo ""; }
                    
            
        }
        echo "</table>";

        ?>