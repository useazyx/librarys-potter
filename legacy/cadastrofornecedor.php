<!DOCTYPE html>
<html>

<head>
   <meta charset="UTF-8">
   <title>Redirecionamento de Cadastro do Fornecedor</title>
</head>

<body>
   <?php

   $servidor = "localhost";
   $usuario = "root";
   $senha = "";
   $nomeBD = "trabalhoguizela";

   $conexao = new mysqli($servidor, $usuario, $senha, $nomeBD);

   if ($conexao->connect_error) {
      die("Ocorreu erro na conexão" . $conexao->connect_error);
   }

   $CN2 = $_POST['cn2'];
   $CE2 = $_POST['ce2'];
   $CS2 = $_POST['cs2'];
   $TU = 'fornecedor';
   $sql = "INSERT INTO usuarios (nome, email, senha, tipo_usuario) VALUES ('$CN2', '$CE2', '$CS2', '$TU')";
   if ($conexao->query($sql) === TRUE) {
      echo "<meta http-equiv='refresh' content='0; URL=login.html'>";
   } else {
      echo "Realização de Cadastro mal-sucedida: <a href='login.html'>clique aqui</a>.";
   }
   $conexao->close();
   ?>
</body>

</html>