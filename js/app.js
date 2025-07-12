OrgChart.elements.multiline = function(t, e, r, i) {
  var n = OrgChart.elements._vidrf(t, e, i);
  if (n.doNotRender) return {
    html: ""
  };
  var a = "";
  return e.btn && (a = `<a href="#" data-input-btn="" class="boc-link boc-link-boc-button">${e.btn}</a>`), {
    html: `<div class="boc-form-field" style="min-width: ${r};">\n                    <div class="boc-input" data-boc-input="" ${n.disabledAttribute} ${n.vlidators}>\n                        <label for="${n.id}">${OrgChart._escapeGreaterLessSign(n.label)}</label>\n                        <input ${n.readOnlyAttribute} data-binding="${OrgChart._escapeDoubleQuotes(n.binding)}" maxlength="256" id="${n.id}" name="${n.id}" type="hidden" value="${OrgChart._escapeDoubleQuotes(n.value)}" autocomplete="off"><pre style="white-space: pre-wrap;">\n\n${OrgChart._escapeDoubleQuotes(n.value)}</pre>\n                        ${a}\n                    </div>\n                </div>`,
    id: n.id,
    value: n.value
  }
}

let pendingRecompute = false;

function getGewinnverteilung(einsatz) {
  for (let i = gewinnverteilung.length - 1; i >= 0; i--) {
    if (einsatz >= gewinnverteilung[i].minimum) {
      return gewinnverteilung[i];
    }
  }
  return gewinnverteilung[0];
}
function getMonatsprofit(einsatz) {
  const gewinn = getGewinnverteilung(einsatz);
  return (einsatz * gewinn.eigenanteil) / 100.0 * 0.175; // 17.5% of Eigenanteil
}
function getProfit(einsatz) {
  return getMonatsprofit(einsatz) * 12;
}
function getStufe(node) {
  for (let i = stufen.length - 1; i >= 0; i--) {
    if (
      node.Einsatz >= stufen[i].ek &&
      node.Eigenvolumen + (node.Teamvolumen - node.Eigenvolumen) * 0.4 >= stufen[i].qlv
    ) {
      return stufen[i];
    }
  }
  return stufen[0];
}
function setStufenparameter(node, stufe) {
  node.Stufe = stufe.name;
  node.Bonus = stufe.bonus;
  node.Provision = stufe.percentage;
  node.PS = stufe.ps;
  node.Shareholder = stufe.shareholder;
  return node;
}

function recompute() {
  if (pendingRecompute) return;
  pendingRecompute = true;
  window.setTimeout(() => {
    nodes = computeFields(nodes);
    chart.load(nodes);
    window.setTimeout(() => {
      pendingRecompute = false;
    }, 500);
  }, 100);
}

let nodes = [
  { id: "0", Name: "Upline", Mitgliedsnummer: 0, Einsatz: 1000 /* computed fields will be added */ }
];
recompute();

Array.prototype.findId = function(id) {
  return this.find(node => node.id === id);
}

Array.prototype.findIdIndex = function(id) {
  return this.findIndex(node => node.id === id);
}

