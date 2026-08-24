<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Menu</title>
    <link rel="stylesheet" href="menuconsulta.css">
</head>

<body>
    <?php
    session_start();
    $servidor = "localhost";
    $usuario = "root";
    $senha = "";
    $nomeBD = "trabalhoguizela";

    $conexao = new mysqli($servidor, $usuario, $senha, $nomeBD);

    if ($_SESSION['tipo_usuario'] == 'comum') {
        echo "<meta http-equiv='refresh' content='0; URL=index_usuario.php'>";
    } elseif ($_SESSION['tipo_usuario'] == 'fornecedor') {
        echo "<div class='wrapper'>
                <h1>Consultas - Fornecedor</h1>
                <button class='btn'><a href='consultalivros.php'>Livros</a></button>
                <button class='btn'><a href='consultaautores.php'>Autores</a></button>
                <button class='btn'><a href='consultaeditoras.php'>Editoras</a></button>
                <button class='btn'><a href='consultaavaliacoes.php'>Avaliações</a></button>
                <br>&nbsp
                <button class='btn'><a href='identificador.php'>Voltar a página Inicial</a></button>
              </div>";
    } elseif ($_SESSION['tipo_usuario'] == 'suporte') {
        echo "<div class='wrapper'>
                <h1>Consultas - Suporte</h1>
                <button class='btn'><a href='consultalivros.php'>Livros</a></button>
                <button class='btn'><a href='consultaautores.php'>Autores</a></button>
                <button class='btn'><a href='consultaeditoras.php'>Editoras</a></button>
                <button class='btn'><a href='consultauser.php'>Usuários</a></button>
                <button class='btn'><a href='consultaforn.php'>Fornecedores</a></button>
                <button class='btn'><a href='consultasup.php'>Suportes</a></button>
                <button class='btn'><a href='consultavendas.php'>Vendas</a></button>
                <button class='btn'><a href='consultaavaliacoes.php'>Avaliações</a></button>
                <br>&nbsp
                <button class='btn'><a href='identificador.php'>Voltar a página Inicial</a></button>
              </div>";
    } else {
        echo "<meta http-equiv='refresh' content='0; URL=index.html'>";
    }
    ?>
</body>

</html>
