/**
 * Main Application Logic
 * Theme switcher, mobile nav, project filters, clipboard, project modal.
 */

// --- 1. Theme Management (Light default / Dark "night lab") ---
function initTheme() {
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const themeIconSun = document.getElementById('theme-icon-sun');
  const themeIconMoon = document.getElementById('theme-icon-moon');
  const themeLabel = document.getElementById('theme-label');

  const savedTheme = localStorage.getItem('theme');
  const currentTheme = savedTheme || 'light';
  applyTheme(currentTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const isDark = document.documentElement.classList.contains('dark');
      applyTheme(isDark ? 'light' : 'dark');
    });
  }

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      if (themeIconSun) themeIconSun.classList.add('hidden');
      if (themeIconMoon) themeIconMoon.classList.remove('hidden');
      if (themeLabel) themeLabel.textContent = 'Night';
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      if (themeIconSun) themeIconSun.classList.remove('hidden');
      if (themeIconMoon) themeIconMoon.classList.add('hidden');
      if (themeLabel) themeLabel.textContent = 'Day';
      localStorage.setItem('theme', 'light');
    }
    if (window.automataInstance) window.automataInstance.updateColors();
  }
}

// --- 2. Mobile Navigation ---
function initMobileNav() {
  const btn = document.getElementById('mobile-nav-btn');
  const panel = document.getElementById('mobile-nav');
  const iconOpen = document.getElementById('mobile-nav-icon-open');
  const iconClose = document.getElementById('mobile-nav-icon-close');
  if (!btn || !panel) return;

  const close = () => {
    panel.classList.remove('open');
    panel.classList.add('hidden');
    if (iconOpen) iconOpen.classList.remove('hidden');
    if (iconClose) iconClose.classList.add('hidden');
    btn.setAttribute('aria-expanded', 'false');
  };
  const open = () => {
    panel.classList.remove('hidden');
    panel.classList.add('open');
    if (iconOpen) iconOpen.classList.add('hidden');
    if (iconClose) iconClose.classList.remove('hidden');
    btn.setAttribute('aria-expanded', 'true');
  };

  btn.addEventListener('click', () => {
    panel.classList.contains('open') ? close() : open();
  });
  panel.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
}

