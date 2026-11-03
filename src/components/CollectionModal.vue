<template>
  <Teleport to="body">
    <div class="overlay" @click.self="$emit('cancel')">
      <div class="modal">
        <div class="modal-head">
          <span class="modal-title">{{ collection ? 'Edit Sphir' : 'New Sphir' }}</span>
          <button class="modal-close" @click="$emit('cancel')">×</button>
        </div>
        <div class="modal-body">
          <div class="field">
            <label>Name *</label>
            <input v-model="form.name" type="text" placeholder="e.g. Reading List" autofocus />
          </div>
          <div class="field">
            <label>Description</label>
            <textarea v-model="form.description" placeholder="What's this Sphir for?" rows="3" />
          </div>
          <div class="field">
            <label>Privacy</label>
            <select v-model="form.privacy">
              <option value="private">Private — only you</option>
              <option value="connections">Connections — people you follow</option>
              <option value="public">Public — everyone</option>
            </select>
          </div>

          <div v-if="error" class="error-msg">{{ error }}</div>

          <div class="modal-actions">
            <button class="btn btn-ghost" @click="$emit('cancel')">Cancel</button>
            <button class="btn btn-primary" :disabled="!form.name.trim() || loading" @click="submit">
              <span v-if="loading" class="spinner"></span>
              <span v-else>{{ collection ? 'Save Changes' : 'Create Sphir' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'
import { createCollection, updateCollection } from '../api.js'

const props = defineProps({ collection: { type: Object, default: null } })
const emit  = defineEmits(['saved', 'cancel'])

const loading = ref(false)
const error   = ref('')
const form    = reactive({
  name:        props.collection?.name        ?? '',
  description: props.collection?.description ?? '',
  privacy:     props.collection?.privacy     ?? 'private'
})

watch(() => props.collection, (c) => {
  form.name        = c?.name        ?? ''
  form.description = c?.description ?? ''
  form.privacy     = c?.privacy     ?? 'private'
}, { immediate: true })

async function submit() {
  error.value = ''; loading.value = true
  try {
    const payload = { name: form.name.trim(), description: form.description.trim(), privacy: form.privacy }
    const result  = props.collection
      ? await updateCollection(props.collection.id, payload)
      : await createCollection(payload)
    emit('saved', result ?? { ...props.collection, ...payload })
  } catch (e) { error.value = e.message }
  finally { loading.value = false }
}
</script>

<style scoped>
.modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 8px; }
</style>
