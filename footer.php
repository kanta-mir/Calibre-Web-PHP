<!-- Optional JavaScript -->
    <!-- jQuery first, then Popper.js, then Bootstrap JS -->
    <!--
    <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous"></script>
    -->
    
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js" integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" crossorigin="anonymous"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js" integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM" crossorigin="anonymous"></script>
    <script src="js/scrolls.js"></script>

    <script>
    $(document).ready(function() {
        // grab all thumbnails and add bootstrap popovers
        // https://getbootstrap.com/javascript/#popovers
        $('[data-toggle="popover"]').popover({
            container: 'body',
            html: true,
            placement: 'auto',
            trigger: 'hover',
            content: function() {
            // get the url for the full size img
            var url = $(this).data('full');
            return '<img src="' + url + '" width=250>'
            }
        });
        scroller.init();
        bookIndex
        
        $(document).on("click", ".bookIndex", function () {
            $('#bookIndex').modal('show');
        });

        $(document).on("click", ".open-AddBookDialog", function () {
            var bookId      = $(this).data('id');
            var bookTitle   = $(this).data('title');
            var bookPdfSize = $(this).data('pdfsize');
            var bookFormat  = $(this).data('format');
            var bookThumb   = $(this).data('thumb');
            var bookPubDate = $(this).data('pubdate');
            var bookLang    = $(this).data('lang');
            var bookRating  = $(this).data('rating');
            var bookSeries  = $(this).data('series');
            var bookSeriesId    = $(this).data('seriesid');
            var bookTags        = $(this).data('tags');
            var bookPublisher   = $(this).data('publisher');
            
            

            $(".modal-body #bookId").html( bookId );
            $(".modal-body #bookTitle").html( bookTitle );
            $(".modal-body #bookPdfSize").html( bookPdfSize );
            $(".modal-body #bookFormat").html( bookFormat );
            $(".modal-body #bookThumb").attr('src', bookThumb );
            $(".modal-body #bookPubDate").html(bookPubDate );
            $(".modal-body #bookPubDateLink").attr('href', "search.php?t=published&s=" + bookPubDate );
            
            $(".modal-body #bookLang").html(bookLang);
            $(".modal-body #bookRating").html(bookRating);
            $(".modal-body #bookSeries").html(bookSeries);
            $(".modal-body #bookSeriesLink").attr('href', "search.php?t=series&s=" + bookSeriesId );
            $(".modal-body #bookTags").html(bookTags);
            $(".modal-body #bookPublisher").html(bookPublisher);
            
            // As pointed out in comments, 
            // it is unnecessary to have to manually call the modal.
            $('#exampleModalCenter').modal('show');
        });
        
        $('#type').val("<?php echo $search_type; ?>");
        
    });
    </script>
    <script>
        function openLink(){
            el = document.getElementById('page-no');
            value = el.value;
            console.log("Value: " + value);
            $link = "https://home.mscod.net/caliber-meer/?page=" + value;
            window.open($link, '_self');
        }
    </script>
    <script>
        
    </script>
</body>

</html>