<template>
  <div class="layout">
    <nav class="nav">
      <div class="nav-inner">
        <router-link to="/" class="back-btn">← Collections</router-link>
        <div class="nav-right">
          <span class="nav-user">{{ store.displayName }}</span>
          <button class="btn-signout" @click="logout">Sign out</button>
        </div>
      </div>
    </nav>

    <main class="main">
      <!-- Loading collection -->
      <div v-if="loadingCol" class="state-center">
        <div class="page-loader"></div>
        <p>Loading…</p>
      </div>

      <div v-else-if="colError" class="error-banner">{{ colError }}</div>

      <template v-else-if="collection">
        <!-- Collection header -->
        <header class="col-head">
          <div class="col-meta">
            <span class="col-privacy" :class="collection.privacy">
              {{ PRIVACY[collection.privacy] ?? collection.privacy }}
            </span>
          </div>
          <div class="col-title-row">
            <h1>{{ collection.name }}</h1>
            <button class="btn-add-card" @click="openCreate">
              <span class="btn-new-icon">+</span> Add Card
            </button>
          </div>
          <p class="col-desc" v-if="collection.description">{{ collection.description }}</p>
          <p class="card-count" v-if="!loadingCards">
            {{ cards.length }} card{{ cards.length !== 1 ? 's' : '' }}
          </p>
        </header>

        <!-- Cards area -->
        <div v-if="loadingCards" class="state-center">
          <div class="page-loader"></div>
          <p>Loading cards…</p>
        </div>

        <div v-else-if="cardsError" class="error-banner">{{ cardsError }}</div>

        <div v-else-if="cards.length === 0" class="state-center">
          <div class="empty-icon">📭</div>
          <p>No cards yet. Add the first one.</p>
        </div>

        <div v-else class="cards-list">
          <div
            v-for="card in cards"
            :key="card.id"
            class="card-item"
            :class="{ 'is-deleting': deletingId === card.id }"
          >
            <!-- Delete confirm -->
            <div v-if="confirmDeleteId === card.id" class="card-delete-confirm">
              <p>Delete <strong>{{ card.title }}</strong>?</p>
              <div class="confirm-actions">
                <button class="btn-confirm-cancel" @click="confirmDeleteId = null">Cancel</button>
                <button
                  class="btn-confirm-yes"
                  :disabled="deletingId === card.id"
                  @click="doDeleteCard(card.id)"
                >
                  <span v-if="deletingId === card.id" class="spinner-sm"></span>
                  <span v-else>Delete</span>
                </button>
              </div>
            </div>

            <template v-else>
              <div class="card-body">
                <div class="card-main">
                  <div class="card-title">{{ card.title }}</div>
                  <div class="card-desc" v-if="card.description">{{ card.description }}</div>
                  <a
                    v-if="card.website"
                    :href="normalizeUrl(card.website)"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="card-url"
                    @click.stop
                  >{{ card.website }}</a>
                </div>
                <div class="card-actions">
                  <button class="btn-icon btn-edit" title="Edit" @click="openEdit(card)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button class="btn-icon btn-del" title="Delete" @click="confirmDeleteId = card.id">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                  </button>
                </div>
              </div>
              <div class="card-tags" v-if="parseTags(card.tags).length">
                <span v-for="tag in parseTags(card.tags)" :key="tag" class="tag">#{{ tag }}</span>
              </div>
            </template>
          </div>
        </div>
      </template>
    </main>

    <!-- Add / Edit Card Modal -->
    <div v-if="showCardModal" class="overlay" @click.self="closeCardModal">
      <div class="modal">
        <div class="modal-header">
          <span class="modal-title">{{ editingCard ? 'Edit Card' : 'New Card' }}</span>
          <button class="modal-close" @click="closeCardModal">×</button>
        </div>

        <div class="modal-field">
          <label>Title *</label>
          <input v-model="cardForm.title" type="text" placeholder="Card title" autofocus />
        </div>
        <div class="modal-field">
          <label>Description</label>
          <textarea v-model="cardForm.description" placeholder="Short description…" rows="2"></textarea>
        </div>
        <div class="modal-field">
          <label>Website / URL</label>
          <input v-model="cardForm.website" type="text" placeholder="https://example.com" />
        </div>
        <div class="modal-field">
          <label>Tags <span class="field-hint">(comma-separated)</span></label>
          <input v-model="cardForm.tagsRaw" type="text" placeholder="design, tools, reading" />
        </div>

        <div v-if="cardFormError" class="modal-error">{{ cardFormError }}</div>

        <div class="modal-actions">
          <button class="btn-cancel" @click="closeCardModal">Cancel</button>
          <button
            class="btn-submit"
            :disabled="!cardForm.title.trim() || cardSubmitting"
            @click="doSaveCard"
          >
            <span v-if="cardSubmitting" class="spinner"></span>
            <span v-else>{{ editingCard ? 'Save Changes' : 'Add Card' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchCollections, fetchAllCards, createCard, updateCard, deleteCard } from '../api.js'
import { store } from '../store.js'

const route  = useRoute()
const router = useRouter()

const collection   = ref(null)
const cards        = ref([])
const loadingCol   = ref(true)
const loadingCards = ref(false)
const colError     = ref('')
const cardsError   = ref('')

const showCardModal   = ref(false)
const editingCard     = ref(null)
const cardSubmitting  = ref(false)
const cardFormError   = ref('')
const confirmDeleteId = ref(null)
const deletingId      = ref(null)

const PRIVACY = { private: 'Private', connections: 'Connections', public: 'Public' }

const cardForm = reactive({ title: '', description: '', website: '', tagsRaw: '' })

function parseTags(tags) {
  if (Array.isArray(tags)) return tags.filter(Boolean)
  if (typeof tags === 'string') {
    try { const p = JSON.parse(tags); if (Array.isArray(p)) return p.filter(Boolean) } catch {}
    return tags.split(',').map(t => t.trim()).filter(Boolean)
  }
  return []
}

function tagsFromRaw(raw) {
  return raw.split(',').map(t => t.trim()).filter(Boolean)
}

function normalizeUrl(url) {
  if (!url) return '#'
  return url.startsWith('http') ? url : `https://${url}`
}

onMounted(async () => {
  const id = route.params.id
  try {
    const all = await fetchCollections()
    collection.value = all.find(c => String(c.id) === String(id)) ?? null
    if (!collection.value) { colError.value = 'Collection not found.'; return }
  } catch (e) {
    colError.value = e.message; return
  } finally {
    loadingCol.value = false
  }

  await loadCards()
})

async function loadCards() {
  const id = route.params.id
  loadingCards.value = true
  cardsError.value = ''
  try {
    const all = await fetchAllCards()
    cards.value = all.filter(b => String(b.folder_id) === String(id))
  } catch (e) {
    cardsError.value = e.message
  } finally {
    loadingCards.value = false
  }
}

function openCreate() {
  editingCard.value = null
  cardForm.title = ''; cardForm.description = ''; cardForm.website = ''; cardForm.tagsRaw = ''
  cardFormError.value = ''
  showCardModal.value = true
}

function openEdit(card) {
  editingCard.value = card
  cardForm.title       = card.title       ?? ''
  cardForm.description = card.description ?? ''
  cardForm.website     = card.website     ?? ''
  cardForm.tagsRaw     = parseTags(card.tags).join(', ')
  cardFormError.value  = ''
  showCardModal.value  = true
}

function closeCardModal() { showCardModal.value = false }

async function doSaveCard() {
  cardFormError.value = ''
  cardSubmitting.value = true
  const tags = tagsFromRaw(cardForm.tagsRaw)
  try {
    if (editingCard.value) {
      await updateCard(editingCard.value.id, {
        title: cardForm.title.trim(),
        description: cardForm.description.trim(),
        website: cardForm.website.trim(),
        tags
      })
      // Patch the card in place so the list updates without a full reload.
      const idx = cards.value.findIndex(c => c.id === editingCard.value.id)
      if (idx !== -1) {
        cards.value[idx] = {
          ...cards.value[idx],
          title: cardForm.title.trim(),
          description: cardForm.description.trim(),
          website: cardForm.website.trim(),
          tags
        }
      }
    } else {
      const newCard = await createCard({
        title: cardForm.title.trim(),
        description: cardForm.description.trim(),
        website: cardForm.website.trim(),
        tags,
        folder_id: route.params.id
      })
      cards.value.unshift(newCard ?? {
        id: Date.now(),
        title: cardForm.title.trim(),
        description: cardForm.description.trim(),
        website: cardForm.website.trim(),
        tags,
        folder_id: route.params.id
      })
    }
    closeCardModal()
  } catch (e) {
    cardFormError.value = e.message
  } finally {
    cardSubmitting.value = false
  }
}

async function doDeleteCard(id) {
  deletingId.value = id
  try {
    await deleteCard(id)
    cards.value = cards.value.filter(c => String(c.id) !== String(id))
    confirmDeleteId.value = null
  } catch (e) {
    cardsError.value = `Delete failed: ${e.message}`
    confirmDeleteId.value = null
  } finally {
    deletingId.value = null
  }
}

function logout() { store.logout(); router.push('/login') }
</script>

<style scoped>
.layout { min-height: 100vh; display: flex; flex-direction: column; }

.back-btn {
  font-size: 14px;
  font-weight: 500;
  color: var(--taupe);
  text-decoration: none;
  transition: color .15s;
}
.back-btn:hover { color: var(--taupe-dk); }

.main {
  max-width: 820px;
  width: 100%;
  margin: 0 auto;
  padding: 32px 24px 80px;
  flex: 1;
}

/* Collection header */
.col-head { margin-bottom: 28px; }

.col-meta { margin-bottom: 8px; }

.col-privacy {
  font-size: 10px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 20px;
  letter-spacing: .04em;
  text-transform: uppercase;
}
.col-privacy.private     { background: var(--taupe-lt); color: var(--taupe-dk); }
.col-privacy.connections { background: #e8eef5; color: #4a6fa5; }
.col-privacy.public      { background: #e8f5ee; color: var(--success); }

.col-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 6px;
}

h1 { font-size: 26px; font-weight: 700; }

.btn-add-card {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 16px;
  border-radius: 9px;
  background: var(--taupe);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
  transition: background .15s;
}
.btn-add-card:hover { background: var(--taupe-dk); }
.btn-new-icon { font-size: 16px; font-weight: 400; }

.col-desc {
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.5;
  margin-bottom: 4px;
}

.card-count { font-size: 13px; color: var(--text-muted); font-weight: 500; }

/* State views */
.state-center {
  text-align: center;
  padding: 60px 0;
  color: var(--text-muted);
  font-size: 14px;
}
.page-loader {
  width: 28px; height: 28px;
  border: 3px solid var(--border);
  border-top-color: var(--taupe);
  border-radius: 50%;
  animation: spin .65s linear infinite;
  margin: 0 auto 12px;
}
@keyframes spin { to { transform: rotate(360deg) } }
.empty-icon { font-size: 36px; margin-bottom: 10px; }
.error-banner {
  background: var(--danger-bg);
  border: 1px solid var(--danger-bd);
  border-radius: 10px;
  padding: 12px 16px;
  color: var(--danger);
  font-size: 13px;
  margin-bottom: 20px;
}

/* Cards list */
.cards-list { display: flex; flex-direction: column; gap: 10px; }

.card-item {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px 18px;
  transition: box-shadow .15s, border-color .15s;
}
.card-item:hover { box-shadow: var(--shadow); border-color: var(--taupe); }
.card-item.is-deleting { opacity: .4; pointer-events: none; }

/* Delete confirm inside card */
.card-delete-confirm {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}
.card-delete-confirm p {
  font-size: 13px;
  color: var(--text);
}
.confirm-actions { display: flex; gap: 8px; }
.btn-confirm-cancel {
  padding: 6px 14px;
  border-radius: 7px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 500;
}
.btn-confirm-cancel:hover { border-color: var(--taupe); color: var(--text); }
.btn-confirm-yes {
  padding: 6px 14px;
  border-radius: 7px;
  background: var(--danger);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  display: flex; align-items: center; gap: 5px;
}
.btn-confirm-yes:disabled { opacity: .6; cursor: default; }

/* Card content */
.card-body {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.card-main { flex: 1; min-width: 0; }

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 3px;
}

.card-desc {
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.5;
  margin-bottom: 5px;
}

.card-url {
  font-size: 12px;
  color: var(--taupe);
  word-break: break-all;
  transition: color .15s;
  text-decoration: none;
}
.card-url:hover { color: var(--taupe-dk); text-decoration: underline; }

.card-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
  opacity: 0;
  transition: opacity .15s;
}
.card-item:hover .card-actions { opacity: 1; }

.btn-icon {
  width: 30px; height: 30px;
  border-radius: 7px;
  display: flex; align-items: center; justify-content: center;
  background: transparent;
  color: var(--text-muted);
  transition: background .15s, color .15s;
}
.btn-edit:hover { background: var(--taupe-lt); color: var(--taupe-dk); }
.btn-del:hover  { background: var(--danger-bg); color: var(--danger); }

.card-tags { display: flex; flex-wrap: wrap; gap: 6px; }

.tag {
  font-size: 11px;
  font-weight: 500;
  color: var(--taupe-dk);
  background: var(--taupe-lt);
  border-radius: 20px;
  padding: 2px 9px;
}

.field-hint { font-size: 11px; font-weight: 400; text-transform: none; letter-spacing: 0; color: var(--text-muted); }

.spinner-sm {
  width: 12px; height: 12px;
  border: 2px solid rgba(255,255,255,.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin .65s linear infinite;
  display: inline-block;
}
</style>
