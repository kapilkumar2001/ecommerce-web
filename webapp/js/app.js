function getCurrentUserId() {
    let currentUserId = localStorage.getItem('current-user-id');

    if(currentUserId === null) {
        localStorage.setItem('current-user-id', 0);
        currentUserId = 0;
    }

    return currentUserId;
}

function filterByBarcode(jsonObject, barcode) {
    return jsonObject.filter(
        function(jsonObject) {
            return (jsonObject['barcode'] == barcode);
        })[0];
}

function setLoginLogoutIcon() { 
    let currentUserId = getCurrentUserId(); 

    if(currentUserId === '0') {
        $("#navbar-login-logout").html("<a class='nav-link' href='login.html'><i class='fa fa-sign-out fa-lg'></i></a>");
    } else {
        $("#navbar-login-logout").html("<a class='nav-link' href='login.html'><i class='fa fa-sign-in fa-lg'></i></a>");
    } 
} 

function loginLogoutAction() {
    let currentUserId = getCurrentUserId();

    if(currentUserId !== '0') {
        localStorage.setItem('current-user-id', 0);
    } 
} 

function writeFileData(arr){
	let config = {
		quoteChar: "",
		escapeChar: "",
		delimiter: "\t"
	};
  
	let data = Papa.unparse(arr, config);
    let blob = new Blob([data], {type: "text/tsv;charset=utf-8;"});
    let fileUrl =  null;

    if (navigator.msSaveBlob) {
        fileUrl = navigator.msSaveBlob(blob, "order.csv");
    } else {
        fileUrl = window.URL.createObjectURL(blob);
    }

    let tempLink = document.createElement("a");
    tempLink.href = fileUrl;
    tempLink.setAttribute("download", "order.csv");
    tempLink.click(); 
    tempLink.remove();
}


function init() {
    setLoginLogoutIcon();
    $("#navbar-login-logout").click(loginLogoutAction);
} 

$(document).ready(init); 