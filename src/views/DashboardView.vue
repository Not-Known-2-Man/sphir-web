<template>
  <div class="page-body">
    <!-- Page hero -->
    <div class="page-hero">
      <h1 class="gradient-title">Sphirs</h1>
      <div class="search-row">
        <div class="search-pill-wrap">
          <input v-model="search" class="search-pill" type="text"
            placeholder="Search collections and cards…" />
          <button v-if="search" class="search-clear" @click="search = ''" aria-label="Clear">×</button>
        </div>
        <button class="btn-pill-lg" @click="openCollectionModal(null)">+ Create Sphir</button>
      </div>
      <a href="#" class="what-link" @click.prevent>What is a Sphir?</a>
    </div>

    <!-- Tabs (hidden during search) -->
    <div v-if="!search" class="tabs-row">
      <button class="tab" :class="{ active: tab === 'collections' }" @click="tab = 'collections'">
        Collections
        <span class="tab-count">{{ activeList.length }}</span>
      </button>
      <button class="tab" :class="{ active: tab === 'groups' }" @click="tab = 'groups'">
        Groups
        <span class="tab-count">{{ groupList.length }}</span>
      </button>
    </div>

    <!-- Loading / error -->
    <div v-if="loadingCollections" class="state-loading">
      <div class="spinner-page"></div><p>Loading…</p>
    </div>
    <div v-else-if="colError" class="error-msg">{{ colError }}</div>

    <!-- Main content -->
    <template v-else>

      <!-- ─── SEARCH MODE ──────────────────────────────────────── -->
      <template v-if="search">
        <!-- No results at all -->
        <div v-if="!activeList.length && !searchedCards.length" class="state-empty">
          <div class="state-empty-icon">🔎</div>
          <p class="search-noresults">No results for "{{ search }}"</p>
        </div>

        <template v-else>
          <!-- Collections section -->
          <div v-if="activeList.length" class="search-section">
            <div class="search-section-label">Collections</div>
            <div class="sphir-grid" @click="closeMenu">
              <div v-for="col in activeList" :key="col.id" class="sphir-card">
                <div class="sphir-card-top">
                  <span :class="['sphir-badge', privacyClass(col.privacy)]">
                    <template v-if="col.privacy === 'public'">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                        <line x1="10" y1="2" x2="10" y2="18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                        <line x1="2" y1="10" x2="18" y2="10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                        <line x1="4.1" y1="4.1" x2="15.9" y2="15.9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                        <line x1="15.9" y1="4.1" x2="4.1" y2="15.9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                      </svg>
                      <span>Public</span>
                    </template>
                    <template v-else>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                        <circle cx="8" cy="5.5" r="3" stroke="currentColor" stroke-width="1.5"/>
                        <path d="M2 17C2 13.69 4.69 11 8 11S14 13.69 14 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                        <circle cx="15" cy="5.5" r="2.2" stroke="currentColor" stroke-width="1.3"/>
                        <path d="M14.5 17c0-2.07 1.07-3.9 2.7-5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
                      </svg>
                      <span>{{ col.privacy === 'connections' ? 'Connections' : 'Private' }}</span>
                    </template>
                  </span>
                  <div class="menu-wrap">
                    <button class="dots-btn" @click.stop="toggleMenu(col.id)">···</button>
                    <div v-if="openMenuId === col.id" class="card-menu">
                      <button @click.stop="openCollectionModal(col); openMenuId = null">Edit</button>
                      <button class="menu-danger" @click.stop="askDeleteCollection(col); openMenuId = null">Delete</button>
                    </div>
                  </div>
                </div>
                <router-link :to="`/c/${col.id}`" class="sphir-card-body" @click="closeMenu">
                  <div class="sphir-circle"><span class="sphir-initial">{{ (col.name || '?')[0].toUpperCase() }}</span></div>
                  <div class="sphir-name">{{ col.name }}</div>
                  <div v-if="col.description" class="sphir-desc">{{ col.description }}</div>
                  <div class="sphir-share-row" @click.prevent.stop>
                    <button class="share-btn" title="Share" @click.prevent.stop>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                      </svg>
                      <span>Share</span>
                    </button>
                  </div>
                </router-link>
              </div>
            </div>
          </div>

          <!-- Cards section -->
          <div v-if="searchedCards.length" class="search-section">
            <div class="search-section-label">Cards</div>
            <div class="uncat-list">
              <div v-for="card in searchedCards" :key="card.id" class="uncat-row" @click="detailCard = card">
                <div class="uncat-row-body">
                  <span class="uncat-category">{{ cardCategory(card) }}</span>
                  <span class="uncat-title">{{ card.title }}</span>
                  <span v-if="card.description" class="uncat-desc">{{ card.description }}</span>
                </div>
                <span v-if="card.created_at" class="uncat-date">{{ formatDate(card.created_at) }}</span>
              </div>
            </div>
          </div>
        </template>
      </template>

      <!-- ─── NORMAL MODE ─────────────────────────────────────── -->
      <template v-else>
        <!-- Collections grid -->
        <div v-if="displayList.length > 0" class="sphir-grid" @click="closeMenu">
          <div v-for="col in displayList" :key="col.id" class="sphir-card">
            <div class="sphir-card-top">
              <span :class="['sphir-badge', privacyClass(col.privacy)]">
                <template v-if="col.privacy === 'public'">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <line x1="10" y1="2" x2="10" y2="18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                    <line x1="2" y1="10" x2="18" y2="10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                    <line x1="4.1" y1="4.1" x2="15.9" y2="15.9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                    <line x1="15.9" y1="4.1" x2="4.1" y2="15.9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                  </svg>
                  <span>Public</span>
                </template>
                <template v-else>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <circle cx="8" cy="5.5" r="3" stroke="currentColor" stroke-width="1.5"/>
                    <path d="M2 17C2 13.69 4.69 11 8 11S14 13.69 14 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    <circle cx="15" cy="5.5" r="2.2" stroke="currentColor" stroke-width="1.3"/>
                    <path d="M14.5 17c0-2.07 1.07-3.9 2.7-5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
                  </svg>
                  <span>{{ col.privacy === 'connections' ? 'Connections' : 'Private' }}</span>
                </template>
              </span>
              <div class="menu-wrap">
                <button class="dots-btn" @click.stop="toggleMenu(col.id)">···</button>
                <div v-if="openMenuId === col.id" class="card-menu">
                  <button @click.stop="openCollectionModal(col); openMenuId = null">Edit</button>
                  <button class="menu-danger" @click.stop="askDeleteCollection(col); openMenuId = null">Delete</button>
                </div>
              </div>
            </div>
            <router-link :to="`/c/${col.id}`" class="sphir-card-body" @click="closeMenu">
              <div class="sphir-circle"><span class="sphir-initial">{{ (col.name || '?')[0].toUpperCase() }}</span></div>
              <div class="sphir-name">{{ col.name }}</div>
              <div v-if="col.description" class="sphir-desc">{{ col.description }}</div>
              <div class="sphir-share-row" @click.prevent.stop>
                <button class="share-btn" title="Share" @click.prevent.stop>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                  </svg>
                  <span>Share</span>
                </button>
              </div>
            </router-link>
          </div>
        </div>

        <!-- Empty state: no collections -->
        <div v-else class="empty-collections">
          <div class="empty-icon">📁</div>
          <div class="empty-title">No collections yet</div>
          <div class="empty-subtitle">Create your first collection to get started</div>
          <button class="btn-empty" @click="openCollectionModal(null)">+ Create Collection</button>
        </div>

        <!-- Uncategorized cards section -->
        <div
          v-if="tab === 'collections' && !loadingUncat && uncategorizedCards.length > 0"
          class="uncat-section"
        >
          <div class="uncat-heading">Uncategorized</div>
          <div class="uncat-list">
            <div
              v-for="card in uncategorizedCards" :key="card.id"
              class="uncat-row"
              @click="detailCard = card"
            >
              <div class="uncat-row-body">
                <span class="uncat-category">{{ cardCategory(card) }}</span>
                <span class="uncat-title">{{ card.title }}</span>
                <span v-if="card.description" class="uncat-desc">{{ card.description }}</span>
              </div>
              <span v-if="card.created_at" class="uncat-date">{{ formatDate(card.created_at) }}</span>
            </div>
          </div>
        </div>
      </template>
    </template>

    <!-- Modals -->
    <CardDetailModal
      v-if="detailCard"
      :card="detailCard"
      :collections="collections"
      @close="detailCard = null"
      @edit="onDetailEdit"
      @delete="onDetailDelete"
    />
    <CollectionModal
      v-if="collectionModalOpen"
      :collection="editingCollection"
      @saved="onCollectionSaved"
      @cancel="collectionModalOpen = false"
    />
    <CardModal
      v-if="cardModalOpen"
      :card="editingCard"
      :collections="collections"
      :default-folder-id="''"
      @saved="onCardSaved"
      @cancel="cardModalOpen = false"
    />
    <ConfirmDialog
      v-if="confirmTarget"
      message="Delete this Sphir?"
      :sub="confirmTarget.name"
      :loading="deleting"
      @confirm="doDelete"
      @cancel="confirmTarget = null"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { fetchCollections, deleteCollection, fetchAllCards, deleteCard } from '../api.js'
