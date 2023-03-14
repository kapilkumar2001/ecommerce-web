function getCurrentUserId() {
    let currentUserId = localStorage.getItem('current-user-id');

    if(currentUserId === null) {
        localStorage.setItem('current-user-id', 0);
        currentUserId = 0;
    }

    return currentUserId;
}

function displayCart() {
    let cartArea = $("#cart");
    cartArea.empty();

    let row = ("<div class='col-8'> <div class='border p-4 rounded'> <h5>Review Items</h5>");

    const promises = [];

    let keys = JSON.parse(localStorage.getItem(getCurrentUserId()))['cart'],
    i = keys.length;

    if(i === 0) {
        row += "<div><img class='img-fluid' src='https://shop.millenniumbooksource.com/static/images/cart1.png'></img></div>";
    }

    while (i--) {
        let barcode = keys[i].barcode;
        promises.push(    
            $.ajax({
                url: 'data/products.json',
                dataType: 'json',
                success: function(data) {
                    let productData = null;
                    let quantity = parseInt(filterByBarcode(JSON.parse(localStorage.getItem(getCurrentUserId()))['cart'], barcode).quantity);
        
                    for(let i in data) {
                        if(data[i]['barcode'] === barcode) {
                            productData = data[i];
                            break;
                        }
                    }
                    if((productData !== null) && (quantity !== 0) && (quantity !== null)) {
                        row += ("<div class='row align-items-center mt-4'><div class='col-4' onclick='viewProduct(\"" + barcode + "\")'> <img class='img-fluid rounded img-thumbnail p-2 border-0 shadow-sm' src=" + productData['imageUrl'] + " alt='Image not Available' style='height:150px' width='200'> </div>"
                            + "<div class='col-8 p-4'>"
                            + "<div class='row align-items-baseline'> <b>" + productData['name'] + "</b> <h6 class='ml-auto'>" + productData['mrp'] + "</h6> </div>"
                            + "<div class='row mt-2'><span>Color: " + productData['color'] + "</span> <span id='increase-or-decrease-item-" + barcode + "' class='rounded-pill border px-2 ml-auto'><button class='border-0 bg-transparent' onclick='decreaseQuantity(decreaseQuantity(\"" + barcode + "\"))'><i class='fa fa-minus border-right pr-2 py-2'></i></button> <span class='px-2'>" + filterByBarcode(JSON.parse(localStorage.getItem(getCurrentUserId()))['cart'], barcode).quantity + "</span> <button class='border-0 bg-transparent' onclick='increaseQuantity(\"" + barcode + "\")'><i class='fa fa-plus border-left pl-2 py-2'></i></button></span> </div></div></div>");
                    }
                }
        }));
    }

    Promise.all(promises).then(() => {
        row += ("</div></div><div class='col-4'> <div class='border p-4 rounded'>"
            + "<h3>Order Summary</h3>"
            + "<div class='row p-4'> <span>Total Amount </span> <span class='ml-auto'>$5678</span> </div>"
            + "<div class='row'> <button class='border btn btn-dark mx-2 my-1 px-4 py-2 rounded-pill ml-auto' onclick='checkLogin()'>Place Order</button></div></div></div>");
            
        cartArea.append(row);
    });
}

function viewProduct(barcode) {
    let url = "product-details.html?barcode=" + barcode;
    window.location.href = url;
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
    
    let button = $("#increase-or-decrease-item-" + barcode).find('span');
    button.html(filterByBarcode(JSON.parse(localStorage.getItem(getCurrentUserId()))['cart'], barcode).quantity);
}

function decreaseQuantity(barcode) {
    let data =  JSON.parse(localStorage.getItem(getCurrentUserId()));
    let cart = data['cart'];
    let quantity = 0;

    if(filterByBarcode(cart, barcode) != null){
        quantity = parseInt(filterByBarcode(cart, barcode).quantity);
    }

    if(quantity > 0) {
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

        let button = $("#increase-or-decrease-item-" + barcode).find('span');
        button.html(filterByBarcode(JSON.parse(localStorage.getItem(getCurrentUserId()))['cart'], barcode).quantity);
    } 
}

function checkLogin() {
    let currentUserId = getCurrentUserId();

    if(currentUserId === '0') {
        window.location.href = "login.html";
    } else {
        let data = JSON.parse(localStorage.getItem(getCurrentUserId()));

        // TODO: add more data in csv 
        writeFileData(data['cart']);
        
        data['cart'] = [];
        localStorage.setItem(currentUserId, JSON.stringify(data));

        // TODO: success message
        displayCart();
    }
}

function filterByBarcode(jsonObject, barcode) {
    return jsonObject.filter(
        function(jsonObject) {
            return (jsonObject['barcode'] == barcode);
        })[0];
}

function init(){
    $("#navbar-placeholder").load("navbar.html");
    $("#footer-placeholder").load("footer.html");
	displayCart();
}

$(document).ready(init);