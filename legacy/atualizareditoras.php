<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Atualização de Editoras</title>
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
        die("Erro na conexão: " . $conexao->connect_error);
    }

    $ce = $_POST['ce'];
    $en = $_POST['en'];
    $ep = $_POST['ep'];

    $stmt = $conexao->prepare("UPDATE editoras SET nome = ?, cidade = ? WHERE id_editora = ?");
    $stmt->bind_param('ssi', $en, $ep, $ce);

    if ($stmt->execute()) {
        echo "<p>Informações Atualizadas com sucesso!</p>";
        echo "<meta http-equiv='refresh' content='0; URL=menuatualizacao.php'>";
    } else {
        echo "Erro: " . $stmt->error . " Clique aqui para <a href='menuatualizacao.php'>voltar</a>";
    }

    $stmt->close();
    $conexao->close();
    ?>
</body>

</html>