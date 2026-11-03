<template>
  <Teleport to="body">
    <div class="overlay" @click.self="$emit('cancel')">
      <div class="modal" :class="{ 'modal-type-sel': step === 1 }">

        <!-- ── Step 1: Card Type Selector ─────────────────────────── -->
        <template v-if="step === 1">
          <button class="modal-close-abs" @click="$emit('cancel')">×</button>
          <div class="type-sel-head">
            <h2 class="type-sel-title">Select Card Type</h2>
            <p class="type-sel-sub">
              The Card Type is the category that the subject of the card best fits into.
              For example, to save an online article in a card, choose "Text" Card Type below.
              Click <a href="#" class="type-sel-link" @click.prevent>here</a> to learn more about creating cards.
            </p>
          </div>
          <div class="type-rows">
            <div v-for="t in CARD_TYPES" :key="t.key" class="type-row">
              <button class="type-pill" @click="pickType(t.key)">{{ t.label }}</button>
              <span class="type-row-desc">{{ t.desc }}</span>
            </div>
          </div>
        </template>

        <!-- ── Step 2: Form ────────────────────────────────────────── -->
        <template v-else>
          <div class="modal-head">
            <button v-if="!isEdit" class="modal-back" @click="step = 1">← Back</button>
            <span class="modal-title">{{ isEdit ? 'Edit Card' : (currentType?.label ?? 'New Card') }}</span>
            <button class="modal-close" @click="$emit('cancel')">×</button>
          </div>
          <div class="modal-body">

            <!-- OG image preview -->
            <div v-if="form.image" class="preview-thumb-wrap">
              <img :src="form.image" class="preview-thumb" alt="Preview" />
              <button class="preview-remove" @click="form.image = ''" title="Remove image">×</button>
            </div>

            <div class="field">
              <label>Title *</label>
              <input v-model="form.title" type="text"
                :placeholder="currentType?.titlePlaceholder ?? 'Card title'"
                autofocus />
            </div>

            <div class="field">
              <label>Description</label>
              <textarea v-model="form.description" rows="3"
                :placeholder="currentType?.descPlaceholder ?? 'Description…'" />
            </div>

            <div class="field">
              <label>
                Website URL
                <span v-if="fetching" class="field-hint">Fetching metadata…</span>
              </label>
              <div class="url-input-wrap">
                <input
                  v-model="form.website"
                  type="url"
                  placeholder="https://…"
                  @blur="onUrlBlur"
                  @paste.prevent="onUrlPaste"
                />
                <span v-if="fetching" class="url-fetch-spinner spinner spinner-muted"></span>
              </div>
              <span v-if="fetchError" class="field-hint-err">{{ fetchError }}</span>
            </div>

            <div class="field">
              <label>Tags <span class="field-hint">(comma-separated)</span></label>
              <input v-model="form.tagsRaw" type="text" placeholder="design, reading, work" />
            </div>

            <div class="field">
              <label>Collection * <span v-if="loadingFolders" class="field-hint">Loading…</span></label>
              <select v-model="form.folderId" :class="{ 'select-required': !form.folderId }">
                <option value="" disabled>— Select a collection —</option>
                <option v-for="c in allCollections" :key="c.id" :value="String(c.id)">{{ c.name }}</option>
              </select>
            </div>

            <div v-if="error" class="error-msg">{{ error }}</div>

            <div class="modal-actions">
              <button class="btn btn-ghost" @click="$emit('cancel')">Cancel</button>
              <button class="btn btn-primary"
                :disabled="!form.title.trim() || !form.folderId || saving"
                @click="save">
                <span v-if="saving" class="spinner"></span>
                <span v-else>{{ isEdit ? 'Save Changes' : 'Add Card' }}</span>
              </button>
            </div>
          </div>
        </template>

      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { createCard, updateCard, fetchCollections } from '../api.js'
import { useToast } from '../composables/useToast.js'

