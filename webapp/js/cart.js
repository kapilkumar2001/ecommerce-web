function displayCart() {
    const promises = [];
    let cart = getCart();
    let userId = getCurrentUserId();
    let userCart = cart[userId];
    let i = userCart.length;

    // items count cart length
    if(i === 0) {
        $("#empty-cart").removeClass("d-none");
        $("#cart-items").addClass("d-none");
        $("#order-summary").addClass("d-none");
        $("#start-shopping-btn").click(viewHomePage);
    } else {
        $("#empty-cart").addClass("d-none");
        $("#cart-items").removeClass("d-none");
        $("#order-summary").removeClass("d-none");

        while (i--) {
            let barcode = userCart[i].barcode;
            let quantity = userCart[i].quantity;

            if(quantity !== 0 && quantity !== null) {
                promises.push(    
                    $.ajax({
                        url: 'data/products.json',
                        dataType: 'json',
                        success: function(data) {
                            let productData = null;
                    
                            for(let i in data) {
                                if(data[i]['barcode'] === barcode) {
                                    productData = data[i];
                                    break;
                                }
                            }

                            if((productData !== null)) { 
                                let node = $("#cart-item");
                                let clone = node.clone().attr("id", "cart-item-" + barcode);
                                $("#cart-items .card-body").append(clone);
    
                                $("#cart-item-" + barcode + " .product-img").attr("src", productData["imageUrl"]);
                                $("#cart-item-" + barcode + " .product-img").attr("onclick", "viewProduct('" + barcode + "')");
                                $("#cart-item-" + barcode + " .brand-name").html(productData["brand"]);
                                $("#cart-item-" + barcode + " .product-name").html(productData["name"]);
                                $("#cart-item-" + barcode + " .product-name").attr("href", "product-details.html?barcode=" + barcode);
                                $("#cart-item-" + barcode + " .product-color").html("Color - " + productData["color"]);
                                $("#cart-item-" + barcode + " .product-price").html("₹" + (productData["mrp"] - parseInt(productData["mrp"] * productData["discountPercent"] / 100)));
                                $("#cart-item-" + barcode + " .product-mrp").find("s").html("₹" + productData["mrp"]);
                                $("#cart-item-" + barcode + " .product-discount").html(productData["discountPercent"] + "% off");
                                
                                $("#cart-item-" + barcode + " .inc-qty-btn").attr("onclick", "increaseQuantity('" + barcode + "')");
                                $("#cart-item-" + barcode + " .dec-qty-btn").attr("onclick", "decreaseQuantity('" + barcode + "')");
                                $("#cart-item-" + barcode + " .remove-item-btn").attr("onclick", "removeItem('" + barcode + "')");
                                $("#cart-item-" + barcode + " .product-qty").html(quantity);
                            }
                        }
                }));
            }
        }
    
        Promise.all(promises).then(() => {
            $(".order-value").html("₹15490");
            $(".discount").html("-₹1490");
            $(".shipping-price").html("₹90");
            $(".total-amount").html("₹14090");
            $("#cart-item").remove();

            setLoginLogoutIcon();
            $("#navbar-login-logout").click(logout);
        });
    }
}

function increaseQuantity(barcode) {
    let cart = getCart();
    let userId = getCurrentUserId();
    let userCart = cart[userId];
    let quantity = parseInt(filterByBarcode(userCart, barcode).quantity);
    
    for(let i in userCart) {
        if(userCart[i]['barcode'] === barcode) {
            userCart[i]['quantity'] = quantity + 1;
            break;
        }
    }

    cart[userId] = userCart;
    updateCart(cart);
    
    $("#cart-item-" + barcode + " .product-qty").html(quantity + 1);
}

function decreaseQuantity(barcode) {
    let cart = getCart();
    let userId = getCurrentUserId();
    let userCart = cart[userId];
    let quantity = 0;

    if(filterByBarcode(userCart, barcode) != null){
        quantity = parseInt(filterByBarcode(userCart, barcode).quantity);
    }

    if(quantity > 0) {
        for(let i in userCart) {
            if(userCart[i]['barcode'] === barcode) {
                userCart[i]['quantity'] = quantity - 1;
                break;
            }
        }

        cart[userId] = userCart;  
        updateCart(cart);

        $("#cart-item-" + barcode + " .product-qty").html(quantity - 1);
    } 
}

function checkLogin() {
    let userId = getCurrentUserId();

    if(userId === '0') {
        window.location.href = "login.html";
    } else {
        let cart = getCart();
        let userCart = cart[userId];
        let orderData = [];
        let products;

        $.ajax({
            url: 'data/products.json',
            dataType: 'json',
            success: function(response) {
                products = response;
        
                for(let i in userCart) {
                    if(parseInt(userCart[i]["quantity"]) !== 0) {
                        let row = {};
                        row.barcode = userCart[i]["barcode"];
                        row.name = filterByBarcode(products, userCart[i]["barcode"]).name;
                        row.quantity = userCart[i]["quantity"];
                        row.mrp = filterByBarcode(products, userCart[i]["barcode"]).mrp;
                        row.amount = (row.quantity) * (row.mrp);
                        orderData.push(row);
                    }
                }
        
                writeFileData(orderData);
                
                cart[userId] = [];
                updateCart(cart);
        
                // TODO: success message
                displayCart();
            },
        });

    }
}

function removeItem(barcode) {
    let cart = getCart();
    let userId = getCurrentUserId();
    let userCart = cart[userId];

    for(let i in userCart) {
        if(userCart[i]['barcode'] === barcode) {
            userCart[i]['quantity'] = 0;
            break;
        }
    }

    cart[userId] = userCart;  
    updateCart(cart);

    $("#cart-item-" + barcode).remove();

    // TODO : on item count 0 - display cart again or display empty cart 

    // if(parseInt(JSON.parse(localStorage.getItem(getCurrentUserId()))['itemsCount']) === 0) {
    //     displayCart();
    // }
}

function clearCart() {
    let cart = getCart();
    let userId = getCurrentUserId();
    let userCart = cart[userId];
    
    cart[userId] = [];  
    updateCart(cart);

    displayCart();  // should display empty cart page
}

function viewProduct(barcode) {
    let url = "product-details.html?barcode=" + barcode;
    window.location.href = url;
}

function viewHomePage() {
    window.location.href = "home.html";
}

function init(){
    $("#navbar-placeholder").load("navbar.html");
    $("#footer-placeholder").load("footer.html");
	displayCart();
    $("#clear-cart-btn").click(clearCart);
    $("#place-order-btn").click(checkLogin);
}

$(document).ready(init);