CREATE DATABASE trabalhoguizela;

CREATE TABLE autores (
  id_autor INT(11) NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(255) DEFAULT NULL,
  `nacionalidade` VARCHAR(50) DEFAULT NULL,
  PRIMARY KEY (`id_autor`)
) 

CREATE TABLE editoras (
  `id_editora` INT(11) NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(255) DEFAULT NULL,
  `cidade` VARCHAR(50) DEFAULT NULL,
  PRIMARY KEY (`id_editora`)
) 

CREATE TABLE livros (
  `id_livro` INT(11) NOT NULL AUTO_INCREMENT,
  `titulo` VARCHAR(255) DEFAULT NULL,
  `isbn` VARCHAR(20) DEFAULT NULL,
  `id_autor` INT(11) DEFAULT NULL,
  `id_editora` INT(11) DEFAULT NULL,
  `data_publicacao` DATE DEFAULT NULL,
  `preço` DECIMAL(10,2) DEFAULT NULL,
  `estoque` INT(11) DEFAULT NULL,
  `genero` VARCHAR(50) DEFAULT NULL,
  PRIMARY KEY (`id_livro`),
  KEY `id_autor` (`id_autor`),
  KEY `id_editora` (`id_editora`),
  CONSTRAINT `livros_ibfk_1` FOREIGN KEY (`id_autor`) REFERENCES `autores` (`id_autor`),
  CONSTRAINT `livros_ibfk_2` FOREIGN KEY (`id_editora`) REFERENCES `editoras` (`id_editora`)
) 

CREATE TABLE usuarios (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(255) DEFAULT NULL,
  `email` VARCHAR(255) DEFAULT NULL,
  `senha` VARCHAR(255) DEFAULT NULL,
  `tipo_usuario` ENUM('comum', 'fornecedor', 'suporte') DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) 

CREATE TABLE vendas (
  `id_venda` INT(11) NOT NULL AUTO_INCREMENT,
  `id_livro` INT(11) DEFAULT NULL,
  `email` VARCHAR(255) DEFAULT NULL,
  `data_venda` DATE DEFAULT NULL,
  `quantidade` INT(11) DEFAULT NULL,
  PRIMARY KEY (`id_venda`),
  KEY `id_livro` (`id_livro`),
  KEY `email` (`email`),
  CONSTRAINT `vendas_ibfk_1` FOREIGN KEY (`id_livro`) REFERENCES `livros` (`id_livro`),
  CONSTRAINT `vendas_ibfk_2` FOREIGN KEY (`email`) REFERENCES `usuarios` (`email`)
) 


CREATE TABLE avaliacoes (
    id_avaliacao INT AUTO_INCREMENT PRIMARY KEY,
    id_livro INT NOT NULL,
    email_usuario VARCHAR(255) NOT NULL,
    nota INT NOT NULL,  -- Nota de 1 a 5
    comentario TEXT,
    data_avaliacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_livro) REFERENCES livros(id_livro)
)

CREATE TABLE problemas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    descricao TEXT NOT NULL,
    urgencia ENUM('Baixa', 'Média', 'Alta') NOT NULL,
    status ENUM('Aberto', 'Resolvido') DEFAULT 'Aberto',
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)

INSERT INTO autores (nome, nacionalidade) VALUES ('Ronaldo Fênomeno', 'Brasil');
INSERT INTO editoras (nome, cidade) VALUES ('Seleção Corinthiana', 'Néo Química Arena');
INSERT INTO livros (titulo, isbn, id_autor, id_editora, data_publicacao, preço, estoque, genero) VALUES ('Harry Potter e a Pedra Filosofal', '9781234567890', '1', '1', '0000-00-00', '200', '50', 'Fantasia');
INSERT INTO livros (titulo, isbn, id_autor, id_editora, data_publicacao, preço, estoque, genero) VALUES ('Harry Potter e o Enigma do Príncipe', '9781234567891', '1', '1', '0000-00-00', '300', '80', 'Fantasia');
INSERT INTO livros (titulo, isbn, id_autor, id_editora, data_publicacao, preço, estoque, genero) VALUES ('Harry Potter e a Câmara Secreta', '9781234567892', '1', '1', '0000-00-00', '900', '900', 'Fantasia');
INSERT INTO livros (titulo, isbn, id_autor, id_editora, data_publicacao, preço, estoque, genero) VALUES ('Harry Potter e o Cálice de Fogo', '9781234567893', '1', '1', '0000-00-00', '300', '800', 'Fantasia');
INSERT INTO livros (titulo, isbn, id_autor, id_editora, data_publicacao, preço, estoque, genero) VALUES ('Harry Potter e o Prisioneiro de Azkaban', '9781234567894', '1', '1', '0000-00-00', '400', '700', 'Fantasia');
INSERT INTO usuarios (nome, email, senha, tipo_usuario) VALUES ('Agostinho Carrara', 'agostinhocarrara@gmail.com', 'agostinho2024', 'usuario');
INSERT INTO usuarios (nome, email, senha, tipo_usuario) VALUES ('Japa', 'japalivros@gmail.com', 'ruiva1ams', 'fornecedor');
INSERT INTO usuarios (nome, email, senha, tipo_usuario) VALUES ('Memphis Depay', 'memphisdepay@gmail.com', 'corinthians', 'suporte');
INSERT INTO vendas (id_livro, email, data_venda, quantidade) VALUES ('3', 'agostinhocarrara@gmail.com', '0000-00-00', '999');
INSERT INTO avaliacoes (id_livro, email_usuario, nota, comentario) VALUES ('3', 'agostinhocarrara@gmail.com', '3', 'um lixo');
INSERT INTO problemas (nome, email, descricao, urgencia) VALUES ('Agostinho Carrara', 'agostinhocarrara@gmail.com', 'como faço pra fazer um site bom igual esse?', 'Alta');
