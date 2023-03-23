function displayPage(){
    $.ajax({
        url: 'data/products.json',
        dataType: 'json',
        success: function(data) {
            displayFilters(data);
            displayProducts(data);
        },
    });
}

function displayFilters(data) {
    displayBrands(data);
    displayCategories(data);
    displayColors(data);

    let filters = getFilters();
    if(filters !== null) {
        let brands = JSON.parse(filters)["brand"];
        let categories = JSON.parse(filters)["category"];
        let colors = JSON.parse(filters)["color"];
    
        for(let i in brands) {
            $("#input-brand-" + brands[i]).find("input").attr("checked" , true);
        }
        for(let i in categories) {
            $("#input-category-" + categories[i]).find("input").attr("checked" , true);
        }
        for(let i in colors) {
            $("#input-color-" + colors[i]).find("input").attr("checked" , true);
        }
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

function displayColors(data) {
    let colors = [];
    for(let i in data) {
        colors.push(data[i]["color"]);
    }
    colors = Array.from(new Set(colors));

    for(let i in colors) {
        let node = $("#input-color");
        let clone = node.clone().attr("id", "input-color-" + colors[i]);
        $("#color-collapse").append(clone);

        $("#input-color-" + colors[i]).find("label").html(colors[i]);
        $("#input-color-" + colors[i]).find("input").attr("value", colors[i]);
    }

    $("#input-color").remove();
}

function displayProducts(data) {
    let filters = getFilters();
                
    if(filters === null) {
        showProductCard(data);
    } else {
        filters = JSON.parse(filters);

        if(Object.keys(filters).length === 0) {
            showProductCard(data);
        } else {
            for (let key in filters) {
                let value = filters[key];
                switch(key) {
                    case "brand" : 
                        data = filterByBrand(data, value);
                        break;
                    case "category" :
                        data = filterByCategory(data, value);
                        break;
                    case "color" :
                        data = filterByColor(data, value);
                        break;
                }
            }
            showProductCard(data);
        }
    }

    $("#product-card").remove();
    $("input[type='checkbox']").on("change", function(e){
        filterProducts();
    });

    setLoginLogoutIcon();
    $("#navbar-login-logout").click(logout);
}

function showProductCard(data) {

    if(data.length === 0) {
        $("#no-product").removeClass("d-none");
    } else {
        $("#no-product").addClass("d-none");

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
            
            let cart = getCart();
            let userId = getCurrentUserId();

            if(cart === null || cart[userId] === undefined
                || filterByBarcode(cart[userId], e['barcode']) === undefined
                || filterByBarcode(cart[userId], e['barcode']).quantity === undefined 
                || parseInt(filterByBarcode(cart[userId], e['barcode']).quantity) === 0) {
                    $("#product-card-" + e["barcode"] + " .add-to-cart-btn").attr("onclick", "changeToCountButton('" + e['barcode'] + "')")
                    $("#product-card-" + e["barcode"] + " .add-to-cart-span").removeClass("d-none");
                    $("#product-card-" + e["barcode"] + " .inc-dec-qty-span").addClass("d-none");
            } else {
                $("#product-card-" + e["barcode"] + " .inc-qty-btn").attr("onclick", "increaseQuantity('" + e['barcode'] + "')");
                $("#product-card-" + e["barcode"] + " .dec-qty-btn").attr("onclick", "decreaseQuantity('" + e['barcode'] + "')");
                $("#product-card-" + e["barcode"] + " .inc-dec-qty-span").removeClass("d-none");
                $("#product-card-" + e["barcode"] + " .add-to-cart-span").addClass("d-none");
                $("#product-card-" + e["barcode"] + " .product-qty").html(parseInt(filterByBarcode(cart[userId], e['barcode']).quantity));
            }
        }
    }
}

function changeToCountButton(barcode) {
    let button = $("#product-card-" + barcode + " .add-to-cart-btn");
    button.empty();

    let cart =  getCart();
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

    updateCart(cart);

    $("#product-card-" + barcode + " .inc-qty-btn").attr("onclick", "increaseQuantity('" + barcode + "')");
    $("#product-card-" + barcode + " .dec-qty-btn").attr("onclick", "decreaseQuantity('" + barcode + "')");
    $("#product-card-" + barcode + " .inc-dec-qty-span").removeClass("d-none");
    $("#product-card-" + barcode + " .add-to-cart-span").addClass("d-none");
    $("#product-card-" + barcode + " .product-qty").html(1);
}

function increaseQuantity(barcode) {
    let cart =  getCart();
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
    updateCart(cart);
    
    $("#product-card-" + barcode + " .product-qty").html(quantity + 1);
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
        updateCart(cart);

        $("#product-card-" + barcode + " .product-qty").html(quantity - 1);
    } else if(quantity === 1) {
        for(let i in userCart) {
            if(userCart[i]['barcode'] === barcode) {
                userCart[i]['quantity'] = 0;
                break;
            }
        }

        cart[userId] = userCart;  
        updateCart(cart);

        $("#product-card-" + barcode + " .add-to-cart-btn").attr("onclick", "changeToCountButton('" + barcode + "')");
        $("#product-card-" + barcode + " .add-to-cart-btn").html("Add to cart");
        $("#product-card-" + barcode + " .inc-dec-qty-span").addClass("d-none");
        $("#product-card-" + barcode + " .add-to-cart-span").removeClass("d-none");
    }
}

function viewProduct(barcode) {
    let url = "product-details.html?barcode=" + barcode;
    window.location.href = url;
}

function filterProducts() {
    let selectedFilters = {};

    $("input[type='checkbox']").filter(":checked").each(function() {

        if (!selectedFilters.hasOwnProperty(this.name)) {
          selectedFilters[this.name] = [];
        }

        selectedFilters[this.name].push(this.value);
    });

    setFilters(selectedFilters);

    window.location.href = "home.html";
}

function filterByBrand(data, brands) {
    const filteredData = new Set();

    for(let i in data) {
        for(let j in brands) {
            if(data[i]["brand"] === brands[j]) {
                filteredData.add(data[i]);
            }
        }
    }

    return Array.from(filteredData);
}

function filterByCategory(data, categories) {
    const filteredData = new Set();

    for(let i in data) {
        for(let j in categories) {
            if(data[i]["category"] === categories[j]) {
                filteredData.add(data[i]);
            }
        }
    }

    return Array.from(filteredData);
}

function filterByColor(data, colors) {
    const filteredData = new Set();

    for(let i in data) {
        for(let j in colors) {
            if(data[i]["color"] === colors[j]) {
                filteredData.add(data[i]);
            }
        }
    }

    return Array.from(filteredData);
}
 
function init() {
    $("#navbar-placeholder").load("navbar.html");
    $("#footer-placeholder").load("footer.html");
	displayPage();
}

$(document).ready(init);