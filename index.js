import session from 'express-session';
import cookieParser from 'cookie-parser';
import express from 'express';

const host = '0.0.0.0'; 
const porta = 3000; 

const app = express();
let listaLivros = [];
let listaLeitores = [];

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'chave_secreta',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 30 * 60 * 1000 }
}));

function estaAutenticado(req, res, next) {
    if (req.session.logado) {
        next();
    } else {
        res.send(`
        <!DOCTYPE html>
        <html lang="pt-br">
        <head>
            <meta charset="UTF-8">
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
        </head>

        <body class="container mt-5">

            <div class="alert alert-warning text-center">
                <h4>Acesso negado</h4>
                <p>Você precisa estar logado para acessar esta página.</p>
                <a href="/login" class="btn btn-primary">Ir para Login</a>
            </div>

        </body>
        </html>
`);
    }
}

app.get('/', estaAutenticado, (req, res) => {
    const ultimoAcesso = req.cookies.ultimoAcesso;
    res.cookie("ultimoAcesso", new Date().toLocaleString());
    res.send(`
       <!DOCTYPE html>
       <html lang="pt-br">
            <head>
                <meta charset="UTF-8">
                <title>Menu do sistema</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
            </head>

            <body>

            <nav class="navbar navbar-expand-lg bg-body-tertiary">
            <div class="container-fluid">
            <a class="navbar-brand" href="/">MENU</a>

            <div class="collapse navbar-collapse">
            <ul class="navbar-nav me-auto">

                <li class="nav-item">
                    <a class="nav-link" href="/login">Login</a>
                </li>

                <li class="nav-item">
                    <a class="nav-link" href="/livro">Cadastro de Livros</a>
                </li>

                <li class="nav-item">
                    <a class="nav-link" href="/leitor">Cadastro de Leitores</a>                
                </li>

                <li class="nav-item">
                    <a class="nav-link" href="/logout">Logout</a>
                </li>

            </ul>
        </div>
    </div>
</nav>

    
        <div class="container d-flex flex-column justify-content-center align-items-center text-center" style="height: 70vh;">
                
                <h2 class="mb-3">Bem-vindo ao sistema</h2>
                <p class="text-muted">
                    Último acesso: ${ultimoAcesso || "Primeiro acesso"}
                </p>

        </div>


            </body>
       </html>
    `);
});

app.get('/login', (req, res) => {
    res.send(`
    <!DOCTYPE html>

<head>
    <meta charset="utf-8">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet"
        integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
</head>

<body>
    <div class="container w-25">
        <form action='/login' method='POST' class="row g-3 needs-validation" novalidate>
            <fieldset class="border p-2">
                <legend class="mb-3">Autenticação do Sistema</legend>
                <div class="col-md-4">
                    <label for="" class="form-label">Usuário:</label>
                    <input type="text" class="form-control" id="usuario" name="usuario" required>
                </div>
                <div class="col-md-4">
                    <label for="senha" class="form-label">Senha</label>
                    <input type="password" class="form-control" id="senha" name="senha" required>
                </div>
                <div class="col-12 mt-2">
                    <button class="btn btn-primary" type="submit">Login</button>
                </div>
            </fieldset>
        </form>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM"
        crossorigin="anonymous"></script>
</body>

</html>
    `);
});

