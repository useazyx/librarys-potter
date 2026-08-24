<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Consulta</title>
    <link rel="stylesheet" href="consultaeditoras2.css">
</head>

<body>
    <div class="wrapper">
        <h1>Consulta de Editoras</h1>

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

        $ce = $_POST["ce"];

        $consultasql = "SELECT * FROM editoras WHERE id_editora = $ce";
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

        <a href="consultaeditoras.php" class="btn-back">Voltar</a>
    </div>
</body>

</html>
