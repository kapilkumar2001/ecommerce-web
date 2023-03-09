function displayProducts(){
    let productsArea = $("#products-area").find("div");
    productsArea.empty();

    $.ajax({
        url: 'data/products.json',
        dataType: 'json',
        success: function(data) {
            for(let i in data) {

                let e = data[i];
                let row = "<div class='col-3 my-3'>"
                    + "<div onclick='viewProduct(\"" + e['barcode'] + "\")'> <img class='img-fluid rounded img-thumbnail p-2 border-0 shadow-sm' src=" + e['imageUrl'] + " alt='Image not Available' style='height:170px' width='300'> </div>"
                    + "<div class='row mt-4 mb-2 mx-2'> <b>" + e['name'] + "</b> <b class='ml-auto'>" + e['mrp'].split(" ")[0] + "</b> </div>"
                    + "<div class='row mx-2'>" + e['short-description'] + "</div>"
                    + "<div class='row mx-2 my-2 align-items-baseline'>";
                let rating = Math.round(e['rating']);

                for(let j = 0; j < rating; j++){
                    row += "<i class='fa fa-star'></i>";
                }

                for(let j = 0; j < (5 - rating); j++){
                    row += "<i class='fa fa-star-o'></i>";
                }

                row += ("<span class='ml-1'>" + e['rating'] + "  (" + e['reviews'] + ")</span> </div>");

                if(localStorage.getItem('quantity-' + e['barcode']) === null || parseInt(localStorage.getItem('quantity-' + e['barcode'])) === 0) {
                    row += ("<span id='add-item-to-cart-button-" + e['barcode'] + "'><button class='border btn btn-outline-secondary btn-sm mx-2 my-1 px-4 py-2 rounded-pill' onclick='changeToCountButton(\"" + e['barcode'] + "\")'>Add to cart</button></span>"
                    + "</div>");
                } else {
                    row += ("<span id='add-item-to-cart-button-" + e['barcode'] + "' class='rounded-pill border py-2 px-2 mx-2'><button class='border-0 bg-transparent' onclick='decreaseQuantity(decreaseQuantity(\"" + e['barcode'] + "\"))'><i class='fa fa-minus border-right pr-2 py-2 my-2'></i></button> <span class='px-2'>" + localStorage.getItem('quantity-' + e['barcode']) + "</span> <button class='border-0 bg-transparent' onclick='increaseQuantity(\"" + e['barcode'] + "\")'><i class='fa fa-plus border-left pl-2 py-2'></i></button></span>"
                    + "</div>");
                }
        
                productsArea.append(row);
            }
        },
    });
}

function viewProduct(barcode) {
    let url = "product-details.html?barcode=" + barcode;
    window.location.href = url;
}

function changeToCountButton(barcode) {
    let button = $("#add-item-to-cart-button-" + barcode);
    button.empty();

    // var value = JSON.parse(localStorage.getItem("cart"));
    // value.add(barcode);
    // localStorage.setItem("cart", JSON.stringify(value));

    localStorage.setItem("quantity-" + barcode, 1);
    button.addClass("rounded-pill border py-2 px-2 mx-2");
    button.append("<button class='border-0 bg-transparent' onclick='decreaseQuantity(\"" + barcode + "\")'><i class='fa fa-minus border-right pr-2 py-2 my-2'></i></button> <span class='px-2'>" + localStorage.getItem('quantity-'+barcode) + "</span> <button class='border-0 bg-transparent' onclick='increaseQuantity(\"" + barcode + "\")'><i class='fa fa-plus border-left pl-2 py-2'></i></button>");
}

function increaseQuantity(barcode) {
    let quantity = parseInt(localStorage.getItem("quantity-" + barcode));
    localStorage.setItem("quantity-" + barcode, quantity + 1);
    
    let button = $("#add-item-to-cart-button-" + barcode).find("span");
    button.html(localStorage.getItem("quantity-" + barcode));
}

function decreaseQuantity(barcode) {
    let quantity = parseInt(localStorage.getItem("quantity-" + barcode));
    if(quantity > 1) {
        localStorage.setItem("quantity-" + barcode, quantity - 1);

        let button = $("#add-item-to-cart-button-" + barcode).find('span');
        button.html(localStorage.getItem("quantity-" + barcode));
    } else {
        localStorage.setItem("quantity-" + barcode, 0);

        let button = $("#add-item-to-cart-button-" + barcode);
        button.empty();
        button.removeClass("rounded-pill border py-2 px-2 mx-2");
        button.append("<button class='border btn btn-outline-secondary btn-sm mx-2 my-1 px-4 py-2 rounded-pill' onclick='changeToCountButton(\"" + barcode + "\")'>Add to cart</button>");
    }
}

function init() {
	displayProducts();
}

$(document).ready(init);