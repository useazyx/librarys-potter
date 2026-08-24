<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Menu</title>
    <link rel="stylesheet" href="menucadastros.css">
</head>

<body>
    <?php
    session_start();
    $servidor = "localhost";
    $usuario = "root";
    $senha = "";
    $nomeBD = "trabalhoguizela";

    $conexao = new mysqli($servidor, $usuario, $senha, $nomeBD);

    if ($_SESSION['tipo_usuario'] == 'comum') {
        echo "<meta http-equiv='refresh' content='0; URL=index_usuario.php'>";
    } elseif ($_SESSION['tipo_usuario'] == 'fornecedor' || $_SESSION['tipo_usuario'] == 'suporte') {
        echo "<div class='wrapper'>
                <h1>Formulários de Cadastro</h1>

                <form action='cadastrolivros.php' method='post' class='form-box'>
                    <h2>Cadastro de Livros</h2>
                    <label>Título do Livro:</label>
                    <input type='text' name='tl' placeholder='Insira o título' required>
                    
                    <label>Gênero:</label>
                    <input type='text' name='gl' placeholder='Insira o gênero' required>
                    
                    <label>Código ISBN:</label>
                    <input type='number' name='il' placeholder='Insira o ISBN' required>
                    
                    <label>ID do Autor:</label>
                    <input type='number' name='id_autor' placeholder='Insira o ID do autor' required>
                    
                    <label>ID da Editora:</label>
                    <input type='number' name='id_editora' placeholder='Insira o ID da editora' required>
                    
                    <label>Data de Lançamento:</label>
                    <input type='text' name='dl' placeholder='dd/mm/aaaa' required>
                    
                    <label>Preço:</label>
                    <input type='text' name='pl' placeholder='Insira o preço' required>
                    
                    <label>Quantidade em Estoque:</label>
                    <input type='number' name='ql' placeholder='Insira a quantidade' required>

                    <div class='buttons'>
                        <input type='submit' value='Enviar' class='btn'>
                        <input type='reset' value='Limpar Dados' class='btn'>
                    </div>
                </form>

                <form action='cadastroeditoras.php' method='post' class='form-box'>
                    <h2>Cadastro de Editoras</h2>
                    <label>Nome da Editora:</label>
                    <input type='text' name='na' placeholder='Insira o nome da editora' required>
                    
                    <label>Cidade:</label>
                    <input type='text' name='pa' placeholder='Insira a cidade' required>

                    <div class='buttons'>
                        <input type='submit' value='Enviar' class='btn'>
                        <input type='reset' value='Limpar Dados' class='btn'>
                    </div>
                </form>

                <form action='cadastroautores.php' method='post' class='form-box'>
                    <h2>Cadastro de Autores</h2>
                    <label>Nome do Autor:</label>
                    <input type='text' name='na' placeholder='Insira o nome do autor' required>
                    
                    <label>Nacionalidade:</label>
                    <input type='text' name='pa' placeholder='Insira a nacionalidade' required>

                    <div class='buttons'>
                        <input type='submit' value='Enviar' class='btn'>
                        <input type='reset' value='Limpar Dados' class='btn'>
                    </div>
                </form>
              </div>
              <br>&nbsp
                <button class='btn'><a href='identificador.php'>Voltar a página Inicial</a></button>";
    } else {
        echo "<meta http-equiv='refresh' content='0; URL=index.html'>";
    }
    ?>
</body>

</html>
