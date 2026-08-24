<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Consulta de Avaliações</title>
    <link rel="stylesheet" href="consultaavaliacao.css">
</head>

<body>
    <div class="wrapper">
        <h1>Consulta de Avaliações</h1>
        <form method="post" action="consultaavaliacao2.php">
            <div class="input-box">
                <label for="ca">Código da Avaliação:</label>
                <input type="text" id="ca" placeholder="Digite o Código da Avaliação" name="ca">
            </div>
            <div class="buttons">
                <button type="submit" class="btn">Consultar</button>
                <button type="reset" class="btn reset">Limpar Dados</button>
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
                        </tr>
                    </thead>
                    <tbody>";
            while ($linha = mysqli_fetch_array($query)) {
                echo "<tr>
                        <td>" . $linha["id_avaliacao"] . "</td>
                        <td>" . $linha["id_livro"] . "</td>
                        <td>" . $linha["email_usuario"] . "</td>
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
