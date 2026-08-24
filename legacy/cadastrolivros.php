<html lang="pt-br">

<head>
   <meta charset="UTF-8">
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   <title>Cadastro de Livros</title>
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

   $tl = $_POST['tl'];
   $gl = $_POST['gl'];
   $il = $_POST['il'];
   $id_autor = $_POST['id_autor'];
   $id_editora = $_POST['id_editora'];
   $dl = $_POST['dl'];
   $pl = $_POST['pl'];
   $ql = $_POST['ql'];


   $sql = "INSERT INTO livros (titulo, isbn, id_autor, id_editora, data_publicacao, preço, estoque, genero) VALUES ('$tl', '$il', '$id_autor', '$id_editora', '$dl', '$pl', '$ql', '$gl')";
   if ($conexao->query($sql) === TRUE) {
      echo "<p>Informações cadastradas com sucesso!</p>";
      echo "<meta http-equiv='refresh' content='0; URL=cadastros.php'>";
   } else {
      echo "Erro:" . $sql . "<br>" . $conexao->error . "Clique aqui para voltar: <a href='cadastros.php'> voltar </a>";
   }
   ?>

</body>

</html>