<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Consulta</title>
    <link rel="stylesheet" href="consultauser.css">
</head>

<body>
    <div class="wrapper">
        <h1>Consulta de Usuários</h1>

        <form method="post" action="consultauser2.php">
            <div class="input-box">
                <label for="cu">Código do Usuário</label>
                <input type="text" id="cu" placeholder="Digite o Código do Usuário" name="cu" required>
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

        $consultasql = "SELECT * FROM usuarios WHERE tipo_usuario = 'comum'";
        $query = mysqli_query($conexao, $consultasql);

        $num_linhas = mysqli_num_rows($query);

        if ($num_linhas > 0) {
            echo "<table class='user-table'>
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Nome</th>
                            <th>Email</th>
                        </tr>
                    </thead>
                    <tbody>";
            while ($linha = mysqli_fetch_array($query)) {
                echo "<tr>
                        <td>" . $linha["id"] . "</td>
                        <td>" . $linha["nome"] . "</td>
                        <td>" . $linha["email"] . "</td>
                    </tr>";
            }
            echo "</tbody></table>";
        } else {
            echo "<p class='no-records'>Não há registros para mostrar!</p>";
        }

        $conexao->close();
        ?>

        <div class="back-link">
            <a href="menuconsulta.php">Voltar</a>
        </div>
    </div>
</body>

</html>
