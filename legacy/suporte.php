<?php
// Conexão com o banco de dados
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "trabalhoguizela"; // Nome do seu banco de dados

// Criação da conexão
$conn = new mysqli($servername, $username, $password, $dbname);

// Verifica se houve erro na conexão
if ($conn->connect_error) {
    die("Conexão falhou: " . $conn->connect_error);
}

// Consulta os problemas abertos
$sql = "SELECT * FROM problemas WHERE status = 'Aberto' ORDER BY data_criacao DESC";
$result = $conn->query($sql);
?>

<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Suporte - Problemas Pendentes</title>
    <link rel="stylesheet" href="suporte.css">
</head>
<body>
    <div class="wrapper">
        <h1>Problemas Pendentes</h1>

        <?php if ($result->num_rows > 0): ?>
            <table class="table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nome</th>
                        <th>Email</th>
                        <th>Descrição</th>
                        <th>Urgência</th>
                        <th>Ação</th>
                    </tr>
                </thead>
                <tbody>
                    <?php while($row = $result->fetch_assoc()): ?>
                        <tr>
                            <td><?php echo $row['id']; ?></td>
                            <td><?php echo $row['nome']; ?></td>
                            <td><?php echo $row['email']; ?></td>
                            <td><?php echo $row['descricao']; ?></td>
                            <td><?php echo $row['urgencia']; ?></td>
                            <td>
                                <form action="resolver_problema.php" method="POST">
                                    <input type="hidden" name="id" value="<?php echo $row['id']; ?>">
                                    <button class="btn resolve" type="submit">Marcar como Resolvido</button>
                                </form>
                            </td>
                        </tr>
                    <?php endwhile; ?>
                </tbody>
            </table>
        <?php else: ?>
            <p class="no-issues">Não há problemas pendentes.</p>
        <?php endif; ?>
    </div>
</body>
</html>

<?php
// Fecha a conexão
$conn->close();
?>
