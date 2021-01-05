'use strict';

var scroller = {
	config: {
		hoverColor: "#DB7661",
		bgColor: "rgba(31, 43, 49,0.5)",
		opacity: 1
	},
	init: function(){
		var anchor = document.createElement("a");
		var scrollTopButton = ".scroll-top-button";
		var spn = document.createElement("img");
		$(spn).text("^");
		$(anchor).attr({
			href: "#top"
		});
		$(spn).attr({
			id: "up-btn",
			class: scrollTopButton.replace(".",""),
			src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB8AAAATCAYAAABobNZCAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA7VpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wUmlnaHRzPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvcmlnaHRzLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcFJpZ2h0czpNYXJrZWQ9IkZhbHNlIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6MDI4MDExNzQwNzIwNjgxMThEQkJGNTAwMDFENjJCODEiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NjQ3MDE3RkUzN0M2MTFFMkI5MUNENTYyQzU3ODhFNEUiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NjQ3MDE3RkQzN0M2MTFFMkI5MUNENTYyQzU3ODhFNEUiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo0MjY1MDg5QjNGMkZFMjExQUM3Q0Q4Nzg2MUU1NkM3RSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDowMjgwMTE3NDA3MjA2ODExOERCQkY1MDAwMUQ2MkI4MSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Psc29coAAAE7SURBVHjaYvj//z8DmTgOiM8CsTK5ZpBrccR/BDhPrgPIsTgKiH//RwVkhQCpFscA8Y//2AHIAaq0stwNiL/8xw+OAbEQtS13AuKX/4kD24FYgFqW25FgMUkOIMbiF//JA9uAmJ9cy22B+Dkew/8C8R0CDtgKxMKkWu5AhI/bgVgNiE8SEQVixFpuD8TPCBjYg6RekUgHiBCy3IkIi7uAmAlNnwIQnyAiDQjistyRiKAGWcyKI6pkiAiBbci5AEQwQoOakMXdeCxGdsBpIqIAFAKMIA36QPyWQKrugTqSmHJBhsgoUGNiYGD4BsQPGXCDfiAuAeL/DMSBJ0AcCsQn8ai5B8Q/kFPsGRxBTW61K4cjBCZgS3BKaPHVSYHFuHJBH76sBgqBo0DciyU7UeKAw0A8EYiZkeUAAgwAswRZ5V7ztVUAAAAASUVORK5CYII=",
		});
		var bgCol, hoverCol, arrowCol, op;
		if(typeof  conf != "undefined") {
			bgCol = typeof conf.bgColor == "undefined" ? scroller.config.bgColor : conf.bgColor;
			hoverCol = typeof conf.hoverColor == "undefined" ? scroller.config.hoverColor : conf.hoverColor;
			op = typeof conf.opacity == "undefined" ? scroller.config.opacity : conf.opacity;
		} else {
			bgCol =  scroller.config.bgColor;
			hoverCol = scroller.config.hoverColor;
			op = scroller.config.opacity;
		}
		$(anchor).append(spn);
		$("body").prepend(anchor);
		$(anchor).prepend("<a name='top'></a>");
		$(scrollTopButton).css({
			position: "absolute",
			top: "120px",
			right: "40px",
			color: "#fff",
			backgroundColor: bgCol,
			opacity: op,
			webkitTransition: "background 0.4s",
			mozTransition: "background 0.4s",
			msTransition: "background 0.4s",
			transition: "background 0.4s",
			padding:"15px 10px",
			textAlign: "center",
			boxSizing: "content-box"

		});

		$(scrollTopButton).on("mouseover", function(){
			$(this).css({
				backgroundColor: hoverCol,
				opacity: 1
			});
		});
		$(scrollTopButton).on("mouseout", function(){
			$(this).css({
				color: arrowCol,
				backgroundColor: bgCol,
				opacity: op
			});
		});
		this.offset();
	},
	offset: function(){
		var currentWindowHeight = window.innerHeight;

		var arrow = $(".scroll-top-button");

		arrow.css("display", "none");

		$(function() {
			var eTop = $('body').offset().top;

			var arrowOffset = arrow.offset().top;

			//position of the ele w.r.t window
			$(window).scroll(function() {
				//when window is scrolled
				var scrollPosition = eTop - $(window).scrollTop();
				if (scrollPosition > -200) {
					arrow.fadeOut("slow");
				}
				if (scrollPosition <= -400) {
					var height = (window.innerHeight - 100);
					arrow.fadeIn("slow");
					arrow.css({
						'position': 'fixed',
						'display': 'block',
						'top': height,
						'z-index': 2
					});
				}
			});
		});
		this.scrolls();
	},
	scrolls: function(){
		$('a[href*=\\#]:not([href=\\#])').click(
			function() {
				if (location.pathname.replace(
						/^\//, '') == this.pathname.replace(
						/^\//, '') || location.hostname ==
					this.hostname) {
					var target = $(this.hash);
					target = target.length ? target :
						$('[name=' + this.hash.slice(1) +
							']');
					if (target.length) {
						$('html,body').animate({
							scrollTop: target.offset().top
						}, 500);
						return false;
					}
				}
			});
	}

};

$(function(){
	scroller.scrolls();


});