function computeFields(nodeList) {
  console.log("Computing fields for nodes...");
  // Your logic here: Recalculate computed fields based on DAG structure.
  // Example: For each node, compute Eigenanteil as a percentage, etc.
  nodeIdMap = {};
  nodeList.forEach(node => {
    nodeIdMap[node.id] = node.Mitgliedsnummer;
  });
  nodeList.forEach(node => {
    node.id = nodeIdMap[node.id];
    node.pid = nodeIdMap[node.pid] ?? undefined;
  })
  nodeList.forEach(node => {
    const gewinnverteilung = getGewinnverteilung(node.Einsatz);
    node.Eigenanteil = gewinnverteilung.eigenanteil;
    node.Einsatz = +((+node.Einsatz).toFixed(2));
    node.Ertrag = +(getProfit(node.Einsatz).toFixed(2));
    node.Eigenvolumen = 0;
    node.Teamvolumen = 0;
    node.Bonus = 0;
    node.Provision = 0;
    node.Sofortprovision = 0;
    node.Jahresprovision = 0;
    node.Gesamtprovision = 0;
    node.Simulation = `Einstieg als Mitglied mit \$${node.Einsatz}`;
    const stufe = getStufe(node);
    setStufenparameter(node, stufe);
  });
  // sort nodelist by node ID:
  nodeList.sort((a, b) => a.id - b.id);
  nodeList.forEach(node => {
    let parent = node;
    let diffProvision = 0;
    while (parent.pid !== undefined) {
      parent = nodeList.findId(parent.pid);
      if (!parent) break;
      parent.Teamvolumen += node.Einsatz;
      if (parent.id === node.pid) {
        parent.Eigenvolumen += node.Einsatz;
      }
      const oldStufe = parent.Stufe;
      const stufe = getStufe(parent);
      setStufenparameter(parent, stufe);
      if (oldStufe !== stufe.name) {
        parent.Simulation += "\nNeue Stufe: " + stufe.name;
      }
      const provision = Math.max(parent.Provision - diffProvision, 0);
      const sofortprovision = (provision * node.Einsatz / 100.0);
      parent.Sofortprovision += sofortprovision;
      parent.Simulation += `\nProvision: ${provision}% von ${node.Name} = \$${sofortprovision.toFixed(2)}`;
      diffProvision += provision;
    }
  })
  nodeList.forEach(node => {
    let parent = node;
    let diffPS = 0;
    while (parent.pid !== undefined) {
      parent = nodeList.findId(parent.pid);
      if (!parent) break;

      const ps = Math.max(parent.PS - diffPS, 0);
      const jahresprovision = node.Ertrag * node.Eigenanteil / 100.0 * ps / 100.0;
      parent.Jahresprovision += jahresprovision;
      parent.Gesamtprovision = parent.Sofortprovision + parent.Jahresprovision + parent.Bonus;
      parent.Simulation += `\nProfitshare: ${ps}% von ${node.Name} = \$${jahresprovision.toFixed(2)}`;
      diffPS += ps;
    }
  })
  nodeList.forEach(node => {
    if (node.Bonus > 0) {
      node.Simulation += `\nBonus: ${node.Bonus.toFixed(2)}`;
    }
    node.Sofortprovision = +(node.Sofortprovision.toFixed(2));
    node.Jahresprovision = +(node.Jahresprovision.toFixed(2));
    node.Gesamtprovision = +(node.Gesamtprovision.toFixed(2));
  })
  return nodeList;
}

// Custom node template for display: Mitgliedsnummer | Name on top, Einsatz (Eigenanteil%) below
OrgChart.templates.custom = Object.assign({}, OrgChart.templates.ula);
// OrgChart.templates.custom.size = [250, 100]; // Adjust size as needed
OrgChart.templates.custom.field_0 = '<text class="field_0" style="font-size: 16px;" fill="#000" x="125" y="30" text-anchor="middle">{val}</text>';
OrgChart.templates.custom.field_1 = '<text class="field_1" style="font-size: 14px;" fill="#000" x="125" y="50" text-anchor="middle">{val}</text>';
OrgChart.templates.custom.field_2 = '<text class="field_2" style="font-size: 14px;" fill="#000" x="10" y="70" text-anchor="start">{val}</text>';
OrgChart.templates.custom.field_3 = '<text class="field_3" style="font-size: 14px;" fill="#000" x="10" y="90" text-anchor="start">Provision: ${val}</text>';
OrgChart.templates.custom.plus = "";
OrgChart.templates.custom.minus = "";

