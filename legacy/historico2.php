<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Consulta</title>
    <link rel="stylesheet" href="historico2.css"> <!-- Supondo que o CSS esteja em 'styles.css' -->
</head>

<body>
    <div class="wrapper">
        <h1>Consulta de Venda</h1>
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

        $cv = $_POST["cv"];

        $consultasql = "SELECT * FROM vendas WHERE id_venda = '$cv'";
        $query = mysqli_query($conexao, $consultasql);

        $num_linhas = mysqli_num_rows($query);

        if ($num_linhas > 0) {
            echo "<table>";
            echo "<thead><tr>
                        <th>Código - Venda</th>
                        <th>Código - Livro</th>
                        <th>Email - Usuário</th>
                        <th>Data</th>
                        <th>Quantidade</th>
                    </tr></thead>";
            echo "<tbody>";
            while ($linha = mysqli_fetch_array($query)) {
                echo "<tr>
                            <td>" . $linha["id_venda"] . "</td>
                            <td>" . $linha["id_livro"] . "</td>
                            <td>" . $linha["email"] . "</td>
                            <td>" . $linha["data_venda"] . "</td>
                            <td>" . $linha["quantidade"] . "</td>
                        </tr>";
            }
            echo "</tbody></table>";
        } else {
            echo "<p class='msg'>Não há registros para mostrar!</p>";
        }

        $conexao->close();
        ?>

        <a href="historico.php" class="btn-back">Voltar</a>
    </div>
</body>

</html>
