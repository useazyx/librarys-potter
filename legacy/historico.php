<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Consulta</title>
    <link rel="stylesheet" href="historico.css"> <!-- Supondo que o CSS esteja em 'styles.css' -->
</head>

<body>
    <div class="wrapper">
        <form method="post" action="historico2.php">
            <h1>Histórico - Busca</h1>
            <div class="input-box">
                <input type="text" id="cv" placeholder="Digite o Código da Venda" name="cv">
            </div>
            <div class="form-actions">
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

        $consultasql = "SELECT * FROM vendas";
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
    </div>
</body>

</html>
