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
    $("#success").removeClass("d-none");
    $("#error").addClass("d-none");

    let tbody = $("#order-items-table").find("tbody");
    tbody.empty();

    let totalAmount = 0;

    for(let i in orderData) {
        let data = orderData[i];
        let row = "<tr>"
            + "<td>" + (parseInt(i) + 1) + "</td>"
            + "<td>" + data.barcode + "</td>"
            + "<td>" + data.name + "</td>"
            + "<td class='text-right'>" + data.quantity + "</td>"
            + "<td class='text-right'>" + "₹" + data.mrp + "</td>"
            + "<td class='text-right'>" + "₹" + (data.quantity *  data.mrp) + "</td></tr>";
        totalAmount += (data.quantity *  data.mrp);
        tbody.append(row);
    }

    $("#total-amount").find("b").html("Total Amount: ₹" + totalAmount);
}

function showError(errorData) {
    $("#success").addClass("d-none");
    $("#error").removeClass("d-none");

    let tbody = $("#errors-table").find("tbody");
    tbody.empty();

    for(let i in errorData) {
        let data = errorData[i];
        let row = "<tr>"
            + "<td>" + (parseInt(i) + 1) + "</td>"
            + "<td>" + data.barcode + "</td>"
            + "<td class='text-right'>" + data.quantity + "</td>"
            + "<td>" + data.error + "</td>"
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
        row.error = "Barcode should not be empty";
        errorData.push(row);
    }
    else if(row.quantity == "") {
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
            row.error = "Product doesn't exist";
            errorData.push(row);
        } else if(!containsOnlyNumbers(row.quantity)) {
            row.error = "Quantity should be a integer";
            errorData.push(row);
        } else if(parseInt(row.quantity) <= 0) {
            row.error = "Quantity should be greater than 0";
            errorData.push(row);
        } else {
            row.name = product["name"];
            row.mrp = product["mrp"];
            orderData.push(row);
        }
    } 

    uploadRows(productsData);  
}

function checkLogin() {
    let currentUserId = getCurrentUserId();

    if(currentUserId === '0') {
        window.location.href = "login.html";
    } else {
        // TODO: Add more data 
        writeFileData(orderData);
        // TODO: success message
    }
}

function init() {
    $("#browse-btn").click(clickInputFile);
    $("#file-input").on("change", updateFileName);
    $("#upload-btn").click(validateFile);
    $("#place-order-btn").click(checkLogin);
}

$(document).ready(init);