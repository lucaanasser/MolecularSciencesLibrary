import React, { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, HelpCircle, AlertCircle, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";

const NewQuestionPage: React.FC = () => {
  const navigate = useNavigate();
  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const suggestedTags = [
    "créditos",
    "formatura",
    "projeto-avançado",
    "orientador",
    "tcc",
    "optativas",
    "grade-curricular",
    "júpiter",
    "iniciação-científica",
    "intercâmbio",
    "pré-requisitos",
    "matrícula",
  ];

  const handleAddTag = (tag: string) => {
    const normalizedTag = tag.toLowerCase().trim();
    if (normalizedTag && !tags.includes(normalizedTag) && tags.length < 5) {
      setTags([...tags, normalizedTag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag(tagInput);
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!titulo.trim()) {
      newErrors.titulo = "O título é obrigatório";
    } else if (titulo.length < 15) {
      newErrors.titulo = "O título deve ter pelo menos 15 caracteres";
    }

    if (!conteudo.trim()) {
      newErrors.conteudo = "O conteúdo é obrigatório";
    } else if (conteudo.length < 30) {
      newErrors.conteudo = "O conteúdo deve ter pelo menos 30 caracteres";
    }

    if (tags.length === 0) {
      newErrors.tags = "Adicione pelo menos uma tag";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      console.log("Submitting question:", { titulo, conteudo, tags });
      // TODO: Implementar submissão para API
      navigate("/forum");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate("/forum")}
            className="flex items-center gap-2 text-gray-600 hover:text-cm-academic mb-3 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para o fórum
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Fazer uma Pergunta
          </h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          {/* Main Form */}
          <div className="space-y-6">
            {/* Tips Card */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-50 border border-blue-200 rounded-lg p-6"
            >
              <div className="flex items-start gap-3">
                <Lightbulb className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="font-bold text-blue-900 mb-2">
                    Dicas para fazer uma boa pergunta
                  </h2>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Seja específico e objetivo no título</li>
                    <li>• Descreva o contexto e o que você já tentou</li>
                    <li>• Use tags relevantes para facilitar a busca</li>
                    <li>• Revise antes de publicar</li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-200 rounded-lg p-6"
            >
              <label className="block mb-2">
                <span className="text-lg font-semibold text-gray-900">
                  Título da pergunta
                </span>
                <span className="text-sm text-gray-600 ml-2">
                  Seja específico e imagine que está perguntando para outra pessoa
                </span>
              </label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Como calcular os créditos necessários para formatura?"
                className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-cm-academic ${
                  errors.titulo ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.titulo && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.titulo}
                </p>
              )}
              <p className="mt-2 text-xs text-gray-500">
                {titulo.length} caracteres (mínimo 15)
              </p>
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white border border-gray-200 rounded-lg p-6"
            >
              <label className="block mb-2">
                <span className="text-lg font-semibold text-gray-900">
                  Descreva sua dúvida
                </span>
                <span className="text-sm text-gray-600 ml-2">
                  Adicione todos os detalhes relevantes
                </span>
              </label>
              <textarea
                value={conteudo}
                onChange={(e) => setConteudo(e.target.value)}
                placeholder="Forneça o máximo de contexto possível. O que você já tentou? Qual é o problema específico?&#10;&#10;Você pode usar Markdown para formatar seu texto!"
                className={`w-full min-h-[300px] px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-cm-academic resize-y ${
                  errors.conteudo ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.conteudo && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.conteudo}
                </p>
              )}
              <p className="mt-2 text-xs text-gray-500">
                {conteudo.length} caracteres (mínimo 30)
              </p>
            </motion.div>

            {/* Tags */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white border border-gray-200 rounded-lg p-6"
            >
              <label className="block mb-2">
                <span className="text-lg font-semibold text-gray-900">
                  Tags
                </span>
                <span className="text-sm text-gray-600 ml-2">
                  Adicione até 5 tags para categorizar sua pergunta
                </span>
              </label>

              {/* Selected Tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-cyan-50 text-cyan-700 px-3 py-1 rounded-full text-sm flex items-center gap-2 border border-cyan-200"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-cyan-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Tag Input */}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Digite uma tag e pressione Enter"
                disabled={tags.length >= 5}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cm-academic disabled:bg-gray-100 disabled:cursor-not-allowed ${
                  errors.tags ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.tags && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.tags}
                </p>
              )}

              {/* Suggested Tags */}
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Tags sugeridas:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedTags
                    .filter((tag) => !tags.includes(tag))
                    .slice(0, 8)
                    .map((tag, index) => (
                      <button
                        key={index}
                        onClick={() => handleAddTag(tag)}
                        disabled={tags.length >= 5}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm hover:bg-cyan-50 hover:text-cyan-700 hover:border hover:border-cyan-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {tag}
                      </button>
                    ))}
                </div>
              </div>
            </motion.div>

            {/* Submit Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex gap-3 justify-end"
            >
              <Link to="/forum">
                <button className="px-6 py-2.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium transition-colors">
                  Cancelar
                </button>
              </Link>
              <button
                onClick={handleSubmit}
                className="px-6 py-2.5 bg-cm-academic hover:bg-cyan-600 text-white rounded-md font-medium transition-colors shadow-md"
              >
                Publicar Pergunta
              </button>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-4 space-y-4">
              {/* Writing Tips */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-orange-500" />
                  Como escrever uma boa pergunta
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex gap-2">
                    <span className="text-orange-500">1.</span>
                    <span>Resuma seu problema no título</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-orange-500">2.</span>
                    <span>Descreva o problema em detalhes</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-orange-500">3.</span>
                    <span>Descreva o que você já tentou</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-orange-500">4.</span>
                    <span>Adicione tags relevantes</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-orange-500">5.</span>
                    <span>Revise antes de publicar</span>
                  </li>
                </ul>
              </div>

              {/* Example */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-bold text-yellow-900 mb-2">
                  Exemplo de boa pergunta
                </h3>
                <div className="text-sm text-yellow-800 space-y-2">
                  <p className="font-semibold">
                    "Como validar créditos de intercâmbio para formatura?"
                  </p>
                  <p className="text-xs">
                    Descreve exatamente o que a pessoa quer saber, é específico
                    e usa palavras-chave que outros podem buscar.
                  </p>
                </div>
              </div>

              {/* Community Guidelines */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-2">
                  Diretrizes da Comunidade
                </h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>✓ Seja respeitoso</li>
                  <li>✓ Pesquise antes de perguntar</li>
                  <li>✓ Aceite respostas úteis</li>
                  <li>✓ Vote em boas respostas</li>
                  <li>✗ Não faça spam</li>
                  <li>✗ Não seja rude</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default NewQuestionPage;