import { store } from '../store.js'
import { useToast } from '../composables/useToast.js'
import CollectionModal  from '../components/CollectionModal.vue'
import CardModal        from '../components/CardModal.vue'
import ConfirmDialog    from '../components/ConfirmDialog.vue'
import CardDetailModal  from '../components/CardDetailModal.vue'

const { success, error: toastError } = useToast()

const tab             = ref('collections')
const search          = ref('')
const collections     = ref([])
const loadingCollections = ref(true)
const colError        = ref('')

const collectionModalOpen  = ref(false)
const editingCollection    = ref(null)
const cardModalOpen        = ref(false)
const editingCard          = ref(null)
const confirmTarget        = ref(null)
const deleting             = ref(false)
const openMenuId           = ref(null)
const allCards             = ref([])
const loadingUncat         = ref(false)
const detailCard           = ref(null)

const myCollections = computed(() => collections.value.filter(c => c.privacy !== 'public'))
const myGroups      = computed(() => collections.value.filter(c => c.privacy === 'public'))

function filterBySearch(list) {
  if (!search.value) return list
  const q = search.value.toLowerCase()
  return list.filter(c => c.name?.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q))
}

const activeList  = computed(() => filterBySearch(myCollections.value))
const groupList   = computed(() => filterBySearch(myGroups.value))
const displayList = computed(() => tab.value === 'collections' ? activeList.value : groupList.value)

