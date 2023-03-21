function displayProducts(){
    $.ajax({
        url: 'data/products.json',
        dataType: 'json',
        success: function(data) {
            for(let i in data) {
                let e = data[i];

                let node = $("#product-card");
                let clone = node.clone().attr("id", "product-card-" + e["barcode"]);
                $("#products-area").append(clone);
                
                $("#product-card-" + e["barcode"] + " .product-img").attr("src", e["imageUrl"]);
                $("#product-card-" + e["barcode"] + " .product-img").attr("onclick", "viewProduct('" + e['barcode'] + "')")
                $("#product-card-" + e["barcode"] + " .brand-name").find("div").html(e["brand"]);
                $("#product-card-" + e["barcode"] + " .brand-name").attr("href", "product-details.html?barcode=" + e['barcode']);
                $("#product-card-" + e["barcode"] + " .product-name").find("div").html(e["name"]);
                $("#product-card-" + e["barcode"] + " .product-name").attr("href", "product-details.html?barcode=" + e['barcode']);
                $("#product-card-" + e["barcode"] + " .product-short-desc").find("div").html(e["shortDescription"]);
                $("#product-card-" + e["barcode"] + " .product-short-desc").attr("href", "product-details.html?barcode=" + e['barcode']);
                $("#product-card-" + e["barcode"] + " .product-rating").html(e["rating"] + " <i class='fa fa-star text-success'></i>");
                $("#product-card-" + e["barcode"] + " .product-reviews").html("(" + e["reviews"] + ")");
                $("#product-card-" + e["barcode"] + " .product-price").find("b").html("₹" + (e["mrp"] - parseInt(e["mrp"] * e["discountPercent"] / 100)));
                $("#product-card-" + e["barcode"] + " .product-price").attr("href", "product-details.html?barcode=" + e['barcode']);
                $("#product-card-" + e["barcode"] + " .product-mrp").find("s").html("₹" + e["mrp"]);
                $("#product-card-" + e["barcode"] + " .product-mrp").attr("href", "product-details.html?barcode=" + e['barcode']);
                $("#product-card-" + e["barcode"] + " .product-discount").html(e["discountPercent"] + "%off");
                $("#product-card-" + e["barcode"] + " .product-discount").attr("href", "product-details.html?barcode=" + e['barcode']);
               
                if(localStorage.getItem(getCurrentUserId()) == null 
                    || JSON.parse(localStorage.getItem(getCurrentUserId()))['cart'] == null 
                    || filterByBarcode(JSON.parse(localStorage.getItem(getCurrentUserId()))['cart'], e['barcode']) == null 
                    || filterByBarcode(JSON.parse(localStorage.getItem(getCurrentUserId()))['cart'], e['barcode']).quantity === null 
                    || parseInt(filterByBarcode(JSON.parse(localStorage.getItem(getCurrentUserId()))['cart'], e['barcode']).quantity) === 0) {
                        $("#product-card-" + e["barcode"] + " .add-to-cart-btn").attr("onclick", "changeToCountButton('" + e['barcode'] + "')")
                        $("#product-card-" + e["barcode"] + " .add-to-cart-span").removeClass("d-none");
                        $("#product-card-" + e["barcode"] + " .inc-dec-qty-span").addClass("d-none");
                } else {
                    $("#product-card-" + e["barcode"] + " .inc-qty-btn").attr("onclick", "increaseQuantity('" + e['barcode'] + "')");
                    $("#product-card-" + e["barcode"] + " .dec-qty-btn").attr("onclick", "decreaseQuantity('" + e['barcode'] + "')");
                    $("#product-card-" + e["barcode"] + " .inc-dec-qty-span").removeClass("d-none");
                    $("#product-card-" + e["barcode"] + " .add-to-cart-span").addClass("d-none");
                    $("#product-card-" + e["barcode"] + " .product-qty").html(parseInt(filterByBarcode(JSON.parse(localStorage.getItem(getCurrentUserId()))['cart'], e['barcode']).quantity));
                }
            }
            $("#product-card").remove();

            // display brands in filters
            displayBrands(data);
            // display categories in filters
            displayCategories(data);
        },
    });
}

function viewProduct(barcode) {
    let url = "product-details.html?barcode=" + barcode;
    window.location.href = url;
}

function changeToCountButton(barcode) {
    let button = $("#product-card-" + barcode + " .add-to-cart-btn");
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
        }
    }

    localStorage.setItem(getCurrentUserId(), JSON.stringify(data));

    $("#product-card-" + barcode + " .inc-qty-btn").attr("onclick", "increaseQuantity('" + barcode + "')");
    $("#product-card-" + barcode + " .dec-qty-btn").attr("onclick", "decreaseQuantity('" + barcode + "')");
    $("#product-card-" + barcode + " .inc-dec-qty-span").removeClass("d-none");
    $("#product-card-" + barcode + " .add-to-cart-span").addClass("d-none");
    $("#product-card-" + barcode + " .product-qty").html(1);
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
    
    $("#product-card-" + barcode + " .product-qty").html(quantity + 1);
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

        $("#product-card-" + barcode + " .product-qty").html(quantity - 1);
    } else if(quantity === 1) {
        for(let i in cart) {
            if(cart[i]['barcode'] === barcode) {
                cart[i]['barcode'] = barcode;
                cart[i]['quantity'] = 0;
                flag = 1;
                break;
            }
        }

        data['itemsCount'] = data['itemsCount'] - 1;
        data['cart'] = cart;  
        localStorage.setItem(getCurrentUserId(), JSON.stringify(data));

        $("#product-card-" + barcode + " .add-to-cart-btn").attr("onclick", "changeToCountButton('" + barcode + "')");
        $("#product-card-" + barcode + " .add-to-cart-btn").html("Add to cart");
        $("#product-card-" + barcode + " .inc-dec-qty-span").addClass("d-none");
        $("#product-card-" + barcode + " .add-to-cart-span").removeClass("d-none");
    }
}

function displayBrands(data) {
    let brands = [];
    for(let i in data) {
        brands.push(data[i]["brand"]);
    }
    brands = Array.from(new Set(brands));

    for(let i in brands) {
        let node = $("#input-brand");
        let clone = node.clone().attr("id", "input-brand-" + brands[i]);
        $("#brand-collapse").append(clone);

        $("#input-brand-" + brands[i]).find("label").html(brands[i]);
        $("#input-brand-" + brands[i]).find("input").attr("value", brands[i]);
    }

    $("#input-brand").remove();
}

function displayCategories(data) {
    let categories = [];
    for(let i in data) {
        categories.push(data[i]["category"]);
    }
    categories = Array.from(new Set(categories));

    for(let i in categories) {
        let node = $("#input-category");
        let clone = node.clone().attr("id", "input-category-" + categories[i]);
        $("#category-collapse").append(clone);

        $("#input-category-" + categories[i]).find("label").html(categories[i]);
        $("#input-category-" + categories[i]).find("input").attr("value", categories[i]);
    }

    $("#input-category").remove();
}

function filterProducts() {
    console.log("filterProducts");
    var selectedFilters = {};

    $('input[type="checkbox"]').filter(':checked').each(function() {
        if (!selectedFilters.hasOwnProperty(this.name)) {
          selectedFilters[this.name] = [];
        }

        selectedFilters[this.name].push(this.value);
    });
    
    console.log(selectedFilters);
}

function init() {
    $("#navbar-placeholder").load("navbar.html");
    $("#footer-placeholder").load("footer.html");
	displayProducts();
    $('input[type="checkbox"]').on('change', filterProducts());
}

$(document).ready(init);