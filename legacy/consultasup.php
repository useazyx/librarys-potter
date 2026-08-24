<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Consulta</title>
    <link rel="stylesheet" href="consultasup.css"> <!-- Adicionei o link do CSS -->
</head>

<body>
    <div class="container">
        <div class="wrapper">
            <h1>Consulta - Suporte</h1>
            <form method="post" action="consultasup2.php">
                <div class="input-box">
                    <input type="text" id="cs" placeholder="Digite o Código do Suporte" name="cs" required>
                </div>
                <div class="buttons">
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

            $consultasql = "SELECT * FROM usuarios WHERE tipo_usuario = 'suporte'";
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
    </div>
</body>

</html>
