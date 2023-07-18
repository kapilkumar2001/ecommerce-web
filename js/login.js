function login() {
	let email = $("#login-form input[name=email]").val();
	let password = $("#login-form input[name=password]").val();

	if (!validateEmail(email, password)) {
		return;
	}

	$.ajax({
		url: "data/users.json",
		dataType: "json",
		success: function (data) {
			let userId;
			let flag = -1;

			for (let i in data) {
				if (data[i]["email"].toLowerCase() === email.toLowerCase()) {
					if (data[i]["password"] === password) {
						userId = data[i]["id"];
						flag = 1;
					} else {
						flag = 0;
					}
					break;
				}
			}

			if (flag === -1) {
				showErrorToast("User not registered.");
			} else if (flag === 0) {
				showErrorToast("Invalid email id or password");
			} else {
				setCurrentUserId(userId);
				mergeGuestCartToUserCart(userId);
				redirectTo();
			}
		},
	});
}

function mergeGuestCartToUserCart(userId) {
	let cart = getCart();
	let guestCart = getGuestCart();
	let userCart = getUserCart();

	if(Object.keys(guestCart).length !== 0) {
		setToastInSessionStorage("Items have been added to your cart");
	}

	cart[userId] = mergeCarts(guestCart, userCart);
	cart["0"] = {};
	setCart(cart);
}

function validateEmail(mail, password) {
	if (mail === "" || password === "") {
		showErrorToast("Please fill all the fields.");
		return false;
	}

	let mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

	if (!mail.match(mailformat)) {
		showErrorToast("Invalid email address.");
		return false;
	}

	return true;
}

function checkLogin() {
	if (getCurrentUserId() !== null && getCurrentUserId() !== "0") {
		redirectToHomeScreen();
	}
}

function showOrHidePassword() {
	$(this).toggleClass("bi-eye bi-eye-slash");
	var input = $($(this).attr("toggle"));

	if (input.attr("type") === "password") {
		input.attr("type", "text");
	} else {
		input.attr("type", "password");
	}
}

function redirectTo() {
	let searchParams = new URLSearchParams(window.location.search);
	let redirect = searchParams.get('redirect');

	if(redirect === "cart") {
		redirectToCartScreen();
	} else if(redirect === "upload-order") {
		redirectToUploadScreen();
	} else {
		redirectToHomeScreen();
	}
}

function init() {
	checkLogin();
	$("#login-button").click(login);
	$(".toggle-password").click(showOrHidePassword);
}

$(document).ready(init);