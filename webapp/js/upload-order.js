function clickInputFile() {
    $("#file-input").click();
}

function updateFileName() {
    $("#upload-btn-row").removeClass("d-none");
    let file = $("#file-input");
	let fileName = file.val().split("\\")[2];
	$("#file-name").html(fileName);
}

function showOrder() {
    $("#success").removeClass("d-none");
    $("#error").addClass("d-none");
}

function showError() {
    $("#success").addClass("d-none");
    $("#error").removeClass("d-none");
}

function validateFile() {
    // validate file here
    let validate = true;
    if(validate === true) {
        showOrder();
    } else {
        showError();
    }
}

function init() {
    $("#navbar-placeholder").load("navbar.html");
    $("#footer-placeholder").load("footer.html");
    $("#browse-btn").click(clickInputFile);
    $("#file-input").on("change", updateFileName);
    $("#upload-btn").click(validateFile);
}

$(document).ready(init);