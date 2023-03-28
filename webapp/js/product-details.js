function getProductDetails() {
    let searchParams = new URLSearchParams(window.location.search);
    let barcode = searchParams.get('barcode');
    displayProductDetails(barcode);
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
                // $(".headline").html(productData['category'] + " / "  + productData['brand'] + " / " + productData['name']);
                $(".product-desc").html(productData['description']);
                $(".product-rating").html(productData['rating'] + " <i class='bi bi-star-fill'></i>");
                $(".product-reviews").html("(" + productData['reviews'] + " reviews)");
                $(".product-price").html("₹" + (productData["mrp"] - parseInt(productData["mrp"] * productData["discountPercent"] / 100)).toLocaleString());
                $(".product-mrp").find("s").html("₹" + parseInt(productData['mrp']).toLocaleString());
                $(".product-discount").find("b").html(productData['discountPercent'] + "% off");
                $(".product-color").html("Color: " + productData['color']);
                $(".product-style").html("Style Name: " + productData['styleName']);

                let cart = getCart();
                let userId = getCurrentUserId();

                if(cart == null || cart[userId] == undefined
                    || filterByBarcode(cart[userId], barcode) == undefined 
                    || filterByBarcode(cart[userId], barcode).quantity == undefined 
                    || parseInt(filterByBarcode(cart[userId], barcode).quantity) === 0) {
                        $(".add-to-cart-btn").attr("onclick", "changeToCountButton('" + barcode + "')");
                        $(".add-to-cart-span").removeClass("d-none");
                        $(".inc-dec-qty-span").addClass("d-none");
                        $(".buy-now-btn").removeClass("d-none");
                        $(".buy-now-btn").attr("onclick", "buyNow('" + barcode + "')"); 
                        $(".go-to-cart-btn").addClass("d-none");    
                } else {
                    $(".inc-qty-btn").attr("onclick", "increaseQuantity('" + barcode + "')");
                    $(".dec-qty-btn").attr("onclick", "decreaseQuantity('" + barcode + "')");
                    $(".inc-dec-qty-span").removeClass("d-none");
                    $(".add-to-cart-span").addClass("d-none");
                    $(".product-qty").html(filterByBarcode(cart[userId], barcode).quantity);
                    $(".go-to-cart-btn").removeClass("d-none"); 
                    $(".go-to-cart-btn").attr("onclick", "viewCart()"); 
                    $(".buy-now-btn").addClass("d-none");
                }      
                $(".product-details").removeClass("d-none");
                $(".no-product-found").addClass("d-none");
            } else {
                $("#go-to-home-btn").attr("onclick", "viewHomePage()");
                $(".product-details").addClass("d-none");
                $(".no-product-found").removeClass("d-none");
            }
        },
    });
}

function viewCart() {
    window.location.href = "cart.html";
}

function viewHomePage() {
    window.location.href = "home.html";
}

function buyNow(barcode) {
    let cart = getCart();
    let userId = getCurrentUserId();
    let item = {'barcode': barcode, 'quantity': 1};

    if(cart !== null) {
        let userCart = cart[userId];
        let existsInUserCart = 0;

        for(let i in userCart) {
            if(userCart[i]['barcode'] === barcode) {
                userCart[i]['quantity'] = 1;
                existsInUserCart = 1;
                break;
            }
        }

        if(existsInUserCart === 0) {
            userCart.push(item);
        }

        cart[userId] = userCart;  
    } else {
        let userCart = [];
        userCart.push(item);
        cart = {};
        cart[userId] = userCart;  
    }

    setCart(cart);
    window.location.href = "cart.html";
}

function changeToCountButton(barcode) {
    let button = $(".add-to-cart-btn");
    button.empty();
    
    let cart = getCart();
    let userId = getCurrentUserId();
    let item = {'barcode': barcode, 'quantity': 1};

    if(cart !== null) {
        let userCart = cart[userId];
        let existsInUserCart = 0;

        for(let i in userCart) {
            if(userCart[i]['barcode'] === barcode) {
                userCart[i]['quantity'] = 1;
                existsInUserCart = 1;
                break;
            }
        }

        if(existsInUserCart === 0) {
            userCart.push(item);
        }

        cart[userId] = userCart;
    } else {
        let userCart = [];
        userCart.push(item);
        cart = {};
        cart[userId] = userCart;
    }
    
    setCart(cart);

    $(".inc-qty-btn").attr("onclick", "increaseQuantity('" + barcode + "')");
    $(".dec-qty-btn").attr("onclick", "decreaseQuantity('" + barcode + "')");
    $(".inc-dec-qty-span").removeClass("d-none");
    $(".add-to-cart-span").addClass("d-none");
    $(".product-qty").html(1);

    $(".go-to-cart-btn").removeClass("d-none"); 
    $(".go-to-cart-btn").attr("onclick", "viewCart()"); 
    $(".buy-now-btn").addClass("d-none");
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
    setCart(cart);
    
    $(".product-qty").html(quantity + 1);
}

function decreaseQuantity(barcode) {
    let cart = getCart();
    let userId = getCurrentUserId();
    let userCart = cart[userId];
    let quantity = 0;
    
    if(filterByBarcode(userCart, barcode) != null) {
        quantity = parseInt(filterByBarcode(userCart, barcode).quantity);
    }

    if(quantity > 1) {
        for(let i in userCart) {
            if(userCart[i]['barcode'] === barcode) {
                userCart[i]['quantity'] = quantity - 1;
                break;
            }
        }

        cart[userId] = userCart;
        setCart(cart);

        $(".product-qty").html(quantity - 1);
    } else if(quantity === 1) {
        openRemoveItemModal(barcode);
    }
}

function openRemoveItemModal(barcode) {
    $(".confirm-modal").modal("toggle");
    $(".btn-yes").attr("onclick", "removeItemFromCart('" + barcode + "')");
    $(".btn-no").click(() => {
        $(".confirm-modal").modal("hide");
    });
}

function removeItemFromCart(barcode) {
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
    setCart(cart);
    
    $(".add-to-cart-btn").attr("onclick", "changeToCountButton('" + barcode + "')");
    $(".add-to-cart-btn").html("Add to cart");
    $(".inc-dec-qty-span").addClass("d-none");
    $(".add-to-cart-span").removeClass("d-none");

    $(".buy-now-btn").removeClass("d-none");
    $(".buy-now-btn").attr("onclick", "buyNow('" + barcode + "')"); 
    $(".go-to-cart-btn").addClass("d-none");

    $(".confirm-modal").modal("hide");
    $(".toast-success").html("<div class='toast-body text-white'><button type='button' class='ml-auto mr-1 close' data-dismiss='toast' aria-label='Close'><span aria-hidden='true' class='text-white'>&times;</span></button><span class='mr-4'>Product removed from the cart.</span></div>");
    $(".toast-success").toast("show");
}

function init(){
    getProductDetails();
}

$(document).ready(init);