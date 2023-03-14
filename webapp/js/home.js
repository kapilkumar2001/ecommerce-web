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
                    + "<div class='row mt-4 mb-2 mx-2'> <b>" + e['name'] + "</b></div>"
                    + "<div class='row mx-2'>" + e['shortDescription'] + "</div>"
                    + "<div class='row mx-2 my-2 align-items-baseline'>";
               
                let rating = Math.round(e['rating']);

                for(let j = 0; j < rating; j++){
                    row += "<i class='fa fa-star text-success'></i>";
                }

                for(let j = 0; j < (5 - rating); j++){
                    row += "<i class='fa fa-star-o text-success'></i>";
                }

                row += ("<span class='mr-1 text-success'>(" + e['rating'] + ")</span><span class='ml-1 text-primary'>(" + e['reviews'] + ")</span> </div>");

                if(localStorage.getItem(getCurrentUserId()) == null || JSON.parse(localStorage.getItem(getCurrentUserId()))['cart'] == null || filterByBarcode(JSON.parse(localStorage.getItem(getCurrentUserId()))['cart'], e['barcode']) == null || parseInt(filterByBarcode(JSON.parse(localStorage.getItem(getCurrentUserId()))['cart'], e['barcode']).quantity) === null || parseInt(filterByBarcode(JSON.parse(localStorage.getItem(getCurrentUserId()))['cart'], e['barcode']).quantity) === 0) {
                    row += ("<div class='row mx-2 my-3 align-items-baseline'><b>" + e['mrp'] + "</b><span id='add-item-to-cart-button-" + e['barcode'] + "' class='ml-auto'><button class='border btn btn-outline-secondary btn-sm mx-2 px-4 py-2 rounded-pill' onclick='changeToCountButton(\"" + e['barcode'] + "\")'>Add to cart</button></span>"
                    + "</div></div>");
                } else {
                    row += ("<div class='row mx-2 my-3 align-items-baseline'><b>" + e['mrp'] + "</b><span id='add-item-to-cart-button-" + e['barcode'] + "' class='rounded-pill border px-2 mx-2 ml-auto'><button class='border-0 bg-transparent' onclick='decreaseQuantity(decreaseQuantity(\"" + e['barcode'] + "\"))'><i class='fa fa-minus border-right pr-2 py-2'></i></button> <span class='px-2'>" + parseInt(filterByBarcode(JSON.parse(localStorage.getItem(getCurrentUserId()))['cart'], e['barcode']).quantity) + "</span> <button class='border-0 bg-transparent' onclick='increaseQuantity(\"" + e['barcode'] + "\")'><i class='fa fa-plus border-left pl-2 py-2'></i></button></span>"
                    + "</div></div>");
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
        data['cart'] = cart;  
    } else {
        data = {
            'cart' : [item],
            'email' : '',
            'password' : '',
            'id' : ''
        }
    }
    localStorage.setItem(getCurrentUserId(), JSON.stringify(data));

    button.addClass("rounded-pill border px-2 mx-2");
    button.append("<button class='border-0 bg-transparent' onclick='decreaseQuantity(\"" + barcode + "\")'><i class='fa fa-minus border-right pr-2 py-2'></i></button> <span class='px-2'>" + filterByBarcode(JSON.parse(localStorage.getItem(getCurrentUserId()))['cart'], barcode).quantity + "</span> <button class='border-0 bg-transparent' onclick='increaseQuantity(\"" + barcode + "\")'><i class='fa fa-plus border-left pl-2 py-2'></i></button>");
}

function increaseQuantity(barcode) {
    let data =  JSON.parse(localStorage.getItem(getCurrentUserId()));
    let cart = data['cart'];
    let quantity = parseInt(filterByBarcode(cart, barcode).quantity);
    let item = {'barcode': barcode, 'quantity': quantity + 1};
    let flag = 0;

    for(let i in cart) {
        if(cart[i]['barcode'] === barcode) {
            cart[i]['barcode'] = barcode;
            cart[i]['quantity'] = quantity + 1;
            flag = 1;
            break;
        }
    }

    if(flag === 0) {
        cart.push(item);
    }

    data['cart'] = cart;  
    localStorage.setItem(getCurrentUserId(), JSON.stringify(data));
    
    let button = $("#add-item-to-cart-button-" + barcode).find("span");
    button.html(parseInt(filterByBarcode(JSON.parse(localStorage.getItem(getCurrentUserId()))['cart'], barcode).quantity));
}

function decreaseQuantity(barcode) {
    let data =  JSON.parse(localStorage.getItem(getCurrentUserId()));
    let cart = data['cart'];
    let quantity = 0;

    if(filterByBarcode(cart, barcode) != null) {
        quantity = parseInt(filterByBarcode(cart, barcode).quantity);
    }

    if(quantity > 1) {
        let item = {'barcode': barcode, 'quantity': quantity - 1};
        let flag = 0;

        for(let i in cart) {
            if(cart[i]['barcode'] === barcode) {
                cart[i]['barcode'] = barcode;
                cart[i]['quantity'] = quantity - 1;
                flag = 1;
                break;
            }
        }

        if(flag === 0) {
            cart.push(item);
        }

        data['cart'] = cart;  
        localStorage.setItem(getCurrentUserId(), JSON.stringify(data));

        let button = $("#add-item-to-cart-button-" + barcode).find('span');
        button.html(parseInt(filterByBarcode(JSON.parse(localStorage.getItem(getCurrentUserId()))['cart'], barcode).quantity));
    } else {
        let item = {'barcode': barcode, 'quantity': 0};
        let flag = 0;

        for(let i in cart) {
            if(cart[i]['barcode'] === barcode) {
                cart[i]['barcode'] = barcode;
                cart[i]['quantity'] = 0;
                flag = 1;
                break;
            }
        }

        if(flag === 0) {
            cart.push(item);
        }

        data['cart'] = cart;  
        localStorage.setItem(getCurrentUserId(), JSON.stringify(data));

        let button = $("#add-item-to-cart-button-" + barcode);
        button.empty();
        button.removeClass("rounded-pill border px-2 mx-2");
        button.append("<button class='border btn btn-outline-secondary btn-sm mx-2 px-4 py-2 rounded-pill' onclick='changeToCountButton(\"" + barcode + "\")'>Add to cart</button>");
    }
}

function init() {
    $("#navbar-placeholder").load("navbar.html");
    $("#footer-placeholder").load("footer.html");
	displayProducts();
}

$("#footer-placeholder").load("footer.html");
$(document).ready(init);