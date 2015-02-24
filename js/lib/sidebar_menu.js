/** When menu is toggled **/
$(document).ready(function () {						   
	/** Mark option as highlight when selected **/
	$('.list-group-item').click(function() {
		$('.list-group-item').removeClass('highlight');
		$(this).addClass('highlight');
	});
	  
	  /** Add toggled class to 'wrapper' and give page left padding for menu  **/
	$('[data-toggle="offcanvas"]').click(function () {
		window.console.log("sidebar toggled");
		$(this).toggleClass('open');
		$('#wrapper').toggleClass('toggled');
	});  
});