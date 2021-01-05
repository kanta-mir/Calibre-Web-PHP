<?php 
                if(isset($_GET['f'])){
                    $file_name = $_GET['f'];
                    echo " File Name: $file_name";
                }else{
                    $file_name = 'TazkeerUlIbad.djvu';
                    echo "File not set";
                }
            ?>
<!DOCTYPE html>
<html>

<header>
    <meta charset="utf-8">
    <script id="djvu_js_lib" src="js/djvu.js"></script>
    <script src="js/djvu_viewer.js"></script>
    <script src="js/reloader.js"></script>

    <script>
        
        window.onload = function() {
            // save as a global value
            window.ViewerInstance = new DjVu.Viewer();
            // render into the element
            window.ViewerInstance.render(
                document.querySelector("#for_viewer")
            );
            
            window.ViewerInstance.loadDocumentByUrl('<?php echo $file_name; ?>');
        };
    </script>

    <style>
        /* make it pretty-looking */

        body {
            height: 100vh;
            margin: 0;
        }

        #for_viewer {
            height: 95vh;
            width: 95vh;
            margin: 2vh auto;
        }

        a.djvu {
            display: inline-block;
            margin: 2vh 2vw;
            border: 1px solid gray;
            text-decoration: none;
            color: inherit;
            padding: 1vh 1vw;
            border-radius: 0.5em;
        }

        a.djvu:hover {
            background: lightgray;
        }
    </style>

</header>

<body>
    <div id="for_viewer"></div>
</body>

</html>