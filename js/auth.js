// ── Inicializa Firebase Auth ───────────────────────────────────
async function inicializarAuth() {
    const { initializeApp, getApps } = await import("https://www.gstatic.com/firebasejs/11.9.0/firebase-app.js");
    const { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged }
        = await import("https://www.gstatic.com/firebasejs/11.9.0/firebase-auth.js");

    if (!getApps().length) initializeApp(window.firebaseConfig);

    const auth = getAuth();
    window._auth = auth;
    window._signOut = signOut;

    // Monitora estado do login
    onAuthStateChanged(auth, (user) => {
        if (user) {
            loggedUser = user.email;
            document.getElementById("login-screen").style.display = "none";
            document.getElementById("dashboard").style.display  = "block";
            const totalEl = document.getElementById("totalPops");
            if (totalEl) totalEl.innerText = (window.popsList || []).length || 76;
            if (typeof initUI === "function") initUI();
        } else {
            document.getElementById("login-screen").style.display = "flex";
            document.getElementById("dashboard").style.display   = "none";
        }
    });

    return { auth, signInWithEmailAndPassword };
}

// ── Login ──────────────────────────────────────────────────────
async function logar() {
    const email = document.getElementById("user").value.trim();
    const senha = document.getElementById("pass").value.trim();

    if (!email || !senha) return alert("Preencha e-mail e senha!");

    try {
        const { auth, signInWithEmailAndPassword } = await inicializarAuth();
        await signInWithEmailAndPassword(auth, email, senha);
    } catch (err) {
        const msgs = {
            "auth/invalid-credential":    "E-mail ou senha incorretos.",
            "auth/user-not-found":        "Usuário não encontrado.",
            "auth/wrong-password":        "Senha incorreta.",
            "auth/too-many-requests":     "Muitas tentativas. Aguarde alguns minutos.",
            "auth/invalid-email":         "E-mail inválido."
        };
        alert(msgs[err.code] || "Erro ao fazer login: " + err.message);
    }
}

// ── Logout ─────────────────────────────────────────────────────
async function efetuarLogout() {
    if (!window._auth) return;
    await window._signOut(window._auth);
}

// ── Inicia monitoramento ao carregar ───────────────────────────
inicializarAuth();
