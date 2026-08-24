<?php
session_start();

$servidor = "localhost";
$usuario = "root";
$senha = "";
$nomeBD = "trabalhoguizela";

$conexao = new mysqli($servidor, $usuario, $senha, $nomeBD);

if ($conexao->connect_error) {
    die("Erro de conexão: " . $conexao->connect_error);
}

$id_livro = $_POST['id_livro'];
$email_usuario = $_POST['email_usuario'];
$nota = $_POST['nota'];
$comentario = $_POST['comentario'];

// Verificar se a nota foi preenchida
if (!empty($nota) && is_numeric($nota) && $nota >= 1 && $nota <= 5) {
    // Inserir avaliação na tabela
    $stmt = $conexao->prepare("INSERT INTO avaliacoes (id_livro, email_usuario, nota, comentario) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("isis", $id_livro, $email_usuario, $nota, $comentario);
    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        echo "<p class='success-message'>Avaliação enviada com sucesso!</p>";
        echo "<button class='btn'><a href='identificador.php'>Voltar a página Inicial</a></button>";
    } else {
        echo "<p class='error-message'>Erro ao enviar a avaliação.</p>";
    }

    $stmt->close();
} else {
    echo "<p class='error-message'>Erro: Nota inválida.</p>";
}

$conexao->close();
?>
