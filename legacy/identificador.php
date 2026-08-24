<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>library</title>
    <link rel="stylesheet" href="index.css">
</head>
<body>
    <?php
    session_start();
    $servidor = "localhost";
    $usuario = "root";
    $senha = "";
    $nomeBD = "trabalhoguizela";


    $conexao = new mysqli($servidor, $usuario, $senha, $nomeBD);
    if ($conexao->connect_error) {
        die("Erro de conexão: " . $conexao->connect_error);
    }


    if ($_SESSION['tipo_usuario'] == 'comum') {
            header("Location: index_usuario.html");
        } elseif ($_SESSION['tipo_usuario'] == 'fornecedor') {
            header("Location: index_fornecedor.html");
        } elseif ($_SESSION['tipo_usuario'] == 'suporte') {
            header("Location: index_suporte.html");
        }

     else {
        header("Location: index_usuario.html");
    }

    ?>

    <h1> fasfsafsdafasfsafasf </h1>

</body>

</html>