const uncategorizedCards = computed(() =>
  allCards.value.filter(c => c.folder_id === null || c.folder_id === undefined)
)

const searchedCards = computed(() => {
  if (!search.value) return []
  const q = search.value.toLowerCase()
  return allCards.value.filter(c =>
    c.title?.toLowerCase().includes(q) ||
    c.description?.toLowerCase().includes(q) ||
    c.website?.toLowerCase().includes(q) ||
    parseTags(c.tags).some(t => t.toLowerCase().includes(q))
  )
})

function privacyClass(p) { return `badge-${p || 'private'}` }

onMounted(async () => {
  await Promise.all([loadCollections(), loadAllCards()])
  if (store.pendingCreateCard) { store.pendingCreateCard = false; openCardModal(null) }
})

watch(() => store.pendingCreateCard, (val) => {
  if (val) { store.pendingCreateCard = false; openCardModal(null) }
})

async function loadCollections() {
  loadingCollections.value = true; colError.value = ''
  try { collections.value = await fetchCollections() ?? [] }
  catch (e) { colError.value = e.message }
  finally { loadingCollections.value = false }
}

async function loadAllCards() {
  loadingUncat.value = true
  try { allCards.value = await fetchAllCards() ?? [] }
  catch { allCards.value = [] }
  finally { loadingUncat.value = false }
}

const TYPE_LABEL = { url: 'LINK', note: 'NOTE', photo: 'PHOTO', screenshot: 'SCREENSHOT', contact: 'CONTACT' }

