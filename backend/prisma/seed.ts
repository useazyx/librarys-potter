// Popula o banco da Library's Potter.
//
// Os produtos ficam em catalog.ts; aqui ficam a autora, a editora, os usuários,
// as avaliações, os pedidos e a fila de chamados. As três contas do bd.sql
// antigo (Agostinho, Japa e Memphis) continuam aqui, uma para cada papel, junto
// com a avaliação e o chamado que já existiam lá.
//
// Nota: o bd.sql traz A Câmara Secreta a R$ 900, com estoque 900 e uma venda de
// quantidade 999. Aquilo era gente batendo dígito no formulário, não preço. O
// material antigo fica como está e a loja usa preço de livraria.
import { PrismaClient, type OrderStatus, type Role, type TicketStatus, type TicketUrgency } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { CATALOG } from './catalog.js'

const prisma = new PrismaClient()

const DAY = 1000 * 60 * 60 * 24
const daysAgo = (days: number) => new Date(Date.now() - days * DAY)

type SeedUser = { key: string; name: string; email: string; role: Role }

const USERS: SeedUser[] = [
  // As três contas do bd.sql, uma para cada papel.
  { key: 'agostinho', name: 'Agostinho Carrara', email: 'agostinhocarrara@gmail.com', role: 'CUSTOMER' },
  { key: 'japa', name: 'Japa', email: 'japalivros@gmail.com', role: 'SUPPLIER' },
  { key: 'memphis', name: 'Memphis Depay', email: 'memphisdepay@gmail.com', role: 'SUPPORT' },

  { key: 'bruna', name: 'Bruna Almeida', email: 'bruna@example.com', role: 'CUSTOMER' },
  { key: 'caio', name: 'Caio Nogueira', email: 'caio@example.com', role: 'CUSTOMER' },
  { key: 'lia', name: 'Lia Ferraz', email: 'lia@example.com', role: 'CUSTOMER' },

  { key: 'marina', name: 'Marina Tavares', email: 'marina.tavares@gmail.com', role: 'CUSTOMER' },
  { key: 'rodrigo', name: 'Rodrigo Bittencourt', email: 'rodrigo.bitt@gmail.com', role: 'CUSTOMER' },
  { key: 'camila', name: 'Camila Rezende', email: 'camila.rezende@outlook.com', role: 'CUSTOMER' },
  { key: 'thiago', name: 'Thiago Menezes', email: 'thiago.menezes@gmail.com', role: 'CUSTOMER' },
  { key: 'patricia', name: 'Patrícia Vasconcelos', email: 'patricia.vasc@gmail.com', role: 'CUSTOMER' },
  { key: 'eduardo', name: 'Eduardo Prates', email: 'eduardo.prates@hotmail.com', role: 'CUSTOMER' },
  { key: 'juliana', name: 'Juliana Sampaio', email: 'juliana.sampaio@gmail.com', role: 'CUSTOMER' },
  { key: 'felipe', name: 'Felipe Andrade', email: 'felipe.andrade@gmail.com', role: 'CUSTOMER' },
  { key: 'renata', name: 'Renata Coutinho', email: 'renata.coutinho@gmail.com', role: 'CUSTOMER' },
  { key: 'gustavo', name: 'Gustavo Lemes', email: 'gustavo.lemes@outlook.com', role: 'CUSTOMER' },
  { key: 'beatriz', name: 'Beatriz Fontoura', email: 'beatriz.fontoura@gmail.com', role: 'CUSTOMER' },
  { key: 'vinicius', name: 'Vinícius Salgado', email: 'vinicius.salgado@gmail.com', role: 'CUSTOMER' },
  { key: 'larissa', name: 'Larissa Pimentel', email: 'larissa.pimentel@gmail.com', role: 'CUSTOMER' },
  { key: 'otavio', name: 'Otávio Mendonça', email: 'otavio.mendonca@gmail.com', role: 'CUSTOMER' },
  { key: 'sofia', name: 'Sofia Barreto', email: 'sofia.barreto@gmail.com', role: 'CUSTOMER' },
  { key: 'henrique', name: 'Henrique Dorneles', email: 'henrique.dorneles@gmail.com', role: 'CUSTOMER' },
  { key: 'natalia', name: 'Natália Espíndola', email: 'natalia.espindola@gmail.com', role: 'CUSTOMER' },
  { key: 'ricardo', name: 'Ricardo Peixoto', email: 'ricardo.peixoto@gmail.com', role: 'CUSTOMER' },

  // A loja cresceu e o balcão ganhou mais gente.
  { key: 'tatiane', name: 'Tatiane Queiroz', email: 'tatiane.queiroz@libraryspotter.com.br', role: 'SUPPORT' },
  { key: 'marcelo', name: 'Marcelo Ourique', email: 'marcelo.ourique@libraryspotter.com.br', role: 'SUPPLIER' },
]

type SeedReview = { slug: string; user: string; rating: number; comment: string; days: number }

