/*
* Reloader for any page
* 
* Dependences:
*	JQuery (?)
*
* Author: [thblckjkr]
*/
var Reloader = function (options) {
	this.timeToReload = 45; // Time to reload the page (in seconds)
	this.forceGet = false; // Warning: If TRUE it will clear cache, and return position to top AND DO POST AGAIN

	this.navHeight = 52; // Responsive fail 767px - 984px
	this.bar = {
		show: true,
		id: "timetoReloadBar", // Some ID that will not be repeated
		color: "#337ab7",
		height: "5px"
	};

	this.modals = options.modals || [];

	// The class for adding to the document
	this.styleClass = " .timeToReloadBar { background: " + this.bar.color + "; height: " + this.bar.height;
	this.styleClass += "; position: fixed; width: 100%; left: 0px; }";

	this.init = function(){
		var that = this;
		// Check if the bar exists, if not, create it
		if($("#" + that.bar.id).length == 0) {
			// Define the bar properties
			$bar = $('<div id="' + that.bar.id + '" style="top: ' + that.navHeight + 'px"></div>').addClass("timeToReloadBar");

			$('<style type="text/css"> ' + that.styleClass +' </style>').appendTo("head");
			$("body").append($bar);
		}

		// Separated reload animation and function to keep also if the animation is stoped or fails
		$("#" + that.bar.id ).css("width", "100%");
		$("#" + that.bar.id ).animate({ width: 0 }, that.timeToReload * 1000, "linear" );

		setTimeout(function(){ that.reloadWindow(); }, that.timeToReload * 1000);
		$( window ).scroll(function() { that.updateScroll(); });
		that.updateScroll();
	}

	this.reloadWindow = function(){
		var okToReload = true;
		this.modals.forEach(function(element) {
			if( $("#" + element).hasClass('in') ){
				okToReload = false;
			}
		});
		
		if (okToReload){
			window.location.reload(this.forceGet);
		}else{
			this.init();
		}
	}

	this.updateScroll = function(){
		var that = this;
		var scr = ( $('html').scrollTop() > 52 ) ? 0 : that.navHeight - $('html').scrollTop();
		$('#' + that.bar.id).css('top', scr +'px');
	}
}