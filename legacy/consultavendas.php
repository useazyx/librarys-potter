<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Consulta de Vendas</title>
    <link rel="stylesheet" href="consultavendas.css"> <!-- Link para o CSS -->
</head>

<body>
    <div class="wrapper">
        <h1>Consulta de Vendas</h1>
        <form method="post" action="consultavendas2.php">
            <div class="input-box">
                <input type="text" id="cv" placeholder="Digite o Código da Venda" name="cv" required>
            </div>
            <div class="btn-group">
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
            die("Ocorreu erro na conexão: " . $conexao->connect_error);
        }

        $consultasql = "SELECT * FROM vendas";
        $query = mysqli_query($conexao, $consultasql);

        $num_linhas = mysqli_num_rows($query);

        if ($num_linhas > 0) {
            echo "<table class='result-table'>";
            echo "<tr>
                    <th>Código - Venda</th>
                    <th>Código - Livro</th>
                    <th>Email</th>
                    <th>Data </th>
                    <th>Quantidade </th>
                    </tr>";

            while ($linha = mysqli_fetch_array($query)) {
                echo "<tr>
                        <td>" . $linha["id_venda"] . "</td>
                        <td>" . $linha["id_livro"] . "</td>
                        <td>" . $linha["email"] . "</td>
                        <td>" . $linha["data_venda"] . "</td>
                        <td>" . $linha["quantidade"] . "</td>
                        </tr>";
            }
            echo "</table>";
        } else {
            echo "<p class='no-records'>Não há registros para mostrar!</p>";
        }

        $conexao->close();
        ?>

        <a href="menuconsulta.php" class="back-link">Voltar</a>
    </div>
</body>

</html>
