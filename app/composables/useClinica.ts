export const ESPECIALIDADES = ['Clínica Geral', 'Cardiologia', 'Dermatologia', 'Ortopedia', 'Pediatria'] as const
export type Especialidade = typeof ESPECIALIDADES[number]

export interface Medico {
  id: string
  nome: string
  especialidade: Especialidade | null
}

interface Dados {
  medicos: Medico[]
}

const CHAVE = 'otimize'

function carregar(): Dados {
  try {
    const dados = JSON.parse(localStorage.getItem(CHAVE) ?? '')
    return { medicos: Array.isArray(dados?.medicos) ? dados.medicos : [] }
  } catch {
    return { medicos: [] }
  }
}

export function useClinica() {
  const dados = useState<Dados>('clinica', carregar)

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
    salvar()
  }

  return { medicosOrdenados, validarMedico, salvarMedico, removerMedico }
}
