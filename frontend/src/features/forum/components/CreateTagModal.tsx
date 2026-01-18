import React, { useState, useEffect } from 'react';
import { X, Tag as TagIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import * as ForumService from '../../../services/ForumService';

interface CreateTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTagCreated: (tag: ForumService.Tag) => void;
}

export default function CreateTagModal({ isOpen, onClose, onTagCreated }: CreateTagModalProps) {
  const [nome, setNome] = useState('');
  const [topico, setTopico] = useState('');
  const [descricao, setDescricao] = useState('');
  const [topics, setTopics] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchTopics();
    }
  }, [isOpen]);

  const fetchTopics = async () => {
    setIsLoadingTopics(true);
    try {
      const fetchedTopics = await ForumService.getTopics();
      setTopics(fetchedTopics);
    } catch (error) {
      console.error('Erro ao buscar tópicos:', error);
      toast.error('Erro ao carregar tópicos');
    } finally {
      setIsLoadingTopics(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (!nome.trim()) {
      toast.error('Nome da tag é obrigatório');
      return;
    }
    if (nome.length < 2) {
      toast.error('Nome deve ter pelo menos 2 caracteres');
      return;
    }
    if (!topico) {
      toast.error('Selecione um tópico');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await ForumService.createTag({
        nome: nome.trim().toLowerCase(),
        topico,
        descricao: descricao.trim()
      });

      toast.success(result.message || 'Tag criada com sucesso!');
      
      // Criar objeto tag para callback
      const newTag: ForumService.Tag = {
        id: result.id,
        nome: nome.trim().toLowerCase(),
        topico,
        descricao: descricao.trim(),
        approved: 0
      };
      
      onTagCreated(newTag);
      handleClose();
    } catch (error: any) {
      console.error('Erro ao criar tag:', error);
      toast.error(error.message || 'Erro ao criar tag');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setNome('');
    setTopico('');
    setDescricao('');
    onClose();
  };

  if (!isOpen) return null;

  // Tradução dos tópicos para português
  const topicoLabels: Record<string, string> = {
    'academico': '🎓 Acadêmico',
    'administrativo': '📋 Administrativo',
    'tecnico': '💻 Técnico',
    'eventos': '🎉 Eventos',
    'carreira': '💼 Carreira',
    'biblioteca': '📚 Biblioteca',
    'geral': '🌐 Geral'
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <TagIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Criar Nova Tag</h2>
              <p className="text-sm text-gray-500">Ficará disponível imediatamente</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Nome da Tag */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome da Tag *
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: python, machine-learning"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSubmitting}
              maxLength={50}
            />
            <p className="text-xs text-gray-500 mt-1">
              Mínimo 2 caracteres. Será convertido para minúsculas.
            </p>
          </div>

          {/* Tópico */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tópico *
            </label>
            {isLoadingTopics ? (
              <div className="flex items-center justify-center py-3">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              </div>
            ) : (
              <select
                value={topico}
                onChange={(e) => setTopico(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
              >
                <option value="">Selecione um tópico</option>
                {topics.map((t) => (
                  <option key={t} value={t}>
                    {topicoLabels[t] || t}
                  </option>
                ))}
              </select>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Categoria da tag para melhor organização
            </p>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Breve descrição sobre quando usar esta tag..."
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              disabled={isSubmitting}
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">
              {descricao.length}/200 caracteres
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              ℹ️ Sua tag ficará disponível imediatamente. O administrador será notificado para validar ou remover se necessário.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Criando...
                </>
              ) : (
                'Criar Tag'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
