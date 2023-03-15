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
				let itemsCount = JSON.parse(localStorage.getItem("0"))["itemsCount"];

				if(localStorage.getItem(getCurrentUserId()) !== null) {
					existingCart = JSON.parse(localStorage.getItem(getCurrentUserId()))["cart"];
					itemsCount += JSON.parse(localStorage.getItem(getCurrentUserId()))["itemsCount"];
				}
				
				let cart = addNewCartToExistingCart(newCart, existingCart);
				data = {
					"itemsCount" : itemsCount,
					"cart" : cart,
				}
				localStorage.setItem(getCurrentUserId(), JSON.stringify(data));
             	localStorage.setItem("0", JSON.stringify({
					"itemsCount" : 0,
					"cart" : [],
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

function checkLogin() {
	if(localStorage.getItem('current-user-id') !== '0') {
		window.location.href = "home.html";
	}
}

function init(){
	checkLogin();
    $("#navbar-placeholder").load("navbar.html");
    $("#footer-placeholder").load("footer.html");
	$("#login-button").click(login);
}

$(document).ready(init);