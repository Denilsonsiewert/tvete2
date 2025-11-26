
import { getStore } from '@netlify/blobs';

export const handler = async () => {
  try {
    const store = getStore('resumo_geral', { consistency: 'strong', public: true });
    const json = await store.get('resumo.json', { type: 'json' });

    if (!json) {
      return { statusCode: 404, body: 'Resumo não encontrado.' };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(json)
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
