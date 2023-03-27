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
			let flag = 0;
			for(let i in data) {
                if(data[i]["email"] === email && data[i]["password"] === password) {
					userId =  data[i]["id"]; 
					flag =1;
                    break;
                }
            }

			if(flag === 0) {
				// TODO: show error - user not registered / invalid email id or password
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

function init(){
	checkLogin();
	$("#login-button").click(login);
}

$(document).ready(init);