// Initialize chart
let chart = new OrgChart("#tree", {
  template: "custom",
  enableDragDrop: true,
  enableSearch: false,
  nodeMenu: {
    details: { text: "Details" },
    edit: { text: "Bearbeiten" },
    add: { text: "Kind hinzufügen" },
    remove: { text: "Löschen" }
  },
  nodeBinding: {
    field_0: "header",
    field_1: "details",
    field_2: "stufe",
    field_3: "Gesamtprovision"
  },
  nodes,
  toolbar: {
    fullScreen: true,
    zoom: true,
    fit: true,
    expandAll: false
  },
  orderBy: "id",
  editForm: {
    titleBinding: "Name",
    generateElementsFromFields: false,
    elements: [
      { type: 'textbox', label: 'Name', binding: 'Name' },
      { type: 'textbox', label: 'Mitgliedsnummer', binding: 'Mitgliedsnummer' },
      { type: 'textbox', label: 'Einsatz ($)', binding: 'Einsatz', validators: { required: 'Pflichtfeld', pattern: { regex: '^\\d+$', message: 'Nur Zahlen' } } },
      { type: 'textbox', label: 'Ertrag ($)', binding: 'Ertrag', readonly: true },
      { type: 'textbox', label: 'Eigenvolumen ($)', binding: 'Eigenvolumen', readonly: true },
      { type: 'textbox', label: 'Teamvolumen ($)', binding: 'Teamvolumen', readonly: true },
      { type: 'textbox', label: 'Bonus (%)', binding: 'Bonus', readonly: true },
      { type: 'textbox', label: 'Provision (%)', binding: 'Provision', readonly: true },
      { type: 'textbox', label: 'Sofortprovision ($)', binding: 'Sofortprovision', readonly: true },
      { type: 'textbox', label: 'Jahresprovision ($)', binding: 'Jahresprovision', readonly: true },
      { type: 'textbox', label: 'Gesamtprovision ($)', binding: 'Gesamtprovision', readonly: true },
      { type: 'textbox', label: 'Stufe', binding: 'Stufe', readonly: true },
      { type: 'multiline', label: 'Simulation', binding: 'Simulation', readonly: true }
      // Computed fields are read-only; display them if needed via custom elements
    ],
    cancelBtn: 'Abbrechen',
    saveAndCloseBtn: 'Speichern',
    buttons: {
      edit: { text: "Bearbeiten" },
      remove: { text: "Löschen" }
    }
  },
  menu: {
    importJson: {
      text: "Import JSON",
      onClick: importFromJson
    },
    exportJson: {
      text: "Export Kompakt-JSON",
      onClick: exportToJsonSmall
    },
    exportJsonDetailed: {
      text: "Export Detail-JSON",
      onClick: exportToJsonLarge
    },
  }
});

// Custom field rendering: Combine fields for display
chart.onField((args) => {
  if (args.name === "header") {
    args.value = `${args.data.Mitgliedsnummer}. ${args.data.Name}`;
  } else if (args.name === "stufe") {
    args.value = `${args.data.Stufe} (${args.data.Provision}%)`;
  } else if (args.name === "details") {
    args.value = `\$${args.data.Einsatz} (${args.data.Eigenanteil}%)`;
  }
  recompute();
});

// Trigger recomputation after drag/drop
chart.onDrop((args) => {
  recompute();
  return true;
});

/*
// Trigger recomputation after edit (when Mitgliedsnummer or Einsatz changes)
chart.editUI.on('fieldchanged', (sender, args) => {
  if (args.fieldName === 'Mitgliedsnummer' || args.fieldName === 'Einsatz') {
    // Update node ID influenced by Mitgliedsnummer (e.g., prefix for uniqueness and ordering)
    let node = chart.getNode(args.nodeId);
    node.id = `${args.data.Mitgliedsnummer}-${OrgChart.randomId()}`; // Influences order[5][8]
    window.setTimeout(() => {
      let updatedNodes = computeFields(chart.nodes);
      chart.load(updatedNodes);
    }, 100)
  }
});
 */

chart.onAddNode((args) => {
  args.data.Name = "Neuer Name";
  args.data.Mitgliedsnummer = Math.floor(Math.random() * 9000 + 1000);
  args.data.Einsatz = 0;
  args.data.Eigenvolumen = 0;
  args.data.Teamvolumen = 0;
  args.data.Stufe = 'Nova';
  args.data.id = args.data.Mitgliedsnummer;
  recompute();
});

chart.on("added", function (sender, id) {
  sender.editUI.show(id);
});

chart.onRemoveNode((args) => {
  recompute();
});

function exportToJsonSmall() {
  const nodesJson = JSON.stringify(nodes.map(node => ({
    id: node.id,
    pid: node.pid,
    Name: node.Name,
    Einsatz: node.Einsatz,
  })));
  navigator.clipboard.writeText(nodesJson).then(() => {
  }).catch(err => {
    console.error("Failed to copy: ", err);
    alert("Failed to copy JSON to clipboard.");
  });
}
function exportToJsonLarge() {
  const nodesJson = JSON.stringify(nodes);
  navigator.clipboard.writeText(nodesJson).then(() => {
  }).catch(err => {
    console.error("Failed to copy: ", err);
    alert("Failed to copy JSON to clipboard.");
  });
}

function importFromJson() {
  const jsonInput = prompt("Paste your JSON nodes array here:");
  if (jsonInput) {
    try {
      nodes = JSON.parse(jsonInput).map(node => ({
        ...node, Mitgliedsnummer: node.Mitgliedsnummer ?? node.id
      }));
      nodes = computeFields(nodes);
      chart.load(nodes);
    } catch (err) {
      console.error("Invalid JSON: ", err);
      alert("Invalid JSON format. Please check and try again.");
    }
  }
}
