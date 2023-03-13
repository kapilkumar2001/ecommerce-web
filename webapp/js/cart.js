function displayCart() {
    let cartArea = $("#cart");
    cartArea.empty();

    let row = ("<div class='col-8'> <div class='border p-4 rounded'> <h5>Review Items</h5>");

    const promises = [];

    keys = Object.keys(localStorage),
    i = keys.length;

    while (i--) {
        let barcode = keys[i].split("-").slice(1).join('-');
        promises.push(    
            $.ajax({
                url: 'data/products.json',
                dataType: 'json',
                success: function(data) {
                    let productData = null;
                    let quantity = parseInt(localStorage.getItem('quantity-' + barcode));
        
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
                            + "<div class='row mt-2'><span>Color: " + productData['color'] + "</span> <span id='increase-or-decrease-item-" + barcode + "' class='rounded-pill border px-2 ml-auto'><button class='border-0 bg-transparent' onclick='decreaseQuantity(decreaseQuantity(\"" + barcode + "\"))'><i class='fa fa-minus border-right pr-2 py-2'></i></button> <span class='px-2'>" + localStorage.getItem('quantity-' + barcode) + "</span> <button class='border-0 bg-transparent' onclick='increaseQuantity(\"" + barcode + "\")'><i class='fa fa-plus border-left pl-2 py-2'></i></button></span> </div></div></div>");
                    }
                }
        }));
    }

    Promise.all(promises).then(() => {
        row += ("</div></div><div class='col-4'> <div class='border p-4 rounded'>"
            + "<h3>Order Summary</h3>"
            + "<div class='row p-4'> <span>Total Amount </span> <span class='ml-auto'>$5678</span> </div>"
            + "<div class='row'> <button class='border btn btn-dark mx-2 my-1 px-4 py-2 rounded-pill ml-auto'>Place Order</button></div></div></div>");
            
        cartArea.append(row);
    });
}

function viewProduct(barcode) {
    let url = "product-details.html?barcode=" + barcode;
    window.location.href = url;
}

function increaseQuantity(barcode) {
    let quantity = parseInt(localStorage.getItem("quantity-" + barcode));
    localStorage.setItem("quantity-" + barcode, quantity + 1);
    
    let button = $("#increase-or-decrease-item-" + barcode).find('span');
    button.html(localStorage.getItem("quantity-" + barcode));
}

function decreaseQuantity(barcode) {
    let quantity = parseInt(localStorage.getItem("quantity-" + barcode));

    if(quantity > 0) {
        localStorage.setItem("quantity-" + barcode, quantity - 1);

        let button = $("#increase-or-decrease-item-" + barcode).find('span');
        button.html(localStorage.getItem("quantity-" + barcode));
    } 
}

function init(){
    // $("#header-placeholder").load("header.html");
    $("#navbar-placeholder").load("navbar.html");
    $("#footer-placeholder").load("footer.html");
	displayCart();
}

$(document).ready(init);