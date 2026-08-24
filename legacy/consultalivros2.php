<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Consulta de Livro</title>
    <link rel="stylesheet" href="consultalivros2.css">
</head>

<body>
    <div class="wrapper">
        <h1>Consulta de Livro</h1>
        
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

        $cl = $_POST["cl"];

        $consultasql = "SELECT * FROM livros WHERE id_livro = $cl";
        $query = mysqli_query($conexao, $consultasql);

        $num_linhas = mysqli_num_rows($query);

        if ($num_linhas > 0) {
            echo "<table class='table'>";
            echo "<tr>
                    <th>Código - Livro</th>
                    <th>Título</th>
                    <th>ISBN</th>
                    <th>Código - Autor</th>
                    <th>Código - Editora</th>
                    <th>Data de Pub.</th>
                    <th>Preço</th>
                    <th>Estoque</th>
                    <th>Gênero</th>
                  </tr>";

            while ($linha = mysqli_fetch_array($query)) {
                echo "<tr>
                        <td>" . $linha["id_livro"] . "</td>
                        <td>" . $linha["titulo"] . "</td>
                        <td>" . $linha["isbn"] . "</td>
                        <td>" . $linha["id_autor"] . "</td>
                        <td>" . $linha["id_editora"] . "</td>
                        <td>" . $linha["data_publicacao"] . "</td>
                        <td>" . $linha["preço"] . "</td>
                        <td>" . $linha["estoque"] . "</td>
                        <td>" . $linha["genero"] . "</td>
                    </tr>";
            }
            echo "</table>";
        } else {
            echo "<p class='no-records'>Não há registros para mostrar!</p>";
        }

        $conexao->close();
        ?>

        <a href="consultalivros.php" class="back-link">Voltar</a>
    </div>
</body>

</html>
