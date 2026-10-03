export const ESPECIALIDADES = ['Clínica Geral', 'Cardiologia', 'Dermatologia', 'Ortopedia', 'Pediatria'] as const
export type Especialidade = typeof ESPECIALIDADES[number]

export interface Medico {
  id: string
  nome: string
  especialidade: Especialidade | null
}

export interface Pedido {
  id: string
  medicoId: string
  data: string
  paciente: string
  inicio: number
  fim: number
}

interface Dados {
  medicos: Medico[]
  pedidos: Pedido[]
}

interface Selecao {
  medicoId: string | null
  data: string
}

const CHAVE = 'otimize'

function carregar(): Dados {
  try {
    const dados = JSON.parse(localStorage.getItem(CHAVE) ?? '')
    return {
      medicos: Array.isArray(dados?.medicos) ? dados.medicos : [],
      pedidos: Array.isArray(dados?.pedidos) ? dados.pedidos : []
    }
  } catch {
    return { medicos: [], pedidos: [] }
  }
}

function hoje(): string {
  const agora = new Date()
  const mes = String(agora.getMonth() + 1).padStart(2, '0')
  const dia = String(agora.getDate()).padStart(2, '0')
  return `${agora.getFullYear()}-${mes}-${dia}`
}

function paraMinutos(horario: string): number {
  const [horas, minutos] = horario.split(':').map(Number)
  return horas! * 60 + minutos!
}

export function paraHorario(minutos: number): string {
  const horas = String(Math.floor(minutos / 60)).padStart(2, '0')
  return `${horas}:${String(minutos % 60).padStart(2, '0')}`
}

export function useClinica() {
  const dados = useState<Dados>('clinica', carregar)
  const selecao = useState<Selecao>('selecao', () => ({ medicoId: null, data: hoje() }))

  function salvar() {
    localStorage.setItem(CHAVE, JSON.stringify(dados.value))
  }

  const medicosOrdenados = computed(() =>
    [...dados.value.medicos].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
  )

  function validarMedico(nome: string, idIgnorado?: string): string | null {
    if (!nome) return 'Informe o nome do médico.'
    const nomeMinusculo = nome.toLowerCase()
    const duplicado = dados.value.medicos.some(
      (medico) => medico.id !== idIgnorado && medico.nome.toLowerCase() === nomeMinusculo
    )
    return duplicado ? 'Já existe um médico com este nome.' : null
  }

  function salvarMedico(nome: string, especialidade: Especialidade | null, id?: string): string | null {
    const nomeLimpo = nome.trim()
    const erro = validarMedico(nomeLimpo, id)
    if (erro) return erro
    const existente = dados.value.medicos.find((medico) => medico.id === id)
    if (existente) {
      existente.nome = nomeLimpo
      existente.especialidade = especialidade
    } else {
      dados.value.medicos.push({ id: crypto.randomUUID(), nome: nomeLimpo, especialidade })
    }
    salvar()
    return null
  }

  function removerMedico(id: string) {
    dados.value.medicos = dados.value.medicos.filter((medico) => medico.id !== id)
    dados.value.pedidos = dados.value.pedidos.filter((pedido) => pedido.medicoId !== id)
    if (selecao.value.medicoId === id) selecao.value.medicoId = null
    salvar()
  }

  const pedidosSelecionados = computed(() =>
    dados.value.pedidos
      .filter((pedido) => pedido.medicoId === selecao.value.medicoId && pedido.data === selecao.value.data)
      .sort((a, b) => a.inicio - b.inicio || a.fim - b.fim || a.paciente.localeCompare(b.paciente, 'pt-BR'))
  )

  function validarPedido(paciente: string, inicio: string, fim: string, idIgnorado?: string): string | null {
    if (!paciente || !inicio || !fim) return 'Preencha todos os campos.'
    if (paraMinutos(fim) <= paraMinutos(inicio)) return 'O horário de término deve ser posterior ao de início.'
    const pacienteMinusculo = paciente.toLowerCase()
    const duplicado = dados.value.pedidos.some(
      (pedido) =>
        pedido.id !== idIgnorado &&
        pedido.medicoId === selecao.value.medicoId &&
        pedido.data === selecao.value.data &&
        pedido.paciente.toLowerCase() === pacienteMinusculo
    )
    return duplicado ? 'Já existe um pedido para este paciente nesta data.' : null
  }

  function salvarPedido(paciente: string, inicio: string, fim: string, id?: string): string | null {
    const pacienteLimpo = paciente.trim()
    const erro = validarPedido(pacienteLimpo, inicio, fim, id)
    if (erro) return erro
    const existente = dados.value.pedidos.find((pedido) => pedido.id === id)
    if (existente) {
      existente.paciente = pacienteLimpo
      existente.inicio = paraMinutos(inicio)
      existente.fim = paraMinutos(fim)
    } else {
      dados.value.pedidos.push({
        id: crypto.randomUUID(),
        medicoId: selecao.value.medicoId!,
        data: selecao.value.data,
        paciente: pacienteLimpo,
        inicio: paraMinutos(inicio),
        fim: paraMinutos(fim)
      })
    }
    salvar()
    return null
  }

  function removerPedido(id: string) {
    dados.value.pedidos = dados.value.pedidos.filter((pedido) => pedido.id !== id)
    salvar()
  }

  function selecionarData(valor: string) {
    selecao.value.data = valor && valor >= hoje() ? valor : hoje()
  }

  return {
    medicosOrdenados,
    selecao,
    hoje,
    selecionarData,
    validarMedico,
    salvarMedico,
    removerMedico,
    pedidosSelecionados,
    salvarPedido,
    removerPedido,
    paraHorario
  }
}
