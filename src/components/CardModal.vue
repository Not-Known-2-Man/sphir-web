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

            <!-- Link already saved by other people (count only, never who) -->
            <div v-if="alreadyOnSphir" class="sphir-notice">{{ alreadyOnSphirText }}</div>
            <div v-if="filledByAi" class="ai-hint">Filled by AI · edit anything</div>

            <!-- Image upload / paste -->
            <div class="field">
              <label>Image <span class="field-hint">(choose a file or paste with Cmd/Ctrl+V)</span></label>
              <div class="image-upload-row">
                <button class="btn btn-ghost" type="button" :disabled="uploading" @click="fileInput?.click()">
                  <span v-if="uploading" class="spinner"></span>
                  <span v-else>Choose image…</span>
                </button>
                <span v-if="uploading" class="field-hint">{{ uploadStage }}</span>
                <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp" hidden @change="onFilePicked" />
              </div>
              <span v-if="uploadError" class="field-hint-err">{{ uploadError }}</span>
            </div>

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
              <label>Price <span class="field-hint">(optional)</span></label>
              <input v-model="form.price" type="text" placeholder="$29.99" />
            </div>

            <div class="field">
              <label>Tags <span class="field-hint">(comma-separated)</span></label>
              <input v-model="form.tagsRaw" type="text" placeholder="design, reading, work" />
            </div>

            <div class="field">
              <label>Collection * <span v-if="loadingFolders" class="field-hint">Loading…</span></label>
              <select v-if="allCollections.length > 0" v-model="form.folderId" :class="{ 'select-required': !form.folderId }">
                <option value="" disabled>— Select a collection —</option>
                <option v-for="c in allCollections" :key="c.id" :value="String(c.id)">{{ c.name }}</option>
              </select>
              <button v-if="!loadingFolders && allCollections.length > 0 && !showNewCollection"
                class="btn btn-ghost new-collection-btn" type="button" @click="showNewCollection = true">
                + New collection
              </button>
              <div v-if="!loadingFolders && (showNewCollection || allCollections.length === 0)" class="new-collection">
                <span v-if="allCollections.length === 0" class="field-hint">You have no collections yet. Name your first one:</span>
                <div class="new-collection-row">
                  <input v-model="newCollectionName" type="text" placeholder="e.g. Weekend Ideas"
                    @keydown.enter.prevent="createNewCollection" />
                  <button class="btn btn-ghost" type="button"
                    :disabled="!newCollectionName.trim() || creatingCollection"
                    @click="createNewCollection">
                    <span v-if="creatingCollection" class="spinner"></span>
                    <span v-else>Create</span>
                  </button>
                  <button v-if="allCollections.length > 0" class="btn btn-ghost" type="button"
                    @click="showNewCollection = false; newCollectionName = ''">Cancel</button>
                </div>
              </div>
            </div>

            <div v-if="error" class="error-msg">{{ error }}</div>

            <div class="modal-actions">
              <button class="btn btn-ghost" @click="$emit('cancel')">Cancel</button>
              <button class="btn btn-primary"
                :disabled="!form.title.trim() || !form.folderId || saving || uploading"
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
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { createCard, updateCard, fetchCollections, createCollection, previewUrl, uploadImage } from '../api.js'
import { resizeToJpegDataUrl, IMAGE_TYPES } from '../utils/imageResize.js'
import { useToast } from '../composables/useToast.js'

