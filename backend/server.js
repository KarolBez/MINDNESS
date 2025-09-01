const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/cadastro", async (req, res) => {
  try {
    const response = await axios.post(
      `https://app.tisaude.com/api/rest/paciente/adicionar?hash=${req.body.hash}`,
      req.body,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjc5NTAsImlzcyI6Imh0dHBzOlwvXC9hcHAudGlzYXVkZS5jb21cL2FwaVwvbG9naW4iLCJpYXQiOjE3NTUxMTU3MjUsImV4cCI6MTc1NzUzNDkyNSwibmJmIjoxNzU1MTE1NzI1LCJqdGkiOiJDY3k5Z3hCcU44ZkhQQmtzIn0.yDdc1doRvEBbzdlVh_q9myk8naOBzD4w2m6JqXVVjlU"
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Erro ao cadastrar paciente" });
  }
});

app.listen(3001, () => console.log("Backend rodando na porta 3001"));
