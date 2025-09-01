var express = require('express');
var router = express.Router();

module.exports = function(upload) {
const logger = require('../src/logger');
  
router.use((req, res, next) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  next();
}); /* adrian vigarista */

function verificarLogin(req, res, next) {
  if (!global.usuarioEmail || global.usuarioEmail === "") {
    return res.redirect('/');
  }
  next()
}
/**
 * 
 * Rotas GET de usuários
 * 
 */

/* GET cadastro */
router.get('/cadastro', function (req, res, next) {
  return res.render('cadastro', { titulo: 'PETFlix - Cadastro' });
});

/* GET login */
router.get('/', function (req, res, next) {
  if (global.usuarioEmail && global.usuarioEmail != "") {
    logger.info("login_redirect", { user: global.usuarioEmail });
    return res.redirect('/home');
  }
  logger.info("login_page_opened");
  return res.render('index', { titulo: 'PETFlix - Login' });
});

/* GET confirmado (confirmacao login) *
  router.get('/confirmado', function(req, res, next) {
  verificarLogin(res);

  return res.render('confirmado', { titulo: 'PETFlix - Login Confirmado' });
});
*/


/* GET PERFIL */
router.get('/perfil', verificarLogin, async function (req, res) {
  const pets = await global.banco.buscarPetsPorUsuario(global.usuarioCodigo);

  res.render('perfil', {
    titulo: 'PETFlix - Perfil',
    pets: pets || []
  });
});




/* post FORUM */
router.post('/forum', verificarLogin, async function(req, res, next) {
  const { fortitulo, conteudo, catforum } = req.body;
  const usucodigo = global.usuarioCodigo;
  try {
    await global.banco.criarTopico({ fortitulo, conteudo, catforum, usucodigo });
    res.redirect('/forum');
  } catch (error) {
    next(error);
  }
});

/* GET FORUM INCLUSAO */
router.get('/forum/novo', verificarLogin, function(req, res) {
  res.render('foruminclusao', {
    titulo: 'PETFlix - Novo Tópico'
  });
});

/* GET pagina do forum (estilo painel de controle) */
router.get('/forum', verificarLogin, async function(req, res, next) {
  try {
    const limiteDePosts = 10;

    const [geral, adocao, cuidados, medicamentos, ultimos] = await Promise.all([
      global.banco.listarTopicosPorCategoria('Geral', limiteDePosts),
      global.banco.listarTopicosPorCategoria('Adocao de Pets', limiteDePosts),
      global.banco.listarTopicosPorCategoria('Cuidados Pets', limiteDePosts),
      global.banco.listarTopicosPorCategoria('Medicamentos', limiteDePosts),
      global.banco.listarTopicosPorCategoria('Ultimos Posts', limiteDePosts)
    ]);

    res.render('forum', {
      titulo: 'PETFlix - Fórum',
      geral,
      adocao,
      cuidados,
      medicamentos,
      ultimos
    });


  } catch (error) {
    next(error);
  }
});
/* POST PARA RESPOSTAS NO FORUM*/
router.post('/api/forum/topico/:id/responder', verificarLogin, async (req, res) => {
  try {
    const idTopico = req.params.id;
    const { conteudo } = req.body;
    const usucodigo = global.usuarioCodigo; // Ou req.session.usuarioCodigo

    if (!conteudo || conteudo.trim() === '') {
      return res.status(400).json({ error: 'Conteúdo da resposta não pode ser vazio' });
    }

    // Agora, apenas chame a função centralizada do banco
    await global.banco.criarResposta(idTopico, conteudo, usucodigo);

    res.json({ sucesso: true, mensagem: 'Resposta adicionada com sucesso!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao adicionar resposta' });
  }
});

/* GET pagina do forum API*/
router.get('/api/forum/topico/:id', verificarLogin, async function(req, res, next) {
    try {
        const idTopico = req.params.id;

        // Reutilizamos as mesmas funções de antes!
        const [topico, respostas] = await Promise.all([
            global.banco.buscarTopicoPorId(idTopico),
            global.banco.buscarRespostasPorTopicoId(idTopico)
        ]);
      
        if (!topico) {
            // Se não encontrar, retorna um erro 404 em JSON
            return res.status(404).json({ error: 'Tópico não encontrado' });
        }

        // Envia os dados encontrados como uma resposta JSON
        res.json({ topico, respostas });

    } catch (error) {
        // Envia um erro 500 em caso de falha no servidor
        res.status(500).json({ error: 'Erro ao buscar dados do tópico.' });
    }
});



