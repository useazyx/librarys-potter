<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Consulta</title>
    <link rel="stylesheet" href="consultaforn.css">
</head>

<body>
    <div class="wrapper">
        <h1>Consulta de Fornecedores</h1>
        <form method="post" action="consultaforn2.php">
            <div class="input-box">
                <input type="text" id="cf" placeholder="Digite o Código do Fornecedor" name="cf">
            </div>
            <div class="button-group">
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

        $consultasql = "SELECT * FROM usuarios WHERE tipo_usuario = 'fornecedor'";
        $query = mysqli_query($conexao, $consultasql);

        $num_linhas = mysqli_num_rows($query);

        if ($num_linhas > 0) {
            echo "<table class='table'>";
            echo "<tr>
                        <th>Código</th>
                        <th>Nome</th>
                        <th>Email</th>
                    </tr>";

            while ($linha = mysqli_fetch_array($query)) {
                echo "<tr>
                            <td>" . $linha["id"] . "</td>
                            <td>" . $linha["nome"] . "</td>
                            <td>" . $linha["email"] . "</td>
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
