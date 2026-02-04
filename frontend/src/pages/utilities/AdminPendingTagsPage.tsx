import React, { useState, useEffect } from "react";
import { logger } from "@/utils/logger";
import { useNavigate } from "react-router-dom";
import { Tag, CheckCircle, XCircle, Loader2, AlertCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";
import * as ForumService from "@/services/ForumService";
import { toast } from "sonner";

const AdminPendingTagsPage: React.FC = () => {
  const navigate = useNavigate();
  const [pendingTags, setPendingTags] = useState<ForumService.Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [processingTagId, setProcessingTagId] = useState<number | null>(null);

  // Verificar se é admin
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user.role === "admin";

  useEffect(() => {
    if (!isAdmin) {
      toast.error("Acesso negado. Apenas administradores podem acessar esta página.");
      navigate("/forum");
      return;
    }

    fetchPendingTags();
  }, [isAdmin, navigate]);

  const fetchPendingTags = async () => {
    setIsLoading(true);
    try {
      const tags = await ForumService.getPendingTags();
      setPendingTags(tags);
    } catch (error) {
      logger.error("Erro ao buscar tags pendentes:", error);
      toast.error("Erro ao carregar tags pendentes");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (tagId: number, tagName: string) => {
    setProcessingTagId(tagId);
    try {
      await ForumService.approveTag(tagId);
      toast.success(`Tag "${tagName}" aprovada com sucesso!`);
      setPendingTags(pendingTags.filter(tag => tag.id !== tagId));
    } catch (error: any) {
      logger.error("Erro ao aprovar tag:", error);
      toast.error(error.message || "Erro ao aprovar tag");
    } finally {
      setProcessingTagId(null);
    }
  };

  const handleDelete = async (tagId: number, tagName: string) => {
    if (!confirm(`Tem certeza que deseja deletar a tag "${tagName}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    setProcessingTagId(tagId);
    try {
      await ForumService.deleteTag(tagId);
      toast.success(`Tag "${tagName}" deletada com sucesso!`);
      setPendingTags(pendingTags.filter(tag => tag.id !== tagId));
    } catch (error: any) {
      logger.error("Erro ao deletar tag:", error);
      toast.error(error.message || "Erro ao deletar tag");
    } finally {
      setProcessingTagId(null);
    }
  };

  const topicLabels: Record<string, string> = {
    'academico': '🎓 Acadêmico',
    'administrativo': '📋 Administrativo',
    'tecnico': '💻 Técnico',
    'eventos': '🎉 Eventos',
    'carreira': '💼 Carreira',
    'biblioteca': '📚 Biblioteca',
    'geral': '🌐 Geral'
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Tag className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Gerenciar Tags do Fórum
              </h1>
              <p className="text-gray-600">
                Visualize tags criadas por usuários, aprove novas ou remova se necessário
              </p>
            </div>
          </div>
        </motion.div>

        {/* Loading */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
          </div>
        ) : pendingTags.length === 0 ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhuma tag criada por usuários
            </h3>
            <p className="text-gray-600 mb-6">
              Quando usuários criarem novas tags, elas aparecerão aqui para você revisar.
            </p>
            <button
              onClick={() => navigate("/forum")}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Voltar ao Fórum
            </button>
          </motion.div>
        ) : (
          /* Tags List */
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">{pendingTags.length}</span> {pendingTags.length === 1 ? 'tag criada por usuário' : 'tags criadas por usuários'}
                <span className="ml-2 text-yellow-600">
                  ({pendingTags.filter(t => t.approved === 0).length} nova{pendingTags.filter(t => t.approved === 0).length !== 1 ? 's' : ''})
                </span>
              </p>
            </div>

            {pendingTags.map((tag, index) => (
              <motion.div
                key={tag.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Tag Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-3 py-1 bg-cyan-50 text-cyan-700 border border-cyan-200 rounded-full text-sm font-medium">
                        {tag.nome}
                      </span>
                      <span className="text-xs text-gray-500">
                        {topicLabels[tag.topico || 'geral']}
                      </span>
                      {tag.approved === 0 ? (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 border border-yellow-300 rounded text-xs font-medium">
                          🆕 Nova
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 text-green-800 border border-green-300 rounded text-xs font-medium">
                          ✓ Aprovada
                        </span>
                      )}
                    </div>

                    {tag.descricao && (
                      <p className="text-sm text-gray-700 mb-3">
                        {tag.descricao}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        👤 {tag.created_by_name || 'Usuário desconhecido'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(tag.created_at || '')}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {tag.approved === 0 ? (
                      <button
                        onClick={() => handleApprove(tag.id!, tag.nome)}
                        disabled={processingTagId === tag.id}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {processingTagId === tag.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        Aprovar
                      </button>
                    ) : (
                      <div className="px-4 py-2 text-sm text-gray-500 italic">
                        Já aprovada
                      </div>
                    )}
                    <button
                      onClick={() => handleDelete(tag.id!, tag.nome)}
                      disabled={processingTagId === tag.id}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {processingTagId === tag.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      Deletar
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      
    </div>
  );
};

export default AdminPendingTagsPage;
