const state = {
  config: null,
  fields: new Map(),
  localStatus: new Map(),
  modelOptions: [],
  activeView: "providers",
};

const MASKED_SECRET = "********";
const VIEW_GROUPS = [
  {
    id: "providers",
    label: "Providers",
    title: "Providers",
    sections: ["providers", "runtime"],
    containerId: "providersSections",
  },
  {
    id: "model_hub",
    label: "Model Hub",
    title: "Model Hub",
    sections: [],
    containerId: "",
  },
  {
    id: "model_config",
    label: "Model Config",
    title: "Model Config",
    sections: ["models", "thinking", "web_tools"],
    containerId: "modelConfigSections",
  },
  {
    id: "messaging",
    label: "Messaging",
    title: "Messaging",
    sections: ["messaging", "voice"],
    containerId: "messagingSections",
  },
];

const byId = (id) => document.getElementById(id);

function sourceLabel(source) {
  const labels = {
    default: "default",
    template: "template",
    repo_env: "repo .env",
    managed_env: "",
    explicit_env_file: "FCC_ENV_FILE",
    process: "process env",
  };
  return Object.prototype.hasOwnProperty.call(labels, source) ? labels[source] : source;
}

function sourceText(field) {
  const parts = [];
  const label = sourceLabel(field.source);
  if (label) {
    parts.push(label);
  }
  if (field.locked) {
    parts.push("locked");
  }
  return parts.join(" ");
}

