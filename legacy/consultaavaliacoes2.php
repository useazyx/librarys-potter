<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Consulta de Avaliações</title>
    <link rel="stylesheet" href="consultaavaliacao2.css">
</head>

<body>
    <div class="wrapper">
        <h1>Consulta de Avaliações</h1>

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

        $consultasql = "SELECT * FROM avaliacoes";
        $query = mysqli_query($conexao, $consultasql);

        $num_linhas = mysqli_num_rows($query);

        if ($num_linhas > 0) {
            echo "<table class='table'>
                    <thead>
                        <tr>
                            <th>Código - Avaliação</th>
                            <th>Código - Livro</th>
                            <th>Email - Usuário</th>
                            <th>Nota</th>
                            <th>Comentário</th>
                            <th>Data</th>
                        </tr>
                    </thead>
                    <tbody>";
            while ($linha = mysqli_fetch_array($query)) {
                echo "<tr>
                        <td>" . $linha["id_avaliacao"] . "</td>
                        <td>" . $linha["id_livro"] . "</td>
                        <td>" . $linha["email_usuario"] . "</td>
                        <td>" . $linha["nota"] . "</td>
                        <td>" . $linha["comentario"] . "</td>
                        <td>" . $linha["data_avaliacao"] . "</td>
                    </tr>";
            }
            echo "</tbody></table>";
        } else {
            echo "<p class='no-records'>Não há registros para mostrar!</p>";
        }

        $conexao->close();
        ?>
        <a href="menuconsulta.php" class="back-link">Voltar</a>
    </div>
</body>

</html>
