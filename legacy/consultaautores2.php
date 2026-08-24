<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Consulta de Autor</title>
    <link rel="stylesheet" href="consultaautores2.css">
</head>

<body>

    <div class="wrapper">
        <h1>Consulta de Autor</h1>

        <form method="post" action="consultaautores.php">
            <div class="input-box">
                <label for="ca">Digite o Código do Autor:</label>
                <input type="text" id="ca" placeholder="Código do Autor" name="ca" required>
            </div>
            <button type="submit" class="btn">Consultar</button>
        </form>

        <?php
        session_start();
        $servidor = "localhost";
        $usuario = "root";
        $senha = "";
        $nomeBD = "trabalhoguizela";

        $conexao = new mysqli($servidor, $usuario, $senha, $nomeBD);

        if ($conexao->connect_error) {
            die("Erro na conexão: " . $conexao->connect_error);
        }

        if (isset($_POST["ca"])) {
            $ca = $_POST["ca"];

            $consultasql = "SELECT * FROM autores WHERE id_autor = $ca";
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
        }

        $conexao->close();
        ?>

        <a href="consultaautores.php" class="back-link">Voltar</a>
    </div>

</body>
</html>
