function login(){
	let email = $("#login-form input[name=email]").val();
	let password = $("#login-form input[name=password]").val();

	if(!validateEmailandPassword(email, password)) {
		return;
    }

	$.ajax({
		url: "data/users.json",
        dataType: "json",	  	   
		success: function(data) {
			let userId;
			let flag = -1;
			for(let i in data) {
                if(data[i]["email"] === email) { 
					if(data[i]["password"] === password) {
						userId =  data[i]["id"]; 
						flag = 1;
						break;
					} else {
						flag = 0;
						break;
					}
                }
            }

			if(flag === -1) {
				$(".toast-error").html("<div class='toast-body text-white'><button type='button' class='ml-auto mr-1 close' data-dismiss='toast' aria-label='Close'><span aria-hidden='true' class='text-white'>&times;</span></button><span class='mr-4'>User not registered.</span></div>");
                $(".toast-error").toast("show");
			} else if(flag == 0) {
				$(".toast-error").html("<div class='toast-body text-white'><button type='button' class='ml-auto mr-1 close' data-dismiss='toast' aria-label='Close'><span aria-hidden='true' class='text-white'>&times;</span></button><span class='mr-4'>Invalid email id or password.</span></div>");
                $(".toast-error").toast("show");
			} else {
				setCurrentUserId(userId);
				mergeGuestCartToUserCart(userId);
				window.location.href = "home.html";
			}
		},
	});
}

function mergeGuestCartToUserCart(userId) {
	let cart = getCart();
	let guestCart = getGuestCart();
	let userCart = getUserCart();
	
	cart[userId] = mergeCarts(guestCart, userCart);
	cart["0"] = {};
	setCart(cart);
}

function validateEmailandPassword(mail, password){
	if(mail === "" || password === ""){
		$(".toast-error").html("<div class='toast-body text-white'><button type='button' class='ml-auto mr-1 close' data-dismiss='toast' aria-label='Close'><span aria-hidden='true' class='text-white'>&times;</span></button><span class='mr-4'>Please fill all the fields.</span></div>");
		$(".toast-error").toast("show");
	    return false;
	}
  
	let mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  
	if(!mail.match(mailformat)) {
		$(".toast-error").html("<div class='toast-body text-white'><button type='button' class='ml-auto mr-1 close' data-dismiss='toast' aria-label='Close'><span aria-hidden='true' class='text-white'>&times;</span></button><span class='mr-4'>Invalid email address.</span></div>");
        $(".toast-error").toast("show");
	    return false;
	} 
	else if(password.length<6) {
		$(".toast-error").html("<div class='toast-body text-white'><button type='button' class='ml-auto mr-1 close' data-dismiss='toast' aria-label='Close'><span aria-hidden='true' class='text-white'>&times;</span></button><span class='mr-4'>Password should contain more than 6 characters</span></div>");
        $(".toast-error").toast("show");
	    return false;
	}
	
	return true;
}

function checkLogin() {
	if(getCurrentUserId() !== null && getCurrentUserId() !== "0") {
		window.location.href = "home.html";
	}
}

function showOrHidePassword() {
	$(this).toggleClass("bi-eye bi-eye-slash");
	var input = $($(this).attr("toggle"));

	if (input.attr("type") == "password") {
		$(this).attr('data-original-title', 'Hide');
	  	input.attr("type", "text");
	} else {
		$(this).attr('data-original-title', 'Show');
	  	input.attr("type", "password");
	}
}

function init(){
	checkLogin();
	$("#login-button").click(login);
	$(".toggle-password").click(showOrHidePassword);
}

$(document).ready(init);