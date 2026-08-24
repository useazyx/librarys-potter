<?php
// Exibir as avaliações do livro
$stmt = $conexao->prepare("SELECT * FROM avaliacoes WHERE id_livro = ?");
$stmt->bind_param("i", $livro['id_livro']);
$stmt->execute();
$resultado_avaliacoes = $stmt->get_result();

echo "<h2>Avaliações:</h2>";

if ($resultado_avaliacoes->num_rows > 0) {
    while ($avaliacao = $resultado_avaliacoes->fetch_assoc()) {
        // Exibir a avaliação com estrelas
        $nota = $avaliacao['nota'];
        echo "<p><strong>" . $avaliacao['email_usuario'] . " (Nota: ";

        // Exibir estrelas com base na nota
        for ($i = 1; $i <= 5; $i++) {
            if ($i <= $nota) {
                echo "★";
            } else {
                echo "☆";
            }
        }

        echo ")</strong></p>";
        echo "<p>" . $avaliacao['comentario'] . "</p>";
        echo "<hr>";
    }
} else {
    echo "<p>Este livro ainda não foi avaliado.</p>";
}

$stmt->close();
