function clickInputFile() {
    $("#file-input").click();
}

function updateFileName() {
    $("#upload-btn-row").removeClass("d-none");
    let file = $("#file-input");
	let fileName = file.val().split("\\")[2];
	$("#file-name").html(fileName);
}

function showOrder(orderData) {
    $("#uploaded-cart-items").removeClass("d-none");
    $("#uploaded-items-error").addClass("d-none");

    let totalAmount = 0;
    let itemsCount = 0;

    for(let i in orderData) {
        let data = orderData[i];
        showCartItem(data);
        totalAmount += parseInt(data.price * data.quantity);
        itemsCount += parseInt(data.quantity);
    }
    $("#uploaded-cart-item").remove();
    $(".card-title").html("Uploaded Items (" + itemsCount + ")");
    $(".total-amount").html("₹" + parseFloat(totalAmount).toFixed(2).toLocaleString());
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


function showError(errorData) {
    $("#uploaded-cart-items").addClass("d-none");
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

let fileData = [];
let errorData = [];
let orderData = [];
let processCount = 0;

function validateFile() {
    processCount = 0;
	fileData = [];
	errorData = [];

    let file = $("#file-input")[0].files[0];
    readFileData(file, readFileDataCallback);
}

function readFileDataCallback(results){
	fileData = results.data;

    if((results.meta.fields.length !== 2) || (results.meta.fields[0] !== "barcode") || (results.meta.fields[1] !== "quantity")) {
		// showError("Invalid File");
        console.log("invalid file");
		return;
	}

	if(fileData.length === 0) {
		// showError("File is Empty");
        console.log("file is empty");
		return;
	}

	if(fileData.length>5000){
		// showError("Data limit exceeded. Max data limit - 5000 rows");
        console.log("data limit exceed");
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
        } else if(!containsOnlyNumbers(row.quantity)) {
            row.rowNumber = processCount;
            row.error = "Quantity should be a integer";
            errorData.push(row);
        } else if(parseInt(row.quantity) <= 0) {
            row.rowNumber = processCount;
            row.error = "Quantity should be greater than 0";
            errorData.push(row);
        } else {
            row.image = product["searchImage"]
            row.name = product["name"];
            row.mrp = product["mrp"];
            row.price = product["price"];
            row.discount = product["discountDisplayLabel"];
            row.brand = product["brand"];
            row.color = product["color"];
            orderData.push(row);
        }
    } 

    uploadRows(productsData);  
}

// function checkLogin() {
//     let currentUserId = getCurrentUserId();

//     if(currentUserId === '0') {
//         window.location.href = "login.html";
//     } else {
//         // TODO: Add more data 
//         writeFileData(orderData);
//         // TODO: success message
//     }
// }

function init() {
    $("#browse-btn").click(clickInputFile);
    $("#file-input").on("change", updateFileName);
    $("#upload-btn").click(validateFile);
}

$(document).ready(init);