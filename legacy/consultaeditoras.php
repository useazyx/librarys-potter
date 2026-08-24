<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Consulta de Editoras</title>
    <link rel="stylesheet" href="consultaeditoras.css">
</head>

<body>
    <div class="wrapper">
        <form method="post" action="consultaeditoras2.php" class="form-consulta">
            <h1>Consulta de Editoras</h1>
            <div class="input-box">
                <input type="text" id="ce" placeholder="Digite o Código da Editora" name="ce">
            </div>
            <div class="form-buttons">
                <button type="submit" class="btn">Consultar</button>
                <button type="reset" class="btn btn-reset">Limpar Dados</button>
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

        $consultasql = "SELECT * FROM editoras";
        $query = mysqli_query($conexao, $consultasql);

        $num_linhas = mysqli_num_rows($query);

        if ($num_linhas > 0) {
            echo "<table class='tabela-consulta'>";
            echo "<tr>
                        <th>Código</th>
                        <th>Nome</th>
                        <th>Cidade</th>
                    </tr>";

            while ($linha = mysqli_fetch_array($query)) {
                echo "<tr>
                            <td>" . $linha["id_editora"] . "</td>
                            <td>" . $linha["nome"] . "</td>
                            <td>" . $linha["cidade"] . "</td>
                        </tr>";
            }
            echo "</table>";
        } else {
            echo "<p class='no-records'>Não há registros para mostrar!</p>";
        }

        $conexao->close();
        ?>
        <a href="menuconsulta.php" class="btn-back">Voltar</a>
    </div>
</body>

</html>
