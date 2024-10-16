function containsOnlyNumbers(str) {
    return /^[0-9]+$/.test(str);
}

function readFileData(file, callback) {
    let config = {
        header: true,
        delimiter: "\t",
        skipEmptyLines: "greedy",
        complete: function (results) {
            callback(results);
        }
    }
    Papa.parse(file, config);
}

function writeFileData(arr) {
    let config = {
        quoteChar: "",
        escapeChar: "",
        delimiter: "\t"
    };

    let data = Papa.unparse(arr, config);
    let blob = new Blob([data], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    let tempLink = document.createElement("a");
    tempLink.setAttribute("href", url);
    tempLink.setAttribute("download", "order");
    tempLink.click();
    tempLink.remove();
}

function setLoginLogoutIcon() {
    if (getCurrentUserId() === "0") {
        $("#navbar-login-logout").html("<a class='nav-link'><i class='bi bi-box-arrow-in-right fa-lg' data-toggle='tooltip' data-placement='bottom' title='Login'></i></a>");
    } else {
        $("#navbar-login-logout").html("<a class='nav-link'><i class='bi bi-box-arrow-right fa-lg' data-toggle='tooltip' data-placement='bottom' title='Logout''></i></a>");
    }
}

function openLogoutModal() {
    $(".logout-modal").modal("toggle");
    $(".logout-modal .btn-yes").click(logout);
    $(".logout-modal .btn-no").click(() => {
        $(".logout-modal").modal("hide");
    });
}

function logout() {
    localStorage.setItem("currentUserId", "0");
    redirectToHomeScreen();
}

function updateNavbar() {
    updateCartIcon();
    if (window.location.pathname !== "/webapp/login.html") {
        setLoginLogoutIcon();
        $("#navbar-login-logout").click(function () {
            if (localStorage.getItem("currentUserId") === "0") {
                redirectToLoginScreen();
            } else {
                openLogoutModal();
            }
        });
    }
    initializeTooltip();
}

function getCartItemsCount() {
    let userCart = getUserCart();
    let itemsCount = 0;

    for (let i in userCart) {
        if (userCart[i] > 0) itemsCount += userCart[i];
    }

    return itemsCount;
}

function updateCartIcon() {
    let cartItemsCount = getCartItemsCount();

    if(cartItemsCount > 99) {
        $(".cart-icon span").html("99+");
    } else {
        $(".cart-icon span").html(cartItemsCount);
    }
}

function mergeCarts(cart1, cart2) {
    let newCart = {};

    for (let i in cart1) {
        if (cart2[i]) {
            newCart[i] = cart1[i] + cart2[i];
        } else {
            newCart[i] = cart1[i];
        }
    }

    for (let i in cart2) {
        if (!cart1[i]) {
            newCart[i] = cart2[i];
        }
    }

    return newCart;
}

function getCurrentUserId() {
    let currentUserId =  localStorage.getItem("currentUserId");
    currentUserId = checkCurrentUserId(currentUserId);
    return currentUserId;
}

function checkCurrentUserId(currentUserId) {
    if (!currentUserId) {
        setCurrentUserId("0");
        currentUserId = 0;
    }

    return currentUserId;
}

function setCurrentUserId(userId) {
    localStorage.setItem("currentUserId", userId);
}

function getCart() {
    try {
        let cart = JSON.parse(localStorage.getItem("cart"));

        if (!cart) cart = {};

        return cart;
    } catch (e) {
        localStorage.removeItem("cart");
        setToastInSessionStorage("Your Cart has been updated");
        window.location.reload();
    }
}

function setCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartIcon();
}

function getUserCart() {
    let cart = getCart();
    let userId = getCurrentUserId();
    let userCart = {};

    if (cart[userId]) userCart = cart[userId];

    return userCart;
}

function getGuestCart() {
    let cart = getCart();
    let guestCart = {};

    if (cart["0"]) guestCart = cart["0"];

    return guestCart;
}

function increaseQuantityInCart(barcode) {
    let cart = getCart();
    let userId = getCurrentUserId();

    if (!cart[userId]) cart[userId] = {}; 
    if (!cart[userId][barcode] || cart[userId][barcode] < 0) cart[userId][barcode] = 0;

    cart[userId][barcode] = cart[userId][barcode] + 1;
    setCart(cart);
    return cart[userId][barcode];
}

