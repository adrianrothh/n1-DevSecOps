const mysql = require('mysql2/promise'); 

async function conectarBD()
{ 
    if(global.conexao && global.conexao.state !== 'disconnected') 
    {
        return global.conexao;
    }
    
    /*
    const connectionString = 'mysql://root:senha@localhost:3306/livraria' 
    const connection= await mysql.createConnection(connectionString)
    */
    
    const conexao = await mysql.createConnection(
        { 
            host     : 'localhost', 
            port     : 3306, 
            user     : 'root',
            password : '', 
            database : 'petflix',  /*NÃO ESQUEÇA DE VOLTAR AO NORMAL*/
            charset: 'utf8mb4' /* adrian vigarista */
        }); 
        
    console.log('Conectou no MySQL!'); 

    global.conexao = conexao; 
    return global.conexao; 
} 


/*
    Funções de usuários comuns
*/


async function buscarUsuario(usuario)
{
    const conexao = await conectarBD();
    const sql = "select * from usuarios where usuemail=? and ususenha=?;";
    const [usuarioEcontrado] = await conexao.query(sql,[usuario.email, usuario.senha]);
    return usuarioEcontrado && usuarioEcontrado.length>0 ? usuarioEcontrado[0] : {};
}



/********** Busca de Filmes **********/

async function buscarCategorias() {
    const conexao = await conectarBD();
    const sql = "select * from categorias order by catnome;";
    const [categorias] = await conexao.query(sql);
    return categorias;
}


async function buscarDestaque() 
{
    const conexao = await conectarBD();
    const sql = "select * from videos order by vidnota desc limit 1;";
    const [destaque] = await conexao.query(sql);
    return destaque[0];
}


async function buscarEmAlta() 
{
    const conexao = await conectarBD();
    const sql = "select * from videos order by vidnota limit 10 offset 1;";
    const [emAlta] = await conexao.query(sql);
    return emAlta;
}


async function buscarPorCategoria() 
{
    const conexao = await conectarBD();
    const sql = "select * from categorias, videos where categorias.catcodigo=videos.catcodigo order by categorias.catnome, videos.vidtitulo;";
    const [porCategoria] = await conexao.query(sql);
    return porCategoria;
}

async function buscarVideoPorCodigo(vidcodigo) 
{
    const conexao = await conectarBD();
    const sql = "select * from videos where vidcodigo = ?;";
    const [video] = await conexao.query(sql, [vidcodigo]);
    return video[0] || null;
}

/*  const recomendacoes = await global.banco.buscarRecomendacoes();   */






/*   Funções do administrador   */


async function buscarAdmin(adm)
{
    const conexao = await conectarBD();
    const sql = "select * from admins where admemail=? and admsenha=?;";
    const [admEcontrado] = await conexao.query(sql,[adm.email, adm.senha]);
    return admEcontrado && admEcontrado.length>0 ? admEcontrado[0] : {};
}


async function adminBuscarCategorias() 
{
    const conexao = await conectarBD();
    const sql = `select c.catcodigo, c.catnome, c.catnomenormal, count(v.vidcodigo) as quantidade 
                from categorias c left join videos v on c.catcodigo=v.catcodigo 
                group by c.catnome order by c.catnome;`;
    const [categorias] = await conexao.query(sql);
    return categorias;
}


async function adminBuscarCategoria(nome, nomenormal) 
{
    const conexao = await conectarBD();
    const sql = "select * from categorias where catnome = ? or catnomenormal = ?;";
    const [categoria] = await conexao.query(sql,[nome,nomenormal]);
    if (categoria.length > 0) return true;
    else return false;
}


async function adminInserirCategoria(catnome, catnomenormal) 
{
    const conexao = await conectarBD();
    const sql = "insert into categorias (catnome, catnomenormal) values (?, ?);";
    await conexao.query(sql,[catnome, catnomenormal]);
}


async function adminBuscarCategoriaPorCodigo(catcodigo) 
{
    const conexao = await conectarBD();
    const sql = "select * from categorias where catcodigo = ?;";
    const [categoria] = await conexao.query(sql, [catcodigo]);
    return categoria[0] || null;
}


async function adminAtualizarCategoria(catcodigo, catnome, catnomenormal) {
    const conexao = await conectarBD();
    const sql = "update categorias set catnome = ?, catnomenormal = ? where catcodigo = ?;";
    await conexao.query(sql, [catnome, catnomenormal, catcodigo]);
}


async function adminVerificarVideosPorCategoria(catcodigo) 
{
    const conexao = await conectarBD();
    const sql = "select count(*) as total from videos where catcodigo = ?;";
    const [result] = await conexao.query(sql, [catcodigo]);
    return result[0].total;
}


async function adminExcluirCategoria(catcodigo) 
{
    const conexao = await conectarBD();
    const sql = "delete from categorias where catcodigo = ?;";
    await conexao.query(sql, [catcodigo]);
}


async function adminInserirUsuario(email, senha) {
  const conexao = await conectarBD();
  const sql = "INSERT INTO usuarios (usuemail, ususenha) VALUES (?, ?);";
  await conexao.query(sql, [email, senha]);
}