// --- 3. Project Filtering Logic ---
function initProjectFilters() {
  const filterBtns = document.querySelectorAll('[data-filter]');
  const projectCards = document.querySelectorAll('[data-category]');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');

      filterBtns.forEach(b => {
        b.classList.remove('btn-primary');
        b.classList.add('btn-outline');
      });
      btn.classList.add('btn-primary');
      btn.classList.remove('btn-outline');

      projectCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'flex';
          card.classList.add('animate-fadeIn');
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

// --- 4. Copy Email to Clipboard ---
function copyEmail(email = 'biswal.sibabrata@gmail.com') {
  navigator.clipboard.writeText(email).then(() => {
    const toast = document.getElementById('toast');
    if (toast) {
      toast.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-4');
      toast.classList.add('opacity-100', 'translate-y-0');
      setTimeout(() => {
        toast.classList.add('opacity-0', 'pointer-events-none', 'translate-y-4');
        toast.classList.remove('opacity-100', 'translate-y-0');
      }, 2800);
    }
  }).catch(err => console.error('Failed to copy text: ', err));
}

// --- 5. Project Modal Data ---
const projectData = {
  'builder-practice': {
    title: 'Independent ERP & AI-Automation Practice',
    institution: 'Self-directed — Quarry Business Operations & Freelance SME Clients',
    advisor: 'Owner-operator, solo build',
    duration: 'Ongoing',
    category: 'Applied Systems',
    problem: 'Most of my AI work lived in notebooks and papers. I wanted to know whether I could take a business running on fully manual process and ship software people actually depend on every day — with no academic safety net.',
    solution: 'Designed and now maintain an ERP system that runs a quarry business\u2019s day-to-day operations end to end, then extended into freelance work automating workflows for other small businesses by wiring LLMs and third-party APIs directly into how they already work.',
    highlights: [
      'Built and deployed an ERP system now used daily to run quarry operations \u2014 inventory, dispatch, and billing moved off a fully manual process.',
      'Delivered freelance AI-automation projects for SMEs, integrating LLMs and APIs into existing workflows without disrupting live operations.',
      'Owned the full lifecycle solo: requirements, architecture, build, deployment, and ongoing support.'
    ],
    techStack: ['LLM APIs', 'Workflow Automation', 'SQL', 'JavaScript', 'Systems Design']
  },
  'preprint-commons': {
    title: 'PreprintCommons — Open Platform for Scientific Preprint Discovery',
    institution: 'Jawaharlal Nehru University & C-CAMP',
    advisor: 'Prof. B. R. Panda',
    duration: 'Sept 2024 – Aug 2025',
    category: 'Applied Systems',
    problem: 'Biomedical researchers face cognitive overload trying to keep up with thousands of preprints published weekly across bioRxiv and medRxiv, most of it without structured, searchable metadata.',
    solution: 'Built an LLM-based extraction pipeline to parse, clean, and structure preprint metadata, then shipped a full-stack discovery application on top of it so researchers can actually search and filter the result.',
    highlights: [
      'Built the metadata-extraction pipeline using open-source LLMs to structure unstructured preprint text at scale.',
      'Shipped the full-stack platform solo across the stack: React front end, FastAPI backend, PostgreSQL storage.',
      'Designed the discovery UI around how researchers actually filter literature, not around the database schema.'
    ],
    techStack: ['React', 'FastAPI', 'PostgreSQL', 'TailwindCSS', 'Open-Source LLMs', 'Python']
  },
  'hotel-seaside-ledger': {
    title: 'Hotel Sea Side Breeze — AI-Powered Operations Ledger',
    institution: 'Hotel Sea Side Breeze — Hospitality Operations & Internal Tools',
    advisor: 'Commissioned Build, solo architect & developer',
    duration: 'Production Deployment',
    category: 'Applied Systems',
    problem: 'Front-desk night audits and daily bookkeeping relied on fragmented physical receipts, disparate channel manager records, and manual spreadsheet entries, leading to reconciliation errors and audit delays.',
    solution: 'Designed and deployed an internal AI-assisted ledger system tailored for hotel operational staff, featuring automated multi-channel folio reconciliation, expense receipt parsing via LLM structured outputs, and real-time operational query tools.',
    highlights: [
      'Built an automated reconciliation engine matching multi-platform OTA bookings with bank settlements and cash collections.',
      'Integrated LLM-based structured data extraction to digitize and categorize physical expense slips and daily front-desk logs.',
      'Shipped an intuitive operational dashboard allowing management to run instantaneous night-audit checks and flag revenue discrepancies.'
    ],
    techStack: ['Python', 'FastAPI', 'PostgreSQL', 'LLM APIs / Structured Outputs', 'Reconciliation Engine', 'TailwindCSS']
  },
  'pod-ecommerce': {
    title: 'Print-on-Demand E-Commerce Store & Automated Operations',
    institution: 'Independent Venture — D2C E-Commerce & Production Ops',
    advisor: 'Owner-operator, solo build & operations',
    duration: 'Production Operations',
    category: 'Applied Systems',
    problem: 'Managing a print-on-demand merchandising storefront manually creates significant friction across catalog synchronization, custom asset generation, order fulfillment routing, and tracking updates.',
    solution: 'Engineered an end-to-end e-commerce operation integrating modern storefronts with automated supplier fulfillment APIs, real-time payment webhooks, automated order dispatch, and live logistics tracking.',
    highlights: [
      'Engineered automated order routing webhooks connecting the e-commerce storefront directly to manufacturing and print-on-demand provider APIs.',
      'Configured secure checkout, automated transactional customer messaging, and real-time package tracking updates.',
      'Handled the full operational lifecycle: product design pipelines, catalog management, payment gateway integration, unit economics, and customer support workflows.'
    ],
    techStack: ['E-Commerce Platforms', 'REST APIs & Webhooks', 'Stripe / Payments', 'Workflow Automation', 'Inventory Sync', 'Analytics']
  },
  'iot-irrigation': {
    title: 'Predictive Irrigation Using IoT + Machine Learning',
    institution: 'TiH-IoT Foundation, IIT Bombay',
    advisor: 'Dr. Subhankar Mishra, School of Computer Sciences, NISER',
    duration: 'May 2023 – Jan 2024',
    category: 'Bio & Molecular AI',
    problem: 'Manual, timer-based irrigation wastes water and stresses crops. Predicting the right moment to irrigate requires fusing live sensor readings with a plant-specific model, not a fixed schedule.',
    solution: 'Designed a controlled-environment IoT monitoring rig tracking soil moisture and environmental parameters on A. thaliana, then trained ML models on that sensor stream to predict irrigation timing.',
    highlights: [
      'Instrumented the monitoring setup end to end: sensor selection, hardware integration, and the data pipeline feeding the model.',
      'Trained ML models translating live soil and environmental readings into irrigation-timing predictions.',
      'Co-authored a book chapter and a conference paper on the resulting methodology.'
    ],
    techStack: ['IoT Sensors', 'Python', 'Scikit-learn', 'Embedded Systems', 'Time-Series ML']
  },
  'cancer-metastasis': {
    title: 'AI-Based Prediction of Metastasis in Tongue Cancer',
    institution: 'Jawaharlal Nehru University (JNU) & C-CAMP',
    advisor: 'Prof. B. R. Panda, School of Biotechnology',
    duration: 'Feb 2025 – Aug 2025',
    category: 'Bio & Molecular AI',
    problem: 'Early detection of nodal metastasis in head and neck squamous cell carcinomas is critical for surgical planning, but manual radiological review carries real diagnostic ambiguity.',
    solution: 'Fine-tuned deep convolutional networks on clinical radiology data for tumor classification and localization, then layered Grad-CAM and attention-map visualizations on top so predictions are legible to oncologists, not just accurate.',
    highlights: [
      'Built localized heatmap overlays that let clinicians see which regions of a scan actually drove the prediction.',
      'Shipped an end-to-end inference pipeline for radiology-slice classification.',
      'Validated attention regions directly against clinician judgment rather than trusting the metric alone.'
    ],
    techStack: ['PyTorch', 'Grad-CAM', 'Medical Imaging', 'Attention Maps', 'FastAPI', 'Python']
  },
  'drug-kinase-gnn': {
    title: 'GNN Modeling for Drug-Kinase Bioactivity & Repurposing',
    institution: 'NISER Bhubaneswar — Master\u2019s Thesis',
    advisor: 'Dr. V Badireenath Konkimalla, Drug Discovery Lab',
    duration: 'Master\u2019s Thesis Research',
    category: 'Bio & Molecular AI',
    problem: 'De novo drug development runs 10+ years and billions in cost. Repurposing existing compounds is faster, but only if compound-target binding affinity can be predicted accurately enough to trust.',
    solution: 'Built a Graph Neural Network on ChEMBL data that fuses molecular graph topology from RDKit with protein-target representations from ProtBert embeddings, trained end to end with stratified splitting across scaffold families.',
    highlights: [
      'Reached MAE 1.02 and RMSE 1.28 on benchmark drug-target interaction sets.',
      'Used stratified graph splitting across scaffold families so the reported accuracy reflects real generalization, not memorized chemistry.',
      'Built the full encoder-decoder pipeline in PyTorch with Deep Graph Library (DGL).'
    ],
    techStack: ['PyTorch', 'Deep Graph Library (DGL)', 'ProtBert', 'RDKit', 'ChEMBL', 'GNN']
  },
  'braf-phytochemicals': {
    title: 'Deep Learning Discovery of BRAF-Targeting Phytochemicals',
    institution: 'NISER Bhubaneswar — Drug Discovery Lab',
    advisor: 'Dr. V Badireenath Konkimalla',
    duration: 'Research Project',
    category: 'Bio & Molecular AI',
    problem: 'Screening natural compound libraries against a specific cancer-driving mutation by wet-lab assay alone is slow and expensive \u2014 most candidates never justify the bench time.',
    solution: 'Trained a Chemprop-based deep learning model on RDKit-processed SMILES to screen 2,846 phytochemicals from PubChem, ranking candidates by predicted BRAF-inhibition activity before committing any bench work.',
    highlights: [
      'Reached 0.967 AUC separating active from inactive BRAF inhibitors on held-out compounds.',
      'Processed and featurized 2,846 phytochemical structures from PubChem via RDKit-generated SMILES.',
      'Narrowed a natural-compound library to a short list of high-potential candidates for precision cancer therapy follow-up.'
    ],
    techStack: ['Chemprop', 'RDKit', 'PubChem', 'Deep Learning', 'Cheminformatics']
  },
  'mirna-biomarkers': {
    title: 'miRNA\u2013mRNA Network Biomarkers in ALK+ Lung Adenocarcinoma',
    institution: 'NISER Bhubaneswar — Drug Discovery Lab',
    advisor: 'Dr. V Badireenath Konkimalla',
    duration: 'Research Project',
    category: 'Bio & Molecular AI',
    problem: 'ALK-rearrangement lung adenocarcinoma needs biomarkers that reflect the underlying regulatory network, not single genes in isolation \u2014 but integrating miRNA and mRNA data at network scale is noisy.',
    solution: 'Built an R/Bioconductor pipeline integrating limma, WGCNA, and STRING to construct a miRNA\u2013mRNA regulatory network, validated candidate biomarkers with ROC analysis, and visualized the resulting network in Cytoscape.',
    highlights: [
      'Identified 15 candidate miRNA\u2013mRNA biomarker pairs through multi-omics network integration.',
      'Reached 0.82 AUC in ROC analysis validating the top biomarkers\u2019 diagnostic potential.',
      'Surfaced dysregulated pathways (E2F targets, G2M checkpoint) via GO/KEGG enrichment, pointing to mechanism, not just correlation.'
    ],
    techStack: ['R / Bioconductor', 'WGCNA', 'STRING', 'Cytoscape', 'limma', 'GO/KEGG Enrichment']
  }
};

function openProjectModal(projectId) {
  const modal = document.getElementById('project-modal');
  const data = projectData[projectId];
  if (!modal || !data) return;

  document.getElementById('modal-title').textContent = data.title;
  document.getElementById('modal-institution').textContent = `${data.institution} \u2022 ${data.duration}`;
  document.getElementById('modal-category').textContent = data.category;
  document.getElementById('modal-problem').textContent = data.problem;
  document.getElementById('modal-solution').textContent = data.solution;

  const highlightsList = document.getElementById('modal-highlights');
  highlightsList.innerHTML = '';
  data.highlights.forEach(h => {
    const li = document.createElement('li');
    li.className = 'text-sm text-fg-soft flex items-start gap-2';
    li.innerHTML = `<span class="font-display italic" style="color:var(--violet)">\u2014</span> <span>${h}</span>`;
    highlightsList.appendChild(li);
  });

  const techTags = document.getElementById('modal-tags');
  techTags.innerHTML = '';
  data.techStack.forEach(tag => {
    const span = document.createElement('span');
    span.className = 'chip';
    span.textContent = tag;
    techTags.appendChild(span);
  });

  modal.classList.remove('hidden');
  modal.classList.add('flex');
  document.body.style.overflow = 'hidden';
  if (window.lucide) window.lucide.createIcons();
}

function closeProjectModal() {
  const modal = document.getElementById('project-modal');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  document.body.style.overflow = 'auto';
}

// --- DOM Ready Initialization ---
window.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMobileNav();
  initProjectFilters();
  if (window.lucide) window.lucide.createIcons();

  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeProjectModal(); });

  const modal = document.getElementById('project-modal');
  if (modal) {
    modal.addEventListener('click', (e) => { if (e.target === modal) closeProjectModal(); });
  }
});
