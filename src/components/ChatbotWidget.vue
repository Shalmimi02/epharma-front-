    onScopeChanged() {
      if (this.isIframe) return;
      if (!window.botpressWebChat) return;
      try {
        const ids = this.computeWebchatIds();
        const id = this.getWidgetId();
        // Prefer live update of user if supported
        if (typeof window.botpressWebChat.setUser === 'function') {
          window.botpressWebChat.setUser({ userId: ids.userId, clientId: ids.clientId, id });
        } else {
          // Fallback: close and reopen to apply new identity
          if (typeof window.botpressWebChat.close === 'function') {
            try { window.botpressWebChat.close({ id }); } catch (_) { window.botpressWebChat.close(); }
          }
          // No need to call init again if it supports dynamic identity; otherwise, rely on reset
          if (typeof window.botpressWebChat.reset === 'function') {
            try { window.botpressWebChat.reset({ id }); } catch (_) { window.botpressWebChat.reset(); }
          } else if (typeof window.botpressWebChat.resetSession === 'function') {
            try { window.botpressWebChat.resetSession({ id }); } catch (_) { window.botpressWebChat.resetSession(); }
          }
          if (typeof window.botpressWebChat.open === 'function') {
            setTimeout(() => { try { window.botpressWebChat.open({ id }); } catch (_) { window.botpressWebChat.open(); } }, 120);
          }
        }
      } catch (e) {
        console.warn('[ChatbotWidget] onScopeChanged failed', e);
      }
    },
    getInitOptions(botId, configUrl) {
      return {
        botId,
        hostUrl: 'https://cdn.botpress.cloud/webchat/v3.2',
        configUrl,
        containerWidth: '100%',
        layoutWidth: '100%',
        hideWidget: this.debug ? false : true,
        showCloseButton: true,
        enableTranscriptDownload: false,
        className: 'webchatIframe',
        containerClass: 'bp-widget-web',
        zIndex: this.zIndex,
      };
    },
    reinitBotpress() {
      if (!window.botpressWebChat) return;
      const botId = this.botId || 'VOTRE_BOT_ID';
      const configUrl = this.configUrl || 'VOTRE_CONFIG_URL';
      const id = this.getWidgetId();
      const ids = this.computeWebchatIds();
      const options = this.getInitOptions(botId, configUrl);
      options.id = id;
      options.userId = ids.userId;
      options.clientId = ids.clientId;
      if (this.themeColor) options.themeColor = this.themeColor;
      if (this.botName) options.botName = this.botName;
      if (this.botAvatarUrl) options.botAvatarUrl = this.botAvatarUrl;
      if (typeof this.enableReset === 'boolean') options.enableReset = this.enableReset;
      if (typeof this.showPoweredBy === 'boolean') options.showPoweredBy = this.showPoweredBy;
      if (this.stylesheet) options.stylesheet = this.stylesheet;

      try {
        // Prefer in-place update if supported
        if (typeof window.botpressWebChat.mergeConfig === 'function') {
          window.botpressWebChat.mergeConfig(options);
        } else {
          // Re-init the same instance id; most versions will replace the instance config
          window.botpressWebChat.init(options);
        }
      } catch (e) {
        console.warn('[ChatbotWidget] reinitBotpress failed', e);
        try { window.botpressWebChat.init(options); } catch (_) {}
      }
    },
