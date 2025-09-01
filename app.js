var createError = require('http-errors');
var express = require('express');
const multer = require('multer');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var app = express();

require('dotenv').config();                        // ADICIONADO
const appLogger = require('./src/logger');         // ADICIONADO
const requestId = require('./src/requestId');      // ADICIONADO
const httpLogger = require('./src/httpLogger');    // ADICIONADO

const banco = require('./banco'); // Ajuste o caminho se necessário
global.banco = banco;



// -----  MULTER FOTO PET -------


// Configuração do multer (antes de usar upload)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/pets/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});


const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens JPG ou PNG são permitidas!'));
    }
  }
});


// ---- MULTER VIDEO/CAPA -----
const storageVideoCapa = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'vidarquivo') {
      cb(null, 'public/videos/');
    } else if (file.fieldname === 'vidcapa') {
      cb(null, 'public/uploads/pets/'); // ou outra pasta para imagens
    } else {
      cb(new Error('Campo de arquivo inválido'));
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

function fileFilter(req, file, cb) {
  const allowedTypes = {
    vidarquivo: ['.mp4', '.avi', '.mov', '.mkv'],
    vidcapa: ['.jpeg', '.jpg', '.png', '.gif']
  };

  const field = file.fieldname;
  const ext = path.extname(file.originalname).toLowerCase();

  if (!allowedTypes[field]) {
    return cb(new Error(`Campo de upload inválido: ${field}`));
  }

  if (!allowedTypes[field].includes(ext)) {
    return cb(new Error(`Extensão inválida para ${field}. Arquivo enviado: ${file.originalname}`));
  }

  cb(null, true);
}



const uploadVideo = multer({ storage: storageVideoCapa, fileFilter });



// Agora sim, importe as rotas passando o upload configurado
var indexRouter = require('./routes/index')(upload);
var adminRouter = require('./routes/admin')(uploadVideo);
var videoRouter = require('./routes/video'); // Novo módulo de rotas

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// ADICIONADO: observabilidade antes das rotas
app.use(requestId);
app.use(httpLogger);

// ADICIONADO: rotas de diagnóstico
app.get('/saude', (req, res) => {
  appLogger.info('healthcheck_ok', { request_id: req.id });
  res.json({ ok: true, request_id: req.id });
});
//-----//
app.get('/forcar-erro', (req, res, next) => {
  const err = new Error('Erro proposital para demo');
  err.status = 500;
  next(err);
});


app.use('/', indexRouter);
app.use('/admin', adminRouter);
app.use('/video', videoRouter); // Registrar o módulo de rotas de vídeo


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // ADICIONADO: log estruturado do erro
  appLogger.error('unhandled_error', {
    request_id: req.id,
    url: req.originalUrl,
    method: req.method,
    status: err.status || 500,
    message: err.message,
    stack: err.stack
  });

  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