function providerName(providerId) {
  const names = {
    nvidia_nim: "NVIDIA NIM",
    open_router: "OpenRouter",
    mistral_codestral: "Mistral Codestral",
    deepseek: "DeepSeek",
    lmstudio: "LM Studio",
    llamacpp: "llama.cpp",
    ollama: "Ollama",
    kimi: "Kimi",
    wafer: "Wafer",
    opencode: "OpenCode Zen",
    opencode_go: "OpenCode Go",
    zai: "Z.ai",
  };
  if (names[providerId]) return names[providerId];
  return providerId
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function statusClass(status) {
  if (["configured", "reachable", "running"].includes(status)) return "ok";
  if (["missing_key", "missing_url", "unknown"].includes(status)) return "warn";
  if (["offline", "error"].includes(status)) return "error";
  return "neutral";
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  return response.json();
}

async function load() {
  showMessage("Loading admin config");
  const config = await api("/admin/api/config");
  state.config = config;
  state.fields = new Map(config.fields.map((field) => [field.key, field]));
  renderNav();
  renderProviders(config.provider_status);
  renderSections(config.sections, config.fields);
  byId("configPath").textContent = config.paths.managed;
  await validate(false);
  await refreshLocalStatus();

  try {
    const statusResult = await api("/admin/api/status");
    if (statusResult.cached_models) {
      const discovered = [];
      Object.entries(statusResult.cached_models).forEach(([providerId, models]) => {
        models.forEach((model) => {
          discovered.push(`${providerId}/${model}`);
        });
      });
      state.modelOptions = Array.from(new Set([...state.modelOptions, ...discovered])).sort();
      syncModelDatalist();
    }
  } catch (err) {
    console.error("Failed to load active status:", err);
  }

  updateDirtyState();
  showMessage("");
}

function renderNav() {
  const nav = byId("sectionNav");
  nav.innerHTML = "";
  VIEW_GROUPS.forEach((view, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `nav-link${index === 0 ? " active" : ""}`;
    button.dataset.view = view.id;
    button.textContent = view.label;
    if (index === 0) {
      button.setAttribute("aria-current", "page");
    }
    button.addEventListener("click", () => {
      setActiveView(view.id, { scroll: true });
    });
    nav.appendChild(button);
  });
  setActiveView(state.activeView, { scroll: false });
}

function setActiveView(viewId, { scroll = false } = {}) {
  const activeView =
    VIEW_GROUPS.find((view) => view.id === viewId) || VIEW_GROUPS[0];
  state.activeView = activeView.id;
  byId("pageTitle").textContent = activeView.title;

  document.querySelectorAll(".nav-link").forEach((link) => {
    const selected = link.dataset.view === activeView.id;
    link.classList.toggle("active", selected);
    if (selected) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  document.querySelectorAll(".admin-view").forEach((view) => {
    const selected = view.dataset.view === activeView.id;
    view.classList.toggle("active", selected);
    view.hidden = !selected;
  });

  if (viewId === "model_hub") {
    syncModelHubView();
  }

  if (scroll) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function renderProviders(providerStatus) {
  const grid = byId("providerGrid");
  grid.innerHTML = "";
  providerStatus.forEach((provider) => {
    const card = document.createElement("article");
    card.className = "provider-card";
    card.dataset.provider = provider.provider_id;

    const title = document.createElement("div");
    title.className = "provider-title";
    title.innerHTML = `<strong>${providerName(provider.provider_id)}</strong>`;

    const pill = document.createElement("span");
    pill.className = `status-pill ${statusClass(provider.status)}`;
    pill.textContent = provider.label;
    title.appendChild(pill);

    const meta = document.createElement("div");
    meta.className = "provider-meta";
    meta.textContent =
      provider.kind === "local"
        ? provider.base_url || "No local URL configured"
        : provider.credential_env;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "test-button";
    button.textContent = provider.kind === "local" ? "Test" : "Refresh models";
    button.addEventListener("click", () => testProvider(provider.provider_id, button));

    card.append(title, meta, button);
    grid.appendChild(card);
  });
}

function updateProviderCard(providerId, status, label, metaText) {
  const card = document.querySelector(`[data-provider="${providerId}"]`);
  if (!card) return;
  const pill = card.querySelector(".status-pill");
  pill.className = `status-pill ${statusClass(status)}`;
  pill.textContent = label;
  if (metaText) {
    card.querySelector(".provider-meta").textContent = metaText;
  }
}

function renderSections(sections, fields) {
  VIEW_GROUPS.forEach((view) => {
    if (view.containerId) {
      byId(view.containerId).innerHTML = "";
    }
  });

  const sectionById = new Map(sections.map((section) => [section.id, section]));
  const bySection = new Map();
  sections.forEach((section) => bySection.set(section.id, []));
  fields.forEach((field) => {
    if (!bySection.has(field.section)) bySection.set(field.section, []);
    bySection.get(field.section).push(field);
  });

  VIEW_GROUPS.forEach((view) => {
    if (!view.containerId) return;
    const container = byId(view.containerId);
    view.sections.forEach((sectionId) => {
      const section = sectionById.get(sectionId);
      const sectionFields = bySection.get(sectionId) || [];
      if (!section || sectionFields.length === 0) return;

      const sectionEl = document.createElement("section");
      sectionEl.className = "settings-section";
      sectionEl.id = `section-${section.id}`;

      const heading = document.createElement("div");
      heading.className = "section-heading";
      heading.innerHTML = `<div><h3>${section.label}</h3><p>${section.description}</p></div>`;
      sectionEl.appendChild(heading);

      const grid = document.createElement("div");
      grid.className = "field-grid";
      sectionFields.forEach((field) => {
        grid.appendChild(renderField(field));
      });
      sectionEl.appendChild(grid);

      if (sectionFields.some((field) => field.advanced)) {
        const toggle = document.createElement("button");
        toggle.type = "button";
        toggle.className = "ghost-button advanced-toggle";
        toggle.textContent = "Show advanced";
        toggle.addEventListener("click", () => {
          const showing = sectionEl.classList.toggle("show-advanced");
          toggle.textContent = showing ? "Hide advanced" : "Show advanced";
        });
        sectionEl.appendChild(toggle);
      }

      container.appendChild(sectionEl);
    });
  });
}

function renderField(field) {
  const wrapper = document.createElement("div");
  wrapper.className = `field${field.advanced ? " advanced-field" : ""}`;
  wrapper.dataset.key = field.key;

  const label = document.createElement("label");
  label.htmlFor = `field-${field.key}`;
  const labelText = document.createElement("span");
  labelText.textContent = field.label;
  label.appendChild(labelText);

  const source = sourceText(field);
  if (source) {
    const sourceEl = document.createElement("span");
    sourceEl.className = "field-source";
    sourceEl.textContent = source;
    label.appendChild(sourceEl);
  }

  const input = inputForField(field);
  input.id = `field-${field.key}`;
  input.dataset.key = field.key;
  input.dataset.original = field.value || "";
  input.dataset.secret = field.secret ? "true" : "false";
  input.dataset.configured = field.configured ? "true" : "false";
  input.disabled = field.locked;
  input.addEventListener("input", updateDirtyState);
  input.addEventListener("change", updateDirtyState);

  if (field.key.startsWith("MODEL") && field.type !== "boolean") {
    const container = document.createElement("div");
    container.className = "input-with-button";
    
    const chooseBtn = document.createElement("button");
    chooseBtn.type = "button";
    chooseBtn.className = "secondary-button choose-model-btn";
    chooseBtn.textContent = "Choose...";
    chooseBtn.addEventListener("click", () => openModelChooser(field.key));
    
    container.append(input, chooseBtn);
    wrapper.append(label, container);
  } else {
    wrapper.append(label, input);
  }

  if (field.description) {
    const description = document.createElement("div");
    description.className = "field-description";
    description.textContent = field.description;
    wrapper.appendChild(description);
  }
  return wrapper;
}

function inputForField(field) {
  if (field.type === "boolean") {
    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = String(field.value).toLowerCase() === "true";
    input.dataset.original = input.checked ? "true" : "false";
    return input;
  }

  if (field.type === "tri_boolean") {
    const select = document.createElement("select");
    [
      ["", "Inherit"],
      ["true", "Enabled"],
      ["false", "Disabled"],
    ].forEach(([value, label]) => select.appendChild(option(value, label)));
    select.value = field.value || "";
    return select;
  }

  if (field.type === "select") {
    const select = document.createElement("select");
    field.options.forEach((value) => select.appendChild(option(value, value)));
    select.value = field.value || field.options[0] || "";
    return select;
  }

  if (field.type === "textarea") {
    const textarea = document.createElement("textarea");
    textarea.value = field.value || "";
    return textarea;
  }

  const input = document.createElement("input");
  input.type = field.type === "number" ? "number" : "text";
  if (field.type === "secret") {
    input.type = "password";
    input.placeholder = field.configured
      ? "Configured - enter a new value to replace"
      : "Not configured";
    input.value = "";
    input.autocomplete = "off";
  } else {
    input.value = field.value || "";
  }
  if (field.key.startsWith("MODEL")) {
    input.setAttribute("list", "model-options");
  }
  return input;
}

function option(value, label) {
  const optionEl = document.createElement("option");
  optionEl.value = value;
  optionEl.textContent = label;
  return optionEl;
}

function readFieldValue(input) {
  if (input.type === "checkbox") return input.checked ? "true" : "false";
  if (input.dataset.secret === "true" && input.dataset.configured === "true") {
    return input.value ? input.value : MASKED_SECRET;
  }
  return input.value;
}

function changedValues() {
  const values = {};
  document.querySelectorAll("[data-key]").forEach((input) => {
    if (input.disabled || !input.matches("input, select, textarea")) return;
    const value = readFieldValue(input);
    if (value !== input.dataset.original) {
      values[input.dataset.key] = value;
    }
  });
  return values;
}

function updateDirtyState() {
  const count = Object.keys(changedValues()).length;
  byId("dirtyState").textContent =
    count === 0 ? "No changes" : `${count} unsaved change${count === 1 ? "" : "s"}`;
  byId("applyButton").disabled = count === 0;
}

async function validate(showResult = true) {
  const result = await api("/admin/api/config/validate", {
    method: "POST",
    body: JSON.stringify({ values: changedValues() }),
  });
  if (showResult) {
    showValidationResult(result);
  }
  return result;
}

function showValidationResult(result) {
  if (result.valid) {
    showMessage("Config shape is valid", "ok");
  } else {
    showMessage(result.errors.join("; "), "error");
  }
}

async function apply() {
  const result = await api("/admin/api/config/apply", {
    method: "POST",
    body: JSON.stringify({ values: changedValues() }),
  });
  if (!result.applied) {
    showValidationResult(result);
    return;
  }
  const restart = result.restart || {};
  if (restart.required && restart.automatic) {
    showMessage("Applied. Restarting server...", "ok");
    byId("applyButton").disabled = true;
    setTimeout(() => {
      window.location.href = restart.admin_url || "/admin";
    }, 1600);
    return;
  }
  const pending = restart.required ? restart.fields || [] : result.pending_fields || [];
  await load();
  showMessage(
    pending.length
      ? `Applied. Restart fcc-server to use: ${pending.join(", ")}`
      : "Applied",
    "ok",
  );
}

async function refreshLocalStatus() {
  const result = await api("/admin/api/providers/local-status");
  result.providers.forEach((provider) => {
    state.localStatus.set(provider.provider_id, provider);
    const meta = provider.status_code
      ? `${provider.base_url} returned HTTP ${provider.status_code}`
      : provider.base_url;
    updateProviderCard(provider.provider_id, provider.status, provider.label, meta);
  });
}

async function testProvider(providerId, button) {
  const original = button.textContent;
  button.disabled = true;
  button.textContent = "Testing";
  try {
    const result = await api(`/admin/api/providers/${providerId}/test`, {
      method: "POST",
      body: "{}",
    });
    if (result.ok) {
      updateProviderCard(
        providerId,
        "reachable",
        `${result.models.length} models`,
        result.models.slice(0, 3).join(", ") || "No models returned",
      );
      state.modelOptions = Array.from(
        new Set([
          ...state.modelOptions,
          ...result.models.map((model) => `${providerId}/${model}`),
        ]),
      ).sort();
      syncModelDatalist();
    } else {
      updateProviderCard(providerId, "offline", result.error_type, result.error_type);
    }
  } finally {
    button.disabled = false;
    button.textContent = original;
  }
}

function syncModelDatalist() {
  let datalist = byId("model-options");
  if (!datalist) {
    datalist = document.createElement("datalist");
    datalist.id = "model-options";
    document.body.appendChild(datalist);
  }
  datalist.innerHTML = "";
  state.modelOptions.forEach((model) => datalist.appendChild(option(model, model)));
}

function showMessage(message, kind = "") {
  const area = byId("messageArea");
  area.textContent = message;
  area.className = `message-area ${kind}`.trim();
}

byId("validateButton").addEventListener("click", () => validate(true));
byId("applyButton").addEventListener("click", apply);

function switchToProvider(provider) {
  const modelInput = byId("field-MODEL");
  if (!modelInput) return;
  if (provider === "open_router") {
    modelInput.value = "open_router/openrouter/free";
    const keyInput = byId("field-OPENROUTER_API_KEY");
    if (keyInput && !keyInput.value && keyInput.placeholder === "Not configured") {
      showMessage("Switched default model to OpenRouter Free. Please enter your OpenRouter API key(s) in the field below.", "warn");
      keyInput.focus();
    } else {
      showMessage("Switched default model to OpenRouter Free. Click Apply to save.", "ok");
    }
  } else if (provider === "nvidia_nim") {
    modelInput.value = "nvidia_nim/nvidia/nemotron-3-super-120b-a12b";
    const keyInput = byId("field-NVIDIA_NIM_API_KEY");
    if (keyInput && !keyInput.value && keyInput.placeholder === "Not configured") {
      showMessage("Switched default model to NVIDIA NIM. Please enter your NVIDIA NIM API key in the field below.", "warn");
      keyInput.focus();
    } else {
      showMessage("Switched default model to NVIDIA NIM. Click Apply to save.", "ok");
    }
  }
  modelInput.dispatchEvent(new Event("input"));
  modelInput.dispatchEvent(new Event("change"));
}

byId("switchToOpenRouter").addEventListener("click", () => switchToProvider("open_router"));
byId("switchToNvidia").addEventListener("click", () => switchToProvider("nvidia_nim"));

/* Modal Model Chooser Logic */
const PRELOADED_MODELS = [
  // OpenRouter Free
  { id: "open_router/meta-llama/llama-3.3-70b-instruct:free", name: "Llama 3.3 70B Instruct", provider: "open_router", free: true },
  { id: "open_router/qwen/qwen3-coder:free", name: "Qwen3 Coder 480B MoE", provider: "open_router", free: true },
  { id: "open_router/google/gemma-4-31b-it:free", name: "Gemma 4 31B Instruct", provider: "open_router", free: true },
  { id: "open_router/openrouter/free", name: "Auto Free Router", provider: "open_router", free: true },
  { id: "open_router/nousresearch/hermes-3-llama-3.1-405b:free", name: "Hermes 3 405B", provider: "open_router", free: true },
  { id: "open_router/nvidia/nemotron-3-super-120b-a12b:free", name: "Nemotron 3 Super", provider: "open_router", free: true },
  // NVIDIA NIM
  { id: "nvidia_nim/nvidia/nemotron-3-super-120b-a12b", name: "Nemotron 3 Super", provider: "nvidia_nim", free: false },
  { id: "nvidia_nim/meta/llama-3-70b-instruct", name: "Llama 3 70B Instruct", provider: "nvidia_nim", free: false },
  // Gemini
  { id: "gemini/gemini-2.5-pro", name: "Gemini 2.5 Pro", provider: "gemini", free: false },
  { id: "gemini/gemini-2.5-flash", name: "Gemini 2.5 Flash", provider: "gemini", free: false },
  // DeepSeek
  { id: "deepseek/deepseek-chat", name: "DeepSeek V3", provider: "deepseek", free: false },
  { id: "deepseek/deepseek-reasoner", name: "DeepSeek R1", provider: "deepseek", free: false },
];

function getAllModels() {
  const models = [...PRELOADED_MODELS];
  const knownIds = new Set(models.map(m => m.id));
  
  state.modelOptions.forEach((modelId) => {
    if (knownIds.has(modelId)) return;
    
    const parts = modelId.split("/");
    const provider = parts[0];
    const rest = parts.slice(1).join("/");
    
    const isFree = modelId.endsWith(":free") || modelId.includes("/free");
    
    models.push({
      id: modelId,
      name: rest.replace(/:free$/, "").split("/").pop().replace(/[-_]/g, " "),
      provider: provider,
      free: isFree,
    });
  });
  
  return models;
}

function renderModalModels(searchQuery = "") {
  const container = byId("modalModelList");
  container.innerHTML = "";
  
  const query = searchQuery.toLowerCase().trim();
  const allModels = getAllModels();
  
  const groups = {};
  allModels.forEach((model) => {
    const matchesName = model.name.toLowerCase().includes(query);
    const matchesId = model.id.toLowerCase().includes(query);
    if (query && !matchesName && !matchesId) return;
    
    if (!groups[model.provider]) {
      groups[model.provider] = [];
    }
    groups[model.provider].push(model);
  });
  
  Object.keys(groups).sort().forEach((provider) => {
    const groupEl = document.createElement("div");
    groupEl.className = "provider-group";
    
    const titleEl = document.createElement("div");
    titleEl.className = "provider-group-title";
    titleEl.textContent = providerName(provider);
    groupEl.appendChild(titleEl);
    
    groups[provider].forEach((model) => {
      const row = document.createElement("div");
      row.className = "model-item-row";
      
      const details = document.createElement("div");
      details.className = "model-item-details";
      
      const name = document.createElement("div");
      name.className = "model-item-name";
      name.textContent = model.name;
      
      const slug = document.createElement("div");
      slug.className = "model-item-slug";
      slug.textContent = model.id;
      
      details.append(name, slug);
      
      const badges = document.createElement("div");
      badges.className = "model-item-badges";
      
      if (model.free) {
        const badge = document.createElement("span");
        badge.className = "model-item-badge free";
        badge.textContent = "Free";
        badges.appendChild(badge);
      }
      
      if (model.id.includes("reason") || model.id.includes("thinking") || model.id.includes("r1")) {
        const badge = document.createElement("span");
        badge.className = "model-item-badge reasoning";
        badge.textContent = "Reasoning";
        badges.appendChild(badge);
      }
      
      row.append(details, badges);
      
      row.addEventListener("click", () => {
        selectModelForChooser(model.id);
      });
      
      groupEl.appendChild(row);
    });
    
    container.appendChild(groupEl);
  });
  
  if (container.children.length === 0) {
    const noResult = document.createElement("div");
    noResult.style.color = "var(--muted)";
    noResult.style.textAlign = "center";
    noResult.style.padding = "20px";
    noResult.textContent = "No models match your search query.";
    container.appendChild(noResult);
  }
}

function selectModelForChooser(modelId) {
  const targetKey = state.activeChooserField;
  if (!targetKey) return;
  
  const input = byId(`field-${targetKey}`);
  if (input) {
    input.value = modelId;
    input.dispatchEvent(new Event("input"));
    input.dispatchEvent(new Event("change"));
  }
  
  closeModelChooser();
}

function openModelChooser(fieldKey) {
  state.activeChooserField = fieldKey;
  byId("modelSearchInput").value = "";
  renderModalModels();
  byId("modelModal").classList.add("active");
  setTimeout(() => byId("modelSearchInput").focus(), 50);
}

function closeModelChooser() {
  state.activeChooserField = null;
  byId("modelModal").classList.remove("active");
}

byId("closeModalBtn").addEventListener("click", closeModelChooser);
byId("modelModal").addEventListener("click", (e) => {
  if (e.target === byId("modelModal")) {
    closeModelChooser();
  }
});
byId("modelSearchInput").addEventListener("input", (e) => {
  renderModalModels(e.target.value);
});

/* Model Hub Controller Logic */
state.selectedHubModel = null;

function syncModelHubView() {
  const slots = ["MODEL", "MODEL_OPUS", "MODEL_SONNET", "MODEL_HAIKU"];
  slots.forEach((slot) => {
    const input = byId(`field-${slot}`);
    const currentVal = input ? input.value : "";
    const slotEl = byId(`slot-${slot}`);
    if (slotEl) {
      if (currentVal) {
        slotEl.textContent = currentVal;
        slotEl.classList.remove("empty");
      } else {
        slotEl.textContent = "Not configured (Inherit)";
        slotEl.classList.add("empty");
      }
    }
  });

  const allModels = getAllModels();
  if (!state.selectedHubModel && allModels.length > 0) {
    selectModelForHub(allModels[0]);
  } else if (state.selectedHubModel) {
    selectModelForHub(state.selectedHubModel);
  }

  renderHubModels(byId("hubSearchInput").value);
}

function selectModelForHub(model) {
  state.selectedHubModel = model;
  
  const nameEl = byId("hubSelectedName");
  const slugEl = byId("hubSelectedSlug");
  const badgeEl = byId("hubSelectedBadge");
  
  if (nameEl) nameEl.textContent = model.name;
  if (slugEl) slugEl.textContent = model.id;
  
  if (badgeEl) {
    badgeEl.innerHTML = "";
    if (model.free) {
      const badge = document.createElement("span");
      badge.className = "model-item-badge free";
      badge.textContent = "Free";
      badgeEl.appendChild(badge);
    }
  }
}

function renderHubModels(searchQuery = "") {
  const container = byId("hubModelList");
  if (!container) return;
  container.innerHTML = "";
  
  const query = searchQuery.toLowerCase().trim();
  const allModels = getAllModels();
  
  const groups = {};
  allModels.forEach((model) => {
    const matchesName = model.name.toLowerCase().includes(query);
    const matchesId = model.id.toLowerCase().includes(query);
    if (query && !matchesName && !matchesId) return;
    
    if (!groups[model.provider]) {
      groups[model.provider] = [];
    }
    groups[model.provider].push(model);
  });
  
  Object.keys(groups).sort().forEach((provider) => {
    const groupEl = document.createElement("div");
    groupEl.className = "provider-group";
    
    const titleEl = document.createElement("div");
    titleEl.className = "provider-group-title";
    titleEl.textContent = providerName(provider);
    groupEl.appendChild(titleEl);
    
    groups[provider].forEach((model) => {
      const row = document.createElement("div");
      row.className = "model-item-row";
      if (state.selectedHubModel && state.selectedHubModel.id === model.id) {
        row.style.borderColor = "var(--accent)";
        row.style.background = "var(--panel-strong)";
      }
      
      const details = document.createElement("div");
      details.className = "model-item-details";
      
      const name = document.createElement("div");
      name.className = "model-item-name";
      name.textContent = model.name;
      
      const slug = document.createElement("div");
      slug.className = "model-item-slug";
      slug.textContent = model.id;
      
      details.append(name, slug);
      
      const badges = document.createElement("div");
      badges.className = "model-item-badges";
      
      if (model.free) {
        const badge = document.createElement("span");
        badge.className = "model-item-badge free";
        badge.textContent = "Free";
        badges.appendChild(badge);
      }
      
      if (model.id.includes("reason") || model.id.includes("thinking") || model.id.includes("r1")) {
        const badge = document.createElement("span");
        badge.className = "model-item-badge reasoning";
        badge.textContent = "Reasoning";
        badges.appendChild(badge);
      }
      
      row.append(details, badges);
      
      row.addEventListener("click", () => {
        selectModelForHub(model);
        renderHubModels(searchQuery);
      });
      
      groupEl.appendChild(row);
    });
    
    container.appendChild(groupEl);
  });
  
  if (container.children.length === 0) {
    const noResult = document.createElement("div");
    noResult.style.color = "var(--muted)";
    noResult.style.textAlign = "center";
    noResult.style.padding = "20px";
    noResult.textContent = "No models match your search query.";
    container.appendChild(noResult);
  }
}

function assignModelToSlot(slotKey) {
  if (!state.selectedHubModel) return;
  const modelId = state.selectedHubModel.id;
  
  const input = byId(`field-${slotKey}`);
  if (input) {
    input.value = modelId;
    input.dispatchEvent(new Event("input"));
    input.dispatchEvent(new Event("change"));
    
    const slotEl = byId(`slot-${slotKey}`);
    if (slotEl) {
      slotEl.textContent = modelId;
      slotEl.classList.remove("empty");
    }
    showMessage(`Assigned selected model to ${slotKey}. Click Apply to save.`, "ok");
  }
}

// Wire up Model Hub assignment buttons
document.querySelectorAll(".assign-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const slot = e.currentTarget.dataset.slot;
    assignModelToSlot(slot);
  });
});

// Wire up Model Hub search box
const hubSearch = byId("hubSearchInput");
if (hubSearch) {
  hubSearch.addEventListener("input", (e) => {
    renderHubModels(e.target.value);
  });
}

load().catch((error) => {
  showMessage(error.message, "error");
});
