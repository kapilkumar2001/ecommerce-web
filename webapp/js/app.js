function filterByBarcode(data, barcode) {
    return data.filter(
        function(data) {
            return (data['barcode'] == barcode);
        })[0];
}

function containsOnlyNumbers(str) {
    return /^[0-9]+$/.test(str);
}

function readFileData(file, callback){
	let config = {
		header: true,
		delimiter: "\t",
		skipEmptyLines: "greedy",
		complete: function(results) {
			callback(results);
	  }	
	}
	Papa.parse(file, config);
}

function writeFileData(arr){
	let config = {
		quoteChar: "",
		escapeChar: "",
		delimiter: "\t"
	};
  
	let data = Papa.unparse(arr, config);
    let blob = new Blob([data], {type: "text/tsv;charset=utf-8;"});
    let fileUrl =  null;

    if (navigator.msSaveBlob) {
        fileUrl = navigator.msSaveBlob(blob, "order.csv");
    } else {
        fileUrl = window.URL.createObjectURL(blob);
    }

    let tempLink = document.createElement("a");
    tempLink.href = fileUrl;
    tempLink.setAttribute("download", "order.csv");
    tempLink.click(); 
    tempLink.remove();
}

function setLoginLogoutIcon() { 
    let userId = getCurrentUserId(); 

    if(userId === '0') {
        $("#navbar-login-logout").html("<a class='nav-link' href='login.html'><i class='bi bi-box-arrow-right fa-lg'></i></a>");
    } else {
        $("#navbar-login-logout").html("<a class='nav-link' href='login.html'><i class='bi bi-box-arrow-in-right fa-lg'></i></a>");
    } 
} 

function logout() {
    console.log("logout");
    localStorage.setItem("current-user-id", 0); 
} 

function updateNavbar() {
    updateCartIcon();
    setLoginLogoutIcon();
    $("#navbar-login-logout").click(logout);
}

function getCartItemsCount() {
    let cart = getCart();
    let userId = getCurrentUserId();
    let userCart = cart[userId];
    let itemsCount = 0;

    for(let i in userCart) {
        itemsCount += (userCart[i]["quantity"]);
    }

    return itemsCount;
}

function updateCartIcon() {
    let cartItemsCount = getCartItemsCount();
    $(".cart-icon span").html(cartItemsCount);
}

function updateOrderSummary() {
    let cart = getCart();
    let userId = getCurrentUserId();
    let userCart = cart[userId];
    let totalPrice = 0;
    let totalDiscount = 0;
    const promises = [];

    for(let i in userCart) {
        let barcode = userCart[i]["barcode"];
        let quantity = userCart[i]["quantity"];

        promises.push(
            $.ajax({
            url: 'data/products.json',
            dataType: 'json',
            success: function(data) {
                productData = filterByBarcode(data, barcode);
                
                totalPrice += (productData["mrp"] * quantity);
                totalDiscount += ((productData["mrp"] * productData["discountPercent"] / 100) * quantity);
            },
        }));
    }

    Promise.all(promises).then(() => {
        $(".order-value").html("₹" + totalPrice);
        $(".discount").html("-₹" + totalDiscount);
        if(totalPrice >= 4999) {
            $(".shipping-price").html("FREE");
            $(".shipping-price").addClass("text-success");
            $(".free-delivery").addClass("d-none");
        } else {
            $(".shipping-price").html("₹" + 199);
            $(".free-delivery").html("Add items worth ₹" + (4999-totalPrice) + " more to get free delivery on this order.");
            $(".free-delivery").removeClass("d-none");
        }
        $(".total-amount").html("₹" + (totalPrice - totalDiscount));
    });
}

function getCurrentUserId() {
    let currentUserId = localStorage.getItem('current-user-id');

    if(currentUserId === null) {
        localStorage.setItem('current-user-id', 0);
        currentUserId = 0;
    }

    return currentUserId;
}

function setCurrentUserId(userId) {
    localStorage.setItem("current-user-id", userId);
}

function getCart() {
    return JSON.parse(localStorage.getItem("cart"));
}

function setCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartIcon();
}

function getFilters() {
    return sessionStorage.getItem("filters");
}

function setFilters(filters) {
    sessionStorage.setItem("filters", JSON.stringify(filters));
}

function init() {
    $("#navbar-placeholder").load("navbar.html");
    $("#footer-placeholder").load("footer.html");
    updateNavbar();
}

$(document).ready(init)