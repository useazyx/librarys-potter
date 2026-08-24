<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Consulta de Livros</title>
    <link rel="stylesheet" href="consultalivros.css">
</head>

<body>
    <div class="wrapper">
        <h1>Consulta de Livros</h1>
        <form method="post" action="consultalivros2.php">
            <div class="input-box">
                <input type="text" id="cl" name="cl" placeholder="Digite o Código do Livro">
            </div>
            <div class="form-buttons">
                <button type="submit" class="btn">Consultar</button>
                <button type="reset" class="btn">Limpar Dados</button>
            </div>
        </form>

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

        $consultasql = "SELECT * FROM livros";
        $query = mysqli_query($conexao, $consultasql);

        $num_linhas = mysqli_num_rows($query);

        if ($num_linhas > 0) {
            echo "<table class='table'>";
            echo "<tr>
                        <th>Código</th>
                        <th>Título</th>
                        <th>Gênero</th>
                        <th>ISBN</th>
                        <th>Data de Pub.</th>
                    </tr>";

            while ($linha = mysqli_fetch_array($query)) {
                echo "<tr>
                            <td>" . $linha["id_livro"] . "</td>
                            <td>" . $linha["titulo"] . "</td>
                            <td>" . $linha["genero"] . "</td>
                            <td>" . $linha["isbn"] . "</td>
                            <td>" . $linha["data_publicacao"] . "</td>
                        </tr>";
            }
            echo "</table>";
        } else {
            echo "<p>Não há registros para mostrar!</p>";
        }

        $conexao->close();
        ?>

        <a href="menuconsulta.php" class="back-link">Voltar</a>
    </div>
</body>

</html>
