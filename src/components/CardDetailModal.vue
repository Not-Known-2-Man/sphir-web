<template>
  <Teleport to="body">
    <div class="detail-overlay" @click.self="$emit('close')">
      <div class="detail-modal">

        <!-- Close -->
        <button class="detail-close" @click="$emit('close')">×</button>

        <!-- Image -->
        <div class="detail-image-wrap">
          <img v-if="img" :src="img" :alt="card.title" class="detail-image" />
          <div v-else class="detail-image-placeholder">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#C4B9AC" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
          </div>
        </div>

        <!-- Body -->
        <div class="detail-body">

          <!-- Category -->
          <div v-if="category" class="detail-category">{{ category }}</div>

          <!-- Title -->
          <h2 class="detail-title">{{ card.title }}</h2>

          <!-- Description -->
          <p v-if="card.description" class="detail-desc">{{ card.description }}</p>

          <!-- Website link -->
          <a
            v-if="card.website"
            :href="normalizeUrl(card.website)"
            target="_blank"
            rel="noopener"
            class="detail-website"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            <span>{{ card.website }}</span>
          </a>

          <!-- Tags -->
          <div v-if="tags.length" class="detail-tags">
            <span v-for="t in tags" :key="t" class="detail-tag">{{ t }}</span>
          </div>

          <!-- Meta: collection + date -->
          <div class="detail-meta">
            <div v-if="collectionName" class="detail-meta-row">
              <span class="detail-meta-label">Collection</span>
              <span class="detail-meta-value">{{ collectionName }}</span>
            </div>
            <div v-if="card.created_at" class="detail-meta-row">
              <span class="detail-meta-label">Saved on</span>
              <span class="detail-meta-value">{{ formatDate(card.created_at) }}</span>
            </div>
          </div>

          <hr class="detail-divider" />

          <!-- Delete confirm -->
          <div v-if="confirmingDelete" class="detail-confirm">
            <p class="detail-confirm-msg">Delete <strong>{{ card.title }}</strong>?</p>
            <div class="detail-confirm-btns">
              <button class="btn btn-ghost btn-sm" @click="confirmingDelete = false">Cancel</button>
              <button class="btn btn-danger-solid btn-sm" @click="$emit('delete', card.id)">Delete</button>
            </div>
          </div>

          <!-- Actions -->
          <div v-else class="detail-actions">
            <button class="det-btn det-btn-edit" @click="$emit('edit', card)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Edit
            </button>
            <button class="det-btn det-btn-delete" @click="confirmingDelete = true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
              Delete
            </button>
            <a
              v-if="card.website"
              :href="normalizeUrl(card.website)"
              target="_blank"
              rel="noopener"
              class="det-btn det-btn-url"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              Open URL
            </a>
          </div>

        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'

const TYPE_LABEL = { url: 'LINK', note: 'NOTE', photo: 'PHOTO', screenshot: 'SCREENSHOT', contact: 'CONTACT' }

const props = defineProps({
  card:        { type: Object, required: true },
  collections: { type: Array,  default: () => [] },
})

defineEmits(['close', 'edit', 'delete'])

const confirmingDelete = ref(false)

function parseTags(raw) {
  if (Array.isArray(raw)) return raw.filter(Boolean)
  if (typeof raw === 'string') {
    try { const p = JSON.parse(raw); if (Array.isArray(p)) return p.filter(Boolean) } catch {}
    return raw.split(',').map(t => t.trim()).filter(Boolean)
  }
  return []
}

const tags = computed(() => parseTags(props.card.tags).filter(t => !t.startsWith('_')))

const category = computed(() => {
  const all = parseTags(props.card.tags)
  for (const [k, v] of Object.entries(TYPE_LABEL)) {
    if (all.includes(`_${k}`)) return v
  }
  const first = tags.value[0]
  if (first) return first.toUpperCase()
  return props.card.website ? 'LINK' : 'NOTE'
})

const img = computed(() =>
  props.card.image || props.card.photo_url || props.card.og_image || props.card.thumbnail || null
)

const collectionName = computed(() => {
  if (!props.collections?.length || !props.card.folder_id) return ''
  return props.collections.find(c => String(c.id) === String(props.card.folder_id))?.name || ''
})

function normalizeUrl(url) {
  if (!url) return '#'
  return url.startsWith('http') ? url : `https://${url}`
}

