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


// TODO: waiting for response ig
function isUserLoggedIn() {
    let userId = getCurrentUserId();

    $.ajax({
		url: "data/users.json",
        dataType: "json",	  	   
		success: function(data) {
			for(let i in data) {
                if(data[i]["id"] === userId) { 
                    return true;
                }
            }

            setCurrentUserId("0");
            return false;
        }
    });
}

function setLoginLogoutIcon() {
    if(getCurrentUserId() === "0") {
        $("#navbar-login-logout").html("<a class='nav-link'><i class='bi bi-box-arrow-in-right fa-lg' data-toggle='tooltip' data-placement='bottom' title='login'></i></a>");
    } else {
        $("#navbar-login-logout").html("<a class='nav-link'><i class='bi bi-box-arrow-right fa-lg' data-toggle='tooltip' data-placement='bottom' title='logout''></i></a>");
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
    localStorage.setItem("current-user-id", "0"); 
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
    $('[data-toggle="tooltip"]').tooltip();
}

function getCartItemsCount() {
    let userCart = getUserCart();
    let itemsCount = 0;

    for(let i in userCart) {
        itemsCount += userCart[i];
    }

    return itemsCount;
}

function updateCartIcon() {
    let cartItemsCount = getCartItemsCount();
    $(".cart-icon span").html(cartItemsCount);
}

function mergeCarts(cart1, cart2) {
	let newCart = {};

    for (let i in cart1){
        if(!cart2[i]) {
            newCart[i] = cart1[i];
        } else {
            newCart[i] =  cart1[i] + cart2[i];
        }
    } 

    for (let i in cart2){
        if(!cart1[i]) {
            newCart[i] = cart2[i];
        } 
    } 

	return newCart;
}

function getCurrentUserId() {
    let currentUserId = localStorage.getItem("current-user-id");

    if(!currentUserId) {
        setCurrentUserId("0");
        currentUserId = 0;
    }

    return currentUserId;
}

function setCurrentUserId(userId) {
    localStorage.setItem("current-user-id", userId);
}

function getCart() {
    let cart = JSON.parse(localStorage.getItem("cart"));
    if(!cart) {
        cart= {};   
    }   
    return cart;
}

function setCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartIcon();
}

function getUserCart() {
    let cart = getCart();
    let userId = getCurrentUserId();
    let userCart;

    if(!cart[userId]) {
        userCart = {};
    } else {
        userCart = cart[userId];
    }

    return userCart;
}

function getGuestCart() {
    let cart = getCart();
    let guestCart;
	
    if(!cart["0"]) {
        guestCart = {};
    } else {
        guestCart = cart["0"];
    }

    return guestCart;
}

function increaseQuantityInCart(barcode) {
    let cart =  getCart();
    let userId = getCurrentUserId();

    if(!cart[userId]) {
        cart[userId] = {};
    } 

    if(!cart[userId][barcode] || cart[userId][barcode] < 0) {
        cart[userId][barcode] = 0;
    }
    
    cart[userId][barcode] = cart[userId][barcode] + 1; 

    setCart(cart);

    return cart[userId][barcode];
}

function decreaseQuantityInCart(barcode) {
    let cart = getCart();
    let userId = getCurrentUserId();
   
    if(!cart[userId]) {
        cart[userId] = {};
    }

    if(!cart[userId][barcode] || cart[userId][barcode] < 0) {
        cart[userId][barcode] = 0;
    }

    if(cart[userId][barcode] > 1) {
        cart[userId][barcode] = cart[userId][barcode] - 1;
        setCart(cart);
        return cart[userId][barcode];
    } else {
        delete cart[userId][barcode];
        setCart(cart);
        return 0;
    } 
}

function removeItemFromCart(barcode) {
    let cart = getCart();
    let userId = getCurrentUserId();
   
    if(!cart[userId]) {
        cart[userId] = {};
    }

    if(!cart[userId][barcode] || cart[userId][barcode] < 0) {
        cart[userId][barcode] = 0;
    }

    delete cart[userId][barcode];
    setCart(cart);
    return 0;    
}

