function displayCart() {
    let userCart = getUserCart();
    let cartProductsLength = Object.keys(userCart).length;

    $("#cart").removeClass("d-none");
    $("#order-placed").addClass("d-none");

    if (cartProductsLength === 0) {
        $("#empty-cart").removeClass("d-none");
        $("#cart-items").addClass("d-none");
        $("#order-summary").addClass("d-none");
    } else {
        $("#empty-cart").addClass("d-none");
        $("#cart-items").removeClass("d-none");
        $("#order-summary").removeClass("d-none");

        $.ajax({
            url: 'data/products.json',
            dataType: 'json',
            success: function (data) {

                for (let i in data) {
                    let barcode = data[i]["barcode"];
                    if (!userCart[barcode]) {
                        continue;
                    } else if (userCart[barcode] > 0) {
                        let quantity = userCart[barcode];
                        let productData = data[i];
                        showCartItem(quantity, productData);
                    }
                }

                $("#cart-item").addClass("d-none");
                updateOrderSummary();

                if (getCurrentUserId() === "0") {
                    $(".place-order-btn").html("Login to Place Order");
                    $(".place-order-btn").attr("onclick", "redirectToLoginScreenWithParam('cart')");
                } else {
                    $(".place-order-btn").html("Place Order")
                    $(".place-order-btn").attr("onclick", "openPlaceOrderConfirmationModal()");
                }

                checkToastInSessionStorage();
            }
        });
    }
}

function showCartItem(quantity, productData) {
    let barcode = productData["barcode"];
    let node = $("#cart-item");
    let clone = node.clone().attr("id", "cart-item-" + barcode);
    $("#cart-items .card-body").append(clone);

    $("#cart-item-" + barcode + " .product-img").attr("src", productData["searchImage"]);
    $("#cart-item-" + barcode + " .product-img").attr("onclick", "viewProduct('" + barcode + "')");
    $("#cart-item-" + barcode + " .brand-name").html(productData["brand"]);
    $("#cart-item-" + barcode + " .product-name").html(productData["name"]);
    $("#cart-item-" + barcode + " .product-name").attr("href", "product-details.html?barcode=" + barcode);
    $("#cart-item-" + barcode + " .product-color").html("Color - " + productData["color"]);
    $("#cart-item-" + barcode + " .product-price").html("₹" + productData["price"].toLocaleString());
    $("#cart-item-" + barcode + " .product-mrp").find("s").html("₹" + productData["mrp"].toLocaleString());
    $("#cart-item-" + barcode + " .product-discount").html(productData["discountDisplayLabel"]);
    $("#cart-item-" + barcode + " .product-size").html("Size - " + productData['sizes'].split(",")[0]);

    $("#cart-item-" + barcode + " .inc-qty-btn").attr("onclick", "increaseQuantity('" + barcode + "')");
    $("#cart-item-" + barcode + " .dec-qty-btn").attr("onclick", "decreaseQuantity('" + barcode + "', '" + productData["name"] + "')");
    $("#cart-item-" + barcode + " .remove-item-btn").attr("onclick", "openRemoveItemModal('" + barcode + "', '" + productData["name"] + "')");
    $("#cart-item-" + barcode + " .product-qty").html(quantity);
}

function increaseQuantity(barcode) {
    let quantity = increaseQuantityInCart(barcode);
    $("#cart-item-" + barcode + " .product-qty").html(quantity);
    updateOrderSummary()
}

function decreaseQuantity(barcode, productName) {
    let userCart = getUserCart();

    if (userCart[barcode] > 1) {
        let quantity = decreaseQuantityInCart(barcode);
        $("#cart-item-" + barcode + " .product-qty").html(quantity);
        updateOrderSummary();
    } else {
        openRemoveItemModal(barcode, productName);
    }
}

function openRemoveItemModal(barcode, productName) {
    $(".confirm-modal").modal("toggle");
    $(".confirm-modal .modal-title").html("Confirm Remove Item");
    $(".confirm-modal .modal-body").html("<span class='font-weight-bold'>" + productName + "</span> will be removed from cart. Are you sure?");
    $(".confirm-modal .btn-yes").attr("onclick", "removeItem('" + barcode + "','" + productName + "')");
    $(".confirm-modal .btn-no").click(() => {
        $(".confirm-modal").modal("hide");
    });
}

