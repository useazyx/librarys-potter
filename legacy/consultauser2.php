<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Consulta de Usuário</title>
    <link rel="stylesheet" href="consultauser2.css">
</head>

<body>
    <div class="wrapper">
        <h1>Resultado da Consulta</h1>

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
        $cu = $_POST["cu"];

        $consultasql = "SELECT * FROM usuarios WHERE id = $cu";
        $query = mysqli_query($conexao, $consultasql);

        $num_linhas = mysqli_num_rows($query);

        if ($num_linhas > 0) {
            echo "<table class='user-table'>";
            echo "<tr>
                    <th>Código</th>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Senha</th>
                  </tr>";

            while ($linha = mysqli_fetch_array($query)) {
                echo "<tr>
                        <td>" . $linha["id"] . "</td>
                        <td>" . $linha["nome"] . "</td>
                        <td>" . $linha["email"] . "</td>
                        <td>" . $linha["senha"] . "</td>
                      </tr>";
            }
            echo "</table>";
        } else {
            echo "<p class='no-records'>Não há registros para mostrar!</p>";
        }

        $conexao->close();
        ?>

        <div class="back-link">
            <a href="consultauser.php">Voltar</a>
        </div>
    </div>
</body>

</html>
