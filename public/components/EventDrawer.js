// EventDrawer.js: Drawer/modal for event intelligence

export function renderEventDrawer(event) {
  // Remove any existing drawer
  const root = document.getElementById('eventDrawerRoot');
  root.innerHTML = '';

  // Drawer container
  const drawer = document.createElement('div');
  drawer.className = 'fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-40';
  drawer.innerHTML = `
    <div class="w-full max-w-md bg-white rounded-t-2xl shadow-lg p-6 animate-slide-up">
      <div class="flex items-center mb-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-purple-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2" fill="none"/></svg>
        <span class="font-bold text-lg">${event.title}</span>
        <button id="closeDrawerBtn" class="ml-auto text-gray-400 hover:text-gray-700"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/><line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/></svg></button>
      </div>
      <div class="text-sm text-gray-500 mb-2">${new Date(event.datetime).toLocaleString()}</div>
      <div class="mb-4">
        <div class="font-semibold mb-1">Summary</div>
        <div class="text-gray-700">${event.summary || 'No summary available.'}</div>
      </div>
      <div class="mb-4">
        <div class="font-semibold mb-1">Prep Checklist</div>
        <ul class="list-disc pl-5 text-gray-700">
          ${(event.checklist || []).map(item => `<li>${item}</li>`).join('') || '<li>No checklist.</li>'}
        </ul>
      </div>
      <div class="flex flex-wrap gap-2 mb-4">
        <button class="flex items-center px-3 py-1 bg-blue-600 text-white rounded shadow hover:bg-blue-700 focus:outline-none" id="shareSpouseBtn">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M17 16v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2" stroke="currentColor" stroke-width="2" fill="none"/><polyline points="15 3 21 3 21 9" stroke="currentColor" stroke-width="2" fill="none"/><line x1="10" y1="14" x2="21" y2="3" stroke="currentColor" stroke-width="2"/></svg>
          Share with Spouse
        </button>
        <button class="flex items-center px-3 py-1 bg-green-600 text-white rounded shadow hover:bg-green-700 focus:outline-none" id="reframeBtn">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 20h9" stroke="currentColor" stroke-width="2" fill="none"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5z" stroke="currentColor" stroke-width="2" fill="none"/></svg>
          Reframe This
        </button>
        ${(event.tags || []).includes('birthday') || (event.tags || []).includes('party') ? `<button class="flex items-center px-3 py-1 bg-yellow-500 text-white rounded shadow hover:bg-yellow-600 focus:outline-none" id="buyGiftBtn">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="2" y="7" width="20" height="13" rx="2" stroke="currentColor" stroke-width="2" fill="none"/><path d="M12 7V3" stroke="currentColor" stroke-width="2" fill="none"/><path d="M7 7V3" stroke="currentColor" stroke-width="2" fill="none"/><path d="M17 7V3" stroke="currentColor" stroke-width="2" fill="none"/></svg>
          Buy Gift
        </button>` : ''}
      </div>
    </div>
  `;
  root.appendChild(drawer);
  document.getElementById('closeDrawerBtn').onclick = () => { root.innerHTML = ''; };
  // TODO: Wire up action buttons (share, reframe, buy gift) as needed
}
