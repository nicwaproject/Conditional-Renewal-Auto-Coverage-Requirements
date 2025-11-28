/* CONFIG */
const endpointURL = ""; // set to your server endpoint when ready

/* Cached DOM */
const changeTypeGroup = document.getElementById('changeTypeGroup');
const addVehicleSection = document.getElementById('addVehicleSection');
const removeVehicleSection = document.getElementById('removeVehicleSection');
const updateVehicleSection = document.getElementById('updateVehicleSection');
const otherChangeSection = document.getElementById('otherChangeSection');

const addVehicleBtn = document.getElementById('addVehicleBtn');
const vehicleList = document.getElementById('vehicleList');

const symbolsAck = document.getElementById('symbolsAck');

const contactName = document.getElementById('contactName');
const contactEmail = document.getElementById('contactEmail');
const contactPhone = document.getElementById('contactPhone');

const finalConfirm = document.getElementById('finalConfirm');

const previewModal = document.getElementById('previewModal');
const previewBody = document.getElementById('previewBody');
const closePreview = document.getElementById('closePreview');
const editBtn = document.getElementById('editBtn');
const confirmSubmitBtn = document.getElementById('confirmSubmitBtn');
const previewBtn = document.getElementById('previewBtn');

const statusMsg = document.getElementById('statusMsg');
const autoForm = document.getElementById('autoForm');