const REVIEWS: SeedReview[] = [
  // A avaliação que já estava no banco antigo.
  { slug: 'harry-potter-e-a-camara-secreta', user: 'agostinho', rating: 3, comment: 'um lixo', days: 19 },
  {
    slug: 'manto-de-hogwarts',
    user: 'agostinho',
    rating: 4,
    comment: 'Tecido bom e forro caprichado. Só veio um número acima do que eu esperava.',
    days: 12,
  },

  {
    slug: 'harry-potter-e-a-pedra-filosofal',
    user: 'bruna',
    rating: 5,
    comment: 'Reli pela quarta vez e continua sendo o começo perfeito. A edição da Rocco é linda.',
    days: 40,
  },
  {
    slug: 'harry-potter-e-a-pedra-filosofal',
    user: 'caio',
    rating: 5,
    comment: 'Comprei para o meu sobrinho e acabei lendo antes de entregar. Chegou rápido e bem embalado.',
    days: 33,
  },

  {
    slug: 'harry-potter-e-o-prisioneiro-de-azkaban',
    user: 'bruna',
    rating: 4,
    comment: 'O melhor da saga na minha opinião. Só achei o preço um pouco salgado.',
    days: 28,
  },
  {
    slug: 'harry-potter-e-o-prisioneiro-de-azkaban',
    user: 'marina',
    rating: 5,
    comment: 'O terceiro livro é onde a saga cresce junto com o leitor. Chegou em dois dias.',
    days: 21,
  },
  {
    slug: 'harry-potter-e-o-calice-de-fogo',
    user: 'rodrigo',
    rating: 5,
    comment: 'Livro grosso, lombada firme, papel bom. Li em uma semana de férias.',
    days: 47,
  },
  {
    slug: 'harry-potter-e-o-calice-de-fogo',
    user: 'juliana',
    rating: 4,
    comment: 'Ótimo, mas a capa marca com facilidade. Vale usar capinha se você carrega na mochila.',
    days: 16,
  },
  {
    slug: 'harry-potter-e-a-ordem-da-fenix',
    user: 'thiago',
    rating: 4,
    comment: 'O mais longo e o mais raivoso da saga. Demorei um mês, mas valeu.',
    days: 55,
  },
  {
    slug: 'harry-potter-e-o-enigma-do-principe',
    user: 'camila',
    rating: 5,
    comment: 'Chorei no final de novo, mesmo sabendo o que ia acontecer. Edição impecável.',
    days: 30,
  },
  {
    slug: 'harry-potter-e-as-reliquias-da-morte',
    user: 'patricia',
    rating: 5,
    comment: 'Fechei a coleção com esse. Os sete iguais na estante ficaram lindos.',
    days: 25,
  },
  {
    slug: 'harry-potter-e-as-reliquias-da-morte',
    user: 'gustavo',
    rating: 4,
    comment: 'Chegou certinho. Tirei uma estrela porque veio com um vinco pequeno na contracapa.',
    days: 9,
  },
  {
    slug: 'harry-potter-e-a-crianca-amaldicoada',
    user: 'eduardo',
    rating: 3,
    comment: 'É uma peça de teatro, então a leitura é bem diferente. Dá para gostar, mas não é romance.',
    days: 38,
  },
  {
    slug: 'os-contos-de-beedle-o-bardo',
    user: 'renata',
    rating: 5,
    comment: 'Livrinho curto e delicioso. As notas do Dumbledore são a melhor parte.',
    days: 44,
  },
  {
    slug: 'quadribol-atraves-dos-seculos',
    user: 'felipe',
    rating: 4,
    comment: 'Comprei mais pela coleção do que pela leitura, mas me surpreendi. Bem divertido.',
    days: 51,
  },
  {
    slug: 'animais-fantasticos-e-onde-habitam',
    user: 'beatriz',
    rating: 5,
    comment: 'As anotações do Harry e do Rony nas margens fazem o livro. Meu filho adorou.',
    days: 26,
  },
  {
    slug: 'colecao-completa-sete-volumes',
    user: 'vinicius',
    rating: 5,
    comment: 'Caixa bem feita, os sete livros chegaram sem nenhuma amassadinha. O frete grátis ajudou.',
    days: 60,
  },
  {
    slug: 'colecao-completa-sete-volumes',
    user: 'larissa',
    rating: 5,
    comment: 'Presente de aniversário para minha irmã. Ela abriu e ficou uns cinco minutos sem falar nada.',
    days: 14,
  },
  {
    slug: 'caixa-primeiros-anos',
    user: 'otavio',
    rating: 4,
    comment: 'Boa porta de entrada e custa bem menos que a coleção inteira. Recomendo para quem vai começar.',
    days: 35,
  },
  {
    slug: 'pedra-filosofal-edicao-ilustrada',
    user: 'sofia',
    rating: 5,
    comment: 'As ilustrações do Jim Kay são de outro nível. É um livro para deixar aberto na mesa.',
    days: 22,
  },
  {
    slug: 'pedra-filosofal-edicao-ilustrada',
    user: 'marina',
    rating: 5,
    comment: 'Caro, mas justifica. O papel é grosso e a impressão não borra nada.',
    days: 11,
  },
  {
    slug: 'camara-secreta-edicao-ilustrada',
    user: 'henrique',
    rating: 4,
    comment: 'Mesmo padrão da primeira ilustrada. Só achei o miolo um pouco mais escuro.',
    days: 18,
  },
  {
    slug: 'pedra-filosofal-edicao-pop-up',
    user: 'lia',
    rating: 5,
    comment: 'As páginas em 3D são absurdas. O Salão Principal se levanta inteiro, com as velas.',
    days: 8,
  },
  {
    slug: 'pedra-filosofal-edicao-pop-up',
    user: 'natalia',
    rating: 5,
    comment: 'Tem que abrir devagar, mas o resultado impressiona qualquer visita.',
    days: 5,
  },
  {
    slug: 'pedra-filosofal-edicao-grifinoria',
    user: 'ricardo',
    rating: 5,
    comment: 'O caderno sobre a casa no fim do livro é um extra que eu não esperava. Capa dura ótima.',
    days: 29,
  },
  {
    slug: 'pedra-filosofal-edicao-sonserina',
    user: 'thiago',
    rating: 5,
    comment: 'Verde e prata muito bem impressos. Comprei as quatro e a da Sonserina ficou a mais bonita.',
    days: 27,
  },
  {
    slug: 'pedra-filosofal-edicao-corvinal',
    user: 'juliana',
    rating: 4,
    comment: 'Linda, mas o azul da foto do site é um pouco mais claro que o real.',
    days: 24,
  },

  {
    slug: 'varinha-de-harry-potter',
    user: 'caio',
    rating: 5,
    comment: 'O peso surpreende, não parece resina barata. A caixa é metade do presente.',
    days: 20,
  },
  {
    slug: 'varinha-de-harry-potter',
    user: 'lia',
    rating: 4,
    comment: 'Linda, mas o verniz marca com a digital. Uso luva de algodão para manusear.',
    days: 15,
  },
  {
    slug: 'varinha-de-hermione-granger',
    user: 'camila',
    rating: 5,
    comment: 'O detalhe do punho é bem fiel ao filme. Veio numa caixa com berço, sem folga nenhuma.',
    days: 32,
  },
  {
    slug: 'varinha-de-rony-weasley',
    user: 'felipe',
    rating: 4,
    comment: 'Boa réplica pelo preço. O acabamento é um pouco mais simples que o da varinha do Harry.',
    days: 41,
  },
  {
    slug: 'varinha-das-varinhas',
    user: 'rodrigo',
    rating: 5,
    comment: 'Os nós da madeira são esculpidos um por um. Fica muito bem no suporte de parede.',
    days: 13,
  },
  {
    slug: 'varinha-de-severo-snape',
    user: 'beatriz',
    rating: 5,
    comment: 'Simples e elegante, exatamente como devia ser. Chegou antes do prazo.',
    days: 10,
  },
  {
    slug: 'varinha-com-lumos',
    user: 'gustavo',
    rating: 4,
    comment: 'A luz é mais forte do que eu imaginava. As pilhas já vieram, o que ajudou.',
    days: 7,
  },
  {
    slug: 'caixa-de-olivaras',
    user: 'larissa',
    rating: 3,
    comment: 'A ideia do sorteio é legal, mas cai muito a mesma varinha. Comprei duas e vieram iguais.',
    days: 6,
  },

  {
    slug: 'vira-tempo',
    user: 'bruna',
    rating: 5,
    comment: 'Os aros giram de verdade e o vidro é vidro mesmo. Melhor compra do ano.',
    days: 36,
  },
  {
    slug: 'vira-tempo-colar',
    user: 'sofia',
    rating: 4,
    comment: 'Uso quase todo dia. A corrente é fina, então trato com cuidado.',
    days: 17,
  },
  {
    slug: 'medalhao-de-salazar-sonserina',
    user: 'vinicius',
    rating: 5,
    comment: 'Pesado, frio na mão e abre de verdade. Ficou melhor do que nas fotos.',
    days: 23,
  },
  {
    slug: 'diario-de-tom-riddle',
    user: 'patricia',
    rating: 5,
    comment: 'Uso como diário mesmo. O furo do dente de basilisco no meio das páginas é ótimo.',
    days: 31,
  },
  {
    slug: 'espada-de-godrico-grifinoria',
    user: 'otavio',
    rating: 4,
    comment: 'Enorme, bem maior do que parece na foto. Meça a parede antes de comprar.',
    days: 45,
  },
  {
    slug: 'chapeu-seletor',
    user: 'renata',
    rating: 5,
    comment: 'A boca abre e fecha e as dobras do feltro são caprichadas. Sucesso na festa.',
    days: 12,
  },
  {
    slug: 'carta-de-aceitacao-de-hogwarts',
    user: 'lia',
    rating: 5,
    comment: 'Pedi com o nome da minha filha. Ela chorou. Escrita à mão mesmo, com pena.',
    days: 9,
  },
  {
    slug: 'carta-de-aceitacao-de-hogwarts',
    user: 'eduardo',
    rating: 5,
    comment: 'O lacre chegou intacto e a caligrafia é caprichada. Vale cada centavo como presente.',
    days: 4,
  },
  {
    slug: 'sapos-de-chocolate',
    user: 'natalia',
    rating: 3,
    comment: 'O chocolate é comum, a graça está na caixa e na figurinha. Chegou meio derretido no calor.',
    days: 3,
  },
  {
    slug: 'boneco-colecionavel-dobby',
    user: 'henrique',
    rating: 5,
    comment: 'Pintura limpa, sem borrão nenhum. Já é o quarto da linha que eu compro aqui.',
    days: 19,
  },
  {
    slug: 'boneco-colecionavel-hagrid',
    user: 'ricardo',
    rating: 4,
    comment: 'Bem maior que os outros, como prometido. Só achei a base um pouco instável.',
    days: 26,
  },

  {
    slug: 'cachecol-da-sua-casa',
    user: 'marina',
    rating: 5,
    comment: 'Lã grossa de verdade, aguentou o inverno de Curitiba. Escolhi Corvinal e chegou certo.',
    days: 48,
  },
  {
    slug: 'cachecol-da-sua-casa',
    user: 'thiago',
    rating: 4,
    comment: 'Bom cachecol, mas solta um pouco de fiapo nas primeiras lavagens.',
    days: 34,
  },
  {
    slug: 'sueter-da-casa',
    user: 'camila',
    rating: 5,
    comment: 'Modelagem boa e não arranha. Comprei M e serviu certinho.',
    days: 21,
  },
  {
    slug: 'uniforme-de-quadribol',
    user: 'felipe',
    rating: 4,
    comment: 'Bem feito e dá para jogar com ele mesmo. As caneleiras são meio duras no começo.',
    days: 39,
  },
  {
    slug: 'gravata-da-casa',
    user: 'beatriz',
    rating: 5,
    comment: 'Usei no casamento temático de um amigo. As listras são bem definidas.',
    days: 15,
  },
  {
    slug: 'traje-de-gala-do-baile-de-inverno',
    user: 'juliana',
    rating: 5,
    comment: 'Demorou as quatro semanas prometidas, mas o caimento é de costureira mesmo.',
    days: 52,
  },

  {
    slug: 'caderno-mapa-do-maroto',
    user: 'gustavo',
    rating: 5,
    comment: 'Papel bom, não passa a tinta da caneta. Uso na faculdade.',
    days: 11,
  },
  {
    slug: 'pena-e-tinteiro',
    user: 'larissa',
    rating: 4,
    comment: 'Escrever com ela é difícil no começo e vale a pena. A tinta rende bastante.',
    days: 28,
  },
  {
    slug: 'marcadores-magneticos-das-casas',
    user: 'sofia',
    rating: 5,
    comment: 'Baratinho e resolve. Comprei três jogos para dar de brinde no meu clube do livro.',
    days: 8,
  },
  {
    slug: 'agenda-de-hogwarts',
    user: 'otavio',
    rating: 4,
    comment: 'Boa agenda, com espaço de sobra por dia. A capa poderia ser um pouco mais rígida.',
    days: 43,
  },

  {
    slug: 'lego-castelo-de-hogwarts',
    user: 'caio',
    rating: 5,
    comment: 'Trinta e duas horas de montagem em três finais de semana. Vale cada peça.',
    days: 37,
  },
  {
    slug: 'lego-castelo-de-hogwarts',
    user: 'vinicius',
    rating: 5,
    comment: 'Não faltou nenhuma peça e o manual é bem organizado. Chegou com a caixa perfeita.',
    days: 16,
  },
  {
    slug: 'lego-beco-diagonal',
    user: 'rodrigo',
    rating: 5,
    comment: 'As quatro fachadas se encaixam e viram uma rua só. Meu set favorito da linha.',
    days: 49,
  },
  {
    slug: 'lego-expresso-de-hogwarts',
    user: 'patricia',
    rating: 4,
    comment: 'Muito bonito montado. Só achei o preço pesado mesmo em promoção.',
    days: 24,
  },
  {
    slug: 'lego-edwiges',
    user: 'natalia',
    rating: 5,
    comment: 'Montagem tranquila para uma tarde e as asas mexem. Ótimo presente barato.',
    days: 6,
  },
  {
    slug: 'jogo-de-tabuleiro-batalha-por-hogwarts',
    user: 'henrique',
    rating: 5,
    comment: 'Jogamos em quatro e não vimos o tempo passar. As caixas por ano são uma sacada boa.',
    days: 13,
  },
  {
    slug: 'quebra-cabeca-do-castelo',
    user: 'renata',
    rating: 4,
    comment: 'Papelão grosso e encaixe firme. As peças do céu dão trabalho, fica o aviso.',
    days: 30,
  },

  {
    slug: 'caneca-mapa-do-maroto',
    user: 'eduardo',
    rating: 5,
    comment: 'O efeito com o café quente funciona direitinho e não desbotou depois de dois meses.',
    days: 42,
  },
  {
    slug: 'caneca-mapa-do-maroto',
    user: 'bruna',
    rating: 4,
    comment: 'Muito legal, mas não pode ir na máquina de lavar. Lavo na mão e continua perfeita.',
    days: 20,
  },
  {
    slug: 'caneca-da-sua-casa',
    user: 'marina',
    rating: 4,
    comment: 'Tamanho bom e cerâmica pesada. A alça poderia ser um pouco maior.',
    days: 18,
  },
  {
    slug: 'estandarte-da-corvinal',
    user: 'sofia',
    rating: 5,
    comment: 'Tecido bom, sem transparência. Ficou ótimo em cima da escrivaninha.',
    days: 27,
  },
  {
    slug: 'luminaria-vira-tempo',
    user: 'camila',
    rating: 5,
    comment: 'A luz é quente e bem fraquinha, ideal de cabeceira. Não esquenta nada.',
    days: 14,
  },
  {
    slug: 'mochila-de-hogwarts',
    user: 'thiago',
    rating: 4,
    comment: 'Cabe notebook de 15 polegadas com folga. As alças poderiam ter mais espuma.',
    days: 22,
  },
  {
    slug: 'colar-do-pomo-de-ouro',
    user: 'larissa',
    rating: 5,
    comment: 'As asas abrem e fecham sem forçar e ainda guarda foto dentro. Presente certeiro.',
    days: 7,
  },
  {
    slug: 'copo-de-cerveja-amanteigada',
    user: 'ricardo',
    rating: 3,
    comment: 'Bonito, mas menor do que eu esperava. Leiam as medidas antes de comprar.',
    days: 5,
  },
]

