function getCurrentUserId() {
    let currentUserId = localStorage.getItem('current-user-id');

    if(currentUserId === null) {
        localStorage.setItem('current-user-id', 0);
        currentUserId = 0;
    }

    return currentUserId;
}

function filterByBarcode(data, barcode) {
    return data.filter(
        function(data) {
            return (data['barcode'] == barcode);
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

function containsOnlyNumbers(str) {
    return /^[0-9]+$/.test(str);
}

function readFileData(file, callback){
	let config = {
		header: true,
		delimiter: "\t",
		skipEmptyLines: "greedy",
		complete: function(results) {
			callback(results);
	  }	
	}
	Papa.parse(file, config);
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