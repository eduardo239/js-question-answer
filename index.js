const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const connection = require('./database/database');
const Pergunta = require('./database/Pergunta');
const Resposta = require('./database/Resposta');

//db
connection
  .authenticate()
  .then(() => {
    console.log('connected to mysql');
  })
  .catch((e) => {
    console.log('erro:: ' + e);
  });

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  Pergunta.findAll({ raw: true, order: [['id', 'DESC']] }).then((perguntas) => {
    res.render('index', {
      perguntas: perguntas,
    });
  });
});

app.get('/perguntar', (req, res) => {
  res.render('perguntar');
});

app.post('/salvar', (req, res) => {
  const titulo = req.body.titulo;
  const descricao = req.body.descricao;

  if (!titulo) {
    console.log('valor invalido');
    res.redirect('/perguntar');
  } else {
    Pergunta.create({
      titulo: titulo,
      descricao: descricao,
    }).then(() => {
      console.log('dados salvos no db');
      res.redirect('/');
    });
  }
});

app.get('/pergunta/:id', (req, res) => {
  const id = req.params.id;

  Pergunta.findOne({
    where: {
      id: id,
    },
  }).then((p) => {
    if (p != undefined) {
      Resposta.findAll({
        where: {
          perguntaId: p.id,
        },
        order: [['id', 'DESC']],
      }).then((r) => {
        res.render('pergunta', {
          pergunta: p,
          respostas: r,
        });
      });
    } else {
      console.log('pergunta nao encontrada');
      res.redirect('/');
    }
  });
});

app.post('/responder', (req, res) => {
  const corpo = req.body.corpo;
  const perguntaId = req.body.perguntaId;

  Resposta.create({
    corpo: corpo,
    perguntaId: perguntaId,
  }).then(() => {
    console.log('resposta adicionada no db');
    res.redirect('/pergunta/' + perguntaId);
  });
});

app.get('/delete/:id', (req, res) => {
  const id = req.params.id;

  Pergunta.findOne({
    where: {
      id: id,
    },
  })
    .then((p) => {
      Pergunta.destroy({
        where: {
          id: p.id,
        },
      });
    })
    .catch((e) => {
      console.log('erro: ' + e);
    });
  res.redirect('/');
});

app.listen(8080, () => {
  console.log('server running... http://localhost:8080');
});