type SeedOrder = {
  code: string
  user: string
  status: OrderStatus
  days: number
  recipient: string
  address: string
  city: string
  state: string
  zipCode: string
  shipping?: number
  items: [string, number][]
}

const ORDERS: SeedOrder[] = [
  {
    code: 'LP-4K7M2P',
    user: 'agostinho',
    status: 'DELIVERED',
    days: 21,
    recipient: 'Agostinho Carrara',
    address: 'Rua do Catete, 1010',
    city: 'Rio de Janeiro',
    state: 'RJ',
    zipCode: '22220-000',
    items: [['harry-potter-e-a-camara-secreta', 1]],
  },
  {
    code: 'LP-9T3X8B',
    user: 'bruna',
    status: 'SHIPPED',
    days: 2,
    recipient: 'Bruna Almeida',
    address: 'Avenida Paulista, 900, apto 71',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01310-100',
    items: [
      ['harry-potter-e-a-pedra-filosofal', 1],
      ['harry-potter-e-o-prisioneiro-de-azkaban', 1],
    ],
  },
  {
    code: 'LP-2W6H5D',
    user: 'caio',
    status: 'PAID',
    days: 1,
    recipient: 'Caio Nogueira',
    address: 'Rua Padre Chagas, 240',
    city: 'Porto Alegre',
    state: 'RS',
    zipCode: '90570-080',
    items: [
      ['varinha-de-harry-potter', 1],
      ['vira-tempo', 1],
    ],
  },
  {
    code: 'LP-8J1Q4V',
    user: 'lia',
    status: 'DELIVERED',
    days: 9,
    recipient: 'Lia Ferraz',
    address: 'Rua da Bahia, 1200, sala 4',
    city: 'Belo Horizonte',
    state: 'MG',
    zipCode: '30160-011',
    items: [
      ['pedra-filosofal-edicao-pop-up', 1],
      ['carta-de-aceitacao-de-hogwarts', 1],
    ],
  },
  {
    code: 'LP-6R2N9C',
    user: 'marina',
    status: 'DELIVERED',
    days: 49,
    recipient: 'Marina Tavares',
    address: 'Rua Comendador Araújo, 480, apto 902',
    city: 'Curitiba',
    state: 'PR',
    zipCode: '80420-000',
    items: [
      ['cachecol-da-sua-casa', 1],
      ['caneca-da-sua-casa', 2],
    ],
  },
  {
    code: 'LP-3H8K7T',
    user: 'marina',
    status: 'DELIVERED',
    days: 23,
    recipient: 'Marina Tavares',
    address: 'Rua Comendador Araújo, 480, apto 902',
    city: 'Curitiba',
    state: 'PR',
    zipCode: '80420-000',
    items: [
      ['harry-potter-e-o-prisioneiro-de-azkaban', 1],
      ['pedra-filosofal-edicao-ilustrada', 1],
    ],
  },
  {
    code: 'LP-5D4B6M',
    user: 'rodrigo',
    status: 'DELIVERED',
    days: 50,
    recipient: 'Rodrigo Bittencourt',
    address: 'Avenida Boa Viagem, 3300, apto 1201',
    city: 'Recife',
    state: 'PE',
    zipCode: '51020-000',
    items: [
      ['harry-potter-e-o-calice-de-fogo', 1],
      ['lego-beco-diagonal', 1],
    ],
  },
  {
    code: 'LP-7Q9F3J',
    user: 'rodrigo',
    status: 'DELIVERED',
    days: 15,
    recipient: 'Rodrigo Bittencourt',
    address: 'Avenida Boa Viagem, 3300, apto 1201',
    city: 'Recife',
    state: 'PE',
    zipCode: '51020-000',
    items: [['varinha-das-varinhas', 1]],
  },
  {
    code: 'LP-2M5V8W',
    user: 'camila',
    status: 'DELIVERED',
    days: 34,
    recipient: 'Camila Rezende',
    address: 'Rua Sete de Setembro, 88',
    city: 'Florianópolis',
    state: 'SC',
    zipCode: '88010-000',
    items: [
      ['varinha-de-hermione-granger', 1],
      ['harry-potter-e-o-enigma-do-principe', 1],
    ],
  },
  {
    code: 'LP-9C6T4X',
    user: 'camila',
    status: 'SHIPPED',
    days: 3,
    recipient: 'Camila Rezende',
    address: 'Rua Sete de Setembro, 88',
    city: 'Florianópolis',
    state: 'SC',
    zipCode: '88010-000',
    items: [
      ['sueter-da-casa', 1],
      ['luminaria-vira-tempo', 1],
    ],
  },
  {
    code: 'LP-4B7H2K',
    user: 'thiago',
    status: 'DELIVERED',
    days: 57,
    recipient: 'Thiago Menezes',
    address: 'Quadra SQS 108, Bloco C, apto 304',
    city: 'Brasília',
    state: 'DF',
    zipCode: '70347-030',
    items: [
      ['harry-potter-e-a-ordem-da-fenix', 1],
      ['cachecol-da-sua-casa', 1],
    ],
  },
  {
    code: 'LP-6N3J9P',
    user: 'thiago',
    status: 'DELIVERED',
    days: 24,
    recipient: 'Thiago Menezes',
    address: 'Quadra SQS 108, Bloco C, apto 304',
    city: 'Brasília',
    state: 'DF',
    zipCode: '70347-030',
    items: [
      ['pedra-filosofal-edicao-sonserina', 1],
      ['mochila-de-hogwarts', 1],
    ],
  },
  {
    code: 'LP-8V2D5R',
    user: 'patricia',
    status: 'DELIVERED',
    days: 33,
    recipient: 'Patrícia Vasconcelos',
    address: 'Rua Barão de Itapetininga, 255, conj. 12',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01042-001',
    items: [
      ['harry-potter-e-as-reliquias-da-morte', 1],
      ['diario-de-tom-riddle', 1],
    ],
  },
  {
    code: 'LP-3T7K6B',
    user: 'patricia',
    status: 'PAID',
    days: 1,
    recipient: 'Patrícia Vasconcelos',
    address: 'Rua Barão de Itapetininga, 255, conj. 12',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01042-001',
    items: [['lego-expresso-de-hogwarts', 1]],
  },
  {
    code: 'LP-5W9M4C',
    user: 'eduardo',
    status: 'DELIVERED',
    days: 44,
    recipient: 'Eduardo Prates',
    address: 'Avenida Rio Branco, 156, sala 2210',
    city: 'Rio de Janeiro',
    state: 'RJ',
    zipCode: '20040-901',
    items: [
      ['harry-potter-e-a-crianca-amaldicoada', 1],
      ['caneca-mapa-do-maroto', 1],
    ],
  },
  {
    code: 'LP-7F4Q8N',
    user: 'eduardo',
    status: 'DELIVERED',
    days: 6,
    recipient: 'Eduardo Prates',
    address: 'Avenida Rio Branco, 156, sala 2210',
    city: 'Rio de Janeiro',
    state: 'RJ',
    zipCode: '20040-901',
    items: [['carta-de-aceitacao-de-hogwarts', 1]],
  },
  {
    code: 'LP-2K8B6V',
    user: 'juliana',
    status: 'DELIVERED',
    days: 54,
    recipient: 'Juliana Sampaio',
    address: 'Rua Dom José de Barros, 90',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01038-100',
    items: [['traje-de-gala-do-baile-de-inverno', 1]],
  },
  {
    code: 'LP-9J3N7T',
    user: 'juliana',
    status: 'DELIVERED',
    days: 18,
    recipient: 'Juliana Sampaio',
    address: 'Rua Dom José de Barros, 90',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01038-100',
    items: [
      ['harry-potter-e-o-calice-de-fogo', 1],
      ['pedra-filosofal-edicao-corvinal', 1],
    ],
  },
  {
    code: 'LP-4C6R9H',
    user: 'felipe',
    status: 'DELIVERED',
    days: 43,
    recipient: 'Felipe Andrade',
    address: 'Avenida Sete de Setembro, 1200',
    city: 'Salvador',
    state: 'BA',
    zipCode: '40060-001',
    items: [
      ['uniforme-de-quadribol', 1],
      ['quadribol-atraves-dos-seculos', 1],
    ],
  },
  {
    code: 'LP-6H2V5K',
    user: 'felipe',
    status: 'CANCELLED',
    days: 40,
    recipient: 'Felipe Andrade',
    address: 'Avenida Sete de Setembro, 1200',
    city: 'Salvador',
    state: 'BA',
    zipCode: '40060-001',
    items: [['varinha-de-rony-weasley', 1]],
  },
  {
    code: 'LP-8B5T3M',
    user: 'renata',
    status: 'DELIVERED',
    days: 46,
    recipient: 'Renata Coutinho',
    address: 'Rua Goiás, 445',
    city: 'Goiânia',
    state: 'GO',
    zipCode: '74010-010',
    items: [
      ['os-contos-de-beedle-o-bardo', 1],
      ['chapeu-seletor', 1],
    ],
  },
  {
    code: 'LP-3N7W4J',
    user: 'renata',
    status: 'DELIVERED',
    days: 31,
    recipient: 'Renata Coutinho',
    address: 'Rua Goiás, 445',
    city: 'Goiânia',
    state: 'GO',
    zipCode: '74010-010',
    items: [['quebra-cabeca-do-castelo', 1]],
  },
  {
    code: 'LP-5R9K2D',
    user: 'gustavo',
    status: 'DELIVERED',
    days: 12,
    recipient: 'Gustavo Lemes',
    address: 'Rua São João, 780, apto 15',
    city: 'Campinas',
    state: 'SP',
    zipCode: '13010-090',
    items: [
      ['harry-potter-e-as-reliquias-da-morte', 1],
      ['caderno-mapa-do-maroto', 2],
    ],
  },
  {
    code: 'LP-7M4J8C',
    user: 'gustavo',
    status: 'PAID',
    days: 8,
    recipient: 'Gustavo Lemes',
    address: 'Rua São João, 780, apto 15',
    city: 'Campinas',
    state: 'SP',
    zipCode: '13010-090',
    items: [['varinha-com-lumos', 1]],
  },
  {
    code: 'LP-2V6D9B',
    user: 'beatriz',
    status: 'DELIVERED',
    days: 28,
    recipient: 'Beatriz Fontoura',
    address: 'Rua Duque de Caxias, 320',
    city: 'Fortaleza',
    state: 'CE',
    zipCode: '60035-110',
    items: [
      ['animais-fantasticos-e-onde-habitam', 1],
      ['gravata-da-casa', 1],
      ['varinha-de-severo-snape', 1],
    ],
  },
  {
    code: 'LP-9K3B7F',
    user: 'vinicius',
    status: 'DELIVERED',
    days: 62,
    recipient: 'Vinícius Salgado',
    address: 'Avenida Ipiranga, 6681, prédio 32',
    city: 'Porto Alegre',
    state: 'RS',
    zipCode: '90619-900',
    items: [['colecao-completa-sete-volumes', 1]],
  },
  {
    code: 'LP-4J8M6W',
    user: 'vinicius',
    status: 'DELIVERED',
    days: 17,
    recipient: 'Vinícius Salgado',
    address: 'Avenida Ipiranga, 6681, prédio 32',
    city: 'Porto Alegre',
    state: 'RS',
    zipCode: '90619-900',
    items: [
      ['lego-castelo-de-hogwarts', 1],
      ['medalhao-de-salazar-sonserina', 1],
    ],
  },
  {
    code: 'LP-6T2C5N',
    user: 'larissa',
    status: 'DELIVERED',
    days: 16,
    recipient: 'Larissa Pimentel',
    address: 'Rua Marechal Deodoro, 55',
    city: 'Niterói',
    state: 'RJ',
    zipCode: '24030-060',
    items: [
      ['colecao-completa-sete-volumes', 1],
      ['colar-do-pomo-de-ouro', 1],
    ],
  },
  {
    code: 'LP-8D5N3V',
    user: 'larissa',
    status: 'SHIPPED',
    days: 7,
    recipient: 'Larissa Pimentel',
    address: 'Rua Marechal Deodoro, 55',
    city: 'Niterói',
    state: 'RJ',
    zipCode: '24030-060',
    items: [
      ['caixa-de-olivaras', 2],
      ['pena-e-tinteiro', 1],
    ],
  },
  {
    code: 'LP-3B9V7K',
    user: 'otavio',
    status: 'DELIVERED',
    days: 37,
    recipient: 'Otávio Mendonça',
    address: 'Rua XV de Novembro, 640',
    city: 'Blumenau',
    state: 'SC',
    zipCode: '89010-001',
    items: [
      ['caixa-primeiros-anos', 1],
      ['agenda-de-hogwarts', 1],
    ],
  },
  {
    code: 'LP-5N7K4T',
    user: 'sofia',
    status: 'DELIVERED',
    days: 29,
    recipient: 'Sofia Barreto',
    address: 'Avenida Nossa Senhora de Copacabana, 1100',
    city: 'Rio de Janeiro',
    state: 'RJ',
    zipCode: '22060-002',
    items: [
      ['pedra-filosofal-edicao-ilustrada', 1],
      ['estandarte-da-corvinal', 1],
      ['marcadores-magneticos-das-casas', 1],
    ],
  },
  {
    code: 'LP-7W3M9J',
    user: 'sofia',
    status: 'DELIVERED',
    days: 19,
    recipient: 'Sofia Barreto',
    address: 'Avenida Nossa Senhora de Copacabana, 1100',
    city: 'Rio de Janeiro',
    state: 'RJ',
    zipCode: '22060-002',
    items: [['vira-tempo-colar', 1]],
  },
  {
    code: 'LP-2C8J5R',
    user: 'henrique',
    status: 'DELIVERED',
    days: 21,
    recipient: 'Henrique Dorneles',
    address: 'Rua dos Andradas, 1234, sala 501',
    city: 'Porto Alegre',
    state: 'RS',
    zipCode: '90020-008',
    items: [
      ['camara-secreta-edicao-ilustrada', 1],
      ['boneco-colecionavel-dobby', 1],
    ],
  },
  {
    code: 'LP-9V4T6H',
    user: 'henrique',
    status: 'PAID',
    days: 2,
    recipient: 'Henrique Dorneles',
    address: 'Rua dos Andradas, 1234, sala 501',
    city: 'Porto Alegre',
    state: 'RS',
    zipCode: '90020-008',
    items: [['jogo-de-tabuleiro-batalha-por-hogwarts', 1]],
  },
  {
    code: 'LP-4M6B8D',
    user: 'natalia',
    status: 'DELIVERED',
    days: 7,
    recipient: 'Natália Espíndola',
    address: 'Rua Antônio de Albuquerque, 330, apto 604',
    city: 'Belo Horizonte',
    state: 'MG',
    zipCode: '30112-010',
    items: [
      ['pedra-filosofal-edicao-pop-up', 1],
      ['lego-edwiges', 1],
      ['sapos-de-chocolate', 2],
    ],
  },
  {
    code: 'LP-6J9C3W',
    user: 'ricardo',
    status: 'DELIVERED',
    days: 32,
    recipient: 'Ricardo Peixoto',
    address: 'Avenida João Pessoa, 1500',
    city: 'Maceió',
    state: 'AL',
    zipCode: '57025-000',
    items: [
      ['pedra-filosofal-edicao-grifinoria', 1],
      ['boneco-colecionavel-hagrid', 1],
    ],
  },
  {
    code: 'LP-8K5W2N',
    user: 'ricardo',
    status: 'DELIVERED',
    days: 6,
    recipient: 'Ricardo Peixoto',
    address: 'Avenida João Pessoa, 1500',
    city: 'Maceió',
    state: 'AL',
    zipCode: '57025-000',
    items: [['copo-de-cerveja-amanteigada', 1]],
  },
  {
    code: 'LP-3D7N9M',
    user: 'bruna',
    status: 'DELIVERED',
    days: 38,
    recipient: 'Bruna Almeida',
    address: 'Avenida Paulista, 900, apto 71',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01310-100',
    items: [
      ['vira-tempo', 1],
      ['caneca-mapa-do-maroto', 1],
    ],
  },
  {
    code: 'LP-5B2W7C',
    user: 'caio',
    status: 'DELIVERED',
    days: 39,
    recipient: 'Caio Nogueira',
    address: 'Rua Padre Chagas, 240',
    city: 'Porto Alegre',
    state: 'RS',
    zipCode: '90570-080',
    items: [
      ['lego-castelo-de-hogwarts', 1],
      ['harry-potter-e-a-pedra-filosofal', 1],
    ],
  },
]