function formatDate(str) {
  if (!str) return ''
  return new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<style scoped>
/* ── Overlay ─────────────────────────────────────────────────── */
.detail-overlay {
  position: fixed; inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 300; padding: 20px;
  animation: overlay-in .15s ease;
}
@keyframes overlay-in { from { opacity: 0 } to { opacity: 1 } }

/* ── Modal ───────────────────────────────────────────────────── */
.detail-modal {
  position: relative;
  background: #FFFFFF;
  border-radius: 20px;
  width: 100%; max-width: 540px;
  max-height: 90vh; overflow-y: auto;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.22);
  animation: modal-in .18s ease;
}
@keyframes modal-in { from { transform: translateY(16px); opacity: 0 } to { transform: none; opacity: 1 } }

/* ── Close button ────────────────────────────────────────────── */
.detail-close {
  position: absolute; top: 12px; right: 12px;
  width: 32px; height: 32px; border-radius: 50%;
  background: rgba(0, 0, 0, 0.35); color: #fff;
  font-size: 18px; line-height: 1;
  display: flex; align-items: center; justify-content: center;
  z-index: 2; transition: background .15s;
}
.detail-close:hover { background: rgba(0, 0, 0, 0.55); }

/* ── Image ───────────────────────────────────────────────────── */
.detail-image-wrap {
  width: 100%; height: 260px;
  border-radius: 20px 20px 0 0; overflow: hidden;
  flex-shrink: 0;
}
.detail-image {
  width: 100%; height: 100%; object-fit: cover; display: block;
}
.detail-image-placeholder {
  width: 100%; height: 100%;
  background: #F6F5F2;
  display: flex; align-items: center; justify-content: center;
}

/* ── Body ────────────────────────────────────────────────────── */
.detail-body { padding: 24px 28px 28px; }

/* Category */
.detail-category {
  font-size: 12px; font-weight: 600;
  text-transform: uppercase; letter-spacing: .08em;
  color: #8A7A5E; margin-bottom: 10px;
}

/* Title */
.detail-title {
  font-family: 'Poppins', sans-serif;
  font-size: 28px; font-weight: 700; color: #000000;
  line-height: 1.2; margin-bottom: 14px;
}

/* Description */
.detail-desc {
  font-size: 16px; line-height: 1.65; color: #666666;
  margin-bottom: 16px;
}

/* Website */
.detail-website {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 13px; color: #8A7A5E; text-decoration: none;
  margin-bottom: 16px;
  word-break: break-all;
}
.detail-website:hover { text-decoration: underline; }
.detail-website svg { flex-shrink: 0; }

/* Tags */
.detail-tags {
  display: flex; flex-wrap: wrap; gap: 6px;
  margin-bottom: 20px;
}
.detail-tag {
  background: #F6F5F2; color: #8A7A5E;
  font-size: 12px; font-weight: 500;
  border-radius: 20px; padding: 4px 12px;
}

/* Meta rows */
.detail-meta { margin-bottom: 20px; display: flex; flex-direction: column; gap: 6px; }
.detail-meta-row { display: flex; align-items: center; gap: 10px; font-size: 13px; }
.detail-meta-label { color: #B0A89E; font-weight: 500; min-width: 80px; }
.detail-meta-value { color: #414651; font-weight: 500; }

/* Divider */
.detail-divider { border: none; border-top: 1px solid #E8E3DC; margin: 0 0 20px; }

/* Delete confirm */
.detail-confirm { text-align: center; }
.detail-confirm-msg { font-size: 15px; color: #333; margin-bottom: 14px; }
.detail-confirm-btns { display: flex; justify-content: center; gap: 10px; }

/* Action buttons */
.detail-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }

.det-btn {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 9px 18px; border-radius: 200px;
  font-size: 14px; font-weight: 500; cursor: pointer;
  text-decoration: none; white-space: nowrap;
  transition: opacity .15s, background .15s;
}
.det-btn:disabled { opacity: .5; cursor: default; }

.det-btn-edit {
  background: #FFFFFF;
  border: 1.5px solid #D4CCC3;
  color: #414651;
}
.det-btn-edit:hover { border-color: #8A7A5E; }

.det-btn-delete {
  background: #FFFFFF;
  border: 1.5px solid #FF4444;
  color: #FF4444;
}
.det-btn-delete:hover { background: #FFF0F0; }

.det-btn-url {
  background: #8A7A5E;
  border: none;
  color: #FFFFFF;
  margin-left: auto;
}
.det-btn-url:hover { opacity: .88; }
</style>
