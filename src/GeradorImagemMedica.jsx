import { useState } from 'react';
import { Download, Sparkles, Loader2, Image as ImageIcon } from 'lucide-react';

// SUA CHAVE (MANTIDA)
const API_KEY = "AIzaSyCFJkAXHL65FSAuo69el4o_pvcDQ43OJCI";

const GeradorImagemMedica = () => {
  const [pergunta, setPergunta] = useState('');
  const [resposta, setResposta] = useState('');
  const [imagemGerada, setImagemGerada] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  const gerarImagem = async () => {
    if (!pergunta.trim() || !resposta.trim()) return;

    setLoading(true);
    setErro(null);
    setImagemGerada(null);

    // Prompt ajustado para o Imagen 4 (que entende muito bem instruções complexas)
    const promptSistema = `
      Crie uma ilustração 3D estilo Pixar de alta qualidade sobre medicina.
      O TEMA da imagem é baseado nesta pergunta: "${pergunta}".
      A CENA deve ter um personagem médico fofo (estilo chibi 3D) ou um órgão 3D fofo.
      DETALHE CRUCIAL: O personagem deve ter um balão de fala (speech bubble) com o texto ou ícone representando: "${resposta}".
      ESTILO: Fundo escuro ("Dark Mode"), iluminação de estúdio, renderização 8k, Octane Render.
    `;

    try {
      // --- AQUI ESTAVA O SEGREDO ---
      // Atualizei para o modelo que sua conta tem acesso: imagen-4.0-generate-001
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            instances: [
              { prompt: promptSistema },
            ],
            parameters: {
              sampleCount: 1,
              aspectRatio: "1:1", // Quadrado
              // O Imagen 4 às vezes pede parâmetros diferentes, mas o básico costuma funcionar
            },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Erro API (${response.status}): ${errorData}`);
      }

      const data = await response.json();

      // Verificação de segurança para o formato de resposta do Imagen 4
      if (data.predictions && data.predictions[0]?.bytesBase64Encoded) {
        const base64Image = data.predictions[0].bytesBase64Encoded;
        setImagemGerada(`data:image/png;base64,${base64Image}`);
      } else {
        console.log("Resposta completa da API:", data); // Para debug se precisar
        throw new Error("A API respondeu, mas não enviou a imagem (formato inesperado).");
      }

    } catch (err) {
      console.error(err);
      setErro(`ERRO: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row">
      
      {/* LADO ESQUERDO */}
      <div className="flex-1 p-6 space-y-5 border-r border-slate-100">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Sparkles className="text-indigo-600" size={20} />
            Gerador Imagen 4.0
          </h3>
          <p className="text-slate-500 text-sm">Usando o modelo mais recente do Google.</p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pergunta</label>
            <input
              type="text"
              value={pergunta}
              onChange={(e) => setPergunta(e.target.value)}
              placeholder="Ex: O que é febre?"
              className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Resposta Curta</label>
            <textarea
              value={resposta}
              onChange={(e) => setResposta(e.target.value)}
              placeholder="Ex: Aumento da temperatura do corpo."
              rows={2}
              className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 outline-none resize-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            onClick={gerarImagem}
            disabled={loading}
            className="w-full py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 bg-indigo-600 text-white hover:bg-indigo-700 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Gerar com Imagen 4'}
          </button>
          
          {erro && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-600 font-mono break-all">
              {erro}
            </div>
          )}
        </div>
      </div>

      {/* LADO DIREITO */}
      <div className="w-full md:w-[320px] bg-slate-50 flex items-center justify-center p-4">
        {imagemGerada ? (
          <div className="relative group w-full">
             <img src={imagemGerada} alt="Generated" className="w-full rounded-lg shadow-lg" />
             <a 
              href={imagemGerada}
              download="imagem-medica.png"
              className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow text-indigo-600"
            >
              <Download size={16} />
            </a>
          </div>
        ) : (
          <div className="text-center opacity-40">
            {loading ? <p>Gerando em Alta Resolução...</p> : <ImageIcon size={40} className="mx-auto" />}
          </div>
        )}
      </div>
    </div>
  );
};

export default GeradorImagemMedica;