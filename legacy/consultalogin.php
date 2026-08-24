<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <title>Redirecionamento de Login</title>
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
        die("Ocorreu erro na conexão: " . $conexao->connect_error);
    }

    $email = $_POST['email'];
    $senha = $_POST['senha'];

    if (isset($_POST['email']) && isset($_POST['senha'])) {
        $email = $_POST['email'];
        $senha = $_POST['senha'];
    
        $stmt = $conexao->prepare("SELECT email, senha, tipo_usuario FROM usuarios WHERE email = ? AND senha = ?");
        $stmt->bind_param("ss", $email, $senha);
        $stmt->execute();
        $resultado = $stmt->get_result();
    
        if ($resultado->num_rows > 0) {
            $linha = $resultado->fetch_assoc();
            $_SESSION['email'] = $linha['email'];
            $_SESSION['tipo_usuario'] = $linha['tipo_usuario'];
            
            header("Location: identificador.php");
            exit();
        } else {
            echo "Não foi possível realizar seu Login. <a href='login.html'>Tente novamente</a>.";
        }
    }

    $conexao->close();
    ?>
</body>

</html>