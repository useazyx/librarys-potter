<?php
// Conexão com o banco de dados
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "sistema_ajuda"; // Nome do seu banco de dados

// Criação da conexão
$conn = new mysqli($servername, $username, $password, $dbname);

// Verifica se houve erro na conexão
if ($conn->connect_error) {
    die("Conexão falhou: " . $conn->connect_error);
}

// Verifica se o formulário foi submetido
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Recebe os dados do formulário
    $nome = mysqli_real_escape_string($conn, $_POST['nome']);
    $email = mysqli_real_escape_string($conn, $_POST['email']);
    $descricao = mysqli_real_escape_string($conn, $_POST['descricao']);
    $urgencia = mysqli_real_escape_string($conn, $_POST['urgencia']);

    // Insere o problema no banco de dados
    $sql = "INSERT INTO problemas (nome, email, descricao, urgencia) 
            VALUES ('$nome', '$email', '$descricao', '$urgencia')";

    if ($conn->query($sql) === TRUE) {
        echo "<button class='btn'><a href='identificador.php'>Voltar a página Inicial</a></button>";
    } else {
        echo "Erro ao registrar o problema: " . $conn->error;
    }
}

// Fecha a conexão
$conn->close();
?>
