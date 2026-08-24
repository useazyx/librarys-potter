<html lang="pt-br">

<head>
   <meta charset="UTF-8">
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   <title>Cadastro de Autores</title>
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
      die("Ocorreu erro na conexão" . $conexao->connect_error);
   }

   $na = $_POST['na'];
   $pa = $_POST['pa'];


   $sql = "INSERT INTO autores (nome, nacionalidade) VALUES ('$na', '$pa')";
   if ($conexao->query($sql) === TRUE) {
      echo "<p>Informações cadastradas com sucesso!</p>";
      echo "<meta http-equiv='refresh' content='0; URL=cadastros.php'>";
   } else {
      echo "Erro:" . $sql . "<br>" . $conexao->error . "Clique aqui para voltar: <a href='cadastros.php'> voltar </a>";
   }
   ?>

</body>

</html>