<!DOCTYPE html>
<html>

<head>
   <meta charset="UTF-8">
   <title>Redirecionamento de Cadastro do Suporte</title>
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

   $CN3 = $_POST['cn3'];
   $CE3 = $_POST['ce3'];
   $CS3 = $_POST['cs3'];
   $TU = 'suporte';
   $sql = "INSERT INTO usuarios (nome, email, senha, tipo_usuario) VALUES ('$CN3', '$CE3', '$CS3', '$TU')";
   if ($conexao->query($sql) === TRUE) {
      echo "<meta http-equiv='refresh' content='0; URL=login.html'>";
   } else {
      echo "Realização de Cadastro mal-sucedida: <a href='login.html'>clique aqui</a>.";
   }
   $conexao->close();
   ?>
</body>

</html>