const AudioService = {
  voice: null,
  
  init: function() {
    const bindVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) return;

      // Strictly search for fr-FR (standard cross-browser explicit match)
      const exactFrMatch = voices.find(v => v.lang === 'fr-FR' || v.lang === 'fr_FR');
      const warningIcon = document.getElementById("audio-warning");
      
      if (exactFrMatch) {
         this.voice = exactFrMatch;
         console.log(`[AudioService] Bound to strict fr-FR voice: ${this.voice.name}`);
         if (warningIcon) warningIcon.classList.add("hidden");
      } else {
         // Fallback to any French that explicitly is NOT Canadian
         const safeFallback = voices.find(v => v.lang.startsWith('fr') && !v.lang.includes('CA') && !v.lang.includes('ca'));
         this.voice = safeFallback || null;
         if (this.voice) {
             console.log(`[AudioService] Bound to fallback French voice: ${this.voice.name} (${this.voice.lang})`);
             if (warningIcon) warningIcon.classList.add("hidden");
         } else {
             console.warn("[AudioService] WARNING: No suitable French voice found on your Windows installation.");
             if (warningIcon) warningIcon.classList.remove("hidden");
         }
      }
    };

    bindVoice();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = bindVoice;
    }
  },

  speak: function(text) {
    if (!text || !window.speechSynthesis) return;

    // Refresh the voices array to ensure our voice reference isn't a stale C++ pointer (known Chromium bug)
    const voices = window.speechSynthesis.getVoices();
    const liveVoice = this.voice ? voices.find(v => v.name === this.voice.name) : null;

    window.currentUtterance = new SpeechSynthesisUtterance(text);
    
    if (liveVoice) {
      window.currentUtterance.voice = liveVoice;
    } else {
      window.currentUtterance.lang = "fr-FR"; // Absolute fallback
    }

    // Explicitly leaving out .rate = 0.9 and .cancel() queues, as Microsoft SAPI voices often silently crash when modified via Web API floats.
    console.log(`[AudioService] Firing raw utterance via ${liveVoice ? liveVoice.name : 'System Default'}`);
    
    window.speechSynthesis.speak(window.currentUtterance);
  }
};
