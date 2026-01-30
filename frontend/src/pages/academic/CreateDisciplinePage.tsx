import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ExternalLink,
  Info,
  BookOpen,
  Target,
  FileText,
  GraduationCap,
  Building,
  Hash,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createDiscipline, type CreateDisciplineData, type CreateDisciplineError } from "@/services/DisciplinesService";

/**
 * Página para criar disciplina manualmente com tutorial interativo
 */
const CreateDisciplinePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialCodigo = searchParams.get("codigo") || "";

  // Estados do formulário
  const [formData, setFormData] = useState<CreateDisciplineData>({
    codigo: initialCodigo,
    nome: "",
    unidade: "",
    campus: "",
    creditos_aula: 0,
    creditos_trabalho: 0,
    is_postgrad: true, // Default para pós-graduação
    ementa: "",
    objetivos: "",
    conteudo_programatico: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingDiscipline, setExistingDiscipline] = useState<{ codigo: string; nome: string } | null>(null);

  // Campos obrigatórios
  const isFormValid = formData.codigo.trim() && formData.nome.trim();

  const handleChange = (field: keyof CreateDisciplineData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
    setExistingDiscipline(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid) return;

    setIsSubmitting(true);
    setError(null);
    setExistingDiscipline(null);

    console.log('🔵 [CreateDisciplinePage] Enviando formData:', formData);
    console.log('🔵 [CreateDisciplinePage] is_postgrad:', formData.is_postgrad, typeof formData.is_postgrad);

    try {
      const discipline = await createDiscipline(formData);
      console.log('🟢 [CreateDisciplinePage] Disciplina criada:', discipline);
      // Redireciona para a página da disciplina criada
      navigate(`/academico/disciplina/${discipline.codigo}`);
    } catch (err) {
      const error = err as Error & { data?: CreateDisciplineError };
      
      if (error.data?.codigo) {
        // Disciplina já existe
        setExistingDiscipline({
          codigo: error.data.codigo,
          nome: error.data.nome || "",
        });
        setError("Esta disciplina já existe no sistema.");
      } else {
        setError(error.message || "Erro ao criar disciplina. Tente novamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-default-bg">
      

      <div className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => navigate("/academico/buscar")}
            className="mb-4 text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Voltar para busca
          </Button>

          <h1 className="text-3xl font-bebas text-gray-900 mb-2">
            Adicionar Disciplina da Pós-Graduação
          </h1>
          <p className="text-gray-600">
            Preencha as informações da disciplina usando os dados do Janus USP.
          </p>
        </motion.div>

        {/* Tutorial Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-academic-blue/5 to-academic-blue/10 rounded-2xl p-6 mb-8 border border-academic-blue/20"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-academic-blue/20 rounded-xl">
              <Lightbulb className="w-6 h-6 text-academic-blue" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Como encontrar as informações
              </h2>
              <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
                <li>
                  Acesse o{" "}
                  <a
                    href="https://uspdigital.usp.br/janus"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-academic-blue hover:underline inline-flex items-center gap-1"
                  >
                    Janus USP <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>Busque pela disciplina usando o código ou nome</li>
                <li>Clique na disciplina para ver os detalhes</li>
                <li>Copie as informações para os campos abaixo</li>
              </ol>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Seção: Informações Básicas */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-academic-blue/10 rounded-lg">
                <Hash className="w-5 h-5 text-academic-blue" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Informações Básicas</h2>
                <p className="text-sm text-gray-500">Código e nome são obrigatórios</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Código */}
              <div className="space-y-2">
                <Label htmlFor="codigo" className="text-sm font-medium text-gray-700">
                  Código da Disciplina *
                </Label>
                <Input
                  id="codigo"
                  value={formData.codigo}
                  onChange={(e) => handleChange("codigo", e.target.value.toUpperCase())}
                  placeholder="Ex: MCM5712"
                  className="uppercase"
                  required
                />
                <p className="text-xs text-gray-500 flex items-start gap-1">
                  <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  No Janus, aparece no topo da página da disciplina
                </p>
              </div>

              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="nome" className="text-sm font-medium text-gray-700">
                  Nome da Disciplina *
                </Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => handleChange("nome", e.target.value)}
                  placeholder="Ex: Tópicos Avançados em Matemática"
                  required
                />
                <p className="text-xs text-gray-500 flex items-start gap-1">
                  <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  Nome completo da disciplina no Janus
                </p>
              </div>

              {/* Unidade */}
              <div className="space-y-2">
                <Label htmlFor="unidade" className="text-sm font-medium text-gray-700">
                  Unidade
                </Label>
                <Input
                  id="unidade"
                  value={formData.unidade}
                  onChange={(e) => handleChange("unidade", e.target.value)}
                  placeholder="Ex: Instituto de Matemática e Estatística"
                />
                <p className="text-xs text-gray-500 flex items-start gap-1">
                  <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  Instituto ou Faculdade responsável
                </p>
              </div>

              {/* Campus */}
              <div className="space-y-2">
                <Label htmlFor="campus" className="text-sm font-medium text-gray-700">
                  Campus
                </Label>
                <Input
                  id="campus"
                  value={formData.campus}
                  onChange={(e) => handleChange("campus", e.target.value)}
                  placeholder="Ex: São Paulo"
                />
                <p className="text-xs text-gray-500 flex items-start gap-1">
                  <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  São Paulo, Ribeirão Preto, São Carlos, etc.
                </p>
              </div>
            </div>

            {/* Disciplina de Pós-Graduação */}
            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <Switch
                id="is_postgrad"
                checked={formData.is_postgrad}
                onCheckedChange={(checked) => handleChange("is_postgrad", checked)}
              />
              <Label htmlFor="is_postgrad" className="text-sm font-medium text-gray-700 cursor-pointer">
                Esta é uma disciplina de Pós-Graduação
              </Label>
            </div>
          </motion.section>

          {/* Seção: Créditos */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <GraduationCap className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Créditos</h2>
                <p className="text-sm text-gray-500">Informações de carga horária</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Créditos Aula */}
              <div className="space-y-2">
                <Label htmlFor="creditos_aula" className="text-sm font-medium text-gray-700">
                  Créditos Aula
                </Label>
                <Input
                  id="creditos_aula"
                  type="number"
                  min="0"
                  value={formData.creditos_aula || ""}
                  onChange={(e) => handleChange("creditos_aula", parseInt(e.target.value) || 0)}
                  placeholder="Ex: 4"
                />
                <div className="text-xs text-gray-600 space-y-1">
                  <p className="flex items-start gap-1">
                    <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span className="font-semibold text-purple-700">
                      Pós: (Teórica + Prática) × Duração ÷ 15
                    </span>
                  </p>
                  <p className="text-gray-500 ml-4">
                    Graduação: Use o valor direto de "Créditos Aula"
                  </p>
                </div>
              </div>

              {/* Créditos Trabalho */}
              <div className="space-y-2">
                <Label htmlFor="creditos_trabalho" className="text-sm font-medium text-gray-700">
                  Créditos Trabalho
                </Label>
                <Input
                  id="creditos_trabalho"
                  type="number"
                  min="0"
                  value={formData.creditos_trabalho || ""}
                  onChange={(e) => handleChange("creditos_trabalho", parseInt(e.target.value) || 0)}
                  placeholder="Ex: 2"
                />
                <div className="text-xs text-gray-600 space-y-1">
                  <p className="flex items-start gap-1">
                    <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span className="font-semibold text-purple-700">
                      Pós: Estudos × Duração ÷ 30
                    </span>
                  </p>
                  <p className="text-gray-500 ml-4">
                    Graduação: Use o valor direto de "Créditos Trabalho"
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Seção: Conteúdo */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BookOpen className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Conteúdo da Disciplina</h2>
                <p className="text-sm text-gray-500">Ementa, objetivos e programa (opcionais)</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Ementa */}
              <div className="space-y-2">
                <Label htmlFor="ementa" className="text-sm font-medium text-gray-700">
                  Ementa / Justificativa
                </Label>
                <Textarea
                  id="ementa"
                  value={formData.ementa}
                  onChange={(e) => handleChange("ementa", e.target.value)}
                  placeholder="Cole aqui a justificativa da disciplina..."
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-gray-500 flex items-start gap-1">
                  <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  No Janus: Seção "Justificativa" - copie o texto completo
                </p>
              </div>

              {/* Objetivos */}
              <div className="space-y-2">
                <Label htmlFor="objetivos" className="text-sm font-medium text-gray-700">
                  Objetivos
                </Label>
                <Textarea
                  id="objetivos"
                  value={formData.objetivos}
                  onChange={(e) => handleChange("objetivos", e.target.value)}
                  placeholder="Cole aqui os objetivos da disciplina..."
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-gray-500 flex items-start gap-1">
                  <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  No Janus: Seção "Objetivos" - copie o texto completo
                </p>
              </div>

              {/* Conteúdo Programático */}
              <div className="space-y-2">
                <Label htmlFor="conteudo_programatico" className="text-sm font-medium text-gray-700">
                  Conteúdo Programático
                </Label>
                <Textarea
                  id="conteudo_programatico"
                  value={formData.conteudo_programatico}
                  onChange={(e) => handleChange("conteudo_programatico", e.target.value)}
                  placeholder="Cole aqui o conteúdo programático..."
                  rows={6}
                  className="resize-none"
                />
                <p className="text-xs text-gray-500 flex items-start gap-1">
                  <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  No Janus: Seção "Conteúdo" - copie o texto completo
                </p>
              </div>
            </div>
          </motion.section>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 rounded-xl p-4"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-red-700 font-medium">{error}</p>
                  {existingDiscipline && (
                    <Button
                      type="button"
                      variant="link"
                      className="text-red-600 hover:text-red-800 p-0 h-auto mt-2"
                      onClick={() => navigate(`/academico/disciplina/${existingDiscipline.codigo}`)}
                    >
                      Ir para a página de {existingDiscipline.codigo}
                      {existingDiscipline.nome && ` - ${existingDiscipline.nome}`}
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-end"
          >
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/academico/buscar")}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="bg-academic-blue hover:bg-academic-blue/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Criar Disciplina
                </>
              )}
            </Button>
          </motion.div>
        </form>
      </div>

      
    </div>
  );
};

export default CreateDisciplinePage;