const CARD_TYPES = [
  {
    key: 'text',
    label: 'Text',
    desc: 'Article, Blog Post, Document, Slide Deck, Study, etc.',
    titlePlaceholder: 'Article title, document name…',
    descPlaceholder:  'Summary, notes, key points…',
  },
  {
    key: 'media',
    label: 'Media',
    desc: 'Video, Podcast, Audio File, etc.',
    titlePlaceholder: 'Video title, podcast episode…',
    descPlaceholder:  'Description, notes, timestamps…',
  },
  {
    key: 'business',
    label: 'Business',
    desc: 'Company, Organization, Professional, Website, etc.',
    titlePlaceholder: 'Company name, organization…',
    descPlaceholder:  'What they do, notes, contacts…',
  },
  {
    key: 'product',
    label: 'Product',
    desc: 'Physical or digital Product, App, Book, etc.',
    titlePlaceholder: 'Product name, app or book title…',
    descPlaceholder:  'What it does, why it matters…',
  },
  {
    key: 'scribe',
    label: 'Original Scribe',
    desc: 'Your own unique article or blog post with customized layout.',
    titlePlaceholder: 'Your article title…',
    descPlaceholder:  'Your article content…',
  },
]

// Map legacy type tags to new types for edit mode
const LEGACY_TYPE_MAP = { url: 'text', note: 'text', photo: 'media', screenshot: 'media', contact: 'business' }

const props = defineProps({
  card:            { type: Object,           default: null },
  collections:     { type: Array,            default: () => [] },
  defaultFolderId: { type: [String, Number], default: '' },
})
const emit = defineEmits(['saved', 'cancel'])

const { success, error: toastError } = useToast()

const isEdit         = computed(() => !!props.card)
const step           = ref(isEdit.value ? 2 : 1)
const selectedTypeKey = ref(isEdit.value ? inferType(props.card) : null)

const currentType = computed(() => CARD_TYPES.find(t => t.key === selectedTypeKey.value) ?? null)

const fetching   = ref(false)
const fetchError = ref('')

const form = reactive({
  title:       props.card?.title       ?? '',
  description: props.card?.description ?? '',
  website:     props.card?.website     ?? '',
  image:       props.card?.og_image    ?? props.card?.image ?? '',
  tagsRaw:     parseTags(props.card?.tags ?? []).filter(t => !t.startsWith('_')).join(', '),
  folderId:    String(props.card?.folder_id ?? props.defaultFolderId ?? ''),
})

const saving           = ref(false)
const error            = ref('')
const loadingFolders   = ref(false)
const localCollections = ref([])

const allCollections = computed(() => {
  if (props.collections.length > 0) return props.collections
  return localCollections.value
})

onMounted(async () => {
  if (props.collections.length === 0) {
    loadingFolders.value = true
    try { localCollections.value = await fetchCollections() ?? [] }
    catch { localCollections.value = [] }
    finally { loadingFolders.value = false }
  }
  if (!isEdit.value && !form.folderId && allCollections.value.length > 0) {
    form.folderId = String(allCollections.value[0].id)
  }
})

function inferType(card) {
  if (!card) return 'text'
  const tags = parseTags(card.tags)
  for (const t of CARD_TYPES) { if (tags.includes(`_${t.key}`)) return t.key }
  for (const [old, neo] of Object.entries(LEGACY_TYPE_MAP)) { if (tags.includes(`_${old}`)) return neo }
  return 'text'
}

function parseTags(tags) {
  if (Array.isArray(tags)) return tags.filter(Boolean)
  if (typeof tags === 'string') {
    try { const p = JSON.parse(tags); if (Array.isArray(p)) return p.filter(Boolean) } catch {}
    return tags.split(',').map(t => t.trim()).filter(Boolean)
  }
  return []
}

function pickType(key) {
  selectedTypeKey.value = key
  step.value = 2
}

async function fetchMeta() {
  if (!form.website?.trim()) return
  fetching.value = true; fetchError.value = ''
  try {
    const res  = await fetch(`/api/v1/preview?url=${encodeURIComponent(form.website.trim())}`)
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Could not fetch metadata')
    if (data.title       && !form.title)       form.title       = data.title
    if (data.description && !form.description) form.description = data.description
    if (data.image)                            form.image       = data.image
  } catch {
    fetchError.value = 'Could not fetch metadata.'
    toastError('Could not fetch URL metadata')
  } finally { fetching.value = false }
}

function onUrlBlur() {
  if (form.website?.trim() && !fetching.value) fetchMeta()
}

