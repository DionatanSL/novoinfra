function logar() {
    const userVal = document.getElementById("user").value.trim();
    const passVal = document.getElementById("pass").value.trim();
    if (userVal === "admin" && passVal === "123") {
        loggedUser = userVal;
        document.getElementById("login-screen").style.display = "none";
        document.getElementById("dashboard").style.display = "block";
        document.getElementById("totalPops").innerText = popsList.length;
        initUI(); // Chama a inicialização da interface
    } else alert("Acesso Negado!");
}