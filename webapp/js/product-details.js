function getProductDetails() {
    let searchParams = new URLSearchParams(window.location.search);
    let barcode = searchParams.get('barcode');
    displayProductDetails(barcode);
}

function displayProductDetails(barcode) {
    $.ajax({
        url: 'data/products.json',
        dataType: 'json',
        success: function (data) {
            showProductDetails(data, barcode);
            checkToastInSessionStorage();
        },
    });
}

function showProductDetails(data, barcode) {
    let productData = null;

    for (let i in data) {
        if (data[i]['barcode'] === barcode) {
            productData = data[i];
            break;
        }
    }

    if (productData) {
        $(".product-name").html(productData['name']);
        $(".product-img-1").attr("src", productData["images"][0]["src"]);
        $(".product-img-2").attr("src", productData["images"][1]["src"]);
        $(".product-img-3").attr("src", productData["images"][2]["src"]);
        $(".product-img-4").attr("src", productData["images"][3]["src"]);
        $(".product-img-5").attr("src", productData["images"][4]["src"]);
        $(".product-desc").html(productData['additionalInfo']);
        $(".product-reviews").html("(" + productData['reviews'] + " reviews)");
        $(".product-price").html("₹" + productData["price"].toLocaleString());
        $(".product-mrp").find("s").html("₹" + parseInt(productData['mrp']).toLocaleString());
        $(".product-discount").find("b").html(productData['discountDisplayLabel']);
        $(".product-color").html("Color: " + productData['color']);
        $(".product-sizes").html("Size: " + productData['sizes'].split(",")[0]);
        document.getElementById("product-rating").title = parseFloat(productData['rating']).toFixed(1) + " out of 5 stars";
        document.getElementById("full-stars").style.width = parseInt(parseFloat(productData['rating']).toFixed(1) / 5 *100) + "%";
        initializeTooltip();

        let userCart = getUserCart();

        if (!userCart[barcode] || parseInt(userCart[barcode]) < 0) {
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
        $("#go-to-home-btn").attr("onclick", "redirectToHomeScreen()");
        $(".product-details").addClass("d-none");
        $(".no-product-found").removeClass("d-none");
    }
}

function buyNow(barcode) {
    increaseQuantityInCart(barcode);
    redirectToCartScreen();
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

    showSuccessToast("Product has been added to your cart.");
}

function increaseQuantity(barcode) {
    let quantity = increaseQuantityInCart(barcode);
    $(".product-qty").html(quantity);
}

function decreaseQuantity(barcode) {
    let userCart = getUserCart();

    if (userCart[barcode] > 1) {
        let quantity = decreaseQuantityInCart(barcode);
        $(".product-qty").html(quantity);
    } else {
        openRemoveItemModal(barcode);
    }
}

function openRemoveItemModal(barcode) {
    $(".confirm-modal").modal("toggle");
    $(".confirm-modal .btn-yes").attr("onclick", "removeItem('" + barcode + "')");
    $(".confirm-modal .btn-no").click(() => {
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
    showSuccessToast("Product has been removed from the cart.");
}

function init() {
    getProductDetails();
}

$(document).ready(init);