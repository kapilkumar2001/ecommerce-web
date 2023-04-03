function clickInputFile() {
    $("#file-input").click();
    $("#uploaded-cart-items").addClass("d-none");
    $("#uploaded-items-error").addClass("d-none");
    $("#file-error").addClass("d-none");
}

function updateFileName() {
    $("#upload-btn-row").removeClass("d-none");
    let file = $("#file-input");
	let fileName = file.val().split("\\")[2];
	$("#file-name").html(fileName);
}

function showOrder(orderData) {
    $("#upload-btn-row").addClass("d-none");
    $("#uploaded-cart-items").removeClass("d-none");
    $("#uploaded-items-error").addClass("d-none");
    $("#file-error").addClass("d-none");

    let totalAmount = 0;
    let itemsCount = 0;

    for(let i in orderData) {
        let data = orderData[i];

        showCartItem(data);
            
        totalAmount += parseInt(data.price * data.quantity);
        itemsCount += parseInt(data.quantity);
    }

    console.log(orderData);

    $("#uploaded-cart-item").remove();
    $(".card-title").html("Uploaded Items (" + itemsCount + ")");
    $(".total-amount").html("₹" + parseFloat(totalAmount).toFixed(2).toLocaleString());

    $(".add-to-cart-btn").attr("onclick", "addToCart(" + JSON.stringify(orderData) + ")");
    $(".replace-cart-btn").attr("onclick", "replaceCart(" + JSON.stringify(orderData) + ")");
}

function showCartItem(productData) {
    let node = $("#uploaded-cart-item");
    let clone = node.clone().attr("id", "uploaded-cart-item-" + productData.barcode);
    $("#uploaded-cart-items .card-body").append(clone);

    $("#uploaded-cart-item-" + productData.barcode + " .product-img").attr("src", productData.image);
    $("#uploaded-cart-item-" + productData.barcode + " .brand-name").html(productData.brand);
    $("#uploaded-cart-item-" + productData.barcode + " .product-name").html(productData.name);
    $("#uploaded-cart-item-" + productData.barcode + " .product-color").html("Color - " + productData.color);
    $("#uploaded-cart-item-" + productData.barcode + " .product-price").html("₹" + productData.price.toLocaleString());
    $("#uploaded-cart-item-" + productData.barcode + " .product-mrp").find("s").html("₹" + productData.mrp.toLocaleString());
    $("#uploaded-cart-item-" + productData.barcode + " .product-discount").html(productData.discount);
    $("#uploaded-cart-item-" + productData.barcode + " .product-qty").html("Quantity - " + productData.quantity);
    $("#uploaded-cart-item-" + productData.barcode + " .subtotal").html("Amount - ₹" + (productData.price * productData.quantity).toLocaleString());
}

function addToCart(orderData) {
    let userId = getCurrentUserId();
    let cart = getCart();

    if(cart === undefined || cart === null) {
        cart = {};
    } 

    let uploadedCart = {};
    for(let i in orderData) {
        let data = orderData[i];
        uploadedCart[data.barcode] = data.quantity;
    }

    let userCart = {};
    if(cart[userId]) {
        userCart = cart[userId];
        cart[userId] = mergeCarts(uploadedCart, userCart);
    } else {
        cart[userId] = uploadedCart;
    }

    setCart(cart);
    window.location.href = "cart.html";
}

function replaceCart(orderData) {
    let userId = getCurrentUserId();
    let cart = getCart();

    let userCart = {};
   
    for(let i in orderData) {
        let data = orderData[i];
        userCart[data.barcode] = data.quantity;
    }

    cart[userId] = userCart;
    setCart(cart);

    window.location.href = "cart.html";
}

