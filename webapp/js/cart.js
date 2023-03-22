function displayCart() {
    const promises = [];
    let data = JSON.parse(localStorage.getItem(getCurrentUserId()));
    let cart = data['cart'];
    let itemsCount = parseInt(data['itemsCount']);  
    let i = cart.length;

    if(itemsCount === 0) {
        $("#empty-cart").removeClass("d-none");
        $("#cart-items").addClass("d-none");
        $("#order-summary").addClass("d-none");
        $("#start-shopping-btn").click(viewHomePage);
    } else {
        $("#empty-cart").addClass("d-none");
        $("#cart-items").removeClass("d-none");
        $("#order-summary").removeClass("d-none");

        while (i--) {
            let barcode = cart[i].barcode;
            promises.push(    
                $.ajax({
                    url: 'data/products.json',
                    dataType: 'json',
                    success: function(data) {
                        let productData = null;
                        let quantity = parseInt(filterByBarcode(JSON.parse(localStorage.getItem(getCurrentUserId()))['cart'], barcode).quantity);
            
                        for(let i in data) {
                            if(data[i]['barcode'] === barcode) {
                                productData = data[i];
                                break;
                            }
                        }
                        if((productData !== null) && (quantity !== 0) && (quantity !== null)) {
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
                            $("#cart-item-" + barcode + " .product-qty").html(filterByBarcode(JSON.parse(localStorage.getItem(getCurrentUserId()))['cart'], barcode).quantity);
                        }
                    }
            }));
        }
    
        Promise.all(promises).then(() => {
            $(".order-value").html("₹15490");
            $(".discount").html("-₹1490");
            $(".shipping-price").html("₹90");
            $(".total-amount").html("₹14090");
            $("#cart-item").remove();

            setLoginLogoutIcon()
        });
    }
}

function increaseQuantity(barcode) {
    let data =  JSON.parse(localStorage.getItem(getCurrentUserId()));
    let cart = data['cart'];
    let quantity = parseInt(filterByBarcode(cart, barcode).quantity);
    
    for(let i in cart) {
        if(cart[i]['barcode'] === barcode) {
            cart[i]['barcode'] = barcode;
            cart[i]['quantity'] = quantity + 1;
            break;
        }
    }

    data['itemsCount'] = data['itemsCount'] + 1;
    data['cart'] = cart;  
    localStorage.setItem(getCurrentUserId(), JSON.stringify(data));
    
    $("#cart-item-" + barcode + " .product-qty").html(quantity + 1);
}

function decreaseQuantity(barcode) {
    let data =  JSON.parse(localStorage.getItem(getCurrentUserId()));
    let cart = data['cart'];
    let quantity = 0;

    if(filterByBarcode(cart, barcode) != null){
        quantity = parseInt(filterByBarcode(cart, barcode).quantity);
    }

    if(quantity > 0) {
        for(let i in cart) {
            if(cart[i]['barcode'] === barcode) {
                cart[i]['barcode'] = barcode;
                cart[i]['quantity'] = quantity - 1;
               
                break;
            }
        }

        data['itemsCount'] = data['itemsCount'] - 1;
        data['cart'] = cart;  
        localStorage.setItem(getCurrentUserId(), JSON.stringify(data));

        $("#cart-item-" + barcode + " .product-qty").html(quantity - 1);
    } 
}

function checkLogin() {
    let currentUserId = getCurrentUserId();

    if(currentUserId === '0') {
        window.location.href = "login.html";
    } else {
        let data = JSON.parse(localStorage.getItem(getCurrentUserId()));
        cart = data["cart"];
        let orderData = [];
        let products;

        $.ajax({
            url: 'data/products.json',
            dataType: 'json',
            success: function(response) {
                products = response;
        
                for(let i in cart) {
                    if(parseInt(cart[i]["quantity"]) !== 0) {
                        let row = {};
                        row.barcode = cart[i]["barcode"];
                        row.name = filterByBarcode(products, cart[i]["barcode"]).name;
                        row.quantity = cart[i]["quantity"];
                        row.mrp = filterByBarcode(products, cart[i]["barcode"]).mrp;
                        row.amount = (row.quantity) * (row.mrp);
                        orderData.push(row);
                    }
                }
        
                writeFileData(orderData);
                
                data['cart'] = [];
                data['itemsCount'] = 0;
                localStorage.setItem(currentUserId, JSON.stringify(data));
        
                // TODO: success message
                displayCart();
            },
        });

    }
}

function removeItem(barcode) {
    let data =  JSON.parse(localStorage.getItem(getCurrentUserId()));
    let cart = data['cart'];
    let quantity;

    for(let i in cart) {
        if(cart[i]['barcode'] === barcode) {
            quantity = cart[i]['quantity'];
            cart[i]['barcode'] = barcode;
            cart[i]['quantity'] = 0;
            break;
        }
    }

    data['itemsCount'] = data['itemsCount'] - quantity;
    data['cart'] = cart;  
    localStorage.setItem(getCurrentUserId(), JSON.stringify(data));

    $("#cart-item-" + barcode).remove();

    if(parseInt(JSON.parse(localStorage.getItem(getCurrentUserId()))['itemsCount']) === 0) {
        displayCart();
    }
}

function clearCart() {
    let data = JSON.parse(localStorage.getItem(getCurrentUserId()));
    let cart = data['cart'];
    let i = cart.length;
    
    while(i--) {
        let barcode = cart[i].barcode;
        removeItem(barcode);
    }

    data['itemsCount'] = 0;
    data['cart'] = [];  
    localStorage.setItem(getCurrentUserId(), JSON.stringify(data));
    displayCart();
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