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

// Verifica se o ID foi enviado
if (isset($_POST['id'])) {
    $id = $_POST['id'];

    // Atualiza o status do problema para 'Resolvido'
    $sql = "UPDATE problemas SET status = 'Resolvido' WHERE id = $id";

    if ($conn->query($sql) === TRUE) {
        echo "<script>alert('Problema resolvido com sucesso!'); window.location.href = 'suporte.php';</script>";
    } else {
        echo "Erro ao resolver o problema: " . $conn->error;
    }
}

// Fecha a conexão
$conn->close();
?>

<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resolvimento de Problema</title>
    <link rel="stylesheet" href="resolverproblema.css">
</head>
<body>
    <div class="wrapper">
        <h1>Atualizar Status</h1>
        <p class="message">O status do problema foi atualizado com sucesso!</p>
        <a href="suporte.php" class="btn">Voltar para Suporte</a>
    </div>
</body>
</html>
