class FlipClockCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  setConfig(config) {
    if (!config) {
      throw new Error('Invalid configuration');
    }
    this.config = config;
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
    this.updateTime();
  }

  connectedCallback() {
    this.updateInterval = setInterval(() => this.updateTime(), 1000);
  }

  disconnectedCallback() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }

  updateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    const use24Hour = this.config.use_24_hour !== false;
    
    let displayHours = hours;
    let ampm = '';
    
    if (!use24Hour) {
      const hour = parseInt(hours);
      displayHours = String(hour % 12 || 12).padStart(2, '0');
      ampm = hour >= 12 ? 'PM' : 'AM';
    }
    
    this.updateDigit('hour1', displayHours[0]);
    this.updateDigit('hour2', displayHours[1]);
    this.updateDigit('min1', minutes[0]);
    this.updateDigit('min2', minutes[1]);
    
    if (ampm && this.shadowRoot.querySelector('.ampm')) {
      this.shadowRoot.querySelector('.ampm').textContent = ampm;
    }
  }

  updateDigit(id, value) {
    const digit = this.shadowRoot.getElementById(id);
    if (digit && digit.textContent !== value) {
      digit.classList.add('flip');
      setTimeout(() => {
        digit.textContent = value;
        setTimeout(() => digit.classList.remove('flip'), 300);
      }, 150);
    }
  }

  render() {
    const use24Hour = this.config.use_24_hour !== false;
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          padding: 20px;
        }
        
        .flip-clock {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
          font-family: 'Roboto', sans-serif;
          background: var(--ha-card-background, var(--card-background-color, #fff));
          border-radius: var(--ha-card-border-radius, 12px);
          padding: 30px;
          box-shadow: var(--ha-card-box-shadow, 0 2px 8px rgba(0,0,0,0.1));
        }
        
        .digit-group {
          display: flex;
          gap: 5px;
        }
        
        .digit {
          background: linear-gradient(180deg, #2c2c2c 0%, #1a1a1a 100%);
          color: #fff;
          font-size: 72px;
          font-weight: bold;
          width: 70px;
          height: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          position: relative;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          overflow: hidden;
        }
        
        .digit::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 2px;
          background: rgba(0,0,0,0.3);
          z-index: 1;
        }
        
        .digit.flip {
          animation: flip 0.6s ease-in-out;
        }
        
        @keyframes flip {
          0% { transform: rotateX(0deg); }
          50% { transform: rotateX(-90deg); }
          100% { transform: rotateX(0deg); }
        }
        
        .separator {
          font-size: 72px;
          font-weight: bold;
          color: var(--primary-text-color, #000);
          margin: 0 5px;
          padding-bottom: 10px;
        }
        
        .ampm {
          font-size: 24px;
          font-weight: bold;
          color: var(--primary-text-color, #000);
          margin-left: 10px;
          align-self: flex-end;
          padding-bottom: 20px;
        }
      </style>
      
      <ha-card>
        <div class="flip-clock">
          <div class="digit-group">
            <div class="digit" id="hour1">0</div>
            <div class="digit" id="hour2">0</div>
          </div>
          <span class="separator">:</span>
          <div class="digit-group">
            <div class="digit" id="min1">0</div>
            <div class="digit" id="min2">0</div>
          </div>
          ${!use24Hour ? '<span class="ampm">AM</span>' : ''}
        </div>
      </ha-card>
    `;
  }

  getCardSize() {
    return 3;
  }

  static getConfigElement() {
    return document.createElement('flip-clock-card-editor');
  }

  static getStubConfig() {
    return {
      use_24_hour: true
    };
  }
}

// Config editor
class FlipClockCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = config;
    this.render();
  }

  configChanged(newConfig) {
    const event = new Event('config-changed', {
      bubbles: true,
      composed: true,
    });
    event.detail = { config: newConfig };
    this.dispatchEvent(event);
  }

  render() {
    if (!this._config) return;
    
    this.innerHTML = `
      <div style="padding: 20px;">
        <ha-formfield label="Use 24-Hour Format">
          <ha-switch
            .checked=${this._config.use_24_hour !== false}
            @change=${(e) => {
              this._config = { ...this._config, use_24_hour: e.target.checked };
              this.configChanged(this._config);
            }}
          ></ha-switch>
        </ha-formfield>
      </div>
    `;
  }
}

customElements.define('flip-clock-card', FlipClockCard);
customElements.define('flip-clock-card-editor', FlipClockCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'flip-clock-card',
  name: 'Flip Clock Card',
  description: 'A beautiful flip clock display for Home Assistant',
  preview: true,
  documentationURL: 'https://github.com/yourusername/flip-clock-card',
});

console.info(
  '%c FLIP-CLOCK-CARD %c Version 1.0.0 ',
  'color: white; background: #00a8e8; font-weight: 700;',
  'color: white; background: #333; font-weight: 700;'
);
