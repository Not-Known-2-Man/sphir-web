<template>
  <div class="col-page">
    <div class="col-container">

      <!-- ── Header ──────────────────────────────────────────── -->
      <div v-if="loadingCol" class="state-loading"><div class="spinner-page"></div><p>Loading…</p></div>
      <div v-else-if="colError" class="error-page">{{ colError }}</div>

      <template v-else-if="collection">
        <header class="col-header">
          <!-- Row 1: back + actions -->
          <div class="col-header-row1">
            <button class="back-btn" @click="router.push('/')">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#007BFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/>
              </svg>
            </button>
            <div class="col-header-edit">
              <button class="btn btn-ghost btn-sm" @click="openEditCollection">Edit</button>
              <button class="btn-icon-danger" @click="askDeleteCollection">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Row 2: badge + created-by pill -->
          <div class="col-header-row2">
            <span :class="['badge', privacyClass(collection.privacy)]">
              <template v-if="collection.privacy === 'public'">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><line x1="5" y1="0.5" x2="5" y2="9.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><line x1="0.5" y1="5" x2="9.5" y2="5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><line x1="1.96" y1="1.96" x2="8.04" y2="8.04" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><line x1="8.04" y1="1.96" x2="1.96" y2="8.04" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
                Public
              </template>
              <template v-else>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                {{ collection.privacy === 'connections' ? 'Connections' : 'Private' }}
              </template>
            </span>
            <span class="created-by-pill">Created By {{ store.displayName }}</span>
          </div>

          <!-- Title -->
          <h1 class="col-title">{{ collection.name }}</h1>

          <!-- Meta dates -->
          <div class="col-meta" v-if="collection.created_at || collection.updated_at">
            <span v-if="collection.created_at">Created: {{ formatDate(collection.created_at) }}</span>
            <span v-if="collection.updated_at">Last Updated: {{ formatDate(collection.updated_at) }}</span>
          </div>

          <!-- Search + add -->
          <div class="col-search-row">
            <input v-model="searchCards" class="cards-search-pill" type="text" placeholder="Search cards…" />
            <button class="btn-pill-add" @click="openCardModal(null)">+ Add Card</button>
          </div>
        </header>

        <!-- ── Loading / error ─────────────────────────────────── -->
        <div v-if="cardsError" class="error-msg">{{ cardsError }}</div>
        <div v-else-if="loadingCards" class="state-loading" style="padding:40px 0">
          <div class="spinner-page"></div><p>Loading cards…</p>
        </div>

        <!-- ── Empty ──────────────────────────────────────────── -->
        <div v-else-if="filteredCards.length === 0 && searchCards" class="state-empty">
          <div class="state-empty-icon">🔎</div>
          <p>No cards match your search.</p>
        </div>
        <div v-else-if="filteredCards.length === 0" class="empty-cards">
          <div class="empty-icon">🗂️</div>
          <div class="empty-title">No cards yet</div>
          <div class="empty-subtitle">Add your first card to this collection</div>
          <button class="btn-empty" @click="openCardModal(null)">+ Add Card</button>
        </div>

        <!-- ── Business card grid ──────────────────────────────── -->
        <div v-else class="biz-grid">
          <div v-for="card in filteredCards" :key="card.id" class="biz-col">

            <!-- Inline delete confirm -->
            <div v-if="confirmCardId === card.id" class="inline-confirm">
              <span>Delete <strong>{{ card.title }}</strong>?</span>
              <button class="btn btn-ghost btn-sm" @click="confirmCardId = null">Cancel</button>
              <button class="btn btn-danger-solid btn-sm" :disabled="deletingCardId === card.id" @click="doDeleteCard(card.id)">
                <span v-if="deletingCardId === card.id" class="spinner"></span>
                <span v-else>Delete</span>
              </button>
            </div>

            <!-- Business card — System 2 -->
            <div v-else class="biz-card" @click="openDetail(card)">

              <!-- ① Image: 236×157, top, object-fit cover -->
              <div class="biz-image-wrap">
                <img v-if="cardImage(card)" :src="cardImage(card)" :alt="card.title" class="biz-image" />
                <div v-else class="biz-image-placeholder">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C4B9AC" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                </div>
              </div>

              <!-- ② Category: 12px uppercase #8A7A5E -->
              <div class="biz-category">{{ cardCategory(card) }}</div>

              <!-- ③ Title: Montserrat Bold 20px #000000 -->
              <div class="biz-title">{{ card.title }}</div>

              <!-- ④ Description (optional) -->
              <div v-if="card.description" class="biz-desc">{{ card.description }}</div>

              <!-- ⑤ Website URL with favicon (optional) -->
              <a
                v-if="card.website"
                :href="normalizeUrl(card.website)"
                target="_blank"
                rel="noopener"
                class="biz-website"
                @click.stop
              >
                <img
                  :src="`https://www.google.com/s2/favicons?domain=${encodeURIComponent(normalizeUrl(card.website))}&sz=16`"
                  class="biz-favicon"
                  alt=""
                  loading="lazy"
                />
                <span class="biz-website-text">{{ card.website }}</span>
              </a>

              <!-- ⑥ Tags (optional) -->
              <div v-if="visibleTags(card).length" class="biz-tags-row">
                <span v-for="t in visibleTags(card)" :key="t" class="biz-tag">{{ t }}</span>
              </div>

              <!-- Spacer — pushes footer to bottom -->
              <div class="biz-spacer"></div>

              <!-- ⑦ Footer: edit | external-link + delete -->
              <div class="biz-footer" @click.stop>
                <button class="biz-icon-btn" title="Edit" @click="openCardModal(card)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <div class="biz-footer-right">
                  <a
                    v-if="card.website"
                    :href="normalizeUrl(card.website)"
                    target="_blank"
                    rel="noopener"
                    class="biz-icon-btn ext"
                    title="Open link"
                    @click.stop
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                      <polyline points="15 3 21 3 21 9"/>
                      <line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                  </a>
                  <button class="biz-icon-btn danger" title="Delete" @click="confirmCardId = card.id">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Modals -->
    <CardDetailModal
      v-if="detailCard"
      :card="detailCard"
      :collections="allCollections"
      @close="detailCard = null"
      @edit="onDetailEdit"
      @delete="onDetailDelete"
    />
    <CollectionModal
      v-if="collectionModalOpen"
      :collection="collection"
      @saved="onCollectionSaved"
      @cancel="collectionModalOpen = false"
    />
    <CardModal
      v-if="cardModalOpen"
      :card="editingCard"
      :collections="allCollections"
      :default-folder-id="String(route.params.id)"
      @saved="onCardSaved"
      @cancel="cardModalOpen = false"
    />
    <ConfirmDialog
      v-if="confirmCollection"
      message="Delete this Sphir?"
      :sub="collection?.name"
      :loading="deletingCol"
      @confirm="doDeleteCollection"
      @cancel="confirmCollection = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchCollections, fetchAllCards, deleteCollection, deleteCard } from '../api.js'
