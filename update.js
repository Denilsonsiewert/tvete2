
import { getStore } from '@netlify/blobs';

export const handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Método não permitido. Use POST.' };
    }

    if (!event.body) {
      return { statusCode: 400, body: 'Corpo da requisição vazio.' };
    }

    let data;
    try {
      data = JSON.parse(event.body);
    } catch (e) {
      return { statusCode: 400, body: 'JSON inválido.' };
    }

    if (!data || !Array.isArray(data.data)) {
      return { statusCode: 400, body: 'Formato esperado: { "data": [ ... ] }' };
    }

    const store = getStore('resumo_geral', { consistency: 'strong', public: true });
    await store.setJSON('resumo.json', data);

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, message: 'Resumo atualizado no Blobs.' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: error.message })
    };
  }
};