function removeItem(barcode, productName) {
    removeItemFromCart(barcode);
    updateOrderSummary();

    $("#cart-item-" + barcode).remove();

    $(".confirm-modal").modal("hide");
    showSuccessToast("<b>" + productName + "</b> has been removed from the cart.");

    if (Object.keys(getUserCart()).length === 0) displayCart();
}

function updateOrderSummary() {
    let userCart = getUserCart();
    let totalPrice = 0;
    let totalDiscount = 0;

    $.ajax({
        url: 'data/products.json',
        dataType: 'json',
        success: function (data) {
            for (let i in data) {
                if (!userCart[data[i]["barcode"]]) {
                    continue;
                } else {
                    let barcode = data[i]["barcode"];
                    let quantity = userCart[barcode];
                    let productData = data[i];

                    totalPrice += (productData["mrp"] * quantity);
                    totalDiscount += ((productData["mrp"] - productData["price"]) * quantity);
                }
            }

            $(".order-value").html("₹" + totalPrice.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }));
            $(".discount").html("-₹" + totalDiscount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }));
            if (totalPrice >= 4999) {
                $(".shipping-price").html("<span class='text-body'><s>₹199</s></span> FREE");
                $(".shipping-price").addClass("text-success");
                $(".free-delivery").addClass("d-none");

                $(".total-amount").html("₹" + (totalPrice - totalDiscount).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }));
            } else {
                $(".shipping-price").html("<span class='text-body'>₹199</span>");
                $(".free-delivery").html("Add items worth ₹" + (4999 - totalPrice).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }) + " more to get free delivery on this order.");
                $(".free-delivery").removeClass("d-none");

                $(".total-amount").html("₹" + (totalPrice - totalDiscount + 199).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }));
            }
        }
    });
}

function openPlaceOrderConfirmationModal() {
    $(".place-order-modal").modal("toggle");
    $(".place-order-modal .btn-yes").click(placeOrder);
    $(".place-order-modal .btn-no").click(() => {
        $(".place-order-modal").modal("hide");
    });
}

function placeOrder() {
    let userCart = getUserCart();
    let orderData = [];

    $.ajax({
        url: 'data/products.json',
        dataType: 'json',
        success: function (response) {
            let products = response;

            for (let i in products) {
                if (!userCart[products[i]["barcode"]]) {
                    continue;
                } else {
                    let row = {};
                    row.Barcode = products[i]["barcode"];
                    row.Name = products[i]["name"];
                    row.Quantity = userCart[[products[i]["barcode"]]];
                    row.Mrp = products[i]["mrp"];
                    row.SellingPrice = products[i]["price"];
                    row.Amount = (row.Quantity) * (row.SellingPrice);
                    orderData.push(row);
                }
            }

            removeAllItemsFromCart();
            $(".place-order-modal").modal("hide");
            $("#cart").addClass("d-none");
            $("#order-placed").removeClass("d-none");
            $("#download-order-csv").attr("onclick", "downloadOrderCSV(" + JSON.stringify(orderData) + ")");

            writeFileData(orderData);
        },
    });
}

function downloadOrderCSV(orderData) {
    writeFileData(orderData);
}

function openClearCartModal() {
    $(".confirm-modal").modal("toggle");
    $(".confirm-modal .modal-title").html("Confirm Clear Cart");
    $(".confirm-modal .modal-body").html("The cart will be empty. Are you sure?");
    $(".confirm-modal .btn-yes").attr("onclick", "clearCart()");
    $(".confirm-modal .btn-no").click(() => {
        $(".confirm-modal").modal("hide");
    });
}

function clearCart() {
    $(".confirm-modal").modal("hide");
    
    removeAllItemsFromCart();
    showSuccessToast("All the products have been removed from the cart.");
    displayCart();
}

function viewProduct(barcode) {
    let url = "product-details.html?barcode=" + barcode;
    window.location.href = url;
}

function init() {
    displayCart();
    $("#clear-cart-btn").click(openClearCartModal);
}

$(document).ready(init);