<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Consulta</title>
    <link rel="stylesheet" href="consultasup2.css"> <!-- Adiciona o link do CSS -->
</head>

<body>

    <div class="container">
        <div class="wrapper">
            <h1>Consulta - Suporte</h1>

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

            $cs = $_POST["cs"];

            $consultasql = "SELECT * FROM cadastrosup WHERE id = $cs";
            $query = mysqli_query($conexao, $consultasql);

            $num_linhas = mysqli_num_rows($query);

            if ($num_linhas > 0) {
                echo "<table class='table'>";
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

            <a href="consultasup.php" class="back-link">Voltar</a>
        </div>
    </div>
    
</body>

</html>
