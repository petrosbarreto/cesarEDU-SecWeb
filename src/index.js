const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

const app = express();

// ✅ S-SDLC: Hardening via cabeçalhos HTTP seguros (helmet)
app.use(helmet());
app.use(express.json());

// ✅ Rate Limiting: proteção contra brute-force (OWASP A07)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  message: { error: 'Muitas requisições. Tente novamente em 15 minutos.' },
});
app.use('/api/', limiter);

// ✅ Rota segura: usa parametrização, não concatenação de strings
//    Evita SQL Injection (OWASP A03) via validação de entrada
app.post(
  '/api/user/search',
  [
    body('name')
      .isString()
      .trim()
      .isLength({ min: 1, max: 100 })
      .escape(), // sanitiza XSS
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name } = req.body;

    // ❌ NUNCA FAÇA ISSO (exemplo de código inseguro — SQL Injection):
    // const query = `SELECT * FROM users WHERE name = '${name}'`;

    // ✅ Em um caso real, use ORM ou prepared statements:
    // const user = await db.query('SELECT * FROM users WHERE name = $1', [name]);
    return res.json({ message: `Busca realizada com segurança para: ${name}` });
  }
);

// ✅ Health check — sem expor informações internas
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ✅ Handler global de erros — não vaza stack traces em produção
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err.stack); // loga internamente
  res.status(500).json({ error: 'Erro interno do servidor.' }); // resposta genérica
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = { app, server };
