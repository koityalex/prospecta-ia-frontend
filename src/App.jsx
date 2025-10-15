import { useState } from 'react'
import { Search, Send, Building2, MapPin, Globe, Phone, Mail, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Card, CardContent } from '@/components/ui/card.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import './App.css'

function App() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('notas')

  // Dados de exemplo para os leads
  const leads = {
    novos: [
      {
        id: 1,
        nome: 'TRINDTECH LTDA',
        cnpj: '71.673.990/0001-77',
        endereco: 'São Paulo, SP',
        site: 'trindtech.com.br',
        telefone: '(11) 4444-5555',
        email: 'contato@trindtech.com.br',
        porte: 'Grande',
        ramo: 'Comércio',
        status: 'Novo'
      }
    ],
    emContato: [],
    negociando: [],
    ganhos: []
  }

  const LeadCard = ({ lead }) => (
    <Card className="bg-[#1a1a1a] border-[#2a2a2a] hover:border-[#3a3a3a] transition-all duration-200 mb-4">
      <CardContent className="p-4">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-sm mb-1">{lead.nome}</h3>
            <Badge 
              variant="secondary" 
              className="bg-[#2a2a2a] text-gray-300 hover:bg-[#2a2a2a] text-xs px-2 py-0.5"
            >
              {lead.status}
            </Badge>
          </div>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="font-medium text-gray-500">CNPJ</span>
            <span className="text-gray-300">{lead.cnpj}</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-400">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="font-medium text-gray-500">Endereço</span>
            <span className="text-gray-300">{lead.endereco}</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Globe className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="font-medium text-gray-500">Site</span>
            <a 
              href={`https://${lead.site}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-pink-500 hover:text-pink-400 transition-colors"
            >
              {lead.site}
            </a>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Phone className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="font-medium text-gray-500">Telefone</span>
            <span className="text-gray-300">{lead.telefone}</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Mail className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="font-medium text-gray-500">Email</span>
            <span className="text-gray-300">{lead.email}</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-400">
            <BarChart3 className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="font-medium text-gray-500">Porte</span>
            <span className="text-gray-300">{lead.porte}</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="font-medium text-gray-500">Ramo</span>
            <span className="text-gray-300">{lead.ramo}</span>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2 bg-[#0f0f0f] border border-[#2a2a2a]">
            <TabsTrigger 
              value="notas"
              className="data-[state=active]:bg-pink-500/10 data-[state=active]:text-pink-500 text-gray-400"
            >
              Notas
            </TabsTrigger>
            <TabsTrigger 
              value="historico"
              className="data-[state=active]:bg-pink-500/10 data-[state=active]:text-pink-500 text-gray-400"
            >
              Histórico
            </TabsTrigger>
          </TabsList>
          <TabsContent value="notas" className="mt-3">
            <p className="text-xs text-gray-500 text-center py-4">
              Nenhuma nota adicionada ainda
            </p>
          </TabsContent>
          <TabsContent value="historico" className="mt-3">
            <p className="text-xs text-gray-500 text-center py-4">
              Nenhum histórico disponível
            </p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )

  const KanbanColumn = ({ title, count, leads, emptyMessage }) => (
    <div className="flex-1 min-w-[280px]">
      <div className="mb-4">
        <h2 className="text-white font-semibold text-sm mb-1">{title}</h2>
        <p className="text-gray-500 text-xs">{count} lead{count !== 1 ? 's' : ''}</p>
      </div>
      <div className="space-y-3">
        {leads.length > 0 ? (
          leads.map(lead => <LeadCard key={lead.id} lead={lead} />)
        ) : (
          <div className="text-center py-12 px-4">
            <p className="text-gray-500 text-sm">{emptyMessage}</p>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0a0a0a] dark">
      {/* Header */}
      <header className="border-b border-[#1a1a1a] bg-[#0a0a0a] sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-red-500 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">TrindAI</h1>
              <p className="text-gray-500 text-xs">Seu caderninho inteligente de prospecção</p>
            </div>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="border-b border-[#1a1a1a] bg-[#0a0a0a]">
        <div className="max-w-[1400px] mx-auto px-6 py-6">
          <div className="relative max-w-3xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Digite o nome da empresa, CNPJ ou site para começar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 pr-12 h-12 bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-gray-600 focus:border-pink-500/50 focus:ring-pink-500/20"
            />
            <Button 
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-br from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 w-8 h-8"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <main className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="flex gap-6 overflow-x-auto pb-4">
          <KanbanColumn 
            title="NOVOS" 
            count={leads.novos.length}
            leads={leads.novos}
            emptyMessage="Arraste leads aqui"
          />
          <KanbanColumn 
            title="EM CONTATO" 
            count={leads.emContato.length}
            leads={leads.emContato}
            emptyMessage="Arraste leads aqui"
          />
          <KanbanColumn 
            title="NEGOCIANDO" 
            count={leads.negociando.length}
            leads={leads.negociando}
            emptyMessage="Arraste leads aqui"
          />
          <KanbanColumn 
            title="GANHOS" 
            count={leads.ganhos.length}
            leads={leads.ganhos}
            emptyMessage="Arraste leads aqui"
          />
        </div>
      </main>

         {/* Footer */}
      <footer className="border-t border-[#1a1a1a] bg-[#0a0a0a] mt-12">
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          {/* Texto "Trindtech" substitui a logo e o crédito Lovable */}
          <p className="text-gray-600 text-xs text-right font-semibold">
  <span className="text-white">Trin</span>
  <span className="text-pink-500">dt</span>
  <span className="text-white">ech</span>
</p>

As letras **Trin** e **ech** usam `text-white`, e as letras **dt** usam `text-pink-500`, replicando o estilo do logo.
        </div>
      </footer>
    </div>
  )
}

export default App
