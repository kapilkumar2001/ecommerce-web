function getProductDetails() {
    let searchParams = new URLSearchParams(window.location.search);
    let barcode = searchParams.get('barcode');
    displayProductDetails(barcode);
}

function getCurrentUserId() {
    let currentUserId = localStorage.getItem('current-user-id');

    if(currentUserId === null) {
        localStorage.setItem('current-user-id', 0);
        currentUserId = 0;
    }

    return currentUserId;
}

function displayProductDetails(barcode){
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

            if(productData !== null) {
                $(".product-name").html(productData['name']);
                $(".product-img").attr("src", productData['imageUrl']);
                $(".headline").html(productData['category'] + " / "  + productData['brand'] + " / " + productData['name']);
                $(".product-desc").html(productData['description']);
                $(".product-rating").html(productData['rating'] + " <i class='fa fa-star text-success'></i>");
                $(".product-reviews").html("(" + productData['reviews'] + ")");
                $(".product-mrp").html("₹" + productData['mrp']);
                $(".product-color").html("Color: " + productData['color']);
                $(".product-style").html("Style Name: " + productData['styleName']);
 
                if(JSON.parse(localStorage.getItem(getCurrentUserId())) == null 
                    || JSON.parse(localStorage.getItem(getCurrentUserId()))['cart'] == null 
                    || filterByBarcode(JSON.parse(localStorage.getItem(getCurrentUserId()))['cart'], barcode) == null 
                    || filterByBarcode(JSON.parse(localStorage.getItem(getCurrentUserId()))['cart'], barcode).quantity == null 
                    || parseInt(filterByBarcode(JSON.parse(localStorage.getItem(getCurrentUserId()))['cart'], barcode).quantity) === 0) {
                        $(".add-to-cart-btn").attr("onclick", "changeToCountButton('" + barcode + "')");
                        $(".add-to-cart-span").removeClass("d-none");
                        $(".inc-dec-qty-span").addClass("d-none");
                } else {
                    $(".inc-qty-btn").attr("onclick", "increaseQuantity('" + barcode + "')");
                    $(".dec-qty-btn").attr("onclick", "decreaseQuantity('" + barcode + "')");
                    $(".inc-dec-qty-span").removeClass("d-none");
                    $(".add-to-cart-span").addClass("d-none");
                    $(".product-qty").html(filterByBarcode(JSON.parse(localStorage.getItem(getCurrentUserId()))['cart'], barcode).quantity);
                }  
                $("#buy-now-btn").attr("onclick", "viewCart()");           
            }
        },
    });
}

function viewCart() {
    window.location.href = "cart.html";
}

function changeToCountButton(barcode) {
    let button = $(".add-to-cart-btn");
    button.empty();
    
    let item = {'barcode': barcode, 'quantity': 1};
    let data =  JSON.parse(localStorage.getItem(getCurrentUserId()));

    if(data !== null) {
        let cart = data['cart'];
        let flag = 0;

        for(let i in cart) {
            if(cart[i]['barcode'] === barcode) {
                cart[i]['barcode'] = barcode;
                cart[i]['quantity'] = 1;
                flag = 1;
            }
        }

        if(flag === 0) {
            cart.push(item);
        }

        data['itemsCount'] = data['itemsCount'] + 1;
        data['cart'] = cart;  
    } else {
        data = {
            'itemsCount' : 1,
            'cart' : [item],
            'email' : '',
            'password' : '',
            'id' : ''
        }
    }
    localStorage.setItem(getCurrentUserId(), JSON.stringify(data));

    $(".inc-qty-btn").attr("onclick", "increaseQuantity('" + barcode + "')");
    $(".dec-qty-btn").attr("onclick", "decreaseQuantity('" + barcode + "')");
    $(".inc-dec-qty-span").removeClass("d-none");
    $(".add-to-cart-span").addClass("d-none");
    $(".product-qty").html(1);
}

function increaseQuantity(barcode) {
    let data = JSON.parse(localStorage.getItem(getCurrentUserId()));
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
    
    $(".product-qty").html(quantity + 1);
}

function decreaseQuantity(barcode) {
    let data =  JSON.parse(localStorage.getItem(getCurrentUserId()));
    let cart = data['cart'];
    let quantity = 0;
    
    if(filterByBarcode(cart, barcode) != null) {
        quantity = parseInt(filterByBarcode(cart, barcode).quantity);
    }

    if(quantity > 1) {
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

        $(".product-qty").html(quantity - 1);
    } else if(quantity === 1) {
        for(let i in cart) {
            if(cart[i]['barcode'] === barcode) {
                cart[i]['barcode'] = barcode;
                cart[i]['quantity'] = 0;
                break;
            }
        }

        data['itemsCount'] = data['itemsCount'] - 1;
        data['cart'] = cart;  
        localStorage.setItem(getCurrentUserId(), JSON.stringify(data));
        
        $(".add-to-cart-btn").attr("onclick", "changeToCountButton('" + barcode + "')");
        $(".add-to-cart-btn").html("Add to cart");
        $(".inc-dec-qty-span").addClass("d-none");
        $(".add-to-cart-span").removeClass("d-none");
    }
}

function init(){
    $("#navbar-placeholder").load("navbar.html");
    $("#footer-placeholder").load("footer.html");
    getProductDetails();
}

$(document).ready(init);