<template>
  <div>
    <button
      class="chatbot-fab"
      :class="{ open: isOpen }"
      @click="toggle"
      v-if="visible"
      aria-label="Ouvrir le chatbot"
      title="Assistant"
    >
      <i v-if="!isOpen" class="fa-solid fa-message"></i>
      <i v-else class="fa-solid fa-xmark"></i>
    </button>
    <!-- The Botpress webchat renders its own UI in an iframe; we keep a minimal header actions area only when open -->
    <!-- Render the header/actions panel for both modes; iframe body is only shown in iframe mode -->
    <div v-if="isOpen && visible" class="chatbot-panel shadow">
      <div class="chatbot-header d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center">
          <span class="badge bg-success me-2"></span>
          <strong>Assistant E-Pharma</strong>
        </div>
        <button class="btn btn-sm btn-link text-muted" @click="clearConversation" :disabled="loading">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
      <!-- Body: show iframe when using shareable embed, otherwise leave empty (script-based webchat floats) -->
      <div class="chatbot-body" ref="scrollContainer">
        <iframe v-if="isIframe"
          ref="bpIframe"
          :key="iframeKey"
          :src="currentIframeSrc"
          width="100%"
          height="100%"
          frameborder="0"
          style="border: none; border-radius: 8px;">
        </iframe>
      </div>
    </div>
  </div>
</template>

<script>
// Botpress WebChat is loaded dynamically; no local chat service needed

