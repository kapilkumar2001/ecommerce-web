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
			let currentUserId;
			let flag = 0;
			for(let i in data) {
                if(data[i]["email"] === email && data[i]["password"] === password) {
					currentUserId =  data[i]["id"]; 
					flag =1;
                    break;
                }
            }

			if(flag === 0) {
				// TODO: show error - user not registered / invalid email id or password
			} else {
				localStorage.setItem("current-user-id", currentUserId);
				let newCart = JSON.parse(localStorage.getItem("0"))["cart"];
				let existingCart;

				if(localStorage.getItem(getCurrentUserId()) !== null) {
					existingCart = JSON.parse(localStorage.getItem(getCurrentUserId()))["cart"];
				}
				
				let cart = addNewCartToExistingCart(newCart, existingCart);
				data = {
					"cart" : cart,
					"email" : email,
					"password" : password,
					"id" : currentUserId
				}
				localStorage.setItem(getCurrentUserId(), JSON.stringify(data));
             	localStorage.setItem("0", JSON.stringify({
					"cart" : [],
					"email" : "",
					"password" : "",
					"id" : 0,
				}));
				window.location.href = "home.html";
			}
		},
	});
}

function addNewCartToExistingCart(newCart, existingCart) {
	let cart = [];

	for(let i in existingCart) {
		let flag = 0;
		for(let j in newCart) {
			if(existingCart[i]["barcode"] === newCart[j]["barcode"]) {
				cart.push({
					"barcode" : existingCart[i]["barcode"], 
					"quantity" : existingCart[i]["quantity"] + newCart[j]["quantity"]
				});
				flag = 1;
				break;
			}
		}
		if(flag === 0) {
			cart.push({
				"barcode" : existingCart[i]["barcode"], 
				"quantity" : existingCart[i]["quantity"]
			});
		}
	}

	for(let i in newCart) {
		let flag = 0;
		for(let j in existingCart) {
			if(existingCart[j]["barcode"] === newCart[i]["barcode"]) {
				flag = 1;
				break;
			}
		}
		if(flag === 0) {
			cart.push({
				"barcode" : newCart[i]["barcode"], 
				"quantity" : newCart[i]["quantity"]
			});
		}
	}

	return cart;
}

function init(){
    $("#navbar-placeholder").load("navbar.html");
    $("#footer-placeholder").load("footer.html");
	$("#login-button").click(login);
}

$(document).ready(init);