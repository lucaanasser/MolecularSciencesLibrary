import React, { useState, useEffect, useCallback } from "react";
import { logger } from "@/utils/logger";
import { useNavigate, Link } from "react-router-dom";
import {
  Flag,
  CheckCircle,
  XCircle,
  Loader2,
  Clock,
  ExternalLink,
  MessageSquare,
  HelpCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import * as ForumService from "@/services/ForumService";
import { ROUTES, forumQuestionPath } from "@/constants/navigation";
import { toast } from "sonner";

type StatusFilter = "pending" | "resolved" | "dismissed" | "all";

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: "pending", label: "Pendentes" },
  { key: "resolved", label: "Resolvidas" },
  { key: "dismissed", label: "Descartadas" },
  { key: "all", label: "Todas" },
];

const AdminReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<ForumService.Report[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");

  // Verificar se é admin
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user.role === "admin";

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await ForumService.getReports(statusFilter);
      setReports(data);
    } catch (error) {
      logger.error("Erro ao buscar denúncias:", error);
      toast.error("Erro ao carregar denúncias");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    if (!isAdmin) {
      toast.error("Acesso negado. Apenas administradores podem acessar esta página.");
      navigate(ROUTES.FORUM);
      return;
    }
    fetchReports();
  }, [isAdmin, navigate, fetchReports]);

  const handleResolve = async (id: number, status: "resolved" | "dismissed") => {
    setProcessingId(id);
    try {
      await ForumService.resolveReport(id, status);
      toast.success(status === "resolved" ? "Denúncia resolvida" : "Denúncia descartada");
      // Remove da lista se estamos filtrando por um status diferente
      if (statusFilter !== "all" && statusFilter !== status) {
        setReports((prev) => prev.filter((r) => r.id !== id));
      } else {
        fetchReports();
      }
    } catch (error: any) {
      logger.error("Erro ao atualizar denúncia:", error);
      toast.error(error.message || "Erro ao atualizar denúncia");
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusBadge = (status: ForumService.Report["status"]) => {
    const map = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      resolved: "bg-green-100 text-green-800 border-green-300",
      dismissed: "bg-gray-100 text-gray-600 border-gray-300",
    };
    const label = {
      pending: "Pendente",
      resolved: "Resolvida",
      dismissed: "Descartada",
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium border ${map[status]}`}>
        {label[status]}
      </span>
    );
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
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Flag className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Denúncias do Fórum</h1>
              <p className="text-gray-600">
                Revise conteúdo denunciado pelos usuários e tome uma ação
              </p>
            </div>
          </div>

          {/* Status Tabs */}
          <div className="flex gap-2 flex-wrap">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                  statusFilter === tab.key
                    ? "bg-academic-blue text-white border-academic-blue"
                    : "bg-white text-gray-600 border-gray-200 hover:border-academic-blue/40"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Loading / Empty / List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-red-600" />
          </div>
        ) : reports.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhuma denúncia {statusFilter === "pending" ? "pendente" : "aqui"}
            </h3>
            <p className="text-gray-600 mb-6">
              Quando usuários denunciarem conteúdo, ele aparecerá aqui para revisão.
            </p>
            <button
              onClick={() => navigate(ROUTES.FORUM)}
              className="px-6 py-2 bg-academic-blue text-white rounded-lg hover:bg-cyan-600 transition-colors"
            >
              Voltar ao Fórum
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-2">
              <span className="font-semibold text-gray-900">{reports.length}</span>{" "}
              {reports.length === 1 ? "denúncia" : "denúncias"}
            </p>

            {reports.map((report, index) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-cyan-50 text-cyan-700 border border-cyan-200">
                        {report.target_type === "question" ? (
                          <>
                            <HelpCircle className="w-3 h-3" /> Pergunta
                          </>
                        ) : (
                          <>
                            <MessageSquare className="w-3 h-3" /> Resposta
                          </>
                        )}
                      </span>
                      {statusBadge(report.status)}
                    </div>

                    {/* Trecho do conteúdo denunciado */}
                    <p className="text-sm text-gray-800 font-medium line-clamp-2 mb-2">
                      {report.target_preview || "(conteúdo removido)"}
                    </p>

                    {/* Motivo */}
                    <div className="bg-red-50 border border-red-100 rounded p-3 mb-3">
                      <span className="text-xs font-semibold text-red-700">Motivo: </span>
                      <span className="text-sm text-gray-700">{report.motivo}</span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                      <span>👤 {report.reporter_nome}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(report.created_at)}
                      </span>
                      {report.question_id && (
                        <Link
                          to={forumQuestionPath(report.question_id)}
                          className="flex items-center gap-1 text-academic-blue hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Ver no fórum
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {report.status === "pending" && (
                    <div className="flex flex-col gap-2 shrink-0">
                      <button
                        onClick={() => handleResolve(report.id, "resolved")}
                        disabled={processingId === report.id}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {processingId === report.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        Resolver
                      </button>
                      <button
                        onClick={() => handleResolve(report.id, "dismissed")}
                        disabled={processingId === report.id}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Descartar
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReportsPage;
