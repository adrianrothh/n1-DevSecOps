var express = require('express');
var router = express.Router();

module.exports = function (uploadVideo) {

const fs = require('fs');
const path = require('path');

  /*---------ADMIN---------*/

  /* GET admin. */
  router.get('/', function (req, res, next) {
    res.render('admin/login');
  });

  /* GET dashboard */
  router.get('/dashboard', function (req, res, next) {
    verificarLogin(res);
    res.render('admin/dashboard', { admNome: global.adminEmail });
  });

  /* GET sair */
  router.get('/sair', function (req, res, next) {
    verificarLogin(res);
    delete global.adminCodigo;
    delete global.adminEmail;
    res.redirect('/admin');
  });

  /* POST login*/
  router.post('/login', async function (req, res, next) {
    const email = req.body.email;
    const senha = req.body.senha;

    const admin = await global.banco.buscarAdmin({ email, senha });

    if (admin.admcodigo) {
      global.adminCodigo = admin.admcodigo;
      global.adminEmail = admin.admemail;
      res.redirect('/admin/dashboard');
    }
    else {
      res.redirect('/admin');
    }
  });


  /* GET ADMIN VIDEOS */
  router.get('/videos', verificarLogin2, async function (req, res) {
    try {
      const videos = await global.banco.listarVideosComCategoria(); // Ex: SELECT v.*, c.catnome FROM videos v JOIN categorias c ON ...
      res.render('admin/videos', {
        titulo: 'Gerenciar Vídeos',
        admNome: global.admNome,
        videos,
        mensagem: null,
        sucesso: false
      });
    } catch (erro) {
      console.error('Erro ao listar vídeos:', erro);
      res.render('admin/videos', {
        titulo: 'Gerenciar Vídeos',
        admNome: global.admNome,
        videos: [],
        mensagem: 'Erro ao carregar vídeos',
        sucesso: false
      });
    }
  });

  router.get('/novovideo', verificarLogin2, async function (req, res) {
    const categorias = await global.banco.buscarCategorias();
    res.render('admin/videos_novo', {
      titulo: 'Novo Vídeo',
      admNome: global.admNome,
      categorias,
      mensagem: null,  // adiciona aqui
      sucesso: false   // e aqui
    });
  });





  // Importante: aqui estamos recebendo dois campos de upload diferentes, um vídeo e uma capa
// trecho do POST /novovideo corrigido:
router.post('/novovideo', verificarLogin2,
  uploadVideo.fields([
    { name: 'vidarquivo', maxCount: 1 },
    { name: 'vidcapa', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      console.log('BODY:', req.body);
      console.log('FILES:', req.files);

      const vidtitulo = req.body.vidtitulo;
      const viddescricao = req.body.viddescricao;
      const catcodigo = req.body.vidcategoria;

      // Aqui pega os arquivos corretamente:
      const vidarquivo = req.files['vidarquivo'] ? req.files['vidarquivo'][0].filename : null;
      const vidminiatura = req.files['vidcapa'] ? req.files['vidcapa'][0].filename : null; // capa como miniatura
      const vidcapa = vidminiatura; // podem ser iguais, se quiser

      // Validação simples
      if (!vidtitulo || !viddescricao || !catcodigo || !vidarquivo || !vidminiatura) {
        return res.render('admin/videos_novo', {
          admNome: global.admNome,
          categorias: await global.banco.buscarCategorias(),
          mensagem: 'Todos os campos são obrigatórios, inclusive os arquivos.',
          sucesso: false
        });
      }

      // Chamada para inserir no banco, enviando os campos necessários
      await global.banco.inserirVideo({
        vidtitulo,
        viddescricao,
        vidarquivo,
        vidminiatura,
        vidcapa,
        catcodigo: parseInt(catcodigo)
      });

      res.redirect('/admin/videos');

    } catch (err) {
      console.error('Erro no envio:', err);
      res.render('admin/videos_novo', {
        admNome: global.admNome,
        categorias: await global.banco.buscarCategorias(),
        mensagem: err.message || 'Erro ao cadastrar vídeo.',
        sucesso: false
      });
    }
  }
);









  router.get('/atualizarvideo/:id', verificarLogin2, async function (req, res) {
    const id = req.params.id;
    try {
      const video = await global.banco.buscarVideoPorId(id);
      const categorias = await global.banco.buscarCategorias();
      res.render('admin/videos_atualizar', {
        titulo: 'Atualizar Vídeo',
        admNome: global.admNome,
        video,
        categorias
      });
    } catch (erro) {
      console.error('Erro ao buscar vídeo:', erro);
      res.redirect('/admin/videos');
    }
  });



  router.post('/atualizarvideo/:id', verificarLogin2, async function (req, res) {
    const id = req.params.id;
    const { vidtitulo, viddescricao, vidarquivo, vidcapa, vidcategoria } = req.body;

    try {
      await global.banco.atualizarVideo(id, { vidtitulo, viddescricao, vidarquivo, vidcapa, vidcategoria });
      res.redirect('/admin/videos');
    } catch (erro) {
      console.error('Erro ao atualizar vídeo:', erro);
      res.redirect('/admin/videos');
    }
  });

router.get('/excluirvideo/:id', verificarLogin2, async function (req, res) {
  const id = req.params.id;
  try {
    const video = await global.banco.buscarVideoPorId(id);
    if (!video) {
      throw new Error('Vídeo não encontrado.');
    }
    
    // Supondo que você também precise do nome da categoria para exibir
    const categoria = await global.banco.adminBuscarCategoriaPorCodigo(video.catcodigo);

    res.render('admin/videos_excluir', {
      titulo: 'Confirmar Exclusão',
      admNome: global.adminEmail,
      video: video,
      categoriaNome: categoria ? categoria.catnome : 'Não encontrada'
    });

  } catch (erro) {
    console.error('Erro ao carregar página de exclusão:', erro);
    res.redirect('/admin/videos');
  }
});

router.post('/excluirvideo/:id', verificarLogin2, async function (req, res) {
  const id = req.params.id;
  try {
    const video = await global.banco.buscarVideoPorId(id);
    if (!video) {
      throw new Error('Vídeo não encontrado para exclusão.');
    }

    // Caminhos para os arquivos
    const caminhoVideo = path.join(__dirname, '../public/uploads/videos', video.vidarquivo);
    const caminhoCapa = path.join(__dirname, '../public/uploads/videos', video.vidcapa);

    // Apaga os arquivos físicos (se existirem)
    if (video.vidarquivo && fs.existsSync(caminhoVideo)) {
      fs.unlinkSync(caminhoVideo);
    }
    if (video.vidcapa && fs.existsSync(caminhoCapa) && caminhoVideo !== caminhoCapa) {
      fs.unlinkSync(caminhoCapa);
    }

    // Apaga o registro do banco de dados
    await global.banco.excluirVideo(id);

    // Redireciona de volta para a lista com mensagem de sucesso
    res.redirect('/admin/videos'); // Você pode adicionar uma mensagem de sucesso na sessão se quiser

  } catch (erro) {
    console.error('Erro ao excluir vídeo:', erro);
    // Em caso de erro, redireciona de volta com uma mensagem de erro
    res.redirect('/admin/videos'); // Você pode adicionar uma mensagem de erro na sessão se quiser
  }
});


  /*---------CATEGORIAS---------*/

  /* GET categorias */
  router.get('/categorias', async function (req, res, next) {
    verificarLogin(res);
    const categorias = await global.banco.adminBuscarCategorias();
    res.render('admin/categorias', {
      admNome: global.admNome,
      categorias,
      mensagem: null,
      sucesso: false
    });
  });

  /* GET nova categoria */
  router.get('/novacategoria', verificarLogin2, function (req, res) {
    res.render('admin/categorias_novo', { admNome: global.admNome, mensagem: null, sucesso: false });
  });


  /* POST nova categoria */
  router.post('/novacategoria', verificarLogin2, async function (req, res, next) {
    const { catnome, catnomenormal } = req.body;

    // Validação básica
    if (!catnome || !catnomenormal) {
      return res.render('admin/categorias_novo', {
        admNome: global.admNome,
        mensagem: 'Todos os campos são obrigatórios.',
        sucesso: false
      });
    }



    // Verificar se a categoria já existe
    const categoriaExistente = await global.banco.adminBuscarCategoria(catnome, catnomenormal);
    if (categoriaExistente) {
      return res.render('admin/categorias_novo', {
        admNome: global.admNome,
        mensagem: 'Categoria ou nome normalizado já existe.',
        sucesso: false
      });
    }

    // Inserir nova categoria
    try {
      await global.banco.adminInserirCategoria(catnome, catnomenormal);
      return res.render('admin/categorias_novo', {
        admNome: global.admNome,
        mensagem: 'Categoria cadastrada com sucesso!',
        sucesso: true
      });
    }
    catch (erro) {
      return res.render('admin/categorias_novo', {
        admNome: global.admNome,
        mensagem: 'Erro ao cadastrar categoria.',
        sucesso: false
      });
    }

  });


  /* GET excluir categoria */
  router.get('/excluircategoria/:id', verificarLogin2, async (req, res) => {
    const catcodigo = req.params.id;

    try {
      // Verificar se a categoria existe
      const categoria = await global.banco.adminBuscarCategoriaPorCodigo(catcodigo);
      if (!categoria) {
        return res.render('admin/categorias', {
          admNome: global.admNome,
          categorias: await global.banco.adminBuscarCategorias(),
          mensagem: 'Categoria não encontrada.',
          sucesso: false
        });
      }

      // Verificar se a categoria tem vídeos associados
      const totalVideos = await global.banco.adminVerificarVideosPorCategoria(catcodigo);
      if (totalVideos > 0) {
        return res.render('admin/categorias', {
          admNome: global.admNome,
          categorias: await global.banco.adminBuscarCategorias(),
          mensagem: 'Não é possível excluir: a categoria possui vídeos associados.',
          sucesso: false
        });
      }

      // Excluir a categoria
      await global.banco.adminExcluirCategoria(catcodigo);
      return res.render('admin/categorias', {
        admNome: global.admNome,
        categorias: await global.banco.adminBuscarCategorias(),
        mensagem: 'Categoria excluída com sucesso!',
        sucesso: true
      });
    }
    catch (erro) {
      console.error(erro);
      return res.render('admin/categorias', {
        admNome: global.admNome,
        categorias: await global.banco.adminBuscarCategorias(),
        mensagem: 'Erro ao excluir categoria.',
        sucesso: false
      });
    }
  });


  // GET atualizar categoria
  router.get('/atualizarcategoria/:id', verificarLogin2, async (req, res) => {
    const catcodigo = req.params.id;
    try {
      const categoria = await global.banco.adminBuscarCategoriaPorCodigo(catcodigo);
      if (!categoria) {
        return res.render('admin/categorias_novo', {
          admNome: global.admNome,
          mensagem: 'Categoria não encontrada.',
          sucesso: false
        });
      }

      res.render('admin/categorias_atualizar', {
        admNome: global.admNome,
        categoria,
        mensagem: null,
        sucesso: false
      });

    }
    catch (erro) {
      console.error(erro);
      res.render('admin/categorias_novo', {
        admNome: global.admNome,
        mensagem: 'Erro ao carregar categoria.',
        sucesso: false
      });
    }
  });


  // POST atualizar categoria
  router.post('/atualizarcategoria/:id', verificarLogin2, async (req, res) => {
    const catcodigo = req.params.id;
    let { catnome, catnomenormal } = req.body;

    // Validação de campos vazios
    if (!catnome || !catnomenormal) {
      return res.render('admin/categorias_atualizar', {
        admNome: global.admNome,
        categoria: { catcodigo, catnome, catnomenormal },
        mensagem: 'Todos os campos são obrigatórios.',
        sucesso: false
      });
    }

    // Verificar se a categoria existe
    const categoriaAtual = await global.banco.adminBuscarCategoriaPorCodigo(catcodigo);
    if (!categoriaAtual) {
      return res.render('admin/categorias_atualizar', {
        admNome: global.admNome,
        categoria: { catcodigo, catnome, catnomenormal },
        mensagem: 'Categoria não encontrada.',
        sucesso: false
      });
    }

    // Verificar unicidade (ignorando a própria categoria)
    const categoriaExistente = await global.banco.adminBuscarCategoria(catnome, catnomenormal);
    if (categoriaExistente && categoriaExistente.catcodigo != catcodigo) {
      return res.render('admin/categorias_atualizar', {
        admNome: global.admNome,
        categoria: { catcodigo, catnome, catnomenormal },
        mensagem: 'Categoria ou nome normalizado já existe.',
        sucesso: false
      });
    }

    // Atualizar categoria
    try {
      await global.banco.adminAtualizarCategoria(catcodigo, catnome, catnomenormal);
      return res.render('admin/categorias_atualizar', {
        admNome: global.admNome,
        categoria: { catcodigo, catnome, catnomenormal },
        mensagem: 'Categoria atualizada com sucesso!',
        sucesso: true
      });
    }
    catch (erro) {
      console.error(erro);
      return res.render('admin/categorias_atualizar', {
        admNome: global.admNome,
        categoria: { catcodigo, catnome, catnomenormal },
        mensagem: 'Erro ao atualizar categoria.',
        sucesso: false
      });
    }
  });


  /*---------USUARIOS---------*/


  /* GET usuarios */
  router.get('/usuarios', verificarLogin2, async (req, res) => {
    try {
      const usuarios = await global.banco.adminBuscarUsuarios();
      res.render('admin/usuarios', {
        admNome: global.admNome,
        usuarios,
        mensagem: null,
        sucesso: false,
      });
    }
    catch (erro) {
      console.error(erro);
      res.render('admin/usuarios', {
        admNome: global.admNome,
        usuarios: [],
        mensagem: 'Erro ao carregar usuários.',
        sucesso: false,
      });
    }
  });


  /* GET formulario novo usuario */
  router.get('/novousuario', verificarLogin2, (req, res) => {
    res.render('admin/usuarios_novo', {
      admNome: global.admNome,
      mensagem: null,
      sucesso: false,
    });
  })


  /* POST novo usuário */
  router.post('/novousuario', verificarLogin2, async (req, res) => {
    const { email, senha } = req.body;
    if (!email || !senha) {
      return res.render('admin/usuarios_novo', {
        admNome: global.admNome,
        mensagem: 'Email e senha são obrigatórios.',
        sucesso: false,
      });
    }
    try {
      await global.banco.adminInserirUsuario(email, senha);
      res.render('admin/usuarios_novo', {
        admNome: global.admNome,
        mensagem: 'Usuário cadastrado com sucesso!',
        sucesso: true,
      });
    }
    catch (erro) {
      console.error(erro);
      res.render('admin/usuarios_novo', {
        admNome: global.admNome,
        mensagem: 'Erro ao cadastrar usuário.',
        sucesso: false,
      });
    }
  });

  /* GET formulário de alteração de usuário */
  router.get('/atualizarusuario/:id', verificarLogin2, async (req, res) => {
    const usucodigo = req.params.id;
    try {
      const usuario = await global.banco.adminBuscarUsuarioPorCodigo(usucodigo);
      if (!usuario) {
        return res.render('admin/usuarios_atualizar', {
          admNome: global.admNome,
          mensagem: 'Usuário não encontrado.',
          sucesso: false,
        });
      }
      res.render('admin/usuarios_atualizar', {
        admNome: global.admNome,
        usuario,
        mensagem: null,
        sucesso: false,
      });
    }
    catch (erro) {
      console.error(erro);
      res.render('admin/usuarios_atualizar', {
        admNome: global.admNome,
        mensagem: 'Erro ao carregar usuário.',
        sucesso: false,
      });
    }
  });


  /* POST alteração de usuário */
  router.post('/atualizarusuario/:id', verificarLogin2, async (req, res) => {
    const usucodigo = req.params.id;
    const { email, senha } = req.body;
    if (!email || !senha) {
      return res.render('admin/usuarios_atualizar', {
        admNome: global.admNome,
        usuario: { usucodigo, usuemail: email, ususenha: senha },
        mensagem: 'Email e senha são obrigatórios.',
        sucesso: false,
      });
    }
    try {
      await global.banco.adminAtualizarUsuario(usucodigo, email, senha);
      res.render('admin/usuarios_atualizar', {
        admNome: global.admNome,
        usuario: { usucodigo, usuemail: email, ususenha: senha },
        mensagem: 'Usuário atualizado com sucesso!',
        sucesso: true,
      });
    }
    catch (erro) {
      console.error(erro);
      res.render('admin/usuarios_atualizar', {
        admNome: global.admNome,
        usuario: { usucodigo, usuemail: email, ususenha: senha },
        mensagem: 'Erro ao atualizar usuário.',
        sucesso: false,
      });
    }
  });


  /* GET excluir usuário */
  router.get('/excluirusuario/:id', verificarLogin2, async (req, res) => {
    const usucodigo = req.params.id;
    try {
      await global.banco.adminExcluirUsuario(usucodigo);
      res.redirect('/admin/usuarios');
    }
    catch (erro) {
      console.error(erro);
      res.render('admin/usuarios', {
        admNome: global.admNome,
        usuarios: await global.banco.adminBuscarUsuarios(),
        mensagem: erro.message || 'Erro ao excluir usuário.',
        sucesso: false,
      });
    }
  });

// GET do fórum


router.get('/forum', verificarLogin2, async (req, res) => {
  try {
    const topicos = await global.banco.adminListarTopicos();
    res.render('admin/forum', {
      admNome: global.adminEmail,
      topicos,
      mensagem: null,
      sucesso: false
    });
  } catch (erro) {
    console.error(erro);
    res.render('admin/forum', {
      admNome: global.adminEmail,
      topicos: [],
      mensagem: 'Erro ao carregar tópicos.',
      sucesso: false
    });
  }
});
// GET do fórum para exclusão


router.get('/excluirtopico/:id', verificarLogin2, async (req, res) => {
  const codtopico = req.params.id;
  try {
    await global.banco.adminExcluirTopico(codtopico);
    res.redirect('/admin/forum');
  } catch (erro) {
    console.error(erro);
    const topicos = await global.banco.adminListarTopicos();
    res.render('admin/forum', {
      admNome: global.adminEmail,
      topicos,
      mensagem: 'Erro ao excluir tópico.',
      sucesso: false
    });
  }
});






  function verificarLogin(res) {
    if (!global.adminEmail || global.adminEmail == "")
      res.redirect('/admin/');
  }


  function verificarLogin2(req, res, next) {
    if (!global.adminEmail || global.adminEmail == "")
      res.redirect('/admin/');
    next();
  }


  return router;
};