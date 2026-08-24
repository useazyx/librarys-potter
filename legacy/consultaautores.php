<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Consulta de Autores</title>
    <link rel="stylesheet" href="consultaautores.css">
</head>

<body>
    <div class="wrapper">
        <h1>Consulta de Autores</h1>
        <form method="post" action="consultaautores2.php">
            <div class="input-box">
                <label for="ca">Código do Autor:</label>
                <input type="text" id="ca" placeholder="Digite o Código do Autor" name="ca">
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

        $consultasql = "SELECT * FROM autores";
        $query = mysqli_query($conexao, $consultasql);

        $num_linhas = mysqli_num_rows($query);

        if ($num_linhas > 0) {
            echo "<table class='table'>
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Nome</th>
                            <th>Nacionalidade</th>
                        </tr>
                    </thead>
                    <tbody>";
            while ($linha = mysqli_fetch_array($query)) {
                echo "<tr>
                        <td>" . $linha["id_autor"] . "</td>
                        <td>" . $linha["nome"] . "</td>
                        <td>" . $linha["nacionalidade"] . "</td>
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
