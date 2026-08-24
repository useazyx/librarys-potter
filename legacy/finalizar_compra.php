<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Comprar Livros</title>
    <link rel="stylesheet" href="finalizar_compra.css">
    <style>
        /* Estilos para as estrelas */
        .estrelas {
            display: flex;
            gap: 5px;
        }
        .estrela {
            font-size: 30px;
            color: gray;
            cursor: pointer;
        }
        .estrela.ativa {
            color: gold;
        }
    </style>
</head>

<body>

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

$isbn = $_POST['isbn'];
$quantidade = $_POST['quantidade'];
$nome = $_POST['nome'];
$email = $_POST['email'];
$senha = $_POST['senha'];

$stmt = $conexao->prepare("SELECT * FROM livros WHERE isbn = ?");
$stmt->bind_param("s", $isbn);
$stmt->execute();
$resultado = $stmt->get_result();

if ($resultado->num_rows > 0) {
    $livro = $resultado->fetch_assoc();

    if ($livro['estoque'] >= $quantidade) {
        $stmt = $conexao->prepare("UPDATE livros SET estoque = estoque - ? WHERE isbn = ?");
        $stmt->bind_param("is", $quantidade, $isbn);
        $stmt->execute();

        $stmt = $conexao->prepare("INSERT INTO vendas (id_livro, email, data_venda, quantidade) VALUES (?, ?, NOW(), ?)");
        $stmt->bind_param("isi", $livro['id_livro'], $email, $quantidade);
        $stmt->execute();


        // Exibir o formulário para avaliação do livro
        echo "
            <h2>Avalie o livro</h2>
            <form method='post' action='avaliar_livro.php'>
                <input type='hidden' name='id_livro' value='" . $livro['id_livro'] . "'>
                <input type='hidden' name='email_usuario' value='$email'>

                <div class='estrelas'>
                    <span class='estrela' data-valor='1'>★</span>
                    <span class='estrela' data-valor='2'>★</span>
                    <span class='estrela' data-valor='3'>★</span>
                    <span class='estrela' data-valor='4'>★</span>
                    <span class='estrela' data-valor='5'>★</span>
                </div>
                
                <input type='hidden' name='nota' id='nota'>
                <label for='comentario'>Comentário:</label><br>
                <textarea name='comentario' id='comentario' rows='4' cols='50'></textarea><br><br>
                <button type='submit'>Enviar Avaliação</button>
            </form>
            
            <script>
                // Lógica para selecionar estrelas
                const estrelas = document.querySelectorAll('.estrela');
                const notaInput = document.getElementById('nota');
                
                estrelas.forEach(estrela => {
                    estrela.addEventListener('click', function() {
                        const valor = this.getAttribute('data-valor');
                        notaInput.value = valor;
                        // Destacar as estrelas
                        estrelas.forEach(estrela => estrela.classList.remove('ativa'));
                        for (let i = 0; i < valor; i++) {
                            estrelas[i].classList.add('ativa');
                        }
                    });
                });
            </script>
        ";

    } else {
        echo "<p class='error-message'>Erro: quantidade não disponível em estoque.</p>";
    }
} else {
    echo "<p class='error-message'>Livro não encontrado.</p>";
}

$stmt->close();
$conexao->close();
?>

</body>
</html>