import { store } from '../store.js'
import { useToast } from '../composables/useToast.js'
import CollectionModal  from '../components/CollectionModal.vue'
import CardModal        from '../components/CardModal.vue'
import ConfirmDialog    from '../components/ConfirmDialog.vue'
import CardDetailModal  from '../components/CardDetailModal.vue'

const route  = useRoute()
const router = useRouter()
const { success, error: toastError } = useToast()

const TYPE_EMOJI = { url: '🔗', note: '📝', photo: '📷', screenshot: '🖼️', contact: '👤' }
const TYPE_LABEL = { url: 'LINK', note: 'NOTE', photo: 'PHOTO', screenshot: 'SCREENSHOT', contact: 'CONTACT' }

const collection      = ref(null)
const allCollections  = ref([])
const cards           = ref([])
const searchCards     = ref('')
const loadingCol      = ref(true)
const loadingCards    = ref(false)
const colError        = ref('')
const cardsError      = ref('')

const collectionModalOpen = ref(false)
const cardModalOpen       = ref(false)
const editingCard         = ref(null)
const detailCard          = ref(null)
const confirmCollection   = ref(false)
const confirmCardId       = ref(null)
const deletingCol         = ref(false)
const deletingCardId      = ref(null)

const filteredCards = computed(() => {
  if (!searchCards.value) return cards.value
  const q = searchCards.value.toLowerCase()
  return cards.value.filter(c =>
    c.title?.toLowerCase().includes(q) ||
    c.description?.toLowerCase().includes(q) ||
    c.website?.toLowerCase().includes(q)
  )
})

