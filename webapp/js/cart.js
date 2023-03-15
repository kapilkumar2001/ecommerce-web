function getCurrentUserId() {
    let currentUserId = localStorage.getItem('current-user-id');

    if(currentUserId === null) {
        localStorage.setItem('current-user-id', 0);
        currentUserId = 0;
    }

    return currentUserId;
}

function displayCart() {
    const promises = [];
    let data = JSON.parse(localStorage.getItem(getCurrentUserId()));
    let cart = data['cart'];
    let itemsCount = data['itemsCount'];  
    let i = cart.length;

    if(itemsCount === '0') {
        $("#empty-cart-img").removeClass("d-none");
        $("#cart-items").addClass("d-none");
        $("#order-summary").addClass("d-none");
    } else {
        $("#empty-cart-img").addClass("d-none");
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
                            $("#cart-items").append(clone);

                            $("#cart-item-" + barcode + " .product-img").attr("src", productData["imageUrl"]);
                            $("#cart-item-" + barcode + " .product-img").attr("onclick", "viewProduct('" + barcode + "')")
                            $("#cart-item-" + barcode + " .product-name").html(productData["name"]);
                            $("#cart-item-" + barcode + " .product-mrp").html(productData["mrp"]);
                            $("#cart-item-" + barcode + " .product-color").html(productData["color"]);
                            
                            $("#cart-item-" + barcode + " .inc-qty-btn").attr("onclick", "increaseQuantity('" + barcode + "')");
                            $("#cart-item-" + barcode + " .dec-qty-btn").attr("onclick", "decreaseQuantity('" + barcode + "')");
                            $("#cart-item-" + barcode + " .remove-item-btn").attr("onclick", "removeItem('" + barcode + "')");
                            $("#cart-item-" + barcode + " .product-qty").html(filterByBarcode(JSON.parse(localStorage.getItem(getCurrentUserId()))['cart'], barcode).quantity);
                        }
                    }
            }));
        }
    
        Promise.all(promises).then(() => {
            $(".total-amount").html("₹15490");
            $("#cart-item").remove();
        });
    }
}

function viewProduct(barcode) {
    let url = "product-details.html?barcode=" + barcode;
    window.location.href = url;
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

        // TODO: add more data in csv 
        // TODO: remove 0 quantity before inserting
        writeFileData(data['cart']);
        
        data['cart'] = [];
        data['itemsCount'] = 0;
        localStorage.setItem(currentUserId, JSON.stringify(data));

        // TODO: success message
        displayCart();
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

    if(JSON.parse(localStorage.getItem(getCurrentUserId()))['itemsCount'] === '0') {
        displayCart();
    }
}

function filterByBarcode(jsonObject, barcode) {
    return jsonObject.filter(
        function(jsonObject) {
            return (jsonObject['barcode'] == barcode);
        })[0];
}

function init(){
    $("#navbar-placeholder").load("navbar.html");
    $("#footer-placeholder").load("footer.html");
	displayCart();
}

$(document).ready(init);