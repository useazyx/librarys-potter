<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Atualização de Livros</title>
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

    $cf = $_POST['cf'];
    $lt = $_POST['lt'];
    $li = $_POST['li'];
    $la = $_POST['la'];
    $le = $_POST['le'];
    $ld = $_POST['ld'];
    $lp = $_POST['lp'];
    $les = $_POST['les'];

    $stmt = $conexao->prepare("UPDATE livros SET titulo = ?, isbn = ?, id_autor = ?, id_editora = ?, data_publicacao = ?, preço = ?, estoque = ? WHERE id_livro = ?");
    $stmt->bind_param('ssiiisdi', $lt, $li, $la, $le, $ld, $lp, $les, $cf);

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