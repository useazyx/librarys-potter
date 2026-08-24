<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cadastro de Editoras</title>
</head>

<body>
    <?php
    session_start();

    function conectarBanco()
    {
        $servidor = "localhost";
        $usuario = "root";
        $senha = "";
        $nomeBD = "trabalhoguizela";

        $conexao = new mysqli($servidor, $usuario, $senha, $nomeBD);

        if ($conexao->connect_error) {
            die("Ocorreu erro na conexão: " . $conexao->connect_error);
        }
        return $conexao;
    }

    $conexao = conectarBanco();


    if (isset($_POST['na']) && isset($_POST['pa'])) {
        $nome = $_POST['na'];
        $cidade = $_POST['pa'];

        $stmt = $conexao->prepare("INSERT INTO editoras (nome, cidade) VALUES (?, ?)");
        $stmt->bind_param("ss", $nome, $cidade);

        if ($stmt->execute()) {
            echo "<p>Informações cadastradas com sucesso!</p>";
            echo "<meta http-equiv='refresh' content='2; URL=cadastros.php'>";
        } else {
            echo "Erro ao cadastrar: " . $stmt->error;
        }

        $stmt->close();
    } else {
        echo "Erro: <br>" . $conexao->error . "Clique aqui para voltar: <a href='cadastros.php'> voltar </a>";
    }

    $conexao->close();
    ?>
</body>

</html>