function onUrlPaste(e) {
  const pasted = (e.clipboardData || window.clipboardData).getData('text').trim()
  if (pasted) { form.website = pasted; setTimeout(() => fetchMeta(), 50) }
}

async function save() {
  error.value = ''; saving.value = true
  try {
    const userTags = form.tagsRaw.split(',').map(t => t.trim()).filter(Boolean)
    const typeTags = selectedTypeKey.value ? [`_${selectedTypeKey.value}`] : []
    const payload = {
      title:       form.title.trim(),
      description: form.description.trim(),
      website:     form.website.trim(),
      email:       '',
      tags:        [...typeTags, ...userTags],
      og_image:    form.image || undefined,
      folder_id:   form.folderId || undefined,
    }
    let result
    if (isEdit.value) {
      await updateCard(props.card.id, payload)
      result = { ...props.card, ...payload, folder_id: form.folderId }
    } else {
      result = await createCard(payload)
      if (!result) result = { id: Date.now(), ...payload }
    }
    emit('saved', result)
    success(isEdit.value ? 'Changes saved' : 'Card saved')
  } catch (e) {
    error.value = e.message
    toastError('Failed to save')
  } finally { saving.value = false }
}
</script>

<style scoped>
/* ── Type selector modal size ─────────────────────────────── */
.modal-type-sel { max-width: 600px; padding: 40px; }

.modal-close-abs {
  position: absolute; top: 20px; right: 20px;
  width: 30px; height: 30px; border-radius: 50%;
  background: var(--surface); color: var(--text-muted);
  font-size: 18px; display: flex; align-items: center; justify-content: center;
  transition: background .15s, color .15s;
}
.modal-close-abs:hover { background: var(--border); color: var(--text); }

/* Type selector head */
.type-sel-head { margin-bottom: 32px; }
.type-sel-title {
  font-family: 'Poppins', sans-serif;
  font-size: 20px; font-weight: 600; color: var(--title);
  text-align: center; margin-bottom: 16px;
}
.type-sel-sub {
  font-size: 14px; color: #666666; line-height: 1.65;
  text-align: center; max-width: 480px; margin: 0 auto;
}
.type-sel-link { color: #8A7A5E; text-decoration: underline; }
.type-sel-link:hover { color: #6F5E4E; }

/* Type rows */
.type-rows { display: flex; flex-direction: column; gap: 24px; }

.type-row {
  display: flex; align-items: center; gap: 24px;
}

.type-pill {
  flex-shrink: 0;
  width: 160px; height: 60px;
  border: 1.5px solid #d0c9be;
  border-radius: 50px;
  background: #ffffff;
  font-family: 'Poppins', sans-serif;
  font-size: 16px; font-weight: 600;
  color: #8a8279;
  transition: border-color .15s, color .15s;
  white-space: nowrap;
}
.type-pill:hover {
  border-color: #8A7A5E;
  color: #8A7A5E;
}

.type-row-desc {
  font-size: 14px; color: #666666; line-height: 1.5;
}

/* ── Form modal ──────────────────────────────────────────── */
.modal-back {
  font-size: 13px; font-weight: 500; color: var(--text-muted);
  background: none; padding: 0; transition: color .15s;
}
.modal-back:hover { color: var(--text); }

.modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 8px; }

.select-required { border-color: var(--border-dk); }

/* URL field */
.url-input-wrap { position: relative; }
.url-input-wrap input { padding-right: 40px; }
.url-fetch-spinner { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); }
.field-hint-err { display: block; font-size: 12px; color: var(--danger); margin-top: 5px; }

/* Image preview */
.preview-thumb-wrap {
  position: relative; width: 100%; border-radius: 10px; overflow: hidden;
  margin-bottom: 14px; background: var(--surface); max-height: 160px;
}
.preview-thumb { width: 100%; height: 160px; object-fit: cover; display: block; }
.preview-remove {
  position: absolute; top: 8px; right: 8px;
  width: 26px; height: 26px; border-radius: 50%;
  background: rgba(0,0,0,0.5); color: #fff;
  font-size: 15px; display: flex; align-items: center; justify-content: center;
  transition: background .12s;
}
.preview-remove:hover { background: rgba(0,0,0,0.75); }
</style>
