<?php
session_start();
$caliber_lib_path = "";
if (!isset($_SESSION['logged_in'])) {
    header("location: login.php");
}

include('db-guru.php');
?>
<?php
if (isset($_GET['v'])) {
    $view_type = $_GET['v'];
} else {
    $view_type = 'grid';
}
if (isset($_GET['s'])) {
    $search_text = $_GET['s'];
} else {
    $search_text = "";
}

if (isset($_GET['t'])) {
    $search_type = $_GET['t'];
} else {
    $search_type = "name";
}
?>
<!doctype html>
<html lang="en">

<head>
    <!-- Required meta tags -->
    <meta charset="utf-8">
    <meta name="description" content="Calibre Web PHP">
    <meta name="keywords" content="Calibre, Calibre Web PHP, PDF, Djvu, CBZ, EPUB, DOCX, TXT">
    <meta name="author" content="MeerTheCoder">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <!-- Bootstrap CSS -->
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
    <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.7.2/css/all.css" integrity="sha384-fnmOCqbTlWIlj8LyTjo7mOUStjsKC4pOpQbqyi7RrhN7udi9RwhKkMHpvLbHG9Sr" crossorigin="anonymous">
    <title>Caliber Meer</title>
    <style>
        body .popover {
            max-width: 830px;
        }
        .scroll-top-button {
            border-radius: 50px 50px 0 0;
        }
        .shadow {
            filter: drop-shadow(0 6mm 4mm rgb(0, 0, 0, 0.37));
        }
        .shadow2 {
            filter: drop-shadow(0 -6mm 4mm rgb(0, 0, 0, 0.37));
        }
    </style>
</head>

<body>
    <nav class="navbar navbar-expand-sm navbar-dark bg-primary">
        <a class="navbar-brand" href="/"><i class="fas fa-book-open"></i> Calibre Meer</a>
        <button class="navbar-toggler d-lg-none" type="button" data-toggle="collapse" data-target="#collapsibleNavId" aria-controls="collapsibleNavId" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="collapsibleNavId">
            <ul class="navbar-nav mr-auto mt-2 mt-lg-0">
                <li class="nav-item active">
                    <a class="nav-link" href="/"><i class="fas fa-home"></i> <span class="sr-only">(current)</span></a>
                </li>
                
                <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle" href="#" id="dropdownId" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><i class="fas fa-eye"></i> View</a>
                    <div class="dropdown-menu" aria-labelledby="dropdownId">
                        <a class="dropdown-item" href="index.php?v=list">List View</a>
                        <a class="dropdown-item" href="index.php?v=grid">Grid View</a>
                    </div>
                </li>
                <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle" href="#" id="dropdownId" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><i class="fas fa-tag"></i> Show</a>
                    <div class="dropdown-menu" aria-labelledby="dropdownId">
                        <a class="dropdown-item" href="tags.php">Tags</a>
                        <a class="dropdown-item" href="series.php">Series</a>
                        <a class="dropdown-item" href="authors.php">Authors</a>
                        <a class="dropdown-item" href="formats.php">ٖFormats</a>
                        <a class="dropdown-item" href="languages.php">Languages</a>
                        <a class="dropdown-item" href="publishers.php">Publishers</a>
                    </div>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="logout.php" title="Logout" data-toggle="tooltip"><i class="fas fa-sign-out-alt"></i></a>
                </li>
            </ul>
            <form class="form-inline my-2 my-lg-0" action="search.php" method="get">
                <select name="t" id="type" class="form-control mr-1">
                    <option class="" value="name"> Name </option>
                    <option class="" value="id"> Id </option>
                    <option class="" value="tags"> Tags </option>
                    <option class="" value="series"> Series </option>
                    <option class="" value="author"> Author </option>
                    <option class="" value="language"> Language </option>
                    <option class="" value="publisher"> Publisher </option>
                    <option class="" value="published"> Published </option>
                </select>

                <input name="s" class="form-control mr-sm-2" type="text" placeholder="Search" value="<?php echo $search_text; ?>">
                <button class="btn btn-success my-2 my-sm-0" type="submit"><i class="fas fa-search"></i></button>
            </form>
        </div>
    </nav>