function parseTags(tags) {
  if (Array.isArray(tags)) return tags.filter(Boolean)
  if (typeof tags === 'string') {
    try { const p = JSON.parse(tags); if (Array.isArray(p)) return p.filter(Boolean) } catch {}
    return tags.split(',').map(t => t.trim()).filter(Boolean)
  }
  return []
}
function visibleTags(card) { return parseTags(card.tags).filter(t => !t.startsWith('_')) }
function cardTypeEmoji(card) {
  const tags = parseTags(card.tags)
  for (const [k, v] of Object.entries(TYPE_EMOJI)) { if (tags.includes(`_${k}`)) return v }
  return card.website ? '🔗' : '📝'
}
function cardCategory(card) {
  const tags = parseTags(card.tags)
  for (const [k, v] of Object.entries(TYPE_LABEL)) { if (tags.includes(`_${k}`)) return v }
  const firstTag = visibleTags(card)[0]
  if (firstTag) return firstTag.toUpperCase()
  return card.website ? 'LINK' : 'NOTE'
}
function cardImage(card) {
  return card.image || card.photo_url || card.og_image || card.thumbnail || null
}
function privacyClass(p) { return `badge-${p || 'private'}` }
function normalizeUrl(url) {
  if (!url) return '#'
  return url.startsWith('http') ? url : `https://${url}`
}
function formatDate(str) {
  if (!str) return '—'
  return new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

onMounted(async () => {
  const id = route.params.id
  try {
    const cols = await fetchCollections()
    allCollections.value = cols ?? []
    collection.value = cols?.find(c => String(c.id) === String(id)) ?? null
    if (!collection.value) { colError.value = 'Sphir not found.'; return }
  } catch (e) { colError.value = e.message; return }
  finally { loadingCol.value = false }
  await loadCards()
})

async function loadCards() {
  loadingCards.value = true; cardsError.value = ''
  try {
    const all = await fetchAllCards()
    cards.value = all.filter(b => String(b.folder_id) === String(route.params.id))
  } catch (e) { cardsError.value = e.message }
  finally { loadingCards.value = false }
}

function openEditCollection() { collectionModalOpen.value = true }
function onCollectionSaved(result) { collection.value = { ...collection.value, ...result }; collectionModalOpen.value = false; success('Changes saved') }
function askDeleteCollection() { confirmCollection.value = true }
async function doDeleteCollection() {
  deletingCol.value = true
  try { await deleteCollection(collection.value.id); router.push('/') }
  catch (e) { colError.value = e.message; confirmCollection.value = false }
  finally { deletingCol.value = false }
}

function openDetail(card) { detailCard.value = card }
function openCardModal(card) { editingCard.value = card; cardModalOpen.value = true }
function onDetailEdit(card) { detailCard.value = null; openCardModal(card) }
async function onDetailDelete(id) { await doDeleteCard(id); detailCard.value = null }
function onCardSaved(result) {
  if (editingCard.value) {
    const idx = cards.value.findIndex(c => String(c.id) === String(editingCard.value.id))
    if (idx !== -1) cards.value[idx] = result
    if (String(result.folder_id) !== String(route.params.id)) {
      cards.value = cards.value.filter(c => String(c.id) !== String(result.id))
    }
    success('Changes saved')
  } else {
    cards.value.unshift(result)
    success('Card saved')
  }
  cardModalOpen.value = false
}
async function doDeleteCard(id) {
  deletingCardId.value = id
  try {
    await deleteCard(id)
    cards.value = cards.value.filter(c => String(c.id) !== String(id))
    confirmCardId.value = null
    success('Card deleted')
  } catch (e) {
    toastError('Failed to delete card')
    confirmCardId.value = null
  }
  finally { deletingCardId.value = null }
}
</script>

<style scoped>
.col-page { min-height: 100vh; background: #FFFFFF; }
.col-container { max-width: 1280px; margin: 0 auto; padding: 40px 28px 80px; }

/* ── Collection header ──────────────────────────────────────── */
.col-header { margin-bottom: 36px; }

.col-header-row1 {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 20px;
}
.back-btn {
  width: 22px; height: 22px;
  display: flex; align-items: center; justify-content: center;
  background: none; padding: 0; transition: opacity .15s;
}
.back-btn:hover { opacity: .7; }

.col-header-edit { display: flex; align-items: center; gap: 8px; }
.btn-icon-danger {
  width: 34px; height: 34px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  background: transparent; color: #B0A89E;
  border: 1px solid #E8E3DC;
  transition: background .15s, color .15s, border-color .15s;
}
.btn-icon-danger:hover { background: #FEF2F2; color: #C0392B; border-color: #FCA5A5; }

.col-header-row2 { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; flex-wrap: wrap; }
.created-by-pill {
  background: #ECEBE7; color: #2F3337;
  font-size: 14px; font-weight: 500;
  border-radius: 20px; padding: 6px 12px; white-space: nowrap;
}
.col-title {
  font-family: 'Montserrat', 'Poppins', sans-serif;
  font-size: 28px; font-weight: 700; color: #000000;
  margin-bottom: 8px; line-height: 1.2;
}
.col-meta { display: flex; gap: 18px; flex-wrap: wrap; font-size: 13px; color: #8A8279; margin-bottom: 20px; }
.col-search-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-top: 20px; }
.cards-search-pill {
  width: 320px; height: 44px; border-radius: 200px;
  background: #FFFFFF; border: 1px solid #E6E7E8;
  padding: 0 20px; font-size: 16px; color: #333333;
  transition: border-color .15s, box-shadow .15s;
}
.cards-search-pill::placeholder { color: #B0A89E; }
.cards-search-pill:focus { border-color: #8A7A5E; box-shadow: 0 0 0 3px rgba(138,122,94,.1); outline: none; }
.btn-pill-add {
  background: #8A7A5E; color: #fff; border-radius: 20px; padding: 10px 24px;
  font-size: 14px; font-weight: 500; white-space: nowrap; transition: background .15s;
}
.btn-pill-add:hover { background: #6F5E4E; }

/* ── Empty state: no cards ───────────────────────────────────── */
.empty-cards { text-align: center; padding: 80px 24px; }
.empty-icon  { font-size: 52px; margin-bottom: 16px; line-height: 1; }
.empty-title {
  font-family: 'Montserrat', 'Poppins', sans-serif;
  font-size: 20px; font-weight: 700; color: #000; margin-bottom: 8px;
}
.empty-subtitle { font-size: 14px; color: #8A8279; margin-bottom: 24px; }
.btn-empty {
  background: #8A7A5E; color: #fff; border-radius: 20px;
  padding: 11px 28px; font-size: 14px; font-weight: 500; transition: background .15s;
}
.btn-empty:hover { background: #6F5E4E; }

/* ── Business card grid ──────────────────────────────────────── */
.biz-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
  margin-top: 30px;
}
@media (max-width: 900px)  { .biz-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 576px)  { .biz-grid { grid-template-columns: minmax(0, 1fr); } }

.biz-col { display: flex; justify-content: center; }

/* ── Business card — System 2 ─────────────────────────────────── */
.biz-card {
  width: 100%;
  max-width: 238px;
  min-height: 400px;
  display: flex;
  flex-direction: column;
  border-radius: 28px;
  background: #FFFFFF;
  border: 1px solid #E6E7E8;
  box-shadow: 0px 4px 8px 0px #E6E7E8;
  overflow: hidden;
  cursor: pointer;
  transition: box-shadow .15s, transform .12s;
}
.biz-card:hover { box-shadow: 0px 8px 20px rgba(0,0,0,0.1); transform: translateY(-2px); }

/* ① Image */
.biz-image-wrap { width: 100%; height: 157px; flex-shrink: 0; overflow: hidden; }
.biz-image { width: 100%; height: 100%; object-fit: cover; display: block; }
.biz-image-placeholder {
  width: 100%; height: 157px;
  background: #F6F5F2;
  display: flex; align-items: center; justify-content: center;
}

/* ② Category */
.biz-category {
  font-size: 12px; font-weight: 600;
  text-transform: uppercase; letter-spacing: .07em;
  color: #8A7A5E;
  margin: 0 20px; padding-top: 16px;
  flex-shrink: 0;
}

/* ③ Title */
.biz-title {
  font-family: 'Montserrat', sans-serif;
  font-size: 20px; font-weight: 700; color: #000000;
  margin: 10px 20px 0; line-height: 1.3;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  overflow: hidden; flex-shrink: 0;
}

/* ④ Description */
.biz-desc {
  font-size: 14px; color: #666666;
  margin: 8px 20px 0; line-height: 1.55;
  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;
  overflow: hidden; flex-shrink: 0;
}

/* ⑤ Website */
.biz-website {
  display: flex; align-items: center; gap: 5px;
  margin: 8px 20px 0;
  text-decoration: none; flex-shrink: 0;
  min-width: 0;
}
.biz-favicon { width: 14px; height: 14px; border-radius: 2px; flex-shrink: 0; }
.biz-website-text {
  font-size: 12px; color: #8A7A5E;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.biz-website:hover .biz-website-text { text-decoration: underline; }

/* ⑥ Tags */
.biz-tags-row {
  display: flex; flex-wrap: wrap; gap: 5px;
  margin: 8px 20px 0; flex-shrink: 0;
}
.biz-tag {
  background: #F6F5F2; color: #8A7A5E;
  font-size: 11px; font-weight: 500;
  border-radius: 20px; padding: 3px 10px;
}

/* Spacer: pushes footer to bottom */
.biz-spacer { flex: 1; min-height: 8px; }

/* ⑦ Footer */
.biz-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 20px;
  border-top: 1px solid rgba(230,231,232,0.7);
  flex-shrink: 0;
}
.biz-footer-right { display: flex; align-items: center; gap: 4px; }

.biz-icon-btn {
  width: 32px; height: 32px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  background: transparent; color: #B0A89E;
  border: none; text-decoration: none; cursor: pointer;
  transition: background .12s, color .12s;
}
.biz-icon-btn:hover        { background: #F6F5F2; color: #8A7A5E; }
.biz-icon-btn.danger       { color: #FF4444; }
.biz-icon-btn.danger:hover { background: #FFF0F0; color: #FF4444; }
.biz-icon-btn.ext          { color: #8A7A5E; }
.biz-icon-btn.ext:hover    { background: rgba(138,122,94,.1); }

/* Inline delete confirm */
.inline-confirm {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  padding: 16px; border-radius: 28px;
  border: 1px solid #E6E7E8;
  font-size: 13px; color: #333;
  max-width: 238px;
}
</style>
