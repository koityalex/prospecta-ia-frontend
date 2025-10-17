import { useState, useEffect } from "react";
import {
  Search,
  Send,
  Building2,
  MapPin,
  Globe,
  Phone,
  Mail,
  BarChart3,
  ChevronDown,
  Loader2,
  AlertCircle,
  FileText,
} from "lucide-react";
import "./App.css";

// URL base da API
const API_URL = "http://localhost:3000/api";

function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("notas");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLeads, setIsLoadingLeads] = useState(true);
  const [error, setError] = useState(null);

  // Mapeamento correto de status (conforme o schema do Lead)
  const STATUS_MAP = {
    novo: "novos",
    em_contato: "emContato",
    negociando: "negociando",
    ganho: "ganhos",
    perdido: "perdidos",
  };

  const REVERSE_STATUS_MAP = {
    novos: "novo",
    emContato: "em_contato",
    negociando: "negociando",
    ganhos: "ganho",
    perdidos: "perdido",
  };

  const STATUS_OPTIONS = {
    novos: { label: "Novo", color: "bg-blue-500" },
    emContato: { label: "Em Contato", color: "bg-yellow-500" },
    negociando: { label: "Negociando", color: "bg-orange-500" },
    ganhos: { label: "Ganho", color: "bg-green-500" },
    perdidos: { label: "Perdido", color: "bg-red-500" },
  };

  const [leads, setLeads] = useState({
    novos: [],
    emContato: [],
    negociando: [],
    ganhos: [],
    perdidos: [],
  });

  // Função para carregar leads da API
  const loadLeads = async () => {
    try {
      setIsLoadingLeads(true);
      const response = await fetch(`${API_URL}/leads`);

      if (!response.ok) {
        throw new Error("Erro ao carregar leads");
      }

      const data = await response.json();

      // Organizar leads por status
      const organizedLeads = {
        novos: [],
        emContato: [],
        negociando: [],
        ganhos: [],
        perdidos: [],
      };

      data.leads.forEach((lead) => {
        const columnId = STATUS_MAP[lead.status] || "novos";

        organizedLeads[columnId].push({
          id: lead._id,
          nome: lead.nomeEmpresa || "Empresa sem nome",
          cnpj: lead.cnpj || null,
          endereco: lead.endereco || null,
          site: lead.site || null,
          telefone: lead.telefone || null,
          email: lead.email || null,
          porte: lead.porte || null,
          ramo: lead.ramo || null,
          status: lead.status,
          historico: lead.historico || [],
          notas: lead.notas || [],
          mensagemOriginal: lead.mensagemOriginal || "",
          createdAt: lead.createdAt,
        });
      });

      setLeads(organizedLeads);
      setError(null);
    } catch (err) {
      console.error("Erro ao carregar leads:", err);
      setError(
        "Não foi possível carregar os leads. Verifique se a API está rodando."
      );
    } finally {
      setIsLoadingLeads(false);
    }
  };

  // Carregar leads ao montar o componente
  useEffect(() => {
    loadLeads();
  }, []);

  // Função para criar novo lead via chat
  const handleSendMessage = async () => {
    if (!searchQuery.trim()) return;

    try {
      setIsLoading(true);
      setError(null);

      // Usar a rota correta: /api/chat
      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mensagem: searchQuery,
          usuario: "usuario",
          responsavel: "usuario",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao criar lead");
      }

      const data = await response.json();

      if (data.success && data.lead) {
        const newLead = data.lead;
        const columnId = STATUS_MAP[newLead.status] || "novos";

        const leadFormatted = {
          id: newLead.id,
          nome: newLead.nomeEmpresa || "Empresa sem nome",
          cnpj: newLead.cnpj || null,
          endereco: newLead.endereco || null,
          site: newLead.site || null,
          telefone: newLead.telefone || null,
          email: newLead.email || null,
          porte: newLead.porte || null,
          ramo: newLead.ramo || null,
          status: newLead.status,
          historico: [],
          notas: [],
          mensagemOriginal: searchQuery,
          createdAt: newLead.createdAt,
        };

        setLeads((prev) => ({
          ...prev,
          [columnId]: [leadFormatted, ...prev[columnId]],
        }));

        setSearchQuery("");
      }
    } catch (err) {
      console.error("Erro ao criar lead:", err);
      setError(err.message || "Erro ao criar lead. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  // Função para atualizar status do lead
  const handleStatusChange = async (
    leadId,
    newStatusColumnId,
    currentColumnId
  ) => {
    if (newStatusColumnId === currentColumnId) return;

    try {
      const newStatus = REVERSE_STATUS_MAP[newStatusColumnId];

      const response = await fetch(`${API_URL}/leads/${leadId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar status");
      }

      // Atualizar localmente após sucesso
      setLeads((prevLeads) => {
        const leadToMove = prevLeads[currentColumnId].find(
          (lead) => lead.id === leadId
        );
        if (!leadToMove) return prevLeads;

        const updatedSourceLeads = prevLeads[currentColumnId].filter(
          (lead) => lead.id !== leadId
        );
        const updatedLead = { ...leadToMove, status: newStatus };
        const updatedTargetLeads = [
          updatedLead,
          ...prevLeads[newStatusColumnId],
        ];

        return {
          ...prevLeads,
          [currentColumnId]: updatedSourceLeads,
          [newStatusColumnId]: updatedTargetLeads,
        };
      });
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
      setError("Erro ao atualizar status do lead.");
    }
  };

  const StatusDropdown = ({ lead, currentColumnId }) => {
    const [isOpen, setIsOpen] = useState(false);
    const columnId = STATUS_MAP[lead.status] || "novos";
    const currentStatus = STATUS_OPTIONS[columnId] || STATUS_OPTIONS.novos;

    return (
      <div className="relative inline-block text-left z-10">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
        >
          <span
            className={`w-2 h-2 rounded-full mr-1 ${currentStatus.color}`}
          ></span>
          {currentStatus.label}
          <ChevronDown className="w-3 h-3 ml-0.5" />
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div className="origin-top-left absolute left-0 mt-2 w-40 rounded-lg shadow-xl bg-[#2a2a2a] ring-1 ring-black ring-opacity-5 z-20">
              <div className="py-1">
                {Object.entries(STATUS_OPTIONS).map(([key, option]) => (
                  <button
                    key={key}
                    onClick={() => {
                      handleStatusChange(lead.id, key, currentColumnId);
                      setIsOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-[#3a3a3a] transition-colors"
                  >
                    <span
                      className={`w-2 h-2 rounded-full mr-2 ${option.color}`}
                    ></span>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  const LeadCard = ({ lead, currentColumnId }) => {
    const [localActiveTab, setLocalActiveTab] = useState("info");

    return (
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#3a3a3a] transition-all duration-200 rounded-lg mb-4">
        <div className="p-4">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold text-sm mb-2 truncate">
                {lead.nome}
              </h3>
              <StatusDropdown lead={lead} currentColumnId={currentColumnId} />
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-[#2a2a2a] mb-3">
            <div className="flex gap-4">
              <button
                onClick={() => setLocalActiveTab("info")}
                className={`pb-2 px-1 text-xs font-medium transition-colors ${
                  localActiveTab === "info"
                    ? "text-pink-500 border-b-2 border-pink-500"
                    : "text-gray-500 hover:text-gray-400"
                }`}
              >
                Informações
              </button>
              <button
                onClick={() => setLocalActiveTab("notas")}
                className={`pb-2 px-1 text-xs font-medium transition-colors ${
                  localActiveTab === "notas"
                    ? "text-pink-500 border-b-2 border-pink-500"
                    : "text-gray-500 hover:text-gray-400"
                }`}
              >
                Notas ({lead.notas?.length || 0})
              </button>
              <button
                onClick={() => setLocalActiveTab("historico")}
                className={`pb-2 px-1 text-xs font-medium transition-colors ${
                  localActiveTab === "historico"
                    ? "text-pink-500 border-b-2 border-pink-500"
                    : "text-gray-500 hover:text-gray-400"
                }`}
              >
                Histórico ({lead.historico?.length || 0})
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {localActiveTab === "info" && (
            <div className="space-y-2.5">
              {lead.cnpj && (
                <div className="flex items-center gap-2 text-xs">
                  <Building2 className="w-3.5 h-3.5 flex-shrink-0 text-gray-500" />
                  <span className="font-medium text-gray-500">CNPJ:</span>
                  <span className="text-gray-300 truncate">{lead.cnpj}</span>
                </div>
              )}

              {lead.telefone && (
                <div className="flex items-center gap-2 text-xs">
                  <Phone className="w-3.5 h-3.5 flex-shrink-0 text-gray-500" />
                  <span className="font-medium text-gray-500">Telefone:</span>
                  <span className="text-gray-300">{lead.telefone}</span>
                </div>
              )}

              {lead.email && (
                <div className="flex items-center gap-2 text-xs">
                  <Mail className="w-3.5 h-3.5 flex-shrink-0 text-gray-500" />
                  <span className="font-medium text-gray-500">Email:</span>
                  <span className="text-gray-300 truncate">{lead.email}</span>
                </div>
              )}

              {lead.site && (
                <div className="flex items-center gap-2 text-xs">
                  <Globe className="w-3.5 h-3.5 flex-shrink-0 text-gray-500" />
                  <span className="font-medium text-gray-500">Site:</span>
                  <a
                    href={
                      lead.site.startsWith("http")
                        ? lead.site
                        : `https://${lead.site}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pink-500 hover:text-pink-400 transition-colors truncate"
                  >
                    {lead.site}
                  </a>
                </div>
              )}

              {lead.endereco && (
                <div className="flex items-center gap-2 text-xs">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-gray-500" />
                  <span className="font-medium text-gray-500">Endereço:</span>
                  <span className="text-gray-300 truncate">
                    {lead.endereco}
                  </span>
                </div>
              )}

              {lead.porte && (
                <div className="flex items-center gap-2 text-xs">
                  <BarChart3 className="w-3.5 h-3.5 flex-shrink-0 text-gray-500" />
                  <span className="font-medium text-gray-500">Porte:</span>
                  <span className="text-gray-300">{lead.porte}</span>
                </div>
              )}

              {lead.ramo && (
                <div className="flex items-center gap-2 text-xs">
                  <FileText className="w-3.5 h-3.5 flex-shrink-0 text-gray-500" />
                  <span className="font-medium text-gray-500">Ramo:</span>
                  <span className="text-gray-300 truncate">{lead.ramo}</span>
                </div>
              )}

              {!lead.cnpj &&
                !lead.telefone &&
                !lead.email &&
                !lead.site &&
                !lead.endereco &&
                !lead.porte &&
                !lead.ramo && (
                  <p className="text-xs text-gray-500 text-center py-4">
                    Nenhuma informação adicional disponível
                  </p>
                )}
            </div>
          )}

          {localActiveTab === "notas" && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {lead.notas && lead.notas.length > 0 ? (
                lead.notas.map((nota, idx) => (
                  <div
                    key={idx}
                    className="text-xs p-2 bg-[#0f0f0f] rounded border border-[#2a2a2a]"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-500 font-medium">
                        {nota.usuario}
                      </span>
                      <span className="text-gray-600 text-[10px]">
                        {new Date(nota.data).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    <p className="text-gray-300">{nota.mensagem}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-500 text-center py-8">
                  Nenhuma nota adicionada ainda
                </p>
              )}
            </div>
          )}

          {localActiveTab === "historico" && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {lead.historico && lead.historico.length > 0 ? (
                lead.historico.map((item, idx) => (
                  <div
                    key={idx}
                    className="text-xs p-2 bg-[#0f0f0f] rounded border border-[#2a2a2a]"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-pink-500 font-medium capitalize">
                        {item.tipoMudanca?.replace(/_/g, " ")}
                      </span>
                      <span className="text-gray-600 text-[10px]">
                        {new Date(item.dataAtualizacao).toLocaleDateString(
                          "pt-BR"
                        )}
                      </span>
                    </div>
                    {item.descricao && (
                      <p className="text-gray-400">{item.descricao}</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-500 text-center py-8">
                  Nenhum histórico disponível
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const KanbanColumn = ({ title, columnId, leads, emptyMessage }) => (
    <div className="flex-1 min-w-[300px]">
      <div className="mb-4">
        <h2 className="text-white font-semibold text-sm mb-1">{title}</h2>
        <p className="text-gray-500 text-xs">
          {leads.length} lead{leads.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="bg-[#1a1a1a] p-3 rounded-lg border border-[#2a2a2a] min-h-[500px]">
        {leads.length > 0 ? (
          leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} currentColumnId={columnId} />
          ))
        ) : (
          <div className="flex items-center justify-center h-full pt-16">
            <p className="text-gray-500 text-sm text-center">{emptyMessage}</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <header className="border-b border-[#1a1a1a] bg-[#0a0a0a] sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-red-500 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">
                <span className="text-white">Trin</span>
                <span className="text-pink-500">dC</span>
                <span className="text-white">onnect</span>
              </h1>
              <p className="text-gray-500 text-xs">
                Seu caderninho inteligente de prospecção
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="border-b border-[#1a1a1a] bg-[#0a0a0a]">
        <div className="max-w-[1400px] mx-auto px-6 py-6">
          {error && (
            <div className="mb-4 bg-red-500/10 border border-red-500/50 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          <div className="relative max-w-3xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Digite informações sobre a empresa (nome, CNPJ, site, telefone...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              disabled={isLoading}
              className="w-full pl-11 pr-12 h-12 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white placeholder:text-gray-600 focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 focus:outline-none disabled:opacity-50"
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !searchQuery.trim()}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-br from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 w-8 h-8 rounded-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              ) : (
                <Send className="w-4 h-4 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-[1400px] mx-auto px-6 py-8">
        {isLoadingLeads ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
          </div>
        ) : (
          <div className="flex gap-6 overflow-x-auto pb-4">
            <KanbanColumn
              title="NOVOS"
              columnId="novos"
              leads={leads.novos}
              emptyMessage="Nenhum lead novo"
            />
            <KanbanColumn
              title="EM CONTATO"
              columnId="emContato"
              leads={leads.emContato}
              emptyMessage="Nenhum lead em contato"
            />
            <KanbanColumn
              title="NEGOCIANDO"
              columnId="negociando"
              leads={leads.negociando}
              emptyMessage="Nenhuma negociação ativa"
            />
            <KanbanColumn
              title="GANHOS"
              columnId="ganhos"
              leads={leads.ganhos}
              emptyMessage="Nenhum lead ganho"
            />
            <KanbanColumn
              title="PERDIDOS"
              columnId="perdidos"
              leads={leads.perdidos}
              emptyMessage="Nenhum lead perdido"
            />
          </div>
        )}
      </main>

      <footer className="border-t border-[#1a1a1a] bg-[#0a0a0a] mt-12">
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <p className="text-gray-600 text-xs text-right font-semibold">
            <span className="text-white">Trin</span>
            <span className="text-pink-500">dt</span>
            <span className="text-white">ech</span>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
