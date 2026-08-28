"use client";
import { Badge } from "@/components/ui/badge";
import { useT } from "@/hooks/i18n/useT";
import type { AgentRow } from "@/hooks/ai/useAgent";

export type AgentStatus = "published" | "draft" | "paused" | "archived" | "invalid";

/**
 * "Publicado" tem que significar "está no ar", e quem decide isso é o runtime:
 * tanto o dispatcher do CRM quanto o agent-engine só enxergam o agente pelo
 * `join ai_agent_versions on v.id = a.published_version_id`. Sem versão
 * publicada, o agente não responde a nada.
 *
 * Antes, para os agentes que não são `mcp_agent`, o badge saía apenas de
 * `is_active` — e o agente criado no onboarding (ativo, sem versão) aparecia
 * como "Publicado" enquanto era invisível para os dois runtimes. O dono do CRM
 * terminava a instalação achando que tinha um atendente de IA no ar.
 */
export function deriveAgentStatus(agent: AgentRow): AgentStatus {
  if (agent.archived_at) return "archived";
  if (!agent.published_version_id) return "draft";
  // `is_active` só tem semântica no rag_bot legado. Para mcp_agent, "no ar" é
  // published_version_id + não arquivado — é assim que o dispatcher do CRM e o
  // agent-engine escolhem o agente, e nenhum dos dois lê a coluna. Consultá-la
  // aqui marcava como "Pausado" um agente que está respondendo, sem saída pela
  // UI: "Despausar" fica disabled para mcp_agent, unpauseAgentAction recusa com
  // publish_required, e republicar não mexe em is_active.
  if (agent.kind === "mcp_agent") return "published";
  return agent.is_active ? "published" : "paused";
}

const LABEL: Record<AgentStatus, string> = {
  published: "Publicado",
  draft: "Rascunho",
  paused: "Pausado",
  archived: "Arquivado",
  invalid: "Inválido",
};

const VARIANT: Record<AgentStatus, "default" | "secondary" | "outline" | "destructive"> = {
  published: "default",
  draft: "secondary",
  paused: "outline",
  archived: "outline",
  invalid: "destructive",
};

export function AgentStatusBadge({ status }: { status: AgentStatus }) {
  const t = useT();
  return (
    <Badge variant={VARIANT[status]} aria-label={`${t("status")}: ${t(LABEL[status])}`}>
      {t(LABEL[status])}
    </Badge>
  );
}