const CARD_TYPES = [
  {
    key: 'article',
    label: 'Article',
    desc: 'News story, Blog Post, Essay, Report, etc.',
    titlePlaceholder: 'Article title…',
    descPlaceholder:  'Summary, notes, key points…',
  },
  {
    key: 'video',
    label: 'Video',
    desc: 'YouTube, Vimeo, TikTok or any video.',
    titlePlaceholder: 'Video title…',
    descPlaceholder:  'Description, notes, timestamps…',
  },
  {
    key: 'recipe',
    label: 'Recipe',
    desc: 'A dish, ingredients and steps.',
    titlePlaceholder: 'Recipe name…',
    descPlaceholder:  'Ingredients, notes, timing…',
  },
  {
    key: 'social',
    label: 'Social post',
    desc: 'Instagram, X, Facebook or Threads post.',
    titlePlaceholder: 'Post title or author…',
    descPlaceholder:  'Caption, notes…',
  },
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

const { error: toastError } = useToast()

const isEdit         = computed(() => !!props.card)
const step           = ref(isEdit.value ? 2 : 1)
const selectedTypeKey = ref(isEdit.value ? inferType(props.card) : null)

const currentType = computed(() => CARD_TYPES.find(t => t.key === selectedTypeKey.value) ?? null)

const fetching   = ref(false)
const fetchError = ref('')
const alreadyOnSphir = ref(null)   // { count, title, image, price } from the preview, or null
const filledByAi     = ref(false)
const alreadyOnSphirText = computed(() => {
  const n = Number(alreadyOnSphir.value?.count) || 0
  return `Already on Sphir · ${n} ${n === 1 ? 'person' : 'people'} saved it`
})

const form = reactive({
  title:       props.card?.title       ?? '',
  description: props.card?.description ?? '',
  website:     props.card?.website     ?? '',
  image:       props.card?.og_image    ?? props.card?.image ?? '',
  price:       props.card?.price       ?? '',
  tagsRaw:     parseTags(props.card?.tags ?? []).filter(t => !t.startsWith('_')).join(', '),
  folderId:    String(props.card?.folder_id ?? props.defaultFolderId ?? ''),
})

const saving           = ref(false)
const error            = ref('')
const loadingFolders   = ref(false)
const localCollections = ref([])
const newCollectionName  = ref('')
const creatingCollection = ref(false)
const showNewCollection  = ref(false)

async function createNewCollection() {
  const name = newCollectionName.value.trim()
  if (!name || creatingCollection.value) return
  creatingCollection.value = true
  error.value = ''
  try {
    const created = await createCollection({ name, description: '', privacy: 'private' })
    if (!created?.id) throw new Error('The collection was not created')
    localCollections.value = [...localCollections.value, created]
    showNewCollection.value = false
    form.folderId = String(created.id)
    newCollectionName.value = ''
  } catch (e) {
    error.value = e?.message || 'Could not create the collection'
  } finally {
    creatingCollection.value = false
  }
}

const allCollections = computed(() => {
  const ids = new Set(props.collections.map(c => String(c.id)))
  return [...props.collections, ...localCollections.value.filter(c => !ids.has(String(c.id)))]
})

const fileInput   = ref(null)
const uploading   = ref(false)
const uploadStage = ref('')
const uploadError = ref('')

async function addImage(file) {
  if (!file || uploading.value) return
  uploadError.value = ''
  if (!IMAGE_TYPES.includes(file.type)) {
    uploadError.value = 'Only JPEG, PNG or WebP images are supported.'
    return
  }
  // No type chosen yet (e.g. pasted on the type selector): default to Media
  if (!selectedTypeKey.value) selectedTypeKey.value = 'media'
  if (step.value === 1) step.value = 2
  uploading.value = true
  try {
    uploadStage.value = 'Resizing…'
    const dataUrl = await resizeToJpegDataUrl(file)
    uploadStage.value = 'Uploading…'
    const res = await uploadImage(dataUrl)
    if (!res?.url) throw new Error('The server did not return an image URL')
    form.image = res.url
  } catch (e) {
    uploadError.value = `Image upload failed: ${e?.message || 'unknown error'}. The image was not added — try another image, or save the card without it.`
  } finally {
    uploading.value = false
    uploadStage.value = ''
  }
}

function onFilePicked(e) {
  const file = e.target.files?.[0]
  e.target.value = ''
  addImage(file)
}

function onDocPaste(e) {
  const item = [...(e.clipboardData?.items ?? [])].find(i => i.kind === 'file' && i.type.startsWith('image/'))
  const file = item?.getAsFile()
  if (!file) return          // plain text paste: leave to the focused field
  e.preventDefault()
  addImage(file)
}

onMounted(() => document.addEventListener('paste', onDocPaste))
onBeforeUnmount(() => document.removeEventListener('paste', onDocPaste))

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
  alreadyOnSphir.value = null; filledByAi.value = false
  if (!form.website?.trim()) return
  fetching.value = true; fetchError.value = ''
  try {
    const data = await previewUrl(form.website.trim())
    if (!data) throw new Error('Could not fetch metadata')
    if (data.title       && !form.title)       form.title       = data.title
    if (data.description && !form.description) form.description = data.description
    if (data.image)                            form.image       = data.image
    // Newer API fields (all optional; an older API just omits them)
    if (!isEdit.value) {
      if (data.type && data.type !== 'link' && CARD_TYPES.some(t => t.key === data.type)) {
        selectedTypeKey.value = data.type
      }
      if (data.price && !form.price.trim()) form.price = data.price
      // Already on Sphir: stored info only fills what the page left empty
      const known = data.already_on_sphir && Number(data.already_on_sphir.count) > 0 ? data.already_on_sphir : null
      alreadyOnSphir.value = known
      if (known) {
        if (known.title && !form.title.trim())  form.title = known.title
        if (known.image && !form.image)         form.image = known.image
        if (known.price && !form.price.trim())  form.price = known.price
      }
      filledByAi.value = data.ai === true
      const sid = data.suggested_collection_id
      if (sid != null && allCollections.value.some(c => String(c.id) === String(sid))) {
        form.folderId = String(sid)
      }
      const incoming = (Array.isArray(data.tags) ? data.tags : []).filter(t => t && !String(t).startsWith('_'))
      if (incoming.length) {
        const have = form.tagsRaw.split(',').map(t => t.trim()).filter(Boolean)
        const lower = new Set(have.map(t => t.toLowerCase()))
        for (const t of incoming) if (!lower.has(String(t).toLowerCase())) { have.push(String(t)); lower.add(String(t).toLowerCase()) }
        form.tagsRaw = have.join(', ')
      }
    }
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
      og_image:    form.image || '',
      price:       form.price.trim(),
      folder_id:   form.folderId || undefined,
    }
    let result
    if (isEdit.value) {
      await updateCard(props.card.id, payload)
      result = { ...props.card, ...payload, folder_id: form.folderId }
      // Primary collection changed: drop the stale folder_ids (consumers fall back to folder_id)
      if (String(props.card.folder_id ?? '') !== String(form.folderId ?? '')) delete result.folder_ids
    } else {
      result = await createCard(payload)
      if (!result) result = { id: Date.now(), ...payload }
    }
    // The parent view shows the "Card saved" toast.
    emit('saved', result)
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
.image-upload-row { display: flex; align-items: center; gap: 10px; }
.new-collection { display: flex; flex-direction: column; gap: 6px; }
.new-collection-row { display: flex; gap: 8px; }
.new-collection-btn { align-self: flex-start; margin-top: 6px; }
.new-collection-row input { flex: 1; min-width: 0; }
.field-hint-err { display: block; font-size: 12px; color: var(--danger); margin-top: 5px; }

.sphir-notice, .ai-hint { font-size: 13px; margin-bottom: 12px; }
.sphir-notice {
  padding: 8px 12px; border-radius: 8px;
  background: var(--surface); color: var(--text); font-weight: 500;
}
.ai-hint { color: var(--text-muted); }

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
