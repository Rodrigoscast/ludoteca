import { NextRequest, NextResponse } from "next/server";

// Armazena palavras já usadas (em memória)
const palavrasUsadas = new Set<string>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tema, nivel } = body;

    // Validação básica
    if (!tema) {
      return NextResponse.json(
        { erro: "Tema não fornecido. Inclua um campo 'tema' no corpo da requisição." },
        { status: 400 }
      );
    }

    if (nivel === undefined || nivel < 1 || nivel > 5) {
      return NextResponse.json(
        { erro: "Nível inválido. O campo 'nivel' deve estar entre 1 e 5." },
        { status: 400 }
      );
    }

    // Prompt do sistema
    const systemPrompt = `
      Você é uma IA que gera palavras para um jogo da forca.

      Função:
      - O usuário fornecerá um tema e um nível de dificuldade (1 a 5).
      - Você deve responder com **apenas uma palavra** ou **nome composto** em português relacionado ao tema, respeitando a dificuldade.

      Regras:
      1. A resposta deve ser **somente uma palavra** ou um **nome composto com espaços**, como "Acampamento Meio-Sangue" ou "Você Sabe Quem".
      2. A palavra deve ter **relação direta e clara** com o tema informado.
      3. **Não inclua explicações, frases, listas ou definições.**
      4. Responda apenas com a palavra, sem aspas, pontuação ou qualquer outro texto adicional.
      5. Evite repetir palavras já utilizadas anteriormente.
      6. Sempre responda em português, tanto os conectivos como os nomes, por exemplo Mundungus Fletcher em português é Mundungo Fletcher.
      7. Escolha a palavra conforme o nível de dificuldade:
         - Nível 1 → Palavras simples, curtas e muito conhecidas.
         - Nível 2 → Palavras um pouco mais específicas, mas ainda populares.
         - Nível 3 → Palavras mais raras, com 2 ou mais sílabas, ou nomes compostos médios.
         - Nível 4 → Palavras complexas, longas, mágicas, científicas ou muito específicas do tema.
         - Nível 5 → Nomes próprios ou termos extremamente específicos, longos ou pouco conhecidos (ex: "Alvo Percival Wulfrico Brian Dumbledore").
    `;

    // Chamada à API Groq
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `
              Tema: ${tema}
              Nível de dificuldade: ${nivel}
              Palavras já usadas: ${[...palavrasUsadas].join(", ") || "nenhuma"}
            `,
          },
        ],
        temperature: 1,
        top_p: 1,
        max_completion_tokens: 512,
        reasoning_effort: "medium",
      }),
    });

    // Checa se a resposta foi bem-sucedida
    if (!res.ok) {
      const text = await res.text();
      console.error("Erro da API Groq:", text);
      return NextResponse.json(
        {
          erro: `Erro na API Groq (status ${res.status}). Verifique o log para detalhes.`,
          detalhes: text,
        },
        { status: res.status }
      );
    }

    const data = await res.json();

    // Valida estrutura de resposta
    const resposta = data?.choices?.[0]?.message?.content?.trim();
    if (!resposta) {
      return NextResponse.json(
        { erro: "A API Groq não retornou uma resposta válida." },
        { status: 502 }
      );
    }

    // Adiciona à lista se for nova
    if (!palavrasUsadas.has(resposta.toLowerCase())) {
      palavrasUsadas.add(resposta.toLowerCase());
    }

    return NextResponse.json({ resposta });
  } catch (err: any) {
    console.error("Erro inesperado:", err);

    // 🧱 Captura de erro genérica
    return NextResponse.json(
      {
        erro: "Ocorreu um erro inesperado ao processar sua solicitação.",
        detalhes: err?.message || "Erro desconhecido.",
      },
      { status: 500 }
    );
  }
}
