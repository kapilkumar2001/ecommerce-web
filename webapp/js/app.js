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
    let blob = new Blob([data], { type: "text/tsv;charset=utf-8;" });
    let fileUrl = null;

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
        success: function (data) {
            for (let i in data) {
                if (data[i]["id"] === userId) {
                    return true;
                }
            }

            setCurrentUserId("0");
            return false;
        }
    });
}

function setLoginLogoutIcon() {
    if (getCurrentUserId() === "0") {
        $("#navbar-login-logout").html("<a class='nav-link'><i class='bi bi-box-arrow-in-right fa-lg' data-toggle='tooltip' data-placement='bottom' title='login'></i></a>");
    } else {
        $("#navbar-login-logout").html("<a class='nav-link'><i class='bi bi-box-arrow-right fa-lg' data-toggle='tooltip' data-placement='bottom' title='logout''></i></a>");
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
    localStorage.setItem("current-user-id", "0");
    window.location.href = "home.html";
}

function updateNavbar() {
    updateCartIcon();
    if (window.location.pathname !== "/webapp/login.html") {
        setLoginLogoutIcon();
        $("#navbar-login-logout").click(function () {
            if (localStorage.getItem("current-user-id") === "0") {
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

    for (let i in userCart) {
        if (userCart[i] > 0) itemsCount += userCart[i];
    }

    return itemsCount;
}

function updateCartIcon() {
    let cartItemsCount = getCartItemsCount();
    $(".cart-icon span").html(cartItemsCount);
}

function mergeCarts(cart1, cart2) {
    let newCart = {};

    for (let i in cart1) {
        if (!cart2[i]) {
            newCart[i] = cart1[i];
        } else {
            newCart[i] = cart1[i] + cart2[i];
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
    let currentUserId = localStorage.getItem("current-user-id");

    if (!currentUserId) {
        setCurrentUserId("0");
        currentUserId = 0;
    }

    return currentUserId;
}

function setCurrentUserId(userId) {
    localStorage.setItem("current-user-id", userId);
}

function getCart() {
    try {
        let cart = JSON.parse(localStorage.getItem("cart"));

        if (!cart) {
            cart = {};
        }
        return cart;
    } catch (e) {
        localStorage.removeItem("cart");
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
    let userCart;
//todo
    if (!cart[userId]) {
        userCart = {};
    } else {
        userCart = cart[userId];
    }

    return userCart;
}

function getGuestCart() {
    let cart = getCart();
    let guestCart;

    if (!cart["0"]) {
        guestCart = {};
    } else {
        guestCart = cart["0"];
    }

    return guestCart;
}

function increaseQuantityInCart(barcode) {
    let cart = getCart();
    let userId = getCurrentUserId();

    if (!cart[userId]) {
        cart[userId] = {};
    }

    if (!cart[userId][barcode] || cart[userId][barcode] < 0) {
        cart[userId][barcode] = 0;
    }

    cart[userId][barcode] = cart[userId][barcode] + 1;

    setCart(cart);

    return cart[userId][barcode];
}

function decreaseQuantityInCart(barcode) {
    let cart = getCart();
    let userId = getCurrentUserId();

    if (!cart[userId]) {
        cart[userId] = {};
    }

    if (!cart[userId][barcode] || cart[userId][barcode] < 0) {
        cart[userId][barcode] = 0;
    }

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

    if (!cart[userId]) {
        cart[userId] = {};
    }

    if (!cart[userId][barcode] || cart[userId][barcode] < 0) {
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
    try {
        let filters = JSON.parse(sessionStorage.getItem("filters"));

        if (!filters) {
            filters = {};
        }
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
    return sessionStorage.getItem("sort-by");
}

function setSortBy(sortBy) {
    sessionStorage.setItem("sort-by", sortBy);
}

function showTime() {
    var dateObj = new Date();
  //todo
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var day = days[dateObj.getDay()];
    var hr = dateObj.getHours();
    var min = dateObj.getMinutes();

    if (min < 10) {
        min = "0" + min;
    }

    var ampm = "AM";

    if (hr > 12) {
        hr -= 12;
        ampm = "PM";
    }

    if (hr < 10) {
        hr = "0" + hr;
    }

    var date = dateObj.getDate();
    var month = months[dateObj.getMonth()];
    var year = dateObj.getFullYear();

    if (date < 10) {
        date = "0" + date;
    }

    $(".footer").html("&copy; 2023 Increff  <br>" + day + " " + date + " " + month + " " + year + " " + hr + ":" + min + ampm);
}

function handleCurrentUser() {
    return new Promise((resolve) => {
        let userId = localStorage.getItem("current-user-id");

        $.ajax({
            url: "data/users.json",
            dataType: "json",
            success: function (data) {
                let existingUser = false;

                for (let i in data) {
                    if (data[i]["id"] === userId) {
                        existingUser = true;
                    }
                }

                if (existingUser === false) {
                    setCurrentUserId("0");
                }

                resolve();
            },
        });
    });
}

function handleCart() {
    return new Promise(async (resolve) => {
        let cart = getCart();
        setCart(cart);

        let usersData;
        let productsData;

        await $.ajax({
            url: "data/users.json",
            dataType: "json",
            success: async function (data) {
                usersData = data;

                await $.ajax({
                    url: "data/products.json",
                    dataType: "json",
                    success: function (data) {
                        productsData = data;

                        for (let i in cart) {
                            if (isExistingUser(i, usersData)) {
                                let userCart = cart[i];

                                for (let j in userCart) {

                                    if (isExistingProduct(j, productsData)) {
                                        if (!Number.isInteger(userCart[j])) {
                                            delete userCart[j];
                                            cart[i] = userCart;
                                            setCart(cart);
                                        } else if (userCart[j] <= 0) {
                                            delete userCart[j];
                                            cart[i] = userCart;
                                            setCart(cart);
                                        }
                                    } else {
                                        delete userCart[j];
                                        cart[i] = userCart;
                                        setCart(cart);
                                    }
                                }
                            } else {
                                delete cart[i];
                                setCart(cart);
                            }
                        }//todo

                        resolve();
                    }
                });
            }
        });
    });
}

function isExistingUser(userId, usersData) {
    for (let i in usersData) {
        if (usersData[i]["id"] === userId) {
            return true;
        }
    }
    return false;
}

function isExistingProduct(barcode, productsData) {
    for (let i in productsData) {
        if (productsData[i]["barcode"] == barcode) {
            return true;
        }
    }
    return false;
}

async function handleLocalStorageChanges() {
    Promise.all([handleCurrentUser(), handleCart()]).then(() => {
        window.location.reload();
    });
}

function redirectToLoginScreen() {
    window.location.href = "login.html";
}

function redirectToHomeScreen() {
    window.location.href = "home.html";
}

function init() {
    $("#navbar-placeholder").load("navbar.html", updateNavbar);
    $("#footer-placeholder").load("footer.html");
    setInterval(showTime, 1000);
    $(window).on('storage', function (e) {
        handleLocalStorageChanges();
    }); //todo
}

$(document).ready(init)