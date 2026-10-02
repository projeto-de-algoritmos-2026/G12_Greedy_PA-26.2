<script setup lang="ts">
import { ESPECIALIDADES, type Especialidade, type Medico } from '~/composables/useClinica'

const { medicosOrdenados, selecao, hoje, selecionarData, salvarMedico, removerMedico } = useClinica()

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
      </section>
    </main>
  </div>
</template>