// GET - Página de Regras do Fórum
router.get('/regras', verificarLogin, function(req, res) {
  res.render('forum_regras', {
    titulo: 'PETFlix - Regras do Fórum'
  });
});

/**
 * 
 * Rotas POST de usuários
 * 
 */
/*/ POST cadastro*
router.post('/cadastro', async function (req, res, next) {
  const { nome, email, senha } = req.body;

  // inserindo usuario no banco
  await global.banco.criarUsuario({ nome, email, senha });

  res.redirect('/');
});*/


//POST CADASTRO
router.post('/cadastro', async function (req, res) {
  const { email, senha } = req.body;

  try {
    await global.banco.inserirUsuario(email, senha);
    res.redirect('/'); // Redireciona para login
  } catch (error) {
    console.error('Erro ao cadastrar usuário:', error);
    res.render('cadastro', {
      titulo: 'PETFlix - Cadastro',
      erro: 'Erro ao cadastrar. Tente novamente.'
    });
  }
});





/* POST login */
router.post('/login', async function (req, res, next) {
  const email = req.body.email;
  const senha = req.body.senha;

  try {
    const usuarioValido = await global.banco.buscarUsuario({ email, senha });

    if (usuarioValido) {
      global.usuarioCodigo = usuarioValido.usucodigo;
      global.usuarioEmail = usuarioValido.usuemail;

      logger.info("login_success", {
        email: email,
        user_id: usuarioValido.usucodigo
      });

      res.redirect('/home');
    } else {
      logger.warn("login_failed", {
        email: email,
        reason: "Credenciais inválidas"
      });

      res.render('index', { titulo: 'PETFlix - Login', erro: 'E-mail ou senha incorretos.' });
    }
  } catch (err) {
    logger.error("login_error", {
      email: email,
      message: err.message,
      stack: err.stack
    });

    next(err); 
  }
});

/* routas gets da home*/
/*
router.get('/home', verificarLogin, function (req, res, next) {
  /*res.render('home',
    {
      titulo: 'PETFlix - Home'
    });
  res.render('home', {
    titulo: 'Página Inicial',
    destaque: { vidarquivo: 'video.mp4' }
  });*/



/*
router.get('/home', verificarLogin, async function (req, res, next) {
  try {
    // Busca os vídeos para cada categoria em paralelo
    const [destaque, populares, educandoCaes, educandoGatos] = await Promise.all([
      global.banco.buscarDestaque(),
      global.banco.buscarPopulares(), // Supondo que esta função busque os mais populares
      global.banco.buscarVideosPorNomeCategoria('Educando Cães'),
      global.banco.buscarVideosPorNomeCategoria('Educando Gatos')
    ]);

    res.render('home', {
      titulo: 'PETFlix - Home',
      destaque: destaque || {},
      populares: populares || [],
      educandoCaes: educandoCaes || [],
      educandoGatos: educandoGatos || []
    });

  } catch (erro) {
    console.error("Erro ao carregar a home page:", erro);
    next(erro); // Passa o erro para o handler de erros do Express
  }
});*/


router.get('/home', verificarLogin, async function (req, res, next) {
  try {
    const populares = await global.banco.buscarPopulares();
    const educandoCaes = await global.banco.buscarVideosPorNomeCategoria('Educando Cães');
    const educandoGatos = await global.banco.buscarVideosPorNomeCategoria('Educando Gatos');

    // 3 vídeos fixos
    const destaqueVideos = [
      { vidcodigo: 17, vidtitulo: 'Gatos mais engraçados - Compilado TENTE NÃO RIR', vidcapa: '1751917939791-823226240.jpg' },
      { vidcodigo: 14, vidtitulo: '24 HORAS COM CACHORRO MINI VS MÉDIO VS GIGANTE !!!', vidcapa: '1751917737114-365371883.jpg' },
      { vidcodigo: 19, vidtitulo: 'Dicas Básicas para Cães - Senta - Fica - Bate Aqui e Deita', vidcapa: '1751917979533-901477250.png' }
    ];

    res.render('home', {
      titulo: 'PETFlix - Home',
      destaqueVideos,
      populares: populares || [],
      educandoCaes: educandoCaes || [],
      educandoGatos: educandoGatos || []
    });
  } catch (erro) {
    console.error("Erro ao carregar a home page:", erro);
    next(erro);
  }
});







