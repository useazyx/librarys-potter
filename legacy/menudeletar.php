<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Menu</title>
    <link rel="stylesheet" href="menudeletar.css">
</head>

<body>
    <div class="wrapper">
        <?php
        session_start();
        $servidor = "localhost";
        $usuario = "root";
        $senha = "";
        $nomeBD = "trabalhoguizela";

        $conexao = new mysqli($servidor, $usuario, $senha, $nomeBD);

        if ($_SESSION['tipo_usuario'] == 'comum') {
            echo "<meta http-equiv='refresh' content='0; URL=index_usuario.html'>";
        } elseif ($_SESSION['tipo_usuario'] == 'fornecedor') {
            echo "<meta http-equiv='refresh' content='0; URL=index_fornecedor.html'>";
        } elseif ($_SESSION['tipo_usuario'] == 'suporte') {
            echo "
            <h1>Deletar Itens</h1>

            <form action='deletarlivros.php' method='post'>
                <div class='input-box'>
                    <input type='text' name='cl' placeholder='Código do Livro'>
                </div>
                <input type='submit' value='ENVIAR' class='btn'>
                <input type='reset' value='LIMPAR DADOS' class='btn'>
            </form>

            <form action='deletarautores.php' method='post'>
                <div class='input-box'>
                    <input type='text' name='ca' placeholder='Código do Autor'>
                </div>
                <input type='submit' value='ENVIAR' class='btn'>
                <input type='reset' value='LIMPAR DADOS' class='btn'>
            </form>

            <form action='deletareditoras.php' method='post'>
                <div class='input-box'>
                    <input type='text' name='ce' placeholder='Código da Editora'>
                </div>
                <input type='submit' value='ENVIAR' class='btn'>
                <input type='reset' value='LIMPAR DADOS' class='btn'>
            </form>

            <form action='deletarusuarios.php' method='post'>
                <div class='input-box'>
                    <input type='text' name='cu' placeholder='Código do Usuário'>
                </div>
                <input type='submit' value='ENVIAR' class='btn'>
                <input type='reset' value='LIMPAR DADOS' class='btn'>
            </form>

            <form action='deletarfornecedores.php' method='post'>
                <div class='input-box'>
                    <input type='text' name='cf' placeholder='Código do Fornecedor'>
                </div>
                <input type='submit' value='ENVIAR' class='btn'>
                <input type='reset' value='LIMPAR DADOS' class='btn'>
            </form>
            <br>&nbsp
                <button class='btn'><a href='identificador.php'>Voltar a página Inicial</a></button>";

            
        } else {
            echo "<meta http-equiv='refresh' content='0; URL=index.html'>";
        }
        ?>
    </div>
</body>

</html>