type SeedTicket = {
  code: string
  user?: string
  name: string
  email: string
  subject: string
  description: string
  urgency: TicketUrgency
  status: TicketStatus
  days: number
  handledBy?: string
  resolution?: string
  resolvedDays?: number
}

const TICKETS: SeedTicket[] = [
  {
    // O chamado que já estava no bd.sql.
    code: '#A7K2M',
    user: 'agostinho',
    name: 'Agostinho Carrara',
    email: 'agostinhocarrara@gmail.com',
    subject: 'Dúvida sobre o site',
    description: 'como faço pra fazer um site bom igual esse?',
    urgency: 'HIGH',
    status: 'OPEN',
    days: 14,
  },
  {
    code: '#B4N9Q',
    user: 'bruna',
    name: 'Bruna Almeida',
    email: 'bruna@example.com',
    subject: 'Pedido chegou com a capa amassada',
    description:
      'O pedido LP-9T3X8B chegou hoje, mas a capa do Prisioneiro de Azkaban veio amassada no canto. Gostaria de trocar.',
    urgency: 'MEDIUM',
    status: 'IN_PROGRESS',
    days: 2,
    handledBy: 'memphis',
  },
  {
    code: '#C2P5R',
    name: 'Visitante',
    email: 'visitante@example.com',
    subject: 'Vocês têm a edição de capa dura?',
    description: 'Procuro a edição comemorativa de capa dura da Pedra Filosofal. Vocês trabalham com ela?',
    urgency: 'LOW',
    status: 'RESOLVED',
    days: 4,
    handledBy: 'memphis',
    resolution:
      'Respondido por e-mail: temos a edição ilustrada por Jim Kay e as quatro edições de casa, todas em capa dura.',
    resolvedDays: 3,
  },
  {
    code: '#D8L3T',
    user: 'lia',
    name: 'Lia Ferraz',
    email: 'lia@example.com',
    subject: 'A varinha da caixa de Olivaras é sorteada mesmo?',
    description:
      'Comprei duas caixas de Olivaras e vieram a mesma varinha. É sorteio de verdade ou o estoque estava com uma só?',
    urgency: 'LOW',
    status: 'OPEN',
    days: 5,
  },
  {
    code: '#E5J7W',
    user: 'larissa',
    name: 'Larissa Pimentel',
    email: 'larissa.pimentel@gmail.com',
    subject: 'Troca de casa no cachecol',
    description:
      'Pedi o cachecol da Grifinória mas escolhi a casa errada no fechamento. Dá para trocar antes de sair para entrega?',
    urgency: 'HIGH',
    status: 'IN_PROGRESS',
    days: 1,
    handledBy: 'tatiane',
  },
  {
    code: '#F3M8K',
    user: 'gustavo',
    name: 'Gustavo Lemes',
    email: 'gustavo.lemes@outlook.com',
    subject: 'Prazo de entrega para Campinas',
    description: 'O pedido LP-7M4J8C ainda está como pago. Consigo uma previsão de postagem?',
    urgency: 'MEDIUM',
    status: 'OPEN',
    days: 3,
  },
  {
    code: '#G9C4B',
    user: 'felipe',
    name: 'Felipe Andrade',
    email: 'felipe.andrade@gmail.com',
    subject: 'Estorno do pedido cancelado',
    description: 'Cancelei o pedido LP-6H2V5K há uma semana e o estorno ainda não apareceu na fatura.',
    urgency: 'HIGH',
    status: 'RESOLVED',
    days: 33,
    handledBy: 'memphis',
    resolution: 'Estorno confirmado com a operadora. O prazo do cartão é de até duas faturas.',
    resolvedDays: 30,
  },
  {
    code: '#H6T2V',
    name: 'Escola Municipal Vila Nova',
    email: 'compras@vilanova.edu.br',
    subject: 'Compra em quantidade para biblioteca escolar',
    description:
      'Precisamos de 30 exemplares da Pedra Filosofal para a biblioteca da escola. Vocês emitem nota com CNPJ e fazem desconto por volume?',
    urgency: 'MEDIUM',
    status: 'IN_PROGRESS',
    days: 6,
    handledBy: 'tatiane',
  },
  {
    code: '#J4W7N',
    user: 'natalia',
    name: 'Natália Espíndola',
    email: 'natalia.espindola@gmail.com',
    subject: 'Sapos de chocolate derretidos',
    description:
      'A caixa de sapos chegou derretida. Entendo que faz calor aqui, mas dá para mandar com isopor da próxima vez?',
    urgency: 'LOW',
    status: 'RESOLVED',
    days: 3,
    handledBy: 'tatiane',
    resolution: 'Reenviado com embalagem térmica, sem custo. A partir de novembro a linha toda vai com gelo seco.',
    resolvedDays: 1,
  },
  {
    code: '#K8B5M',
    user: 'otavio',
    name: 'Otávio Mendonça',
    email: 'otavio.mendonca@gmail.com',
    subject: 'Nota fiscal não chegou',
    description: 'Comprei a caixa dos primeiros anos no mês passado e não recebi a nota por e-mail.',
    urgency: 'MEDIUM',
    status: 'RESOLVED',
    days: 36,
    handledBy: 'memphis',
    resolution: 'Nota reenviada para o e-mail do cadastro e anexada ao pedido no perfil.',
    resolvedDays: 35,
  },
  {
    code: '#L2N9J',
    name: 'Visitante',
    email: 'duvidas@example.com',
    subject: 'Vocês entregam em Manaus?',
    description: 'Queria saber se o frete grátis acima de R$ 250 vale para a região Norte também.',
    urgency: 'LOW',
    status: 'OPEN',
    days: 1,
  },
  {
    code: '#M7V3C',
    user: 'vinicius',
    name: 'Vinícius Salgado',
    email: 'vinicius.salgado@gmail.com',
    subject: 'Peça faltando no LEGO do castelo',
    description:
      'Faltou uma peça cinza 1x2 no saco 14 do castelo. Não trava a montagem, mas queria repor. Tenho o número do manual.',
    urgency: 'MEDIUM',
    status: 'RESOLVED',
    days: 15,
    handledBy: 'memphis',
    resolution: 'Peça avulsa enviada por carta registrada. Chega em até dez dias úteis.',
    resolvedDays: 13,
  },
]

