function getProductDetails() {
    let searchParams = new URLSearchParams(window.location.search);
    let barcode = searchParams.get('barcode');
    displayProductDetails(barcode);
}

function displayProductDetails(barcode){
    let productDetailsContainer = $("#product-details-container");
    productDetailsContainer.empty();

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
                let row = "<div class='row mx-2'>" + productData['category'] + " / "  + productData['brand'] + " / " + productData['name'] + "</div>"
                    + "<div class='row mt-4'> <div class='col-6'>"
                    + "<img class='img-fluid rounded img-thumbnail p-2 border-0 shadow-sm' src=" + productData['imageUrl'] + " alt='Image not Available' style='height:400px' width='500'> </div>"
                    + "<div class='col-6'> <h3 class='my-2'>" + productData['name'] + "</h3> <p class='text-secondary'>" + productData['description'] + "</p>"
                    + "<div class='row align-items-baseline mx-1 mb-4'>";
                let rating = Math.round(productData['rating']);

                for(let j=0; j<rating; j++){
                    row += "<i class='fa fa-star text-success'></i>";
                }

                for(let j=0; j<(5-rating); j++){
                    row += "<i class='fa fa-star-o text-success'></i>";
                }

                row +=  ("<span class='mr-1 text-success'>(" + productData['rating'] + ")</span><span class='ml-2 text-primary'>" + productData['reviews'] + " ratings</span></div>"
                    + "<hr>"
                    + "<h4 class='my-2'>" + productData['mrp'] + "</h4>"
                    + "<span class='my-3'>Color: " + productData['color'] + "</span><br>"
                    + "<span class='my-3'>Style Name: " + productData['styleName'] + "</span>"
                    + "<hr>");
                
                if(localStorage.getItem('quantity-' + barcode) === null || parseInt(localStorage.getItem('quantity-' + barcode)) === 0) {
                    row += ("<span id='add-item-to-cart-button'><button class='border btn btn-outline-secondary btn-sm mx-2 my-1 px-4 py-2 rounded-pill' onclick='changeToCountButton(\"" + barcode + "\")'>Add to cart</button></span>")
                } else {
                    row += ("<span id='add-item-to-cart-button' class='rounded-pill border py-2 px-2 mx-2'><button class='border-0 bg-transparent' onclick='decreaseQuantity(\"" + barcode + "\")'><i class='fa fa-minus border-right pr-2 py-2 my-2'></i></button> <span class='px-2'>" + localStorage.getItem('quantity-' + barcode) + "</span> <button class='border-0 bg-transparent' onclick='increaseQuantity(\"" + barcode + "\")'><i class='fa fa-plus border-left pl-2 py-2'></i></button></span>")
                }             
                    
                row += ("<button class='border btn btn-dark btn-sm mx-4 my-1 px-4 py-2 rounded-pill' onclick='viewCart()'>Buy Now</button>"
                    + " </div> </div>");
                
                productDetailsContainer.append(row);
            }
        },
    });
}

function viewCart() {
    window.location.href = "cart.html";
}

function changeToCountButton(barcode) {
    let button = $("#add-item-to-cart-button");
    button.empty();
    localStorage.setItem("quantity-" + barcode, 1);
    button.addClass("rounded-pill border py-2 px-2 mx-2");
    button.append("<button class='border-0 bg-transparent' onclick='decreaseQuantity(\"" + barcode + "\")'><i class='fa fa-minus border-right pr-2 py-2 my-2'></i></button> <span class='px-2'>" + localStorage.getItem('quantity-'+barcode) + "</span> <button class='border-0 bg-transparent' onclick='increaseQuantity(\"" + barcode + "\")'><i class='fa fa-plus border-left pl-2 py-2'></i></button>");
}

function increaseQuantity(barcode) {
    let quantity = parseInt(localStorage.getItem("quantity-" + barcode));
    localStorage.setItem("quantity-" + barcode, quantity + 1);
    
    let button = $("#add-item-to-cart-button").find('span');
    button.html(localStorage.getItem("quantity-" + barcode));
}

function decreaseQuantity(barcode) {
    let quantity = parseInt(localStorage.getItem("quantity-" + barcode));

    if(quantity > 1) {
        localStorage.setItem("quantity-" + barcode, quantity - 1);

        let button = $("#add-item-to-cart-button").find('span');
        button.html(localStorage.getItem("quantity-" + barcode));
    } else {
        localStorage.setItem("quantity-" + barcode, 0);
        
        let button = $("#add-item-to-cart-button");
        button.empty();
        button.removeClass("rounded-pill border py-2 px-2 mx-2");
        button.append("<button class='border btn btn-outline-secondary btn-sm mx-2 my-1 px-4 py-2 rounded-pill' onclick='changeToCountButton(\"" + barcode + "\")'>Add to cart</button>");
    }
}

function init(){
    // $("#header-placeholder").load("header.html");
    $("#navbar-placeholder").load("navbar.html");
    $("#footer-placeholder").load("footer.html");
    getProductDetails();
}

$(document).ready(init);