function removeAllItemsFromCart() {
    let cart = getCart();
    let userId = getCurrentUserId();
    
    cart[userId] = {};  
    setCart(cart);
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

function showTime() {
    var date = new Date();
    $(".footer").html("&copy; 2023 Increff  <br>" 
    + ("0" + date.getDate()).substr(-2) + "/"
    + ("0" + date.getMonth()).substr(-2) + "/"
    + ("0" + date.getFullYear()).substr(-4) + " "
    + ("0" + date.getHours()).substr(-2) + ":" 
    + ("0" + date.getMinutes()).substr(-2) + ":" 
    + ("0" + date.getSeconds()).substr(-2));
}

function handleCurrentUser() {
    let userId = localStorage.getItem("current-user-id");

    $.ajax({
		url: "data/users.json",
        dataType: "json",	  	   
		success: function(data) {
            let existingUser = false;

			for(let i in data) {
                if(data[i]["id"] === userId) { 
                    existingUser = true;
                }
            }

            if(existingUser === false) {
                setCurrentUserId("0");
            }
        }
    });
}

function handleCart() {
    let cart = getCart();
    setCart(cart);
    
    for(let i in cart) {
        isExistingUser(i, function(userExists) {
            if(userExists === false && i !== "0") {
                delete cart[i]; 
                setCart(cart);
            } else {
                let userCart = cart[i];

                for(let j in userCart) {
                    isExistingProduct(j, function(productExists) {
                        if(productExists === false) {
                            delete userCart[j];
                            cart[i] = userCart;
                            setCart(cart);
                        } else {
                            if(!Number.isInteger(userCart[j])) {
                                delete userCart[j];
                                cart[i] = userCart;
                                setCart(cart);
                            } else if(userCart[j] <= 0) {
                                delete userCart[j];
                                cart[i] = userCart;
                                setCart(cart);
                            }
                        }
                    });
                }
            }
        });
    }
}

function isExistingUser(userId, callback) {
    $.ajax({
        url: "data/users.json",
        dataType: "json",
        success: function(data) {
            for (let i in data) {
                if (data[i]["id"] === userId) {
                    callback(true);
                    return;
                }
            }
            callback(false);
        }
    });
}

function isExistingProduct(barcode, callback) {
    $.ajax({
        url: "data/products.json",
        dataType: "json",
        success: function(data) {
            for (let i in data) {
                if (data[i]["barcode"] == barcode) {
                    callback(true);
                    return;
                }
            }
            callback(false);
        }
    });
}

// function handleFilters() {
//     $.ajax({
//         url: "data/products.json",
//         dataType: "json",
//         success: function(data) {
//             let filters = getFilters();
                        
//             if(!filters) {
//                 filters = JSON.parse(filters);

//                 if(Object.keys(filters).length !== 0) {
//                     for (let key in filters) {
//                         let value = filters[key];
//                         switch(key) {
//                             case "brand" : 
//                                 if(filterByBrand(data, value).length === 0) {
//                                     const index = array.indexOf(value);
//                                     if (index > -1) { 
//                                         filters[key].splice(index, 1); 
//                                     }
//                                     setFilters(filters);
//                                 }
//                                 break;
//                             case "category" :
//                                 if(filterByCategory(data, value).length === 0) {
//                                     const index = array.indexOf(value);
//                                     if (index > -1) { 
//                                         filters[key].splice(index, 1); 
//                                     }
//                                     setFilters(filters);
//                                 }
//                                 break;
//                             case "gender" :
//                                 if(filterByGender(data, value).length === 0) {
//                                     const index = array.indexOf(value);
//                                     if (index > -1) { 
//                                         filters[key].splice(index, 1); 
//                                     }
//                                     setFilters(filters);
//                                 }
//                                 break;
//                         }
//                     }
//                     showProductCard(data);
//                 }
//             }
//         }
//     });
// }

function handleLocalStorageChanges() {
    handleCurrentUser();
    handleCart();
    // handleFilters();
    location.reload();

    // Promise.all([handleCurrentUser(), handleCart()]).then(() => {
    //     location.reload();
    // });
}

function init() {
    $("#navbar-placeholder").load("navbar.html", function() {
        updateNavbar();
    });
    $("#footer-placeholder").load("footer.html");
    setInterval(showTime, 1000);
    window.addEventListener("storage", handleLocalStorageChanges);
}

$(document).ready(init)