async function adminBuscarUsuarios() {
  const conexao = await conectarBD();
  const sql = "select * from usuarios order by usuemail;";
  const [usuarios] = await conexao.query(sql);
  return usuarios;
}


async function adminBuscarUsuarioPorCodigo(usuario)
{
    const conexao = await conectarBD();
    const sql = "select * from usuarios where usucodigo=?;";
    const [usuarioEcontrado] = await conexao.query(sql,[usuario]);
    return usuarioEcontrado && usuarioEcontrado.length>0 ? usuarioEcontrado[0] : {};
}


async function adminExcluirUsuario(usucodigo) {
  const conexao = await conectarBD();
  const sql = "DELETE FROM usuarios WHERE usucodigo = ?;";
  await conexao.query(sql, [usucodigo]);
}





async function adminAtualizarUsuario(usucodigo, email, senha) {
  const conexao = await conectarBD();
  const sql = "UPDATE usuarios SET usuemail = ?, ususenha = ? WHERE usucodigo = ?;";
  await conexao.query(sql, [email, senha, usucodigo]);
}


async function buscarPetsPorUsuario(usucodigo) {
  const [pets] = await conexao.execute(`
    SELECT * FROM pets WHERE usucodigo = ?
  `, [usucodigo]);
  return pets;
}

async function criarPet(pet) {
  const conexao = await conectarBD();
  const sql = "INSERT INTO pets (nome_pet, raca_pet, idade_pet, foto_pet, usucodigo) VALUES (?, ?, ?, ?, ?);";
  await conexao.query(sql, [pet.nome_pet, pet.raca_pet, pet.idade_pet, pet.foto_pet, pet.usucodigo]);
}

async function buscarPetPorId(id_pet) {
  const [rows] = await conexao.query(
    'SELECT * FROM pets WHERE id_pet = ?',
    [id_pet]
  );
  return rows[0];
}

async function atualizarPet(pet) {
  const { id_pet, nome_pet, raca_pet, idade_pet } = pet;

  await conexao.query(
    'UPDATE pets SET nome_pet = ?, raca_pet = ?, idade_pet = ? WHERE id_pet = ?',
    [nome_pet, raca_pet, idade_pet, id_pet]
  );
}


async function excluirPet(id_pet) {
  const sql = 'DELETE FROM pets WHERE id_pet = ?';
  const [result] = await conexao.execute(sql, [id_pet]);
  return result;
}

async function listarTopicosPorCategoria(categoria, limite) {
  const conn = await conectarBD();
  const sql = `
      SELECT
      F.codtopico, F.fortitulo, U.usuemail AS autor
      FROM forums F
      INNER JOIN usuarios U ON F.usucodigo = U.usucodigo
      WHERE F.catforum = ?
      ORDER BY F.fordata DESC
      LIMIT ?;
  `;
  const [rows] = await conn.query(sql, [categoria, limite]);
  return rows;
}


async function criarTopico(dados) {
  const conexao = await conectarBD();
  const sql = 'INSERT INTO forums(fortitulo, conteudo, catforum, usucodigo, admcodigo, fordata) VALUES (?, ?, ?, ?, ?, NOW());';
  // Sua tabela exige um admcodigo. Usaremos 1 como padrão.
  const values = [dados.fortitulo, dados.conteudo, dados.catforum, dados.usucodigo, 1];
  await conexao.query(sql, values);
}


async function buscarTopicoPorId(id) {
    const conn = await conectarBD();
    const sql = `
        SELECT
        F.codtopico, F.fortitulo, F.conteudo, F.fordata, U.usuemail AS autor
        FROM forums F
        INNER JOIN usuarios U ON F.usucodigo = U.usucodigo
        WHERE F.codtopico = ?;
    `;
    const [rows] = await conn.query(sql, [id]);
    return rows[0];
}


async function buscarRespostasPorTopicoId(idTopico) {
    const conn = await conectarBD();
    const sql = `
        SELECT
        R.conteudo, R.respdata, U.usuemail AS autor
        FROM forumsresposta R
        INNER JOIN usuarios U ON R.usucodigo = U.usucodigo
        WHERE R.codtopico = ?
        ORDER BY R.respdata ASC;
    `;
    const [rows] = await conn.query(sql, [idTopico]);
    return rows;
}

async function criarResposta(idTopico, conteudo, usucodigo) {
  const conexao = await conectarBD();
  // Adicione a coluna 'admcodigo' no INSERT e o valor correspondente
  const sql = 'INSERT INTO forumsresposta (conteudo, codtopico, usucodigo, admcodigo, respdata) VALUES (?, ?, ?, ?, NOW())';
  // Adicione o valor para admcodigo (neste caso, o valor fixo 1)
  const values = [conteudo, idTopico, usucodigo, 1];
  await conexao.query(sql, values);
}

async function adminExcluirTopico(codtopico) {
  const conexao = await conectarBD();
  // Primeiro exclui as respostas vinculadas
  await conexao.query('DELETE FROM forumsresposta WHERE codtopico = ?', [codtopico]);
  // Depois o tópico em si
  await conexao.query('DELETE FROM forums WHERE codtopico = ?', [codtopico]);
}

