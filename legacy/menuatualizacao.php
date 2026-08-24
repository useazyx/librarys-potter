<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Menu</title>
    <link rel="stylesheet" href="menuatualizacao.css">
</head>

<body>
    <div class="container">
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
            echo "
            <h1>Menu de Atualização</h1>

            <form action='atualizarlivros.php' method='post'>
                <p>Atualizar - Livros</p>
                <input type='text' name='cl' placeholder='Código do Livro'>
                <input type='text' name='lt' placeholder='Novo Título do Livro'>
                <input type='text' name='li' placeholder='Novo ISBN'>
                <input type='text' name='la' placeholder='Novo Código do Autor'>
                <input type='text' name='le' placeholder='Novo Código da Editora'>
                <input type='text' name='ld' placeholder='Nova Data de Publicação'>
                <input type='text' name='lp' placeholder='Novo Preço'>
                <input type='text' name='les' placeholder='Novo Estoque'>
                <input type='text' name='lg' placeholder='Novo Gênero'>
                <input type='submit' value='ENVIAR'>
                <input type='reset' value='LIMPAR DADOS'>
            </form>

            <form action='atualizarautores.php' method='post'>
                <p>Atualizar - Autores</p>
                <input type='text' name='ca' placeholder='Código do Autor'>
                <input type='text' name='an' placeholder='Novo Nome do Autor'>
                <input type='text' name='ap' placeholder='Nova Nacionalidade'>
                <input type='submit' value='ENVIAR'>
                <input type='reset' value='LIMPAR DADOS'>
            </form>

            <form action='atualizareditoras.php' method='post'>
                <p>Atualizar - Editoras</p>
                <input type='text' name='ce' placeholder='Código da Editora'>
                <input type='text' name='en' placeholder='Novo Nome da Editora'>
                <input type='text' name='ep' placeholder='Nova Cidade'>
                <input type='submit' value='ENVIAR'>
                <input type='reset' value='LIMPAR DADOS'>
            </form>
            <br>&nbsp
                <button class='btn'><a href='identificador.php'>Voltar a página Inicial</a></button>";

            if ($_SESSION['tipo_usuario'] == 'suporte') {
                echo "
                <form action='atualizarusuarios.php' method='post'>
                    <p>Atualizar - Usuários</p>
                    <input type='text' name='cu' placeholder='Código do Usuário'>
                    <input type='text' name='un' placeholder='Novo Nome do Usuário'>
                    <input type='text' name='ue' placeholder='Novo Email'>
                    <input type='text' name='us' placeholder='Nova Senha'>
                    <input type='submit' value='ENVIAR'>
                    <input type='reset' value='LIMPAR DADOS'>
                </form>

                <form action='atualizarfornecedores.php' method='post'>
                    <p>Atualizar - Fornecedores</p>
                    <input type='text' name='cf' placeholder='Código do Fornecedor'>
                    <input type='text' name='fn' placeholder='Novo Nome do Fornecedor'>
                    <input type='text' name='fe' placeholder='Novo Email do Fornecedor'>
                    <input type='text' name='fs' placeholder='Nova Senha'>
                    <input type='submit' value='ENVIAR'>
                    <input type='reset' value='LIMPAR DADOS'>
                </form>
                <br>&nbsp
                <button class='btn'><a href='identificador.php'>Voltar a página Inicial</a></button>";
            }
        } else {
            echo "<meta http-equiv='refresh' content='0; URL=index.html'>";
        }
        ?>
    </div>
</body>

</html>