/* Helpers */
function show(el){ if(el) el.classList.remove('hidden'); }
function hide(el){ if(el) el.classList.add('hidden'); }
function escapeHtml(str){ return (str+'').replace(/[&<>"]/g, s=> ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[s])); }

/* --------------------------
   Change type logic (show/hide)
---------------------------*/
function evaluateChangeTypeSections(){
  const checked = Array.from(document.querySelectorAll('input[name="changeType"]'))
    .filter(cb => cb.checked).map(cb => cb.value);

  // Add Vehicle
  if(checked.includes('add')) show(addVehicleSection); else hide(addVehicleSection);

  // Remove Vehicle
  if(checked.includes('remove')) show(removeVehicleSection); else hide(removeVehicleSection);

  // Update Vehicle
  if(checked.includes('update')) show(updateVehicleSection); else hide(updateVehicleSection);

  // Other
  if(checked.includes('other')) show(otherChangeSection); else hide(otherChangeSection);
}

document.querySelectorAll('input[name="changeType"]').forEach(cb => {
  cb.addEventListener('change', evaluateChangeTypeSections);
});
evaluateChangeTypeSections();

/* --------------------------
   Vehicle row template & handlers
---------------------------*/
function createVehicleRow(data = {}) {
  const id = 'veh_' + Date.now() + Math.floor(Math.random()*1000);
  const wrapper = document.createElement('div');
  wrapper.className = 'vehicle-row section';
  wrapper.dataset.id = id;
  wrapper.innerHTML = `
    <div style="display:flex;gap:10px;align-items:center;justify-content:space-between;">
      <div class="sub-section-title">Vehicle</div>
      <button type="button" class="btn secondary small remove-vehicle-btn">Remove</button>
    </div>

    <div style="margin-top:8px;">
      <input class="answer veh-year" placeholder="Year" value="${data.year||''}">
      <input class="answer veh-make" placeholder="Make" style="margin-top:8px;" value="${data.make||''}">
      <input class="answer veh-model" placeholder="Model" style="margin-top:8px;" value="${data.model||''}">
      <input class="answer veh-vin" placeholder="VIN" style="margin-top:8px;" value="${data.vin||''}">
      <input class="answer veh-garage" placeholder="Garaging address" style="margin-top:8px;" value="${data.garaging||''}">
      <div class="label-container">
        <label class="sub-section-title">Effective date to add</label>
        <input class="answer veh-effdate" type="date" style="margin-top:6px;" value="${data.effdate||''}">
         <input class="answer veh-driver" placeholder="Driver name (optional)" style="margin-top:8px;" value="${data.driver||''}">
      </div>
      <div class="label-container">
        <label class="sub-section-title">Vehicle use</label>
        <select class="answer veh-use" style="margin-top:6px;">
            <option value="">-- select --</option>
            <option value="business"${data.use==='business'?' selected':''}>Business</option>
            <option value="personal"${data.use==='personal'?' selected':''}>Personal</option>
            <option value="both"${data.use==='both'?' selected':''}>Both</option>
        </select>
      </div>
      <div style="margin-top:8px;">
        <input type="file" class="answer veh-doc">
        <div class="intro">Upload supporting document (optional)</div>
      </div>
    </div>
  `;

  // remove handler
  wrapper.querySelector('.remove-vehicle-btn').addEventListener('click', () => {
    wrapper.remove();
  });

  return wrapper;
}

addVehicleBtn.addEventListener('click', ()=>{
  const row = createVehicleRow();
  vehicleList.appendChild(row);
  // scroll to new row
  row.scrollIntoView({behavior:'smooth', block:'center'});
});

// initialize with one blank row for UX
vehicleList.appendChild(createVehicleRow());

/* --------------------------
   Preview logic
---------------------------*/
function collectVisibleSectionsForPreview() {
  const rows = [];

  // Intro & symbol ack
  rows.push({
    label: 'Acknowledgment (Symbols 7/8/9)',
    value: symbolsAck.checked ? 'Acknowledged' : '(not acknowledged)'
  });

  // Change types
  const changeTypes = Array.from(document.querySelectorAll('input[name="changeType"]'))
    .filter(cb=>cb.checked).map(cb=>cb.parentElement.textContent.trim());
  rows.push({label: 'Change types selected', value: changeTypes.length ? changeTypes.join(', ') : '(none)'});

  // Add vehicles
  if(!addVehicleSection.classList.contains('hidden')){
    const vehicleRows = Array.from(vehicleList.querySelectorAll('.vehicle-row'));
    if(vehicleRows.length){
      vehicleRows.forEach((vr, i) => {
        const year = vr.querySelector('.veh-year').value.trim();
        const make = vr.querySelector('.veh-make').value.trim();
        const model = vr.querySelector('.veh-model').value.trim();
        const vin = vr.querySelector('.veh-vin').value.trim();
        const garaging = vr.querySelector('.veh-garage').value.trim();
        const effdate = vr.querySelector('.veh-effdate').value;
        const use = vr.querySelector('.veh-use').value;
        const driver = vr.querySelector('.veh-driver').value.trim();

        const vlabel = `Vehicle ${i+1}`;
        const vvalue = `Year: ${year||'(n/a)'}; Make: ${make||'(n/a)'}; Model: ${model||'(n/a)'}; VIN: ${vin||'(n/a)'}; Garaging: ${garaging||'(n/a)'}; Effective: ${effdate||'(n/a)'}; Use: ${use||'(n/a)'}; Driver: ${driver||'(n/a)'}`;
        rows.push({label: vlabel, value: vvalue});
      });
    } else {
      rows.push({label:'Add vehicles', value:'(no vehicles added)'});
    }
  }

  // Remove vehicle
  if(!removeVehicleSection.classList.contains('hidden')){
    const which = document.getElementById('removeWhich').value.trim();
    const rdate = document.getElementById('removeDate').value;
    const reason = document.getElementById('removeReason').value;
    rows.push({label: 'Remove vehicle - which', value: which || '(not provided)'});
    rows.push({label: 'Remove effective date', value: rdate || '(not provided)'});
    rows.push({label: 'Remove reason', value: reason || '(not provided)'});
  }

  // Update vehicle
  if(!updateVehicleSection.classList.contains('hidden')){
    const corrType = document.getElementById('correctionType').value;
    const updatedInfo = document.getElementById('updatedInfo').value.trim();
    const updDate = document.getElementById('updateEffDate').value;
    rows.push({label: 'Correction type', value: corrType || '(not provided)'});
    rows.push({label: 'Updated information', value: updatedInfo || '(not provided)'});
    rows.push({label: 'Update effective date', value: updDate || '(not provided)'});
  }

  // Other change
  if(!otherChangeSection.classList.contains('hidden')){
    const otherDesc = document.getElementById('otherChangeDesc').value.trim();
    rows.push({label:'Other change detail', value: otherDesc || '(not provided)'});
  }

  // Contact
  rows.push({label: 'Contact name', value: contactName.value.trim() || '(not provided)'});
  rows.push({label: 'Contact email', value: contactEmail.value.trim() || '(not provided)'});
  rows.push({label: 'Contact phone', value: contactPhone.value.trim() || '(not provided)'});

  // Final confirmation
  rows.push({label: 'Final confirmation', value: finalConfirm.checked ? 'Confirmed' : '(not confirmed)'});

  return rows;
}

function showPreviewModal() {
  const rows = collectVisibleSectionsForPreview();
  const html = rows.map(r => `
    <div class="preview-row">
      <div class="preview-label">${escapeHtml(r.label)}</div>
      <div class="preview-value">${escapeHtml(r.value)}</div>
    </div>
  `).join('');
  previewBody.innerHTML = html;
  show(previewModal);
}

/* Preview triggers */
previewBtn.addEventListener('click', (ev)=>{
  ev.preventDefault();
  // minimal checks
  if(!symbolsAck.checked){
    if(!confirm('Acknowledgment is not checked. Show preview anyway?')) return;
  }
  if(!Array.from(document.querySelectorAll('input[name="changeType"]')).some(cb=>cb.checked)){
    if(!confirm('No change type selected. Show preview anyway?')) return;
  }
  showPreviewModal();
});
closePreview.addEventListener('click', ()=> hide(previewModal));
editBtn.addEventListener('click', ()=> hide(previewModal));

/* --------------------------
   Build payload & validation
---------------------------*/
function buildPayload(){
  const payload = {};
  payload.symbolsAck = !!symbolsAck.checked;
  payload.changeTypes = Array.from(document.querySelectorAll('input[name="changeType"]')).filter(cb=>cb.checked).map(cb=>cb.value);

  // vehicles
  payload.addVehicles = [];
  if(!addVehicleSection.classList.contains('hidden')){
    const vehicleRows = Array.from(vehicleList.querySelectorAll('.vehicle-row'));
    vehicleRows.forEach(vr=>{
      payload.addVehicles.push({
        year: vr.querySelector('.veh-year').value.trim(),
        make: vr.querySelector('.veh-make').value.trim(),
        model: vr.querySelector('.veh-model').value.trim(),
        vin: vr.querySelector('.veh-vin').value.trim(),
        garaging: vr.querySelector('.veh-garage').value.trim(),
        effectiveDate: vr.querySelector('.veh-effdate').value || '',
        driver: vr.querySelector('.veh-driver').value.trim(),
        use: vr.querySelector('.veh-use').value || ''
      });
    });
  }

  if(!removeVehicleSection.classList.contains('hidden')){
    payload.removeWhich = document.getElementById('removeWhich').value.trim();
    payload.removeDate = document.getElementById('removeDate').value || '';
    payload.removeReason = document.getElementById('removeReason').value || '';
  }

  if(!updateVehicleSection.classList.contains('hidden')){
    payload.correctionType = document.getElementById('correctionType').value || '';
    payload.updatedInfo = document.getElementById('updatedInfo').value.trim();
    payload.updateEffectiveDate = document.getElementById('updateEffDate').value || '';
  }

  if(!otherChangeSection.classList.contains('hidden')){
    payload.otherChangeDesc = document.getElementById('otherChangeDesc').value.trim();
  }

  payload.contact = {
    name: contactName.value.trim(),
    email: contactEmail.value.trim(),
    phone: contactPhone.value.trim()
  };

  payload.finalConfirm = !!finalConfirm.checked;
  payload.submittedAt = new Date().toISOString();

  return payload;
}

/* Minimal validation rules */
function validateForm(){
  // symbols ack
  if(!symbolsAck.checked){ alert('Please acknowledge the symbols statement.'); return false; }

  // change type
  if(!Array.from(document.querySelectorAll('input[name="changeType"]')).some(cb=>cb.checked)){
    alert('Please select at least one change type.'); return false;
  }

  // primary contact
  if(!contactName.value.trim()){ alert('Please enter contact name.'); return false; }
  if(!contactEmail.value.trim()){ alert('Please enter contact email.'); return false; }
  if(!contactPhone.value.trim()){ alert('Please enter contact phone.'); return false; }

  // if add selected, ensure at least one vehicle with required fields
  if(!addVehicleSection.classList.contains('hidden')){
    const vehicleRows = Array.from(vehicleList.querySelectorAll('.vehicle-row'));
    if(vehicleRows.length === 0){ alert('Please add at least one vehicle or uncheck Add a vehicle.'); return false; }
    for(const vr of vehicleRows){
      const year = vr.querySelector('.veh-year').value.trim();
      const make = vr.querySelector('.veh-make').value.trim();
      const model = vr.querySelector('.veh-model').value.trim();
      const vin = vr.querySelector('.veh-vin').value.trim();
      const garaging = vr.querySelector('.veh-garage').value.trim();
      const eff = vr.querySelector('.veh-effdate').value;
      if(!year || !make || !model || !vin || !garaging || !eff){
        alert('Please fill required fields for each vehicle: Year, Make, Model, VIN, Garaging, Effective date.');
        return false;
      }
    }
  }

  // if remove selected, which and date required
  if(!removeVehicleSection.classList.contains('hidden')){
    if(!document.getElementById('removeWhich').value.trim()){ alert('Please indicate which vehicle to remove.'); return false; }
    if(!document.getElementById('removeDate').value){ alert('Please provide effective date for removal.'); return false; }
  }

  // if update selected, correction type and updated info required
  if(!updateVehicleSection.classList.contains('hidden')){
    if(!document.getElementById('correctionType').value){ alert('Please select a correction type.'); return false; }
    if(!document.getElementById('updatedInfo').value.trim()){ alert('Please provide the updated information.'); return false; }
  }

  // final confirmation
  if(!finalConfirm.checked){ alert('Please confirm the information provided.'); return false; }

  return true;
}

/* Submit flows */
autoForm.addEventListener('submit', (ev)=>{
  ev.preventDefault();
  if(!validateForm()) return;

  const payload = buildPayload();

  // if no endpoint, show JSON in statusMsg
  if(!endpointURL){
    statusMsg.innerHTML = `<strong>No endpoint configured.</strong>
      <pre style="white-space:pre-wrap;">${escapeHtml(JSON.stringify(payload, null, 2))}</pre>`;
    statusMsg.classList.remove('hidden');
    statusMsg.setAttribute('aria-hidden','false');
    window.scrollTo({top: statusMsg.offsetTop - 20, behavior:'smooth'});
    return;
  }

  // otherwise post
  (async ()=>{
    try {
      const res = await fetch(endpointURL, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(payload)
      });
      if(!res.ok) throw new Error('Server error');
      statusMsg.innerHTML = `<strong>Successfully submitted!</strong>`;
      statusMsg.classList.remove('hidden');
    } catch(err){
      statusMsg.innerHTML = `<strong>Submission failed:</strong> ${err.message}`;
      statusMsg.classList.remove('hidden');
    }
    window.scrollTo({top: statusMsg.offsetTop - 20, behavior:'smooth'});
  })();
});

/* Confirm submit from preview modal */
confirmSubmitBtn.addEventListener('click', async ()=>{
  hide(previewModal);
  if(!validateForm()) return;
  const payload = buildPayload();

  if(!endpointURL){
    statusMsg.innerHTML = `<strong>No endpoint configured.</strong>
      <pre style="white-space:pre-wrap;">${escapeHtml(JSON.stringify(payload, null, 2))}</pre>`;
    statusMsg.classList.remove('hidden');
    return;
  }

  try {
    const res = await fetch(endpointURL, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    });
    if(!res.ok) throw new Error('Server error');
    statusMsg.innerHTML = `<strong>Successfully submitted!</strong>`;
    statusMsg.classList.remove('hidden');
  } catch(err){
    statusMsg.innerHTML = `<strong>Submission failed:</strong> ${err.message}`;
    statusMsg.classList.remove('hidden');
  }
});

/* Initialize */
evaluateChangeTypeSections();