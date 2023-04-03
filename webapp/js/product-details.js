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
                if(data[i]['barcode'] == barcode) {
                    productData = data[i];
                    break;
                }
            }

            if(productData) {
                $(".product-name").html(productData['name']);
                $(".product-img-1").attr("src", productData["images"][0]["src"]);
                $(".product-img-2").attr("src", productData["images"][1]["src"]);
                $(".product-img-3").attr("src", productData["images"][2]["src"]);
                $(".product-img-4").attr("src", productData["images"][3]["src"]);
                $(".product-img-5").attr("src", productData["images"][4]["src"]);
                $(".product-desc").html(productData['additionalInfo']);
                $(".product-rating").html(parseFloat(productData['rating']).toFixed(1) + " <i class='bi bi-star-fill'></i>");
                $(".product-reviews").html("(" + productData['reviews'] + " reviews)");
                $(".product-price").html("₹" + productData["price"].toLocaleString());
                $(".product-mrp").find("s").html("₹" + parseInt(productData['mrp']).toLocaleString());
                $(".product-discount").find("b").html(productData['discountDisplayLabel']);
                $(".product-color").html("Color: " + productData['color']);
                $(".product-sizes").html("Available Sizes: " + productData['sizes']);

                let userCart = getUserCart();

                if(!userCart[barcode] || parseInt(userCart[barcode]) < 0) {
                        $(".add-to-cart-btn").attr("onclick", "changeToCountButton('" + barcode + "')");
                        $(".add-to-cart-span").removeClass("d-none");
                        $(".inc-dec-qty-span").addClass("d-none");
                        $(".remove-from-cart-btn").addClass("d-none");
                } else {
                    $(".inc-qty-btn").attr("onclick", "increaseQuantity('" + barcode + "')");
                    $(".dec-qty-btn").attr("onclick", "decreaseQuantity('" + barcode + "')");
                    $(".inc-dec-qty-span").removeClass("d-none");
                    $(".add-to-cart-span").addClass("d-none");
                    $(".product-qty").html(userCart[barcode]);
                    $(".remove-from-cart-btn").removeClass("d-none");
                    $(".remove-from-cart-btn").attr("onclick", "openRemoveItemModal('" + barcode + "')");
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
    increaseQuantityInCart(barcode);
    window.location.href = "cart.html";
}

function changeToCountButton(barcode) {
    let quantity = increaseQuantityInCart(barcode);

    $(".inc-qty-btn").attr("onclick", "increaseQuantity('" + barcode + "')");
    $(".dec-qty-btn").attr("onclick", "decreaseQuantity('" + barcode + "')");
    $(".inc-dec-qty-span").removeClass("d-none");
    $(".add-to-cart-span").addClass("d-none");
    $(".product-qty").html(quantity);

    $(".remove-from-cart-btn").removeClass("d-none");
    $(".remove-from-cart-btn").attr("onclick", "openRemoveItemModal('" + barcode + "')");
}

function increaseQuantity(barcode) {
    let quantity = increaseQuantityInCart(barcode);
    $(".product-qty").html(quantity);
}

function decreaseQuantity(barcode) {
    let userCart =  getUserCart();

    if(userCart[barcode] > 1) {
        let quantity = decreaseQuantityInCart(barcode);
        $(".product-qty").html(quantity);
    } else {
        openRemoveItemModal(barcode);
    }
}

function openRemoveItemModal(barcode) {
    $(".confirm-modal").modal("toggle");
    $(".btn-yes").attr("onclick", "removeItem('" + barcode + "')");
    $(".btn-no").click(() => {
        $(".confirm-modal").modal("hide");
    });
}

function removeItem(barcode) {
    removeItemFromCart(barcode);
    
    $(".add-to-cart-btn").attr("onclick", "changeToCountButton('" + barcode + "')");
    $(".add-to-cart-btn").html("Add to cart");
    $(".inc-dec-qty-span").addClass("d-none");
    $(".add-to-cart-span").removeClass("d-none");

    $(".remove-from-cart-btn").addClass("d-none");

    $(".confirm-modal").modal("hide");
    $(".toast-success").html("<div class='toast-body text-white'><button type='button' class='ml-auto mr-1 close' data-dismiss='toast' aria-label='Close'><span aria-hidden='true' class='text-white'>&times;</span></button><span class='mr-4'>Product removed from the cart.</span></div>");
    $(".toast-success").toast("show");
}

function init(){
    getProductDetails();
}

$(document).ready(init);