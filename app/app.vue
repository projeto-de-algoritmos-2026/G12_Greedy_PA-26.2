<script setup lang="ts">
import { ESPECIALIDADES, type Especialidade, type Medico, type Pedido } from '~/composables/useClinica'

const {
  medicosOrdenados,
  selecao,
  hoje,
  selecionarData,
  salvarMedico,
  removerMedico,
  pedidosSelecionados,
  salvarPedido,
  removerPedido,
  atualizarAgenda,
  resultadoSelecionado,
  linhaDoTempo,
  paraHorario
} = useClinica()

watch(pedidosSelecionados, atualizarAgenda, { immediate: true, deep: true })

const nome = ref('')
const especialidade = ref<Especialidade | null>(null)
const erro = ref<string | null>(null)
const editandoId = ref<string | null>(null)

function limparFormulario() {
  nome.value = ''
  especialidade.value = null
  erro.value = null
  editandoId.value = null
}

function enviar() {
  erro.value = salvarMedico(nome.value, especialidade.value, editandoId.value ?? undefined)
  if (!erro.value) limparFormulario()
}

function editar(medico: Medico) {
  nome.value = medico.nome
  especialidade.value = medico.especialidade
  erro.value = null
  editandoId.value = medico.id
}

function remover(medico: Medico) {
  if (!window.confirm(`Remover o médico ${medico.nome}?`)) return
  removerMedico(medico.id)
  if (editandoId.value === medico.id) limparFormulario()
}

const paciente = ref('')
const inicio = ref('')
const fim = ref('')
const erroPedido = ref<string | null>(null)
const editandoPedidoId = ref<string | null>(null)

function limparPedido() {
  paciente.value = ''
  inicio.value = ''
  fim.value = ''
  erroPedido.value = null
  editandoPedidoId.value = null
}

function enviarPedido() {
  erroPedido.value = salvarPedido(paciente.value, inicio.value, fim.value, editandoPedidoId.value ?? undefined)
  if (!erroPedido.value) limparPedido()
}

function editarPedido(pedido: Pedido) {
  paciente.value = pedido.paciente
  inicio.value = paraHorario(pedido.inicio)
  fim.value = paraHorario(pedido.fim)
  erroPedido.value = null
  editandoPedidoId.value = pedido.id
}

function removerPedidoDaLista(id: string) {
  removerPedido(id)
  if (editandoPedidoId.value === id) limparPedido()
}

watch(() => [selecao.value.medicoId, selecao.value.data], limparPedido)

function alterarData(evento: Event) {
  const valor = (evento.target as HTMLInputElement).value
  if (valor && valor >= hoje()) selecao.value.data = valor
}

