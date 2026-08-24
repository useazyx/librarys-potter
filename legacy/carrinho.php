<?php
$servidor = "localhost";
$usuario = "root";
$senha = "";
$nomeBD = "trabalhoguizela";

$conexao = new mysqli($servidor, $usuario, $senha, $nomeBD);

if ($conexao->connect_error) {
    die("Erro de conexão: " . $conexao->connect_error);
}

session_start();

// Adicionar ao carrinho
if (isset($_POST['add_to_cart'])) {
    $isbn = $_POST['isbn'];
    $quantidade = 1; 

    if (isset($_SESSION['carrinho'][$isbn])) {
        $_SESSION['carrinho'][$isbn]['quantidade'] += $quantidade;
    } else {
        $_SESSION['carrinho'][$isbn] = array('quantidade' => $quantidade);
    }
}

// Remover do carrinho
if (isset($_POST['remove_from_cart'])) {
    $isbn = $_POST['remove_from_cart'];
    unset($_SESSION['carrinho'][$isbn]);
}

?>

<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Carrinho de Compras</title>
    <link rel="stylesheet" href="carrinho.css"> <!-- Link do arquivo CSS -->
</head>
<body>
    <div class="cart-container">
        <h1>Carrinho de Compras</h1>
        <form action="carrinho.php" method="post">
            <div class="cart-items">
                <?php
                if (isset($_SESSION['carrinho']) && !empty($_SESSION['carrinho'])) {
                    foreach ($_SESSION['carrinho'] as $isbn => $item) {
                        $stmt = $conexao->prepare("SELECT * FROM livros WHERE isbn = ?");
                        $stmt->bind_param("s", $isbn);
                        $stmt->execute();
                        $resultado = $stmt->get_result();
                        $livro = $resultado->fetch_assoc();
                        ?>
                        <div class="cart-item">
                            <img src="livros/<?php echo $livro['isbn']; ?>.jpg" alt="<?php echo $livro['titulo']; ?>" class="item-image">
                            <div class="item-details">
                                <h3><?php echo htmlspecialchars($livro['titulo']); ?></h3>
                                <p><strong>Quantidade:</strong> <?php echo $item['quantidade']; ?></p>
                                <p><strong>Preço:</strong> R$ <?php echo number_format($livro['preço'], 2, ',', '.'); ?></p>
                                <button type="submit" name="remove_from_cart" value="<?php echo $isbn; ?>" class="remove-button">Remover</button>
                            </div>
                        </div>
                        <?php
                    }
                } else {
                    echo "<p>Seu carrinho está vazio.</p>";
                }
                ?>
            </div>

            <?php
            if (isset($_SESSION['carrinho']) && !empty($_SESSION['carrinho'])) {
                $total_price = 0;
                foreach ($_SESSION['carrinho'] as $isbn => $item) {
                    $stmt = $conexao->prepare("SELECT * FROM livros WHERE isbn = ?");
                    $stmt->bind_param("s", $isbn);
                    $stmt->execute();
                    $resultado = $stmt->get_result();
                    $livro = $resultado->fetch_assoc();
                    $total_price += $livro['preço'] * $item['quantidade'];
                }
                ?>
                <div class="total">
                    <p><strong>Total: </strong>R$ <?php echo number_format($total_price, 2, ',', '.'); ?></p>
                    <button type="submit" name="checkout" class="checkout-button">Finalizar Compra</button>
                </div>
                <?php
            }
            ?>
        </form>
    </div>

    <script>
        // Opcional: Pode-se adicionar um script para confirmar antes de remover um item do carrinho
    </script>
</body>
</html>

<?php
$stmt->close();
$conexao->close();
?>