function decreaseQuantityInCart(barcode) {
    let cart = getCart();
    let userId = getCurrentUserId();

    if (!cart[userId]) cart[userId] = {};
    if (!cart[userId][barcode] || cart[userId][barcode] < 0) cart[userId][barcode] = 0;

    if (cart[userId][barcode] > 1) {
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

    if (!cart[userId]) cart[userId] = {};
    if (!cart[userId][barcode] || cart[userId][barcode] < 0) cart[userId][barcode] = 0;

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
    try {
        let filters = JSON.parse(sessionStorage.getItem("filters"));

        if (!filters) filters = {};

        return filters;
    } catch (e) {
        sessionStorage.removeItem("filters");
        window.location.reload();
    }
}

function setFilters(filters) {
    sessionStorage.setItem("filters", JSON.stringify(filters));
}

function getSortBy() {
    return sessionStorage.getItem("sortBy");
}

function setSortBy(sortBy) {
    sessionStorage.setItem("sortBy", sortBy);
}

function showTime() {
    var dateObj = new Date();

    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var days = ["Sun", "Mon", "Tues", "Wed", "Thu", "Fri", "Sat"];
    var day = days[dateObj.getDay()];
    var hr = dateObj.getHours();
    var min = dateObj.getMinutes();
    var ampm = "AM";

    if (min < 10) min = "0" + min;

    if (hr > 12) {
        hr -= 12;
        ampm = "PM";
    }

    if (hr < 10) hr = "0" + hr;

    var date = dateObj.getDate();
    var month = months[dateObj.getMonth()];
    var year = dateObj.getFullYear();

    if (date < 10) date = "0" + date;

    $(".footer").html("&copy; 2023 Increff  <br>" + day + " " + date + " " + month + " " + year + " " + hr + ":" + min + " " + ampm);
}

async function handleCurrentUser() {
    let userId = localStorage.getItem("currentUserId");

    await $.ajax({
        url: "data/users.json",
        dataType: "json",
        success: function (data) {
            let existingUser = false;

            for (let i in data) {
                if (data[i]["id"] === userId) {
                    existingUser = true;
                    break;
                }
            }

            if (existingUser === false) {
                setCurrentUserId("0");
            }
        },
    });
}

async function handleCart() {
    let cart = getCart();
    setCart(cart);

    await $.ajax({
        url: "data/users.json",
        dataType: "json",
        success: async function (data) {
            let usersData = data;

            await $.ajax({
                url: "data/products.json",
                dataType: "json",
                success: function (data) {
                    let productsData = data;

                    for (let i in cart) {
                        if (isExistingUser(i, usersData)) {
                            let userCart = cart[i];

                            for (let j in userCart) {
                                
                                if (isExistingProduct(j, productsData)) {
                                    console.log(j + "is a existing product");
                                    if (!Number.isInteger(userCart[j])) {
                                        delete userCart[j];
                                        cart[i] = userCart;

                                        if(i === getCurrentUserId()) {
                                            setToastInSessionStorage("Your Cart has been updated");
                                        }
                                    } else if (userCart[j] <= 0) {
                                        delete userCart[j];
                                        cart[i] = userCart;

                                        if(i === getCurrentUserId()) {
                                            setToastInSessionStorage("Your Cart has been updated");
                                        }
                                    }
                                } else {
                                    delete userCart[j];
                                    cart[i] = userCart;

                                    if(i === getCurrentUserId()) {
                                        setToastInSessionStorage("Your Cart has been updated");
                                    }
                                }
                            }
                        } else {
                            delete cart[i]; 
                        }
                    }
                    setCart(cart);
                }
            });
        }
    });
}

function isExistingUser(userId, usersData) {
    if(userId === "0") return true;

    for (let i in usersData) {
        if (usersData[i]["id"] === userId) return true;
    }

    return false;
}

function isExistingProduct(barcode, productsData) {
    for (let i in productsData) {
        if (productsData[i]["barcode"] === barcode) return true;
    }

    return false;
}

async function handleFilters() {
    let filters = getFilters();

    await $.ajax({
        url: "data/products.json",
        dataType: "json",
        success: async (data) => {

            let brands = [];
            let categories = [];
            let genders = [];
            let colors = [];

            for (let i in data) {
                brands.push(data[i]["brand"]);
                categories.push(data[i]["category"]);
                genders.push(data[i]["gender"]);
                colors.push(data[i]["color"]);
            }

            brands = Array.from(new Set(brands));
            categories = Array.from(new Set(categories));
            genders = Array.from(new Set(genders));
            colors = Array.from(new Set(colors));

            for (let key in filters) {
                let value = filters[key];

                if(key !== "brand" && key !== "category" && key !== "gender" && key !== "color") {
                    delete filters[key];
                } else {
                    switch(key) {
                        case "brand":
                            for(let i in value) {
                                if(!brands.includes(value[i])) {
                                    filters[key].splice(i, 1);
                                }
                            }
                            break;
                        case "category":
                            for(let i in value) {
                                if(!categories.includes(value[i])) {
                                    filters[key].splice(i, 1);
                                }
                            }
                            break;
                        case "color":
                            for(let i in value) {
                                if(!colors.includes(value[i])) {
                                    filters[key].splice(i, 1);
                                }
                            }
                            break;
                        case "gender":
                            for(let i in value) {
                                if(!genders.includes(value[i])) {
                                    filters[key].splice(i, 1);
                                }
                            }
                            break;
                    }
                }
            }

            setFilters(filters);
        }
    });
} 

function handleSortBy() {
    let sortBy = getSortBy();
    let sortingOptions = ["price-hl", "price-lh", "rating"];

    if(!sortingOptions.includes(sortBy)) {
        sessionStorage.removeItem("sortBy");
    }
}
 
async function handleStorageChanges() {
    Promise.all([handleCurrentUser(), handleCart(), handleFilters(), handleSortBy()]).then(() => {
        window.location.reload();
    });
}

function redirectToLoginScreen() {
    window.location.href = "login.html";
}

function redirectToLoginScreenWithParam(param) {
    window.location.href = "login.html?redirect=" + param;
}

function redirectToHomeScreen() {
    window.location.href = "home.html";
}

function redirectToCartScreen() {
    window.location.href = "cart.html";
}

function redirectToUploadScreen() {
    window.location.href = "upload-order.html";
}

function showSuccessToast(message) {
    $(".toast-success .toast-msg").html(message);
    $(".toast-success").toast("show");
}

function showErrorToast(message) {
    $(".toast-error .toast-msg").html(message);
    $(".toast-error").toast("show");
}

function checkToastInSessionStorage() {
    if(sessionStorage.getItem("successToast")) {
        showSuccessToast(sessionStorage.getItem("successToast"));
        sessionStorage.removeItem("successToast");
    }
}

function setToastInSessionStorage(message) {
    sessionStorage.setItem("successToast", message);
}

function initializeTooltip() {
    $('[data-toggle="tooltip"]').tooltip();
}

function init() {
    $("#navbar-placeholder").load("navbar.html", updateNavbar);
    $("#footer-placeholder").load("footer.html");
    setInterval(showTime, 1000);
    $(window).on('storage', handleStorageChanges); 
}

$(document).ready(init)