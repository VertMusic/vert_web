$(function () {
	/** Menu open/close toggle **/
    $('.navbar-toggler').on('click', function(event) {
		event.preventDefault();
		window.console.log("Minimal menu clicked");
		$(this).closest('.navbar-minimal').toggleClass('open');
	});
	
	/** Close navbar after click on menu item **/
	$('.navbar-minimal a').on('click', function() { 
		$('.navbar-toggler').trigger('click'); 
	});
});