function showError(errorData) {
    $("#uploaded-cart-items").addClass("d-none");
    $("#file-error").addClass("d-none");
    $("#uploaded-items-error").removeClass("d-none");

    let tbody = $("#errors-table").find("tbody");
    tbody.empty();

    for(let i in errorData) {
        let data = errorData[i];
        let row = "<tr>"
            + "<td class='text-center'>" + data.rowNumber + "</td>"
            + "<td class='text-right'>" + data.barcode + "</td>"
            + "<td class='text-right'>" + data.quantity + "</td>"
            + "<td></td>"
            + "<td class='text-left'>" + data.error + "</td>"
        tbody.append(row);
    }
}

function showFileError(message) {
    $("#uploaded-cart-items").addClass("d-none");
    $("#uploaded-items-error").addClass("d-none");
    $("#file-error").removeClass("d-none");

    $("#file-error .error-text").html(message);
}

let fileData = [];
let errorData = [];
let orderData = new Map();
let processCount = 0;

function validateFile() {
    processCount = 0;
    orderData = new Map();
	fileData = [];
	errorData = [];

    let file = $("#file-input")[0].files[0];
    readFileData(file, readFileDataCallback);
}

function readFileDataCallback(results){
	fileData = results.data;

    if((results.meta.fields.length !== 2) || (results.meta.fields[0] !== "barcode") || (results.meta.fields[1] !== "quantity")) {
        showFileError("Error: The headers are invalid in the attched file. The file must contain <b>barcode</b> as first column header and <b>quantity</b> as second column header.");
		return;
	}

	if(fileData.length === 0) {
		showFileError("Error: Attached file is empty.");
		return;
	}

	if(fileData.length>5000){
        showFileError("Error: Maximum limit of the rows in uploaded file can be 100.");
		return;
	}

    $.ajax({
        url: 'data/products.json',
        dataType: 'json',
        success: function(data) {
            uploadRows(data);
        },
    });
}

function uploadRows(productsData){
	
	if(processCount===fileData.length && errorData.length===0){
		showOrder(orderData);
		return;
	}
	else if(processCount===fileData.length){
		showError(errorData);
		return;
	}

	let row = fileData[processCount];
	processCount++;

    if(row.barcode == "") {
        row.rowNumber = processCount;
        row.error = "Barcode should not be empty";
        errorData.push(row);
    }
    else if(row.quantity == "") {
        row.rowNumber = processCount;
        row.error = "Quantity should not be empty";
        errorData.push(row);
    } 
    else{
        let product = null;

        for(let i in productsData) {
            if(productsData[i]["barcode"] == row.barcode) {
                product = productsData[i];
                break;
            }
        }
        
        if(product === null) {
            row.rowNumber = processCount; 
            row.error = "Product doesn't exist";
            errorData.push(row);
        } else if(!isInteger(row.quantity)) {
            row.rowNumber = processCount;
            row.error = "Quantity should be a integer";
            errorData.push(row);
        } else if(parseInt(row.quantity) <= 0) {
            row.rowNumber = processCount;
            row.error = "Quantity should be greater than 0";
            errorData.push(row);
        } else if(parseInt(row.quantity) > 5000) {
            row.rowNumber = processCount;
            row.error = "Quantity should be less than 5000";
            errorData.push(row);
        } else {
            row.image = product["searchImage"]
            row.name = product["name"];
            row.mrp = product["mrp"];
            row.price = product["price"];
            row.discount = product["discountDisplayLabel"];
            row.brand = product["brand"];
            row.color = product["color"];
            row.quantity = parseInt(row.quantity);

            if(orderData[row.barcode] === undefined || orderData[row.barcode] === null) {
                orderData[row.barcode] = row;
            } else {
                row.quantity = row.quantity + orderData[row.barcode]["quantity"];
                orderData[row.barcode] = row;
            }
        }
    } 

    uploadRows(productsData);  
}

function init() {
    $("#browse-btn").click(clickInputFile);
    $("#file-input").on("change", updateFileName);
    $("#upload-btn").click(validateFile);
}

$(document).ready(init);