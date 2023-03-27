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
        $("#navbar-login-logout").html("<a class='nav-link'><i class='bi bi-box-arrow-in-right fa-lg'></i></a>");
    } else {
        $("#navbar-login-logout").html("<a class='nav-link'><i class='bi bi-box-arrow-right fa-lg'></i></a>");
    } 
} 

function openLogoutModal() {
    $(".logout-modal").modal("toggle");
    $(".btn-yes").click(logout);
    $(".btn-no").click(() => {
        $(".logout-modal").modal("hide");
    });
}

function logout() {
    localStorage.setItem("current-user-id", 0); 
    window.location.href = "home.html";
} 

function updateNavbar() {
    updateCartIcon();
    if(window.location.pathname !== "/webapp/login.html") {
        setLoginLogoutIcon();
        $("#navbar-login-logout").click(function() {
            if(localStorage.getItem("current-user-id") === "0"){
                window.location.href = "login.html";
            } else {
                openLogoutModal();
            }
        });
    }
}

function getCartItemsCount() {
    let cart = getCart();
    let userId = getCurrentUserId();
    let userCart;

    if(cart !== null) {
        if(cart[userId] !== undefined) {
            userCart = cart[userId];
            let itemsCount = 0;
    
            for(let i in userCart) {
                itemsCount += (userCart[i]["quantity"]);
            }
    
            return itemsCount;
        } 
    }
    return 0;
}

function updateCartIcon() {
    let cartItemsCount = getCartItemsCount();
    $(".cart-icon span").html(cartItemsCount);
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

function getSortBy() {
    return sessionStorage.getItem("sort-by");
}

function setSortBy(sortBy) {
    sessionStorage.setItem("sort-by", sortBy); 
} 

function init() {
    $("#navbar-placeholder").load("navbar.html", function() {
        updateNavbar();
    });
    $("#footer-placeholder").load("footer.html");
}

$(document).ready(init)