function login(){
	let email = $("#login-form input[name=email]").val();
	let password = $("#login-form input[name=password]").val();

	if((email === "") || (password === "")) {
		// TODO: show error - fill all the fields
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
				console.log("-1");
				// $(".toast-error").html("<div class='toast-body text-white'><button type='button' class='ml-auto mr-1 close' data-dismiss='toast' aria-label='Close'><span aria-hidden='true' class='text-white'>&times;</span></button><span class='mr-4'>User not registered.</span></div>");
                // $(".toast-error").toast("show");
			} else if(flag == 0) {
				console.log("0"); 
				// $(".toast-error").html("<div class='toast-body text-white'><button type='button' class='ml-auto mr-1 close' data-dismiss='toast' aria-label='Close'><span aria-hidden='true' class='text-white'>&times;</span></button><span class='mr-4'>Invalid email id or password.</span></div>");
                // $(".toast-error").toast("show");
			} else {
				setCurrentUserId(userId);

				let cart = getCart();
				let guestCart = cart["0"];
				let userCart = [];

				if(cart[userId] !== null) {
					userCart = cart[userId];
				}
				
				let newCart = addGuestCartToUserCart(guestCart, userCart);
				
				cart[userId] = newCart;
				cart["0"] = [];

				setCart(cart);
				window.location.href = "home.html";
			}
		},
	});
}

function addGuestCartToUserCart(guestCart, userCart) {
	let cart = [];

	for(let i in userCart) {
		let flag = 0;
		for(let j in guestCart) {
			if(userCart[i]["barcode"] === guestCart[j]["barcode"]) {
				cart.push({
					"barcode" : userCart[i]["barcode"], 
					"quantity" : userCart[i]["quantity"] + guestCart[j]["quantity"]
				});
				flag = 1;
				break;
			}
		}
		if(flag === 0) {
			cart.push({
				"barcode" : userCart[i]["barcode"], 
				"quantity" : userCart[i]["quantity"]
			});
		}
	}

	for(let i in guestCart) {
		let flag = 0;
		for(let j in userCart) {
			if(userCart[j]["barcode"] === guestCart[i]["barcode"]) {
				flag = 1;
				break;
			}
		}
		if(flag === 0) {
			cart.push({
				"barcode" : guestCart[i]["barcode"], 
				"quantity" : guestCart[i]["quantity"]
			});
		}
	}

	return cart;
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