export default {
  name: 'ChatbotWidget',
  props: {
    mode: { type: String, default: 'iframe' }, // 'iframe' | 'script'
    botId: { type: String, default: '' },
    configUrl: { type: String, default: '' },
    // Customization options
    themeColor: { type: String, default: '' },
    botName: { type: String, default: '' },
    botAvatarUrl: { type: String, default: '' },
    enableReset: { type: Boolean, default: true },
    showPoweredBy: { type: Boolean, default: false },
    stylesheet: { type: String, default: '' },
    debug: { type: Boolean, default: false },
    zIndex: { type: Number, default: 2147483000 },
    // Scoping to isolate conversations per widget instance or context
    conversationId: { type: String, default: '' },
    scopeKey: { type: String, default: 'default' },
    // Distinct widget instance id for Botpress (crucial to isolate actions per chat)
    widgetId: { type: String, default: '' },
  },
  data() {
    return {
      isOpen: false,
      loading: false,
      scriptLoaded: false,
      iframeKey: 0,
      contextSent: false,
      fallbackIframe: false,
      currentIframeSrc: ''
    };
  },
  watch: {
    // When the scope or explicit conversation id changes, update the script-mode instance ids
    scopeKey() { this.onScopeChanged(); },
    conversationId() { this.onScopeChanged(); },
  },
  computed: {
    visible() {
      // Afficher si l'utilisateur est authentifié et pas sur login/activation
      const route = this.$route?.name;
      const hideRoutes = ['login', 'activation'];
      return this.$store.getters.authenticated && !hideRoutes.includes(route);
    },
    isIframe() {
      return this.fallbackIframe || this.mode === 'iframe' || (!!this.configUrl && !this.botId);
    },
    shareableUrl() {
      const cfg = this.configUrl || 'VOTRE_CONFIG_URL';
      const base = 'https://cdn.botpress.cloud/webchat/v3.2/shareable.html';
      const params = new URLSearchParams({ configUrl: cfg });
      if (this.stylesheet) params.set('stylesheet', this.stylesheet);
      return `${base}?${params.toString()}`;
    },
  },
  mounted() {
    // Load Botpress webchat script only if using script mode
    if (!this.isIframe) {
      this.ensureBotpressLoaded();
    }
    // Initialize iframe src when in iframe mode
    if (this.isIframe) {
      this.currentIframeSrc = this.buildIframeUrl();
    }
  },
  methods: {
    getWidgetId() {
      return this.widgetId || `bp-${this.scopeKey || 'default'}`;
    },
    // Generate or retrieve a stable token that scopes the session for the given scopeKey
    getOrCreateScopeToken() {
      const scope = this.scopeKey || 'default';
      const bot = this.botId || 'bot';
      const wid = this.getWidgetId();
      const key = `bp_chat_token_${bot}__${wid}__${scope}`;
      let tok = this.conversationId || localStorage.getItem(key);
      if (!tok) {
        tok = `${scope}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
        try { localStorage.setItem(key, tok); } catch (_) {}
      }
      return tok;
    },
    regenerateScopeToken() {
      const scope = this.scopeKey || 'default';
      const bot = this.botId || 'bot';
      const wid = this.getWidgetId();
      const key = `bp_chat_token_${bot}__${wid}__${scope}`;
      const tok = `${scope}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      try { localStorage.setItem(key, tok); } catch (_) {}
      return tok;
    },
    computeWebchatIds() {
      const tok = this.getOrCreateScopeToken();
      // Optionally include the authenticated user id to keep uniqueness per user
      const user = this.$store?.getters?.user;
      const userPart = user?.id ? `u${user.id}` : 'anon';
      const base = `${userPart}:${tok}`;
      return { userId: base, clientId: base };
    },
    buildIframeUrl() {
      // Build the shareable URL but alter the configUrl value by appending a ts param
      // This changes the storage key used by the webchat and yields a brand-new session
      const base = 'https://cdn.botpress.cloud/webchat/v3.2/shareable.html';
      const rawCfg = this.configUrl || 'VOTRE_CONFIG_URL';
      let cfgWithTs = rawCfg;
      const uid = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      try {
        const cfgUrl = new URL(rawCfg);
        cfgUrl.searchParams.set('__ts', String(this.iframeKey));
        // Try also to pass a new client/user id if Botpress accepts it via configUrl propagation
        cfgUrl.searchParams.set('clientId', uid);
        cfgUrl.searchParams.set('userId', uid);
        cfgWithTs = cfgUrl.toString();
      } catch (_) {
        // If rawCfg is not a valid URL, fallback to string concatenation
        const glue = rawCfg.includes('?') ? '&' : '?';
        cfgWithTs = `${rawCfg}${glue}__ts=${encodeURIComponent(String(this.iframeKey))}&clientId=${encodeURIComponent(uid)}&userId=${encodeURIComponent(uid)}`;
      }

      const params = new URLSearchParams({ configUrl: cfgWithTs });
      if (this.stylesheet) params.set('stylesheet', this.stylesheet);
      // Optional hint param for future handling/debugging
      params.set('reset', '1');
      // Duplicate identifiers at top-level as some loaders read only the outer query
      params.set('clientId', uid);
      params.set('userId', uid);
      return `${base}?${params.toString()}`;
    },
    toggle() {
      this.isOpen = !this.isOpen;
      // Show/hide Botpress webchat (script mode only)
      if (!this.isIframe && window.botpressWebChat) {
        try {
          // Preferred API if available
          const id = this.getWidgetId();
          if (typeof window.botpressWebChat.open === 'function' && typeof window.botpressWebChat.close === 'function') {
            if (this.isOpen) {
              try { window.botpressWebChat.open({ id }); } catch (_) { window.botpressWebChat.open(); }
            } else {
              try { window.botpressWebChat.close({ id }); } catch (_) { window.botpressWebChat.close(); }
            }
          } else {
            // Fallback to events
            window.botpressWebChat.sendEvent({ type: this.isOpen ? 'show' : 'hide', id });
            // Some versions may react to 'toggle' instead
            if (this.debug) {
              window.botpressWebChat.sendEvent({ type: 'toggle', id });
            }
          }
        } catch (e) {
          console.warn('[ChatbotWidget] Error toggling webchat, falling back to iframe', e);
          this.fallbackIframe = true;
        }
        if (this.isOpen && !this.contextSent) {
          this.sendUserContext();
        }
      }
    },
    clearConversation() {
      if (!this.isIframe && window.botpressWebChat) {
        try {
          // Regenerate only this scope's token, then re-init the widget with new ids
          this.regenerateScopeToken();
          const id = this.getWidgetId();
          // Instead of global resets, reconfigure only this instance with new identity
          if (typeof window.botpressWebChat.close === 'function') {
            try { window.botpressWebChat.close({ id }); } catch (_) { window.botpressWebChat.close(); }
          }
          this.reinitBotpress();
          if (typeof window.botpressWebChat.open === 'function') {
            setTimeout(() => { try { window.botpressWebChat.open({ id }); } catch (_) { window.botpressWebChat.open(); } }, 120);
          } else {
            // Fallback to show event scoped to this instance
            try { window.botpressWebChat.sendEvent({ type: 'show', id }); } catch (_) {}
          }
        } catch (e) {
          console.warn('[ChatbotWidget] script-mode reset fallback error', e);
          // Last resort: hide -> show event
          try {
            const id = this.getWidgetId();
            window.botpressWebChat.sendEvent({ type: 'hide', id });
            setTimeout(() => window.botpressWebChat.sendEvent({ type: 'show', id }), 150);
          } catch (_) {}
        }
      } else if (this.isIframe) {
        // Force iframe hard reset: blank -> reload with anti-cache param
        try {
          this.loading = true;
          // Try to request a reset via postMessage to the shareable iframe
          try {
            const iframe = this.$refs.bpIframe;
            const cw = iframe && iframe.contentWindow;
            if (cw) {
              const messages = [
                { type: 'reset' },
                { type: 'webchat:reset' },
                { type: 'RESET' },
                { action: 'reset' }
              ];
              messages.forEach((m) => {
                try { cw.postMessage(m, '*'); } catch (_) {}
              });
            }
          } catch (_) {}
          this.currentIframeSrc = 'about:blank';
          setTimeout(() => {
            this.iframeKey++;
            this.currentIframeSrc = this.buildIframeUrl();
            // re-enable shortly after src set
            setTimeout(() => { this.loading = false; }, 200);
          }, 60);
        } catch (e) {
          console.warn('[ChatbotWidget] iframe reset fallback error', e);
          // Fallback to simple key increment
          this.iframeKey++;
          this.loading = false;
        }
      }
    },
    ensureBotpressLoaded() {
      if (this.scriptLoaded || window.botpressWebChat) {
        // Already loaded
        this.initBotpress();
        return;
      }
      this.loading = true;
      const script = document.createElement('script');
      script.src = 'https://cdn.botpress.cloud/webchat/v3.2/inject.js';
      script.async = true;
      script.onload = () => {
        console.info('[ChatbotWidget] Botpress script loaded');
        this.scriptLoaded = true;
        this.initBotpress();
        this.loading = false;
      };
      script.onerror = () => {
        console.error('Erreur de chargement du script Botpress WebChat');
        this.loading = false;
        // Fallback to iframe mode if script blocked (CSP) or network
        this.fallbackIframe = true;
      };
      document.head.appendChild(script);

      // Safety timeout: if still not available after 3s, fallback to iframe
      setTimeout(() => {
        if (!window.botpressWebChat && !this.scriptLoaded) {
          console.warn('[ChatbotWidget] Botpress script not available after timeout, falling back to iframe');
          this.fallbackIframe = true;
          this.loading = false;
        }
      }, 3000);
    },
    initBotpress() {
      if (!window.botpressWebChat) return;
      // Replace placeholders with your real values
      const botId = this.botId || 'VOTRE_BOT_ID';
      const configUrl = this.configUrl || 'VOTRE_CONFIG_URL';
      try {
        const initOptions = this.getInitOptions(botId, configUrl);
        // Instance id to isolate actions per widget
        initOptions.id = this.getWidgetId();
        // Provide per-conversation ids to isolate sessions
        const ids = this.computeWebchatIds();
        initOptions.userId = ids.userId;
        initOptions.clientId = ids.clientId;
        // Apply optional customizations if provided
        if (this.themeColor) initOptions.themeColor = this.themeColor;
        if (this.botName) initOptions.botName = this.botName;
        if (this.botAvatarUrl) initOptions.botAvatarUrl = this.botAvatarUrl;
        if (typeof this.enableReset === 'boolean') initOptions.enableReset = this.enableReset;
        if (typeof this.showPoweredBy === 'boolean') initOptions.showPoweredBy = this.showPoweredBy;
        if (this.stylesheet) initOptions.stylesheet = this.stylesheet;

        window.botpressWebChat.init(initOptions);
        console.info('[ChatbotWidget] Botpress init called', { botId, configUrl, hideWidget: initOptions.hideWidget });
        // Optional event logger for debugging
        if (this.debug && window.botpressWebChat.onEvent) {
          window.botpressWebChat.onEvent((event) => {
            console.info('[ChatbotWidget] Botpress event', event);
          });
        }
        // Ensure initial state matches component state, with a slight delay to allow mount
        setTimeout(() => {
          try {
            if (typeof window.botpressWebChat.open === 'function' && this.isOpen) {
              window.botpressWebChat.open();
            } else {
              window.botpressWebChat.sendEvent({ type: this.isOpen ? 'show' : 'hide' });
            }
          } catch (e) {
            console.warn('[ChatbotWidget] Post-init show/hide failed', e);
          }
        }, 250);
        // Optionally send context immediately if already open
        if (this.isOpen && !this.contextSent) {
          this.sendUserContext();
        }
      } catch (e) {
        console.error('Erreur lors de init Botpress WebChat', e);
        // Fallback if init fails
        this.fallbackIframe = true;
      }
    },
    // Expose a method to send user/pharmacy context to Botpress (script mode only)
    sendUserContext() {
      if (this.isIframe || !window.botpressWebChat) return;
      const botId = this.botId || 'VOTRE_BOT_ID';
      try {
        const user = this.$store.getters.user;
        const pharmacie = this.$store.getters.pharmacie;
        const payload = {
          pharmacie: pharmacie?.nom_pharmacie || null,
          utilisateur: user?.fullname || user?.name || user?.email || String(user?.id || ''),
          contexte: 'logiciel_epharma',
          userId: user?.id ? String(user.id) : undefined,
        };
        const id = this.getWidgetId();
        window.botpressWebChat.sendEvent({
          type: 'trigger',
          channel: 'web',
          target: botId,
          id,
          payload,
        });
        this.contextSent = true;
      } catch (e) {
        console.error('Erreur lors de l\'envoi du contexte Botpress', e);
      }
    },
    // Expose a generic helper to send any custom payload as a trigger event (script mode only)
    sendCustomEvent(customPayload) {
      if (this.isIframe || !window.botpressWebChat) return;
      const botId = this.botId || 'VOTRE_BOT_ID';
      try {
        const id = this.getWidgetId();
        window.botpressWebChat.sendEvent({
          type: 'trigger',
          channel: 'web',
          target: botId,
          id,
          payload: customPayload || {},
        });
      } catch (e) {
        console.error('Erreur lors de l\'envoi de l\'événement personnalisé Botpress', e);
      }
    },
  },
};
</script>

<style scoped>
.chatbot-fab {
  position: fixed;
  right: 20px;
  bottom: 60px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: #2a3963;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  z-index: 1100;
  box-shadow: 0 6px 20px rgba(0,0,0,0.2);
}
.chatbot-fab:hover { opacity: 0.92; }

.chatbot-panel {
  position: fixed;
  right: 20px;
  bottom: 130px;
  width: 380px;
  max-height: 84vh;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  z-index: 1100;
}

.chatbot-header {
  padding: 10px 12px;
  background: #f6f8fa;
  border-bottom: 1px solid #eceff3;
}

.chatbot-body {
  padding: 12px;
  height: 68vh;
  overflow-y: auto;
  background: #fafbfc;
}

.message { display: flex; margin-bottom: 10px; }
.message.user { justify-content: flex-end; }
.message.assistant { justify-content: flex-start; }

.bubble {
  max-width: 80%;
  padding: 10px 12px;
  border-radius: 12px;
  background: #e9eef6;
}
.message.user .bubble { background: #2a3963; color: white; }

.timestamp { font-size: 11px; opacity: 0.7; margin-top: 4px; }

.chatbot-input {
  display: flex;
  align-items: center;
  padding: 8px;
  border-top: 1px solid #eceff3;
}

/* Typing dots */
.dot {
  width: 6px;
  height: 6px;
  background: #99a6ba;
  border-radius: 50%;
  animation: typing 1s infinite ease-in-out;
  display: inline-block;
  margin-right: 4px;
}
.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }
@keyframes typing {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}
</style>