app.post('/login', (req, res) => {
    const { usuario, senha } = req.body;

    if (usuario === "admin" && senha === "123") {
        req.session.logado = true;
        req.session.usuario = usuario;

        const data = new Date();
        res.cookie("ultimoAcesso", data.toLocaleString());

        res.redirect('/');
    } else {
        res.send(`
        <!DOCTYPE html>
        <html lang="pt-br">
        <head>
            <meta charset="UTF-8">
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
        </head>

        <body class="container mt-5">

            <div class="alert alert-danger text-center">
                <h4>Login inválido</h4>
                <p>Usuário ou senha incorretos.</p>
                <a href="/login" class="btn btn-primary">Tentar novamente</a>
            </div>

        </body>
        </html>
`);
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});


app.get('/livro', estaAutenticado, (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
        <meta charset="UTF-8">
        <title>Cadastro de Livro</title>

        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
    </head>

    <body>

    <div class="container mt-4">
        <h2 class="mb-4">Cadastro de Livro</h2>

        <form method="POST" action="/livro">

            <div class="mb-3">
                <label class="form-label">Título do Livro</label>
                <input name="titulo" class="form-control" required>
            </div>

            <div class="mb-3">
                <label class="form-label">Autor</label>
                <input name="autor" class="form-control" required>
            </div>

            <div class="mb-3">
                <label class="form-label">ISBN</label>
                <input name="isbn" class="form-control" required>
            </div>

            <button type="submit" class="btn btn-primary">Cadastrar</button>
            <a href="/" class="btn btn-secondary">Voltar ao Menu</a>

        </form>
    </div>

    </body>
    </html>
    `);
});

app.post('/livro', estaAutenticado, (req, res) => {
    const { titulo, autor, isbn } = req.body;

    if (!titulo || !autor || !isbn) {
        return res.send("Todos os campos são obrigatórios! <a href='/livro'>Voltar</a>");
    }

    listaLivros.push(req.body);
    res.redirect('/listaLivros');
});

app.get('/listaLivros', estaAutenticado, (req, res) => {

    let html = `
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
        <meta charset="UTF-8">
        <title>Lista de Livros</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
    </head>

    <body>

    <div class="container mt-4">
        <h2>Livros Cadastrados</h2>

        <table class="table table-striped table-hover">
            <thead class="table-dark">
                <tr>
                    <th>#</th>
                    <th>Título</th>
                    <th>Autor</th>
                    <th>ISBN</th>
                </tr>
            </thead>
            <tbody>
    `;

    listaLivros.forEach((l, i) => {
        html += `
            <tr>
                <th>${i + 1}</th>
                <td>${l.titulo}</td>
                <td>${l.autor}</td>
                <td>${l.isbn}</td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>

        <a href="/livro" class="btn btn-primary">Novo Livro</a>
        <a href="/" class="btn btn-secondary">Menu</a>
    </div>

    </body>
    </html>
    `;

    res.send(html);
});


app.get('/leitor', estaAutenticado, (req, res) => {

    let opcoesLivros = listaLivros.map(l => 
        `<option value="${l.titulo}">${l.titulo}</option>`
    ).join('');

    res.send(`
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
        <meta charset="UTF-8">
        <title>Cadastro de Leitor</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
    </head>

    <body>
    <div class="container mt-4">
        <h2>Cadastro de Leitor</h2>

        <form method="POST" action="/leitor">

            <div class="mb-3">
                <label class="form-label">Nome</label>
                <input name="nome" class="form-control" required>
            </div>

            <div class="mb-3">
                <label class="form-label">CPF</label>
                <input name="cpf" class="form-control" required>
            </div>

            <div class="mb-3">
                <label class="form-label">Telefone</label>
                <input name="telefone" class="form-control" required>
            </div>

            <div class="mb-3">
                <label class="form-label">Data de Empréstimo</label>
                <input type="date" name="dataEmprestimo" class="form-control" required>
            </div>

            <div class="mb-3">
                <label class="form-label">Data de Devolução</label>
                <input type="date" name="dataDevolucao" class="form-control" required>
            </div>

            <div class="mb-3">
                <label class="form-label">Livro</label>
                <select name="livro" class="form-control" required>
                    <option value="">Selecione um livro</option>
                    ${opcoesLivros}
                </select>
            </div>

            <button class="btn btn-primary">Cadastrar</button>
            <a href="/" class="btn btn-secondary">Menu</a>

        </form>
    </div>
    </body>
    </html>
    `);
});

app.post('/leitor', estaAutenticado, (req, res) => {

    const { nome, cpf, telefone, dataEmprestimo, dataDevolucao, livro } = req.body;

    if (!nome || !cpf || !telefone || !dataEmprestimo || !dataDevolucao || !livro) {
        return res.send("Todos os campos são obrigatórios! <a href='/leitor'>Voltar</a>");
    }

    listaLeitores.push(req.body);

    res.redirect('/listaLeitores');
});

app.get('/listaLeitores', estaAutenticado, (req, res) => {

    let html = `
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
        <meta charset="UTF-8">
        <title>Lista de Leitores</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
    </head>

    <body>

    <div class="container mt-4">
        <h2>Leitores Cadastrados</h2>

        <table class="table table-striped">
            <thead class="table-dark">
                <tr>
                    <th>#</th>
                    <th>Nome</th>
                    <th>CPF</th>
                    <th>Telefone</th>
                    <th>Empréstimo</th>
                    <th>Devolução</th>
                    <th>Livro</th>
                </tr>
            </thead>
            <tbody>
    `;

    listaLeitores.forEach((l, i) => {
        html += `
            <tr>
                <th>${i + 1}</th>
                <td>${l.nome}</td>
                <td>${l.cpf}</td>
                <td>${l.telefone}</td>
                <td>${l.dataEmprestimo}</td>
                <td>${l.dataDevolucao}</td>
                <td>${l.livro}</td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>

        <a href="/leitor" class="btn btn-primary">Novo Leitor</a>
        <a href="/" class="btn btn-secondary">Menu</a>
    </div>

    </body>
    </html>
    `;

    res.send(html);
});


app.listen(porta, host, () => {
    console.log(`Servidor rodando em http://localhost:${porta}`);
});