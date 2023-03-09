function displayCart() {
    let cartArea = $("#cart");
    cartArea.empty();

    let row = ("<div class='col-8'> <div class='border p-4 rounded'> <h3>Review Items</h3>");

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
                        row += ("<div class='row align-items-center mt-4'><div class='col-4'> <img class='img-fluid rounded img-thumbnail p-2 border-0 shadow-sm' src='https://img.freepik.com/free-photo/pink-headphones-wireless-digital-device_53876-96804.jpg' alt='Image not Available'> </div>"
                            + "<div class='col-8 p-4'>"
                            + "<div class='row align-items-baseline'> <h5>" + productData['name'] + "</h5> <h5 class='ml-auto'>" + productData['mrp'].split(" ")[0] + "</h5> </div>"
                            + "<div class='row mt-2'> <span class='rounded border py-1 px-2 ml-auto'> <i class='fa fa-minus border-right pr-2'></i> <span class='px-2'>" + quantity + "</span> <i class='fa fa-plus border-left pl-2'></i>  </span> </div></div></div>");
                    }
                }
        }));
    }

    Promise.all(promises).then(() => {
        row += ("</div></div><div class='col-4'> <div class='border p-4 rounded'>"
            + "<h3>Order Summary</h3>"
            + "<div class='row p-4'> <span>Total Amount </span> <span class='ml-auto'>$5678</span> </div>"
            + "<div class='row'> <button class='border btn btn-dark mx-2 my-1 px-4 py-2 rounded-pill ml-auto'>Place Order</button></div></div></div>");

        console.log(row);
        cartArea.append(row);
    })
}

function init(){
	displayCart();
}

$(document).ready(init);