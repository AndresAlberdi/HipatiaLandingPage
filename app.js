/* ==========================================
   INTERACTIVIDAD Y ANIMACIONES - HIPATIA
   ========================================== */

import { saveLead } from './src/services/leadService.js';
import { askGeminiSupport } from './src/services/aiSupport.js';

document.addEventListener('DOMContentLoaded', () => {

  // 0. Manejo del Tema Día / Noche (Light / Dark Mode)
  const themeToggle = document.getElementById('theme-toggle');
  const savedTheme = localStorage.getItem('hipatia_theme') || 'dark';
  
  applyTheme(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
      localStorage.setItem('hipatia_theme', newTheme);
    });
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (themeToggle) {
      const icon = themeToggle.querySelector('.material-icons-round');
      if (icon) {
        icon.textContent = theme === 'dark' ? 'light_mode' : 'dark_mode';
      }
    }
  }

  // 1. Manejo del Header al hacer scroll
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // 2. Menú de Navegación Móvil
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link, .nav-menu .btn');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      const isExpanded = navMenu.classList.contains('active');
      mobileToggle.querySelector('.material-icons-round').textContent = isExpanded ? 'close' : 'menu';
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        mobileToggle.querySelector('.material-icons-round').textContent = 'menu';
      });
    });
  }

  // 3. Animaciones de entrada en Scroll (Intersection Observer)
  const animateElements = document.querySelectorAll('.animate-on-scroll');
  
  const scrollObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('appear');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  animateElements.forEach(element => {
    scrollObserver.observe(element);
  });

  // 4. Simulación del Sistema Hipatia Puntos
  const ptsCounter = document.getElementById('pts-counter');
  const simAddPointsBtn = document.getElementById('sim-add-points');
  const historyList = document.querySelector('.app-history');
  
  let currentPoints = 750;
  
  if (simAddPointsBtn && ptsCounter && historyList) {
    simAddPointsBtn.addEventListener('click', () => {
      simAddPointsBtn.disabled = true;
      simAddPointsBtn.textContent = 'Procesando QR...';
      
      setTimeout(() => {
        let addedPoints = 150;
        currentPoints += addedPoints;
        
        animateCounter(parseInt(ptsCounter.textContent), currentPoints, 800);
        
        const newItem = document.createElement('div');
        newItem.className = 'history-item';
        newItem.style.animation = 'fadeIn 0.5s ease forwards';
        
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        newItem.innerHTML = `
          <div>
            <p class="history-name">Escaneo Exitoso</p>
            <p style="font-size: 0.6rem; color: var(--color-text-secondary);">${timeStr} - QR Autenticado</p>
          </div>
          <span class="history-pts" style="color: var(--color-lila)">+${addedPoints} PTS</span>
        `;
        
        historyList.insertBefore(newItem, historyList.children[1]);
        
        if (currentPoints >= 1000) {
          setTimeout(() => {
            alert('🎉 ¡Felicidades! Has acumulado suficientes puntos. Generando QR de premio...');
            
            const redemptionItem = document.createElement('div');
            redemptionItem.className = 'history-item';
            redemptionItem.style.animation = 'fadeIn 0.5s ease forwards';
            redemptionItem.innerHTML = `
              <div>
                <p class="history-name" style="color: var(--color-verde)">Premio Canjeado</p>
                <p style="font-size: 0.6rem; color: var(--color-text-secondary);">Código de Canje Utilizado</p>
              </div>
              <span class="history-pts" style="color: #ef4444">-900 PTS</span>
            `;
            
            historyList.insertBefore(redemptionItem, historyList.children[1]);
            
            const prevPoints = currentPoints;
            currentPoints -= 900;
            animateCounter(prevPoints, currentPoints, 800);
          }, 2000);
        }
        
        simAddPointsBtn.disabled = false;
        simAddPointsBtn.textContent = 'Simular Escaneo (+150 pts)';
      }, 2000);
    });
  }
  
  function animateCounter(start, end, duration) {
    const range = end - start;
    let current = start;
    const increment = range > 0 ? 10 : -10;
    const stepTime = Math.abs(Math.floor(duration / (range / increment)));
    
    const timer = setInterval(() => {
      current += increment;
      if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
        current = end;
        clearInterval(timer);
      }
      ptsCounter.textContent = current;
    }, stepTime || 20);
  }

  // 5. Manejo del Formulario de Contacto (Leads -> hipatia.admin@gmail.com)
  const contactForm = document.getElementById('landing-contact-form');
  const formSuccess = document.getElementById('form-success');
  const resetFormBtn = document.getElementById('reset-form-btn');
  const serviceSelect = document.getElementById('service');

  if (serviceSelect) {
    serviceSelect.addEventListener('change', () => {
      if (serviceSelect.value !== "") {
        serviceSelect.classList.add('selected');
      } else {
        serviceSelect.classList.remove('selected');
      }
    });
  }

  if (contactForm && formSuccess) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;
      
      submitBtn.disabled = true;
      submitBtn.innerHTML = `Enviando a Hipatia... <span class="material-icons-round btn-icon" style="animation: float 1s infinite;">hourglass_empty</span>`;
      
      const leadData = {
        name: document.getElementById('name')?.value || '',
        company: document.getElementById('company')?.value || '',
        email: document.getElementById('email')?.value || '',
        service: document.getElementById('service')?.value || '',
        message: document.getElementById('message')?.value || ''
      };

      try {
        await saveLead(leadData);
        formSuccess.style.display = 'flex';
      } catch (err) {
        console.error("Error al guardar lead:", err);
        formSuccess.style.display = 'flex';
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
    });
  }

  if (resetFormBtn && contactForm && formSuccess) {
    resetFormBtn.addEventListener('click', () => {
      formSuccess.style.display = 'none';
      contactForm.reset();
      if (serviceSelect) {
        serviceSelect.style.color = "var(--color-text-secondary)";
      }
    });
  }

  // 6. Lógica del Agente de Atención al Cliente AI (Gemini 1.5 Flash - Zero-Database RAG)
  const aiChatToggle = document.getElementById('ai-chat-toggle');
  const aiChatWindow = document.getElementById('ai-chat-window');
  const aiChatClose = document.getElementById('ai-chat-close');
  const aiChatForm = document.getElementById('ai-chat-form');
  const aiChatInput = document.getElementById('ai-chat-input');
  const aiChatBody = document.getElementById('ai-chat-body');

  const chatHistory = [];

  if (aiChatToggle && aiChatWindow && aiChatClose) {
    aiChatToggle.addEventListener('click', () => {
      aiChatWindow.classList.toggle('active');
      if (aiChatWindow.classList.contains('active')) {
        aiChatInput?.focus();
      }
    });

    aiChatClose.addEventListener('click', () => {
      aiChatWindow.classList.remove('active');
    });
  }

  // Chips de preguntas sugeridas
  document.addEventListener('click', (e) => {
    if (e.target && e.target.classList.contains('ai-chip')) {
      const queryText = e.target.getAttribute('data-query');
      if (queryText && aiChatInput) {
        aiChatInput.value = queryText;
        aiChatForm.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    }
  });

  if (aiChatForm && aiChatInput && aiChatBody) {
    aiChatForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const userText = aiChatInput.value.trim();
      if (!userText) return;

      // 1. Renderizar mensaje del usuario
      appendChatMessage('user', userText);
      aiChatInput.value = '';

      // 2. Indicador de cargando bot
      const loadingMsgEl = appendChatMessage('bot', 'Analizando manuales de Hipatia... 🤖');
      
      try {
        const botResponse = await askGeminiSupport(userText, chatHistory);
        loadingMsgEl.remove();
        appendChatMessage('bot', botResponse);

        // Guardar en historial
        chatHistory.push({ sender: 'user', text: userText });
        chatHistory.push({ sender: 'bot', text: botResponse });
      } catch (err) {
        console.error("Error en chat IA:", err);
        loadingMsgEl.remove();
        appendChatMessage('bot', 'No pude procesar la respuesta. Si deseas ayuda inmediata escríbenos a **hola@hipatia.bo**.');
      }
    });
  }

  function appendChatMessage(sender, text) {
    const msgEl = document.createElement('div');
    msgEl.className = `ai-msg ai-msg-${sender}`;
    // Convertir **negrita** simple
    const formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    msgEl.innerHTML = formattedText;
    aiChatBody.appendChild(msgEl);
    aiChatBody.scrollTop = aiChatBody.scrollHeight;
    return msgEl;
  }

});