async function main() {
  console.log('Limpando dados anteriores...')

  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.cartItem.deleteMany()
  await prisma.cart.deleteMany()
  await prisma.review.deleteMany()
  await prisma.supportTicket.deleteMany()
  await prisma.passwordReset.deleteMany()
  await prisma.user.deleteMany()
  await prisma.book.deleteMany()
  await prisma.author.deleteMany()
  await prisma.publisher.deleteMany()

  console.log('Semeando autora e editora...')

  const rowling = await prisma.author.create({
    data: {
      slug: 'j-k-rowling',
      name: 'J. K. Rowling',
      nationality: 'Britânica',
      bio: 'Criou em sete livros a maior saga bruxa de todos os tempos: mais de 450 milhões de exemplares vendidos, traduções em 78 idiomas e uma série de filmes inesquecíveis.',
      photoUrl: '/img/scenes/autora.webp',
    },
  })

  const rocco = await prisma.publisher.create({
    data: { slug: 'rocco', name: 'Editora Rocco', city: 'Rio de Janeiro', founded: 1975 },
  })

  console.log('Semeando o acervo (' + CATALOG.length + ' produtos)...')

  await prisma.book.createMany({
    data: CATALOG.map((item, index) => ({
      slug: item.slug,
      title: item.title,
      kind: item.kind,
      isbn: item.isbn ?? null,
      // Só quem tem ficha bibliográfica ganha autora e editora. Uma varinha não
      // tem autor nem ISBN: o modelo aceita nulo de propósito.
      authorId: item.biblio ? rowling.id : null,
      publisherId: item.biblio ? rocco.id : null,
      price: item.price,
      compareAtPrice: item.compareAtPrice ?? null,
      stock: item.stock,
      genre: item.genre,
      synopsis: item.synopsis,
      excerpt: item.excerpt ?? null,
      coverUrl: '/img/' + item.image,
      pages: item.pages ?? null,
      language: 'Português',
      brand: item.brand ?? null,
      house: item.house ?? null,
      character: item.character ?? null,
      tags: item.tags ?? [],
      featured: item.featured ?? false,
      publishedAt: item.publishedAt ? new Date(item.publishedAt) : null,
      position: index + 1,
    })),
  })

  const books = await prisma.book.findMany({
    select: { id: true, slug: true, title: true, price: true, coverUrl: true },
  })
  const bookBySlug = new Map(books.map((book) => [book.slug, book]))

  const bookOf = (slug: string) => {
    const book = bookBySlug.get(slug)
    if (!book) throw new Error('Produto não encontrado no catálogo: ' + slug)
    return book
  }

  console.log('Semeando ' + USERS.length + ' usuários...')

  const passwordHash = await bcrypt.hash('libraryspotter', 10)
  const userIds = new Map<string, string>()

  for (const seed of USERS) {
    const user = await prisma.user.create({
      data: { name: seed.name, email: seed.email, passwordHash, role: seed.role, cart: { create: {} } },
    })
    userIds.set(seed.key, user.id)
  }

  const userOf = (key: string) => {
    const id = userIds.get(key)
    if (!id) throw new Error('Usuário não semeado: ' + key)
    return id
  }

  console.log('Semeando ' + REVIEWS.length + ' avaliações...')

  await prisma.review.createMany({
    data: REVIEWS.map((review) => ({
      bookId: bookOf(review.slug).id,
      userId: userOf(review.user),
      rating: review.rating,
      comment: review.comment,
      createdAt: daysAgo(review.days),
    })),
  })

  console.log('Semeando ' + ORDERS.length + ' pedidos...')

  for (const order of ORDERS) {
    const items = order.items.map(([slug, quantity]) => {
      const book = bookOf(slug)
      return { bookId: book.id, title: book.title, coverUrl: book.coverUrl, unitPrice: book.price, quantity }
    })

    const subtotal = items.reduce((total, item) => total + Number(item.unitPrice) * item.quantity, 0)
    const shipping = order.shipping ?? 0

    await prisma.order.create({
      data: {
        code: order.code,
        userId: userOf(order.user),
        status: order.status,
        subtotal,
        shipping,
        total: subtotal + shipping,
        recipient: order.recipient,
        address: order.address,
        city: order.city,
        state: order.state,
        zipCode: order.zipCode,
        createdAt: daysAgo(order.days),
        items: { create: items },
      },
    })
  }

  console.log('Semeando ' + TICKETS.length + ' chamados...')

  await prisma.supportTicket.createMany({
    data: TICKETS.map((ticket) => ({
      code: ticket.code,
      userId: ticket.user ? userOf(ticket.user) : null,
      name: ticket.name,
      email: ticket.email,
      subject: ticket.subject,
      description: ticket.description,
      urgency: ticket.urgency,
      status: ticket.status,
      handledById: ticket.handledBy ? userOf(ticket.handledBy) : null,
      resolution: ticket.resolution ?? null,
      resolvedAt: ticket.resolvedDays === undefined ? null : daysAgo(ticket.resolvedDays),
      createdAt: daysAgo(ticket.days),
    })),
  })

  console.log('Pronto.')
  console.log('  ' + CATALOG.length + ' produtos, ' + USERS.length + ' usuários, ' + ORDERS.length + ' pedidos')
  console.log('  leitor:     agostinhocarrara@gmail.com / libraryspotter')
  console.log('  fornecedor: japalivros@gmail.com / libraryspotter')
  console.log('  suporte:    memphisdepay@gmail.com / libraryspotter')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
