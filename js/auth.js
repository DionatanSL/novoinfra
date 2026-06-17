// E-mails com acesso de administrador (podem aprovar usuários)
const ADMINS = ["lima.soares.dionatan@gmail.com"];

let _auth = null;
let _db   = null;

async function getFirebaseAuth() {
    if (_auth) return _auth;
    const { initializeApp, getApps } = await import("https://www.gstatic.com/firebasejs/11.9.0/firebase-app.js");
    const { getAuth } = await import("https://www.gstatic.com/firebasejs/11.9.0/firebase-auth.js");
    if (!getApps().length) initializeApp(window.firebaseConfig);
    _auth = getAuth();
    window._auth = _auth;
    return _auth;
}

async function getFirebaseDB() {
    if (_db) return _db;
    const { initializeApp, getApps } = await import("https://www.gstatic.com/firebasejs/11.9.0/firebase-app.js");
    const { getFirestore } = await import("https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js");
    if (!getApps().length) initializeApp(window.firebaseConfig);
    _db = getFirestore();
    return _db;
}

// ── Alterna entre telas de login / cadastro / pendente ─────────
function alternarTela(tela) {
    document.getElementById("box-login").style.display    = tela === "login"    ? "flex" : "none";
    document.getElementById("box-register").style.display = tela === "register" ? "flex" : "none";
    document.getElementById("box-pendente").style.display = tela === "pendente" ? "flex" : "none";
}

// ── Login ──────────────────────────────────────────────────────
async function logar() {
    const email = document.getElementById("user").value.trim();
    const senha = document.getElementById("pass").value.trim();
    if (!email || !senha) return alert("Preencha e-mail e senha!");

    try {
        const { signInWithEmailAndPassword } = await import("https://www.gstatic.com/firebasejs/11.9.0/firebase-auth.js");
        const auth = await getFirebaseAuth();
        await signInWithEmailAndPassword(auth, email, senha);
        // onAuthStateChanged cuida do próximo passo
    } catch (err) {
        const msgs = {
            "auth/invalid-credential": "E-mail ou senha incorretos.",
            "auth/user-not-found":     "Usuário não encontrado.",
            "auth/wrong-password":     "Senha incorreta.",
            "auth/too-many-requests":  "Muitas tentativas. Aguarde alguns minutos.",
            "auth/invalid-email":      "E-mail inválido."
        };
        alert(msgs[err.code] || "Erro ao fazer login: " + err.message);
    }
}

// ── Cadastro (cria conta + salva no Firestore como pendente) ───
async function solicitarCadastro() {
    const nome  = document.getElementById("reg-nome").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const senha = document.getElementById("reg-senha").value.trim();
    const cargo = document.getElementById("reg-cargo").value.trim();

    if (!nome || !email || !senha) return alert("Preencha nome, e-mail e senha!");
    if (senha.length < 6) return alert("A senha precisa ter pelo menos 6 caracteres.");

    const btn = document.querySelector("#box-register button");
    btn.disabled    = true;
    btn.textContent = "Enviando...";

    try {
        const { createUserWithEmailAndPassword, signOut } = await import("https://www.gstatic.com/firebasejs/11.9.0/firebase-auth.js");
        const { collection, addDoc } = await import("https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js");

        const auth = await getFirebaseAuth();
        const db   = await getFirebaseDB();

        const cred = await createUserWithEmailAndPassword(auth, email, senha);

        await addDoc(collection(db, "usuarios"), {
            uid:          cred.user.uid,
            nome,
            email,
            cargo:        cargo || "Não informado",
            status:       "pendente",
            criadoEm:     new Date().toISOString()
        });

        // Faz logout imediato — só entra após aprovação
        await signOut(auth);
        alternarTela("pendente");

    } catch (err) {
        const msgs = {
            "auth/email-already-in-use": "Este e-mail já está cadastrado.",
            "auth/invalid-email":        "E-mail inválido.",
            "auth/weak-password":        "Senha muito fraca (mínimo 6 caracteres)."
        };
        alert(msgs[err.code] || "Erro ao cadastrar: " + err.message);
    } finally {
        btn.disabled    = false;
        btn.textContent = "ENVIAR SOLICITAÇÃO";
    }
}

// ── Verifica se o usuário logado está aprovado ─────────────────
async function verificarAprovacao(user) {
    const { collection, getDocs, query, where } = await import("https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js");
    const { signOut } = await import("https://www.gstatic.com/firebasejs/11.9.0/firebase-auth.js");
    const db = await getFirebaseDB();

    // Admins sempre têm acesso
    if (ADMINS.includes(user.email)) return "admin";

    const q    = query(collection(db, "usuarios"), where("uid", "==", user.uid));
    const snap = await getDocs(q);

    if (snap.empty) {
        // Conta criada sem registro (ex: criada direto no console)
        return "aprovado";
    }

    return snap.docs[0].data().status || "pendente";
}