function sairDaData(evento: Event) {
  const campo = evento.target as HTMLInputElement
  selecionarData(campo.value)
  campo.value = selecao.value.data
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 text-gray-900">
    <NuxtRouteAnnouncer />
    <main class="mx-auto max-w-3xl space-y-6 p-6">
      <h1 class="text-2xl font-bold">Otimize</h1>

      <section class="space-y-3 rounded-lg bg-white p-4 shadow">
        <h2 class="text-lg font-semibold">{{ editandoId ? 'Editar médico' : 'Cadastrar médico' }}</h2>
        <form class="flex flex-col gap-3 sm:flex-row sm:items-end" @submit.prevent="enviar">
          <label class="flex flex-1 flex-col gap-1 text-sm">
            Nome
            <input v-model="nome" type="text" class="rounded border border-gray-300 px-3 py-2" />
          </label>
          <label class="flex flex-col gap-1 text-sm">
            Especialidade
            <select v-model="especialidade" class="rounded border border-gray-300 px-3 py-2">
              <option :value="null">Sem especialidade</option>
              <option v-for="opcao in ESPECIALIDADES" :key="opcao" :value="opcao">{{ opcao }}</option>
            </select>
          </label>
          <button type="submit" class="rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700">
            Salvar
          </button>
          <button
            v-if="editandoId"
            type="button"
            class="rounded border border-gray-300 px-4 py-2 font-medium hover:bg-gray-100"
            @click="limparFormulario"
          >
            Cancelar
          </button>
        </form>
        <p v-if="erro" class="text-sm text-red-600">{{ erro }}</p>
      </section>

      <section class="space-y-3 rounded-lg bg-white p-4 shadow">
        <h2 class="text-lg font-semibold">Médicos</h2>
        <p v-if="medicosOrdenados.length === 0" class="text-gray-500">Nenhum médico cadastrado.</p>
        <ul v-else class="divide-y divide-gray-200">
          <li v-for="medico in medicosOrdenados" :key="medico.id" class="flex items-center justify-between gap-3 py-2">
            <div>
              <p class="font-medium">{{ medico.nome }}</p>
              <p class="text-sm text-gray-500">{{ medico.especialidade ?? 'Sem especialidade' }}</p>
            </div>
            <div class="flex gap-2">
              <button type="button" class="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100" @click="editar(medico)">
                Editar
              </button>
              <button type="button" class="rounded border border-red-300 px-3 py-1 text-sm text-red-600 hover:bg-red-50" @click="remover(medico)">
                Remover
              </button>
            </div>
          </li>
        </ul>
      </section>

      <section class="space-y-3 rounded-lg bg-white p-4 shadow">
        <h2 class="text-lg font-semibold">Agenda</h2>
        <p v-if="medicosOrdenados.length === 0" class="text-gray-500">Cadastre um médico para montar a agenda.</p>
        <div class="flex flex-col gap-3 sm:flex-row">
          <label v-if="medicosOrdenados.length > 0" class="flex flex-1 flex-col gap-1 text-sm">
            Médico
            <select v-model="selecao.medicoId" class="rounded border border-gray-300 px-3 py-2">
              <option :value="null">Selecione um médico</option>
              <option v-for="medico in medicosOrdenados" :key="medico.id" :value="medico.id">{{ medico.nome }}</option>
            </select>
          </label>
          <label class="flex flex-col gap-1 text-sm">
            Data
            <input
              type="date"
              :value="selecao.data"
              :min="hoje()"
              class="rounded border border-gray-300 px-3 py-2"
              @change="alterarData"
              @blur="sairDaData"
            />
          </label>
        </div>
        <template v-if="medicosOrdenados.length > 0">
          <p v-if="selecao.medicoId === null" class="text-gray-500">
            Selecione um médico para cadastrar pedidos de consulta.
          </p>
          <template v-else>
            <h3 class="font-semibold">{{ editandoPedidoId ? 'Editar pedido' : 'Cadastrar pedido' }}</h3>
            <form class="flex flex-col gap-3 sm:flex-row sm:items-end" @submit.prevent="enviarPedido">
              <label class="flex flex-1 flex-col gap-1 text-sm">
                Paciente
                <input v-model="paciente" type="text" class="rounded border border-gray-300 px-3 py-2" />
              </label>
              <label class="flex flex-col gap-1 text-sm">
                Início
                <input v-model="inicio" type="time" class="rounded border border-gray-300 px-3 py-2" />
              </label>
              <label class="flex flex-col gap-1 text-sm">
                Término
                <input v-model="fim" type="time" class="rounded border border-gray-300 px-3 py-2" />
              </label>
              <button type="submit" class="rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700">
                Salvar
              </button>
              <button
                v-if="editandoPedidoId"
                type="button"
                class="rounded border border-gray-300 px-4 py-2 font-medium hover:bg-gray-100"
                @click="limparPedido"
              >
                Cancelar
              </button>
            </form>
            <p v-if="erroPedido" class="text-sm text-red-600">{{ erroPedido }}</p>
            <p v-if="pedidosSelecionados.length === 0" class="text-gray-500">Nenhum pedido de consulta para esta data.</p>
            <ul v-else class="divide-y divide-gray-200">
              <li v-for="pedido in pedidosSelecionados" :key="pedido.id" class="flex items-center justify-between gap-3 py-2">
                <div>
                  <p class="font-medium">{{ pedido.paciente }}</p>
                  <p class="text-sm text-gray-500">{{ paraHorario(pedido.inicio) }} – {{ paraHorario(pedido.fim) }}</p>
                </div>
                <div class="flex gap-2">
                  <button type="button" class="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100" @click="editarPedido(pedido)">
                    Editar
                  </button>
                  <button type="button" class="rounded border border-red-300 px-3 py-1 text-sm text-red-600 hover:bg-red-50" @click="removerPedidoDaLista(pedido.id)">
                    Remover
                  </button>
                </div>
              </li>
            </ul>
            <h3 class="font-semibold">Agenda do dia</h3>
            <p class="text-sm text-gray-700">
              {{ resultadoSelecionado.aceitos.length }} de {{ pedidosSelecionados.length }}
              {{ pedidosSelecionados.length === 1 ? 'consulta agendada' : 'consultas agendadas' }}
            </p>
            <template v-if="linhaDoTempo">
              <div class="flex gap-4 text-sm">
                <span class="flex items-center gap-1"><span class="h-3 w-5 rounded bg-green-600"></span>Aceito</span>
                <span class="flex items-center gap-1"><span class="h-3 w-5 rounded border border-dashed border-gray-400 bg-gray-100"></span>Rejeitado</span>
              </div>
              <div class="overflow-x-auto">
                <div class="relative mx-5 pb-1 pt-5" :style="{ minWidth: `${linhaDoTempo.horas.length * 48}px` }">
                  <div
                    v-for="hora in linhaDoTempo.horas"
                    :key="hora.rotulo"
                    class="absolute bottom-0 top-0 border-l border-gray-200"
                    :style="{ left: `${hora.posicao}%` }"
                  >
                    <span class="absolute top-0 -translate-x-1/2 text-xs text-gray-500">{{ hora.rotulo }}</span>
                  </div>
                  <div v-for="barra in linhaDoTempo.barras" :key="barra.pedido.id" class="relative h-7">
                    <div
                      class="absolute inset-y-1 truncate rounded px-1 text-xs leading-5"
                      :class="barra.aceito ? 'bg-green-600 text-white' : 'border border-dashed border-gray-400 bg-gray-100 text-gray-600'"
                      :style="{ left: `${barra.esquerda}%`, width: `${barra.largura}%` }"
                      :title="`${barra.pedido.paciente} — ${paraHorario(barra.pedido.inicio)} – ${paraHorario(barra.pedido.fim)}`"
                    >
                      {{ barra.pedido.paciente }}
                    </div>
                  </div>
                </div>
              </div>
            </template>
            <div
              v-for="grupo in [
                { titulo: 'Aceitos', pedidos: resultadoSelecionado.aceitos, vazio: 'Nenhuma consulta agendada.' },
                { titulo: 'Rejeitados', pedidos: resultadoSelecionado.rejeitados, vazio: 'Nenhum pedido rejeitado.' }
              ]"
              :key="grupo.titulo"
            >
              <h4 class="text-sm font-semibold">{{ grupo.titulo }}</h4>
              <p v-if="grupo.pedidos.length === 0" class="text-gray-500">{{ grupo.vazio }}</p>
              <ul v-else class="divide-y divide-gray-200">
                <li v-for="pedido in grupo.pedidos" :key="pedido.id" class="py-2">
                  <p class="font-medium">{{ pedido.paciente }}</p>
                  <p class="text-sm text-gray-500">{{ paraHorario(pedido.inicio) }} – {{ paraHorario(pedido.fim) }}</p>
                </li>
              </ul>
            </div>
          </template>
        </template>
      </section>
    </main>
  </div>
</template>