async function inserirUsuario(email, senha) {
  const conexao = await conectarBD();
  const sql = "INSERT INTO usuarios (usuemail, ususenha) VALUES (?, ?);";
  await conexao.query(sql, [email, senha]);
}

async function buscarPopulares() {
  const conexao = await conectarBD();
  // CORREÇÃO: Usando 'vidnota' para ordenar e 'vidbloqueado' para filtrar,
  // pois as colunas 'status' e 'visualizacoes' não existem na tabela.
  const sql = `
    SELECT vidcodigo, vidtitulo, vidcapa
    FROM videos
    WHERE vidbloqueado = 0
    ORDER BY vidnota DESC
    LIMIT 6;
  `;
  const [populares] = await conexao.query(sql);
  return populares;
}

async function listarVideosComCategoria() {
  const conexao = await conectarBD();
  const sql = `
    SELECT v.*, c.catnome
    FROM videos v
    LEFT JOIN categorias c ON v.catcodigo = c.catcodigo
    ORDER BY v.vidcodigo DESC
  `;
  const [videos] = await conexao.query(sql);
  return videos;
}

async function inserirVideo({ vidtitulo, viddescricao, vidarquivo, vidminiatura, vidcapa, catcodigo }) {
  const conexao = await conectarBD();

  const sql = `
    INSERT INTO videos 
    (vidtitulo, viddescricao, vidminiatura, vidarquivo, catcodigo, vidnota, vidbloqueado, viddataini, vidcapa) 
    VALUES (?, ?, ?, ?, ?, 0.00, 0, CURDATE(), ?)
  `;

  const [result] = await conexao.query(sql, [vidtitulo, viddescricao, vidminiatura, vidarquivo, catcodigo, vidcapa]);

  return result;
}

async function adminListarTopicos() {
  const conexao = await conectarBD();
  const sql = `
    SELECT F.codtopico, F.fortitulo, F.catforum, F.fordata, U.usuemail AS autor
    FROM forums F
    INNER JOIN usuarios U ON F.usucodigo = U.usucodigo
    ORDER BY F.fordata DESC;
  `;
  const [topicos] = await conexao.query(sql);
  return topicos;
}

async function atualizarVideo(vidcodigo, { vidtitulo, viddescricao, vidarquivo, vidcapa, vidcategoria }) {
  const conexao = await conectarBD();
  const sql = `
    UPDATE videos 
    SET vidtitulo = ?, viddescricao = ?, vidarquivo = ?, vidcapa = ?, catcodigo = ?
    WHERE vidcodigo = ?;
  `;
  await conexao.query(sql, [vidtitulo, viddescricao, vidarquivo, vidcapa, vidcategoria, vidcodigo]);
}

async function excluirVideo(vidcodigo) {
  const conexao = await conectarBD();
  const sql = "DELETE FROM videos WHERE vidcodigo = ?;";
  await conexao.query(sql, [vidcodigo]);
}

async function buscarVideoPorId(id) {
  const conexao = await conectarBD();
  const sql = "SELECT * FROM videos WHERE vidcodigo = ?";
  const [rows] = await conexao.query(sql, [id]);
  return rows.length > 0 ? rows[0] : null;
}

async function buscarVideosPorNomeCategoria(nomeCategoria, limite = 6) {
  const conexao = await conectarBD();
  const sql = `
    SELECT v.vidcodigo, v.vidtitulo, v.vidcapa 
    FROM videos v
    JOIN categorias c ON v.catcodigo = c.catcodigo
    WHERE c.catnome = ?
    ORDER BY v.viddataini DESC
    LIMIT ?;
  `;
  const [videos] = await conexao.query(sql, [nomeCategoria, limite]);
  return videos;
}



// listarCategorias
async function listarCategorias() {
  const conexao = await conectarBD();
  const sql = 'SELECT catcodigo, catnome, catnomenormal FROM categorias ORDER BY catnome';
  const [rows] = await conexao.execute(sql);
  return rows;
}





conectarBD()

module.exports = {
  criarResposta, adminExcluirTopico, adminListarTopicos, listarCategorias,
  atualizarVideo, excluirVideo, buscarVideoPorId, buscarVideosPorNomeCategoria,
  buscarUsuario, buscarDestaque, listarTopicosPorCategoria,
  buscarEmAlta, buscarPorCategoria, buscarCategorias, criarTopico,
  buscarAdmin, adminBuscarCategorias, adminBuscarCategoria, buscarTopicoPorId,
  adminInserirCategoria, adminBuscarCategoriaPorCodigo, 
  adminAtualizarCategoria, adminVerificarVideosPorCategoria,
  adminExcluirCategoria, adminInserirUsuario, inserirUsuario,
  adminBuscarUsuarios, adminExcluirUsuario, buscarRespostasPorTopicoId,
  adminAtualizarUsuario, adminBuscarUsuarioPorCodigo, buscarPetsPorUsuario,
  criarPet, buscarPetPorId, atualizarPet, excluirPet, buscarVideoPorCodigo, buscarPopulares, listarVideosComCategoria, inserirVideo
}