router.get('/categorias', verificarLogin, async (req, res, next) => {
  try {
    const catSelecionada = req.query.cat || null;

    // Buscar todas as categorias
    const categorias = await global.banco.listarCategorias();

    // Se não veio categoria, pega a primeira da lista (se existir)
    const categoriaAtiva = catSelecionada || (categorias.length > 0 ? categorias[0].catnome : null);

    // Buscar vídeos só da categoria ativa
    const videos = categoriaAtiva ? await global.banco.buscarVideosPorNomeCategoria(categoriaAtiva) : [];

    res.render('categorias', {
      titulo: 'PETFlix - Categorias',
      categorias,
      categoriaAtiva,
      videos
    });
  } catch (err) {
    console.error('Erro ao carregar categorias:', err);
    next(err);
  }
});




  






/* PERFIL / PETS */
router.get('/novopet', verificarLogin, function (req, res, next) {
  res.render('perfil_novopet', {
    titulo: 'Adicionar Pet',
    mensagem: null,
    sucesso: false
  });
});


/*POST ORIGINAL SEM MULTER

router.post('/novopet', verificarLogin, async function (req, res, next) {
  const { nome_pet, raca_pet, idade_pet } = req.body;

  try {
    await global.banco.criarPet({
      nome_pet,
      raca_pet,
      idade_pet,
      foto_pet: null, // Ainda não usando imagem
      usucodigo: global.usuarioCodigo
    });

    res.render('perfil_novopet', {
      titulo: 'Adicionar Pet',
      mensagem: 'Pet cadastrado com sucesso!',
      sucesso: true
    });
  } catch (error) {
    console.error(error);
    res.render('perfil_novopet', {
      titulo: 'Adicionar Pet',
      mensagem: 'Erro ao cadastrar o pet.',
      sucesso: false
    });
  }
});*/

router.post('/novopet', upload.single('foto_pet'), async (req, res) => {
  const { nome_pet, raca_pet, idade_pet } = req.body;
  const foto_pet = req.file ? req.file.filename : null;
  const usucodigo = global.usuarioCodigo;

  const pet = {
    nome_pet,
    raca_pet,
    idade_pet,
    foto_pet,
    usucodigo
  };

  try {
    await global.banco.criarPet(pet);
    res.redirect('/perfil'); // ou renderize a página que quiser
  } catch (error) {
    console.error(error);
    res.render('perfil_novopet', {
      titulo: 'Adicionar Pet',
      mensagem: 'Erro ao cadastrar o pet.',
      sucesso: false
    });
  }
});


router.get('/atualizarpet/:id', verificarLogin, async function (req, res, next) {
  const id_pet = req.params.id;
  const pet = await global.banco.buscarPetPorId(id_pet);

  res.render('perfil_atualizarpet', {
    titulo: 'Atualizar Pet',
    pet: pet,
    mensagem: null, // <<< adicione isso
    sucesso: null   // <<< e isso
  });
});


// POST atualizar pet
router.post('/atualizarpet/:id', verificarLogin, async function (req, res) {
  const id_pet = req.params.id;
  const { nome_pet, raca_pet, idade_pet } = req.body;

  await global.banco.atualizarPet({ id_pet, nome_pet, raca_pet, idade_pet });

  res.redirect('/perfil');
});



// POST excluir pet
router.post('/excluirpet/:id', verificarLogin, async function (req, res) {
  const id_pet = req.params.id;

  try {
    await global.banco.excluirPet(id_pet); // você vai criar essa função no banco
    res.redirect('/perfil');
  } catch (error) {
    console.error('Erro ao excluir pet:', error);
    res.status(500).send('Erro ao excluir pet.');
  }
});



/* GET assistir vídeo */
router.get('/assistir/:id', verificarLogin, async function (req, res) {
  const videoId = parseInt(req.params.id);
  const video = await global.banco.buscarVideoPorCodigo(videoId);

  if (!video) {
    return res.redirect('/home');
  }

  res.render('assistir', {
    titulo: `Assistindo - ${video.vidtitulo}`,
    video
  });
});





/**
 * 
 * Funções diversas
 * 
 */


  //module.exports = router;
  return router;
};