function parseTags(raw) {
  if (Array.isArray(raw)) return raw.filter(Boolean)
  if (typeof raw === 'string') {
    try { const p = JSON.parse(raw); if (Array.isArray(p)) return p.filter(Boolean) } catch {}
    return raw.split(',').map(t => t.trim()).filter(Boolean)
  }
  return []
}
function visibleTags(card) { return parseTags(card.tags).filter(t => !t.startsWith('_')) }
function cardCategory(card) {
  const all = parseTags(card.tags)
  for (const [k, v] of Object.entries(TYPE_LABEL)) { if (all.includes(`_${k}`)) return v }
  const first = visibleTags(card)[0]
  if (first) return first.toUpperCase()
  return card.website ? 'LINK' : 'NOTE'
}
function formatDate(str) {
  if (!str) return ''
  return new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function onDetailEdit(card) { detailCard.value = null; openCardModal(card) }
async function onDetailDelete(id) {
  try {
    await deleteCard(id)
    allCards.value = allCards.value.filter(c => String(c.id) !== String(id))
    success('Card deleted')
  } catch { toastError('Failed to delete card') }
  detailCard.value = null
}

function toggleMenu(id) { openMenuId.value = openMenuId.value === id ? null : id }
function closeMenu() { openMenuId.value = null }

onMounted(() => document.addEventListener('keydown', onEsc))
onUnmounted(() => document.removeEventListener('keydown', onEsc))
function onEsc(e) { if (e.key === 'Escape') openMenuId.value = null }

function openCollectionModal(col) { editingCollection.value = col; collectionModalOpen.value = true }

function onCollectionSaved(result) {
  if (editingCollection.value) {
    const idx = collections.value.findIndex(c => String(c.id) === String(editingCollection.value.id))
    if (idx !== -1) collections.value[idx] = { ...collections.value[idx], ...result }
    success('Changes saved')
  } else {
    if (result) collections.value.unshift(result)
    else loadCollections()
    success('Collection created')
  }
  collectionModalOpen.value = false
}

function askDeleteCollection(col) { confirmTarget.value = col }
function openCardModal(card) { editingCard.value = card; cardModalOpen.value = true }

function onCardSaved(result) {
  if (result?.id && result?.folder_id) {
    allCards.value = allCards.value.filter(c => String(c.id) !== String(result.id))
  } else if (result?.id && !result?.folder_id) {
    const idx = allCards.value.findIndex(c => String(c.id) === String(result.id))
    if (idx !== -1) allCards.value[idx] = { ...allCards.value[idx], ...result }
    else allCards.value.unshift(result)
  }
  success(editingCard.value ? 'Changes saved' : 'Card saved')
  cardModalOpen.value = false
}

async function doDelete() {
  deleting.value = true
  const target = confirmTarget.value
  try {
    await deleteCollection(target.id)
    collections.value = collections.value.filter(c => String(c.id) !== String(target.id))
    confirmTarget.value = null
    success('Collection deleted')
  } catch { toastError('Failed to delete'); confirmTarget.value = null }
  finally { deleting.value = false }
}
</script>

<style scoped>
/* Hero */
.page-hero { margin-bottom: 40px; }

.gradient-title {
  font-family: 'Poppins', sans-serif;
  font-size: clamp(42px, 6vw, 60px); font-weight: 600;
  letter-spacing: -2.4px; line-height: 1.05;
  background: linear-gradient(135deg, #8A7A5E 20%, #C4A882 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text; display: inline-block; margin-bottom: 24px;
}

.search-row {
  display: flex; gap: 12px; align-items: center;
  margin-bottom: 14px; flex-wrap: wrap;
}
.search-pill-wrap { position: relative; flex: 1; min-width: 220px; }
.search-pill {
  width: 100%; border-radius: 200px;
  background: rgba(255,255,255,0.9); border: 1px solid var(--border);
  padding: 11px 44px 11px 22px;
  font-size: 14px; color: var(--text);
  transition: border-color .15s, box-shadow .15s;
}
.search-pill::placeholder { color: var(--text-light); }
.search-pill:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(138,122,94,.1); outline: none; }
.search-clear {
  position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
  width: 22px; height: 22px; border-radius: 50%;
  background: var(--border-dk); color: var(--text-muted);
  font-size: 15px; line-height: 22px; text-align: center;
  transition: background .12s;
}
.search-clear:hover { background: var(--border-dk); color: var(--text); }

.btn-pill-lg {
  background: var(--accent); color: #fff;
  border-radius: 20px; padding: 11px 28px;
  font-size: 14px; font-weight: 500; white-space: nowrap;
  transition: background .15s;
}
.btn-pill-lg:hover { background: var(--accent-dk); }

.what-link { font-size: 13px; color: var(--accent); }
.what-link:hover { text-decoration: underline; }

/* Tabs */
.tabs-row {
  display: flex; border-bottom: 1.5px solid var(--border);
  margin-bottom: 36px;
}
.tab {
  display: flex; align-items: center; gap: 8px;
  padding: 11px 20px; font-size: 14px; font-weight: 500;
  color: var(--text-muted); background: none;
  border-bottom: 2px solid transparent; margin-bottom: -1.5px;
  transition: color .15s, border-color .15s;
}
.tab.active { color: var(--accent); border-bottom-color: var(--accent); font-weight: 600; }
.tab:not(.active):hover { color: var(--text); }
.tab-count {
  font-size: 11px; font-weight: 600;
  background: var(--surface); color: var(--text-muted);
  padding: 1px 7px; border-radius: 20px;
}
.tab.active .tab-count { background: var(--accent); color: #fff; }

/* Search results */
.search-section { margin-bottom: 44px; }
.search-section-label {
  font-family: 'Poppins', sans-serif; font-size: 13px; font-weight: 600;
  color: var(--text-muted); text-transform: uppercase;
  letter-spacing: .07em; margin-bottom: 16px;
}
.search-noresults { font-size: 15px; color: var(--text-muted); margin-top: 4px; }

/* Grid */
.sphir-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px;
}
@media (max-width: 1024px) { .sphir-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 620px)  { .sphir-grid { grid-template-columns: 1fr; gap: 20px; } }

/* Sphir card — System 1 */
.sphir-card {
  background: linear-gradient(180deg, #F6F5F2 0%, rgba(246,245,242,0) 100%);
  border-radius: 28px; position: relative;
}
.sphir-card-top {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 24px;
}
.sphir-badge {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 14px; font-weight: 600; color: #414651;
}
.sphir-card-body {
  display: block; background: rgba(255,255,255,0.92);
  border-radius: 28px; padding: 14px;
  margin: 0 12px 12px; text-decoration: none;
}
.sphir-circle {
  width: 100%; aspect-ratio: 1; border-radius: 50%;
  background: linear-gradient(135deg, #C4A882 0%, #8A7A5E 100%);
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 16px; overflow: hidden;
}
.sphir-initial {
  font-family: 'Poppins', sans-serif;
  font-size: clamp(36px, 8vw, 64px); font-weight: 700;
  color: rgba(255,255,255,0.9); line-height: 1; user-select: none;
}
.sphir-name {
  font-family: 'Poppins', sans-serif; font-size: 24px; font-weight: 700;
  color: #414651; text-align: center; padding-bottom: 4px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.sphir-desc {
  font-size: 14px; color: var(--text-muted); text-align: center;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  overflow: hidden; margin-top: 4px; padding: 0 4px;
}
.sphir-share-row {
  display: flex; justify-content: flex-end;
  padding: 10px 4px 2px; margin-top: 10px;
  border-top: 1px solid rgba(230,231,232,0.7);
}
.share-btn {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 12px; font-weight: 500; color: var(--text-muted);
  background: none; transition: color .15s;
}
.share-btn:hover { color: var(--accent); }

/* ··· menu */
.menu-wrap { position: relative; }
.dots-btn {
  width: 24px; height: 24px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 6px; background: transparent;
  font-size: 16px; font-weight: 700; letter-spacing: 0.5px;
  color: var(--text-muted); line-height: 1;
  transition: background .15s, color .15s;
}
.dots-btn:hover { background: var(--surface); color: var(--text); }
.card-menu {
  position: absolute; top: calc(100% + 4px); right: 0;
  background: #fff; border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.12);
  border: 1px solid var(--border);
  padding: 6px; min-width: 130px; z-index: 50;
  animation: menu-in .12s ease;
}
@keyframes menu-in { from { opacity: 0; transform: translateY(-6px) } to { opacity: 1; transform: none } }
.card-menu button {
  display: block; width: 100%; text-align: left;
  padding: 9px 13px; font-size: 13px; font-weight: 500;
  color: var(--text); border-radius: 8px; transition: background .12s;
}
.card-menu button:hover { background: var(--surface); }
.card-menu button.menu-danger:hover { background: var(--danger-bg); color: var(--danger); }

/* Empty state: no collections */
.empty-collections { text-align: center; padding: 80px 24px; }
.empty-icon { font-size: 52px; margin-bottom: 16px; line-height: 1; }
.empty-title {
  font-family: 'Poppins', sans-serif;
  font-size: 20px; font-weight: 600; color: var(--title); margin-bottom: 8px;
}
.empty-subtitle { font-size: 14px; color: var(--text-muted); margin-bottom: 24px; }
.btn-empty {
  background: #8A7A5E; color: #fff;
  border-radius: 20px; padding: 11px 28px;
  font-size: 14px; font-weight: 500; transition: background .15s;
}
.btn-empty:hover { background: #6F5E4E; }

/* Uncategorized cards section */
.uncat-section { margin-top: 44px; }
.uncat-heading {
  font-family: 'Poppins', sans-serif; font-size: 13px; font-weight: 600;
  color: var(--text-muted); text-transform: uppercase;
  letter-spacing: .07em; margin-bottom: 14px;
}
.uncat-list { display: flex; flex-direction: column; gap: 8px; }
.uncat-row {
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  padding: 14px 18px; background: #FFFFFF;
  border: 1px solid var(--border); border-radius: 14px;
  cursor: pointer; transition: box-shadow .12s, border-color .12s;
}
.uncat-row:hover { border-color: var(--accent); box-shadow: 0 2px 12px rgba(138,122,94,.1); }
.uncat-row-body { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.uncat-category {
  font-size: 11px; font-weight: 600; text-transform: uppercase;
  letter-spacing: .07em; color: #8A7A5E;
}
.uncat-title {
  font-family: 'Montserrat', sans-serif; font-size: 15px; font-weight: 700; color: #000000;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.uncat-desc {
  font-size: 13px; color: #666666;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.uncat-date { font-size: 12px; color: var(--text-light); white-space: nowrap; flex-shrink: 0; }
</style>
