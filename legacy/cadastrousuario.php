<!DOCTYPE html>
<html>

<head>
   <meta charset="UTF-8">
   <title>Redirecionamento de Cadastro do Usuário</title>
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

   $CN1 = $_POST['cn1'];
   $CE1 = $_POST['ce1'];
   $CS1 = $_POST['cs1'];
   $TU = 'comum';
   $sql = "INSERT INTO usuarios (nome, email, senha, tipo_usuario) VALUES ('$CN1', '$CE1', '$CS1', '$TU')";
   if ($conexao->query($sql) === TRUE) {
      echo "<meta http-equiv='refresh' content='0; URL=login.html'>";
   } else {
      echo "Realização de Cadastro mal-sucedida: <a href='login.html'>clique aqui</a>.";
   }
   $conexao->close();
   ?>
</body>

</html>