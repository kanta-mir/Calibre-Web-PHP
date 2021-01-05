<?php 
    if(isset($_GET['f'])){
        $file_name = $_GET['f'];
        $file_name = trim($file_name);
    }else{
        $file_name = 'falsfa/aflatoon.pdf';
    }

    if(isset($_GET['p'])){
        $page_no = $_GET['p'];
    }else{
        $page_no = 1;
    }

?>
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no">
        <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.2.228/pdf.min.js"></script>
        <!-- <script src="./pdfjs26/build/pdf.js"></script>  -->
        <style type="text/css">

            #show-pdf-button {
                width: 150px;
                display: block;
                margin: 20px auto;
            }

            #file-to-upload {
                display: none;
            }

            #pdf-main-container {
                width: 90%;
                margin: 20px auto;
            }

            #pdf-loader {
                display: none;
                text-align: center;
                color: #999999;
                font-size: 13px;
                line-height: 100px;
                height: 100px;
            }

            #pdf-contents {
                width: 90%;
                display: none;
            }

            #pdf-meta {
                overflow: hidden;
                margin: 0 0 20px 0;
            }

            #pdf-buttons {
                float: left;
            }

            #page-count-container {
                float: right;
            }

            #pdf-current-page {
                display: inline;
            }

            #pdf-total-pages {
                display: inline;
            }

            #pdf-canvas {
                border: 1px solid rgba(0,0,0,0.2);
                box-sizing: border-box;
            }

            #page-loader {
                height: 100px;
                line-height: 100px;
                text-align: center;
                display: none;
                color: #999999;
                font-size: 13px;
            }

        </style>
    </head>

    <body>

        <!-- <button id="show-pdf-button">Show PDF</button> -->


        <div id="pdf-main-container">
            <div id="pdf-loader">Loading document ...</div>
            <div id="pdf-contents">
                <div id="pdf-meta">
                    <div id="pdf-buttons">
                        <button id="pdf-first">First</button>
                        <button id="pdf-prev">Previous</button>
                        <button id="pdf-next">Next</button>
                        <button id="pdf-last">Last</button>
                        <lable for ="p"># 
                        <input name="p" id="page-no" value="1" style="width:50px;"/>
                        <button id="goto-page-no">Go</button>
                    </div>
                    <div id="page-count-container">Page <div id="pdf-current-page"></div> of <div id="pdf-total-pages"></div></div>
                </div>
                
                <div id="page-loader">Loading page ...</div>
            </div>
            <div width="60%" style="margin: 0 auto; text-align: center;">
                <canvas id="pdf-canvas" width=550px height=600px style="position: absolute; top: 40px; left: 0px; right: 0px; bottom: 0px; margin: auto;"></canvas>
            </div>
        </div>

        <script>

        var _PDF_DOC,
            _CURRENT_PAGE,
            _TOTAL_PAGES,
            _PAGE_RENDERING_IN_PROGRESS = 0,
            _CANVAS = document.querySelector('#pdf-canvas');

        // initialize and load the PDF
        async function showPDF(pdf_url) {
            document.querySelector("#pdf-loader").style.display = 'block';

            // get handle of pdf document
            try {
                _PDF_DOC = await pdfjsLib.getDocument({ url: pdf_url });
            }
            catch(error) {
                alert(error.message);
            }

            // total pages in pdf
            _TOTAL_PAGES = _PDF_DOC.numPages;
            
            // Hide the pdf loader and show pdf container
            document.querySelector("#pdf-loader").style.display = 'none';
            document.querySelector("#pdf-contents").style.display = 'block';
            document.querySelector("#pdf-total-pages").innerHTML = _TOTAL_PAGES;

            // show the first page
            showPage(1);
        }

        // load and render specific page of the PDF
        async function showPage(page_no) {
            
            _PAGE_RENDERING_IN_PROGRESS = 1;
            _CURRENT_PAGE = page_no;

            // disable Previous & Next buttons while page is being loaded
            document.querySelector("#pdf-first").disabled = true;
            document.querySelector("#pdf-next").disabled = true;
            document.querySelector("#pdf-prev").disabled = true;
            document.querySelector("#pdf-last").disabled = true;

            // while page is being rendered hide the canvas and show a loading message
            document.querySelector("#pdf-canvas").style.display = 'none';
            document.querySelector("#page-loader").style.display = 'block';

            // update current page
            document.querySelector("#pdf-current-page").innerHTML = page_no;
            console.log('|'+page_no+'|');
            // get handle of page
            try {
                var page = await _PDF_DOC.getPage(page_no);
            }
            catch(error) {
                alert("Error 786: " + error.message);
            }

            // original width of the pdf page at scale 1
            var pdf_original_width = page.getViewport(1).width;
            
            // as the canvas is of a fixed width we need to adjust the scale of the viewport where page is rendered
            var scale_required = _CANVAS.width / pdf_original_width;
            // get viewport to render the page at required scale
            
            var viewport = page.getViewport(scale_required);
            // viewport.height = 600;
            // viewport.width = 600;
            // viewport.viewBox[2] = 500;

            // set canvas height same as viewport height
            _CANVAS.height = viewport.height;

            // setting page loader height for smooth experience
            document.querySelector("#page-loader").style.height =  _CANVAS.height + 'px';
            document.querySelector("#page-loader").style.lineHeight = _CANVAS.height + 'px';

            // page is rendered on <canvas> element
            var render_context = {
                canvasContext: _CANVAS.getContext('2d'),
                viewport: viewport
            };
                
            // render the page contents in the canvas
            try {
                await page.render(render_context);
            }
            catch(error) {
                alert(error.message);
            }

            _PAGE_RENDERING_IN_PROGRESS = 0;

            // re-enable Previous & Next buttons
            document.querySelector("#pdf-first").disabled = false;
            document.querySelector("#pdf-next").disabled = false;
            document.querySelector("#pdf-prev").disabled = false;
            document.querySelector("#pdf-last").disabled = false;

            // show the canvas and hide the page loader
            document.querySelector("#pdf-canvas").style.display = 'block';
            document.querySelector("#page-loader").style.display = 'none';
        }

        /*
        // click on "Show PDF" buuton
        document.querySelector("#show-pdf-button").addEventListener('click', function() {
            this.style.display = 'none';
            // showPDF('a.pdf');
            showPDF('<?php // echo $file_name; ?>');
        });
        */

        // click on the "First" page button
        document.querySelector("#pdf-first").addEventListener('click', function() {
            if(_CURRENT_PAGE != 1){
                showPage(1);
                el = document.getElementById('page-no');
                el.value = 1;
            }
        });

        // click on the "Previous" page button
        document.querySelector("#pdf-prev").addEventListener('click', function() {
            if(_CURRENT_PAGE != 1){
                showPage(--_CURRENT_PAGE);
                el = document.getElementById('page-no');
                el.value = _CURRENT_PAGE;

            }
                
        });

        // click on the "Next" page button
        document.querySelector("#pdf-next").addEventListener('click', function() {
            if(_CURRENT_PAGE != _TOTAL_PAGES){
                showPage(++_CURRENT_PAGE);
                el = document.getElementById('page-no');
                el.value = _CURRENT_PAGE;
            }
        });

        // click on the "First" page button
        document.querySelector("#pdf-last").addEventListener('click', function() {
            showPage(_TOTAL_PAGES);
            el = document.getElementById('page-no');
            el.value = _TOTAL_PAGES;
        });

        // click on the "Go" page button
        document.querySelector("#goto-page-no").addEventListener('click', function() {
            el = document.getElementById('page-no');
            var goto_page_no = el.value.trim();

            if(goto_page_no > 0 && goto_page_no <= _TOTAL_PAGES){
                _CURRENT_PAGE = goto_page_no;

                // showPage(_CURRENT_PAGE); // this produces error "invalid page request"
                // showPage(50); // this produces no error
                console.log('|'+goto_page_no+'|');
                showPage(parseInt(goto_page_no)); // this produces no error
            }
        });

        </script>

        <script> showPDF('<?php echo $file_name; ?>'); </script>

    </body>
</html>