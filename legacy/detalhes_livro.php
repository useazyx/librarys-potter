<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Comprar Livros</title>
    <link rel="stylesheet" href="detalhes_livro.css">
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

// Verifica se o ISBN foi passado como parâmetro na URL
if (isset($_GET['isbn'])) {
    $isbn = $_GET['isbn'];
    
    // Prepara a consulta SQL para buscar o livro pelo ISBN
    $stmt = $conexao->prepare("SELECT * FROM livros WHERE isbn = ?");
    $stmt->bind_param("s", $isbn);
    $stmt->execute();
    $resultado = $stmt->get_result();

    // Verifica se encontrou o livro
    if ($resultado->num_rows > 0) {
        $livro = $resultado->fetch_assoc();
        ?>
        <div class="product-page">
            <div class="product-details">
                <h1>Comprar Livro: <?php echo htmlspecialchars($livro['titulo']); ?></h1>
                <p><strong>Preço:</strong> R$ <?php echo number_format($livro['preço'], 2, ',', '.'); ?></p>
                <p><strong>Estoque:</strong> <?php echo htmlspecialchars($livro['estoque']); ?> unidades</p>
            </div>

            <div class="form-container">
                <!-- Formulário para adicionar ao carrinho -->
                <form action="carrinho.php" method="post">
                    <input type="hidden" name="isbn" value="<?php echo htmlspecialchars($livro['isbn']); ?>">
                    Quantidade: 
                    <input type="number" id="quantidade" name="quantidade" value="1" min="1" max="<?php echo htmlspecialchars($livro['estoque']); ?>">
                    <br><br>
                    <button type="submit" name="add_to_cart" class="btn">Adicionar ao Carrinho</button>
                </form>

                <!-- Formulário para finalizar a compra -->
                <form action="finalizar_compra.php" method="post">
                    <input type="hidden" name="isbn" value="<?php echo htmlspecialchars($livro['isbn']); ?>">
                    Quantidade: 
                    <input type="number" id="quantidade" name="quantidade" value="1" min="1" max="<?php echo htmlspecialchars($livro['estoque']); ?>">
                    <br><br>
                    Nome: <input type="text" id="nome" name="nome" required>
                    <br><br>
                    Email: <input type="email" name="email" required>
                    <br><br>
                    Senha: <input type="password" name="senha" required>
                    <br><br>

                    <!-- Espaço para mostrar o QR Code do Pix -->
                    <div class="pix-qrcode">
                        <h3>Realize o pagamento via Pix:</h3>
                        <!-- Supondo que o QR Code já tenha sido gerado e salvo como 'qrcode_pix.png' -->
                        <img src="qrcode_pix.png" alt="QR Code do Pix" width="250" height="250">
                        <p>Escaneie o QR Code para realizar o pagamento.</p>
                    </div>

                    <br><br>
                    <button type="submit" class="btn">Finalizar Compra</button>
                </form>
            </div>
        </div>
        <?php
    } else {
        echo "<p>Livro não encontrado.</p>";
    }
    
    $stmt->close();
} else {
    echo "<p>ISBN não fornecido.</p>";
}

$conexao->close();
?>
</body>
</html>