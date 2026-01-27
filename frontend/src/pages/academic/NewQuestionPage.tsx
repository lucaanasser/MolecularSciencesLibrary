import React, { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, HelpCircle, AlertCircle, Lightbulb, Loader2, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import * as ForumService from "@/services/ForumService";
import { toast } from "sonner";
import CreateTagModal from "@/features/forum/components/CreateTagModal";

const NewQuestionPage: React.FC = () => {
  const navigate = useNavigate();
  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [availableTags, setAvailableTags] = useState<ForumService.Tag[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const [showCreateTagModal, setShowCreateTagModal] = useState(false);
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Verificar se o usuário está logado
  const isLoggedIn = !!localStorage.getItem("token");

  useEffect(() => {
    if (!isLoggedIn) {
      toast.error("Você precisa estar logado para fazer uma pergunta");
      navigate("/login");
      return;
    }

    // Buscar tags disponíveis
    const fetchTags = async () => {
      setIsLoadingTags(true);
      try {
        const tagsData = await ForumService.getTags();
        setAvailableTags(tagsData);
      } catch (error) {
        console.error("Erro ao carregar tags:", error);
        toast.error("Erro ao carregar tags sugeridas");
      } finally {
        setIsLoadingTags(false);
      }
    };

    fetchTags();
  }, [isLoggedIn, navigate]);

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
      const normalizedInput = tagInput.toLowerCase().trim();
      
      // Verificar se a tag já existe
      const existingTag = availableTags.find(t => t.nome.toLowerCase() === normalizedInput);
      
      if (existingTag) {
        // Tag existe, adicionar normalmente
        handleAddTag(normalizedInput);
      } else if (normalizedInput.length >= 2) {
        // Tag não existe, abrir modal para criar
        setShowCreateTagModal(true);
      }
    }
  };

  const handleTagCreated = (newTag: ForumService.Tag) => {
    // Adicionar a nova tag criada à lista de tags da pergunta
    if (newTag.nome && !tags.includes(newTag.nome) && tags.length < 5) {
      setTags([...tags, newTag.nome]);
      setTagInput("");
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

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      const newQuestion = await ForumService.createQuestion({
        titulo: titulo.trim(),
        conteudo: conteudo.trim(),
        tags: tags,
        is_anonymous: isAnonymous,
      });
      
      toast.success("Pergunta publicada com sucesso!");
      navigate(`/forum/${newQuestion.id}`);
    } catch (error: any) {
      console.error("Erro ao criar pergunta:", error);
      toast.error(error.message || "Erro ao publicar pergunta. Tente novamente.");
    } finally {
      setSubmitting(false);
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
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-gray-600">
                    Tags disponíveis {availableTags.length > 0 && `(${availableTags.length})`}:
                  </p>
                  <button
                    onClick={() => setShowCreateTagModal(true)}
                    type="button"
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Criar nova tag
                  </button>
                </div>
                {tagInput.trim().length >= 2 && !availableTags.some(t => t.nome.toLowerCase() === tagInput.toLowerCase().trim()) && (
                  <div className="mb-2 text-xs text-green-600 bg-green-50 border border-green-200 rounded px-3 py-2">
                    ✨ Pressione <kbd className="px-1.5 py-0.5 bg-white border border-green-300 rounded text-green-700 font-mono text-xs">Enter</kbd> para criar a tag "{tagInput.trim()}"
                  </div>
                )}
                {isLoadingTags ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-cm-academic" />
                  </div>
                ) : availableTags.length === 0 ? (
                  <div className="p-4 bg-gray-50 rounded-md border border-gray-200 text-center">
                    <p className="text-sm text-gray-500 py-2">Nenhuma tag disponível. Clique em "Criar nova tag" para adicionar!</p>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-md border border-gray-200">
                    {/* Agrupar tags por tópico */}
                    {(() => {
                      const topicLabels: Record<string, string> = {
                        'academico': '🎓 Acadêmico',
                        'administrativo': '📋 Administrativo',
                        'tecnico': '💻 Técnico',
                        'eventos': '🎉 Eventos',
                        'carreira': '💼 Carreira',
                        'biblioteca': '📚 Biblioteca',
                        'geral': '🌐 Geral'
                      };

                      // Agrupar tags por tópico
                      const tagsByTopic = availableTags
                        .filter((tag) => !tags.includes(tag.nome))
                        .reduce((acc, tag) => {
                          const topic = tag.topico || 'geral';
                          if (!acc[topic]) acc[topic] = [];
                          acc[topic].push(tag);
                          return acc;
                        }, {} as Record<string, typeof availableTags>);

                      // Ordenar tópicos
                      const sortedTopics = Object.keys(tagsByTopic).sort();

                      if (sortedTopics.length === 0) {
                        return (
                          <div className="p-4 text-center text-sm text-gray-500">
                            Todas as tags já foram adicionadas!
                          </div>
                        );
                      }

                      const currentTopic = sortedTopics[currentTopicIndex];
                      const canGoPrev = currentTopicIndex > 0;
                      const canGoNext = currentTopicIndex < sortedTopics.length - 1;

                      return (
                        <div className="p-4">
                          {/* Navegação de tópicos */}
                          <div className="flex items-center justify-between mb-3">
                            <button
                              onClick={() => setCurrentTopicIndex(Math.max(0, currentTopicIndex - 1))}
                              disabled={!canGoPrev}
                              type="button"
                              className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <ChevronLeft className="w-5 h-5 text-gray-700" />
                            </button>
                            
                            <h4 className="text-sm font-semibold text-gray-700">
                              {topicLabels[currentTopic] || currentTopic}
                              <span className="ml-2 text-xs text-gray-500">
                                ({currentTopicIndex + 1}/{sortedTopics.length})
                              </span>
                            </h4>

                            <button
                              onClick={() => setCurrentTopicIndex(Math.min(sortedTopics.length - 1, currentTopicIndex + 1))}
                              disabled={!canGoNext}
                              type="button"
                              className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <ChevronRight className="w-5 h-5 text-gray-700" />
                            </button>
                          </div>

                          {/* Tags do tópico atual */}
                          <div className="flex flex-wrap gap-2 min-h-[120px] max-h-[200px] overflow-y-auto p-2">
                            {tagsByTopic[currentTopic].map((tag, index) => (
                              <button
                                key={index}
                                onClick={() => handleAddTag(tag.nome)}
                                disabled={tags.length >= 5}
                                type="button"
                                className="bg-white text-gray-700 px-3 py-1.5 rounded border border-gray-300 text-sm hover:bg-cyan-50 hover:text-cyan-700 hover:border-cyan-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 h-fit"
                              >
                                <span>{tag.nome}</span>
                                {(tag.count || 0) > 0 && (
                                  <span className="text-xs text-gray-400">({tag.count})</span>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Create Tag Modal */}
              <CreateTagModal
                isOpen={showCreateTagModal}
                onClose={() => setShowCreateTagModal(false)}
                onTagCreated={handleTagCreated}
              />
            </motion.div>

            {/* Submit Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-3"
            >
              {/* Anonymous Checkbox */}
              <div className="flex items-center gap-2 pl-1">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 text-cm-academic border-gray-300 rounded focus:ring-cyan-500 cursor-pointer"
                />
                <label htmlFor="anonymous" className="text-sm text-gray-700 cursor-pointer">
                  Postar anonimamente (apenas o admin verá seu nome)
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 justify-end">
                <Link to="/forum">
                  <button className="px-6 py-2.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium transition-colors">
                    Cancelar
                  </button>
                </Link>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-6 py-2.5 bg-cm-academic hover:bg-cyan-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-md font-medium transition-colors shadow-md flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitting ? "Publicando..." : "Publicar Pergunta"}
                </button>
              </div>
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