// ── Monitora estado de autenticação ───────────────────────────
async function inicializarAuth() {
    const { onAuthStateChanged, signOut } = await import("https://www.gstatic.com/firebasejs/11.9.0/firebase-auth.js");
    const auth = await getFirebaseAuth();

    window._signOut = signOut;

    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            document.getElementById("login-screen").style.display = "flex";
            document.getElementById("dashboard").style.display    = "none";
            alternarTela("login");
            return;
        }

        const status = await verificarAprovacao(user);

        if (status === "pendente") {
            document.getElementById("login-screen").style.display = "flex";
            document.getElementById("dashboard").style.display    = "none";
            alternarTela("pendente");
            return;
        }

        // Acesso liberado
        window.loggedUser  = user.email;
        window.isAdmin     = (status === "admin");

        document.getElementById("login-screen").style.display = "none";
        document.getElementById("dashboard").style.display    = "block";

        // Mostra menu de usuários só para admin
        const menuUsuarios = document.getElementById("menu-usuarios");
        if (menuUsuarios) menuUsuarios.style.display = window.isAdmin ? "block" : "none";

        const totalEl = document.getElementById("totalPops");
        if (totalEl) totalEl.innerText = (window.popsList || []).length || 76;

        if (typeof initUI === "function") initUI();
    });
}

// ── Logout ─────────────────────────────────────────────────────
async function efetuarLogout() {
    const auth = await getFirebaseAuth();
    const { signOut } = await import("https://www.gstatic.com/firebasejs/11.9.0/firebase-auth.js");
    await signOut(auth);
}

// ── Admin: carrega tabelas de usuários ─────────────────────────
async function carregarUsuarios() {
    if (!window.isAdmin) return;
    const { collection, getDocs, query, orderBy } = await import("https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js");
    const db = await getFirebaseDB();

    const snap      = await getDocs(query(collection(db, "usuarios"), orderBy("criadoEm", "desc")));
    const pendentes = [];
    const aprovados = [];

    snap.forEach(d => {
        const u = { docId: d.id, ...d.data() };
        (u.status === "pendente" ? pendentes : aprovados).push(u);
    });

    const fmt = iso => iso ? new Date(iso).toLocaleString("pt-BR") : "—";

    document.getElementById("badge-pendentes").textContent = pendentes.length;
    document.getElementById("badge-aprovados").textContent = aprovados.length;

    document.getElementById("tabela-pendentes").innerHTML = pendentes.length
        ? pendentes.map(u => `
            <tr>
                <td>${u.nome}</td>
                <td>${u.email}</td>
                <td>${u.cargo}</td>
                <td style="font-size:0.78rem">${fmt(u.criadoEm)}</td>
                <td style="text-align:center">
                    <button class="btn btn-sm btn-success me-1" onclick="aprovarUsuario('${u.docId}')">✔ Aprovar</button>
                    <button class="btn btn-sm btn-danger"  onclick="rejeitarUsuario('${u.docId}', '${u.uid}')">✖ Rejeitar</button>
                </td>
            </tr>`).join("")
        : `<tr><td colspan="5" style="text-align:center; color:#64748b;">Nenhuma solicitação pendente</td></tr>`;

    document.getElementById("tabela-aprovados").innerHTML = aprovados.length
        ? aprovados.map(u => `
            <tr>
                <td>${u.nome}</td>
                <td>${u.email}</td>
                <td>${u.cargo}</td>
                <td style="font-size:0.78rem">${fmt(u.aprovadoEm)}</td>
                <td style="text-align:center">
                    <button class="btn btn-sm btn-danger" onclick="revogarUsuario('${u.docId}')">🚫 Revogar</button>
                </td>
            </tr>`).join("")
        : `<tr><td colspan="5" style="text-align:center; color:#64748b;">Nenhum usuário aprovado</td></tr>`;
}

async function aprovarUsuario(docId) {
    const { doc, updateDoc } = await import("https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js");
    const db = await getFirebaseDB();
    await updateDoc(doc(db, "usuarios", docId), {
        status:     "aprovado",
        aprovadoEm: new Date().toISOString(),
        aprovadoPor: window.loggedUser
    });
    await carregarUsuarios();
}

async function rejeitarUsuario(docId, uid) {
    if (!confirm("Rejeitar e remover este cadastro?")) return;
    const { doc, deleteDoc } = await import("https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js");
    const db = await getFirebaseDB();
    await deleteDoc(doc(db, "usuarios", docId));
    await carregarUsuarios();
}

async function revogarUsuario(docId) {
    if (!confirm("Revogar acesso deste usuário?")) return;
    const { doc, updateDoc } = await import("https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js");
    const db = await getFirebaseDB();
    await updateDoc(doc(db, "usuarios", docId), { status: "pendente" });
    await carregarUsuarios();
}

// ── Inicia ao carregar ─────────────────────────────────────────
inicializarAuth();
