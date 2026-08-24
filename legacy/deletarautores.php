<html lang="pt-br">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title></title>
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
    die("Ocorreu erro na conexão: " . $conexao->connect_error);
  }

  $ca = $_POST['ca'];

  $stmt = $conexao->prepare("DELETE FROM autores WHERE id_autor = ?");
  $stmt->bind_param('i', $ca);

  if ($stmt->execute()) {
    echo "<p>Informações deletadas com sucesso!</p>";
    echo "<meta http-equiv='refresh' content='0; URL=menudeletar.php'>";
  } else {
    echo "Erro: " . $stmt->error . " Clique aqui para <a href='menudeletar.php'>voltar</a>";
  }

  $stmt->close();
  $conexao->close();
  ?>
</body>

</html>