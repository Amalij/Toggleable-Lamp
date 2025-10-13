const {
    gsap,
    gsap:{
        registerPlugin, set, to, timeline 
    },
    MorphSVGPlugin,
  Draggable } = window;
registerPlugin(MorphSVGPlugin);

 
const AUDIO = {
    CLICK: new Audio('https://assets.codepen.io/605876/click.mp3'),
    SWITCH_ON: new Audio('https://assets.codepen.io/605876/switch-on.mp3'),
    SWITCH_OFF: new Audio('https://assets.codepen.io/605876/switch-off.mp3'),
    HUM: new Audio('https://assets.codepen.io/605876/hum.mp3')
};

 
AUDIO.HUM.loop = true;
AUDIO.HUM.volume = 0.3;

const ON = document.querySelector('#on');
const OFF = document.querySelector('#off'); 

let startX;
let startY;

const PROXY = document.createElement('div');

const CORDS = gsap.utils.toArray('.cords path');
const CORD_DURATION = 0.1;
const HIT = document.querySelector('.lamp__hit');
const DUMMY_CORD = document.querySelector('.cord--dummy');
const ENDX = DUMMY_CORD.getAttribute('x2');
const ENDY = DUMMY_CORD.getAttribute('y2');

 
const SETTINGS_PANEL = document.querySelector('.settings-panel');
const SETTINGS_TOGGLE = document.querySelector('#settings-toggle');
const CLOSE_SETTINGS = document.querySelector('#close-settings');
const LAMP_STYLE_SELECT = document.querySelector('#lamp-style');
const LIGHT_INTENSITY_SLIDER = document.querySelector('#light-intensity');
const AMBIENT_LIGHT_CHECKBOX = document.querySelector('#ambient-light');
const SOUND_EFFECTS_CHECKBOX = document.querySelector('#sound-effects');
const AMBIENT_LIGHT_ELEMENT = document.querySelector('.ambient-light');
const LAMP_ELEMENT = document.querySelector('.lamp');

 
const STATE = {
    ON: false,
    SOUND_ENABLED: true,
    AMBIENT_LIGHT_ENABLED: true,
    LIGHT_INTENSITY: 100,
    CURRENT_STYLE: 'classic'
};

const RESET = () => {
  set(PROXY, {
    x: ENDX,
    y: ENDY });
};

RESET();

gsap.set(['.cords', HIT], {
  x: -10 });

gsap.set('.lamp__eye', {
  rotate: 180,
  transformOrigin: '50% 50%',
  yPercent: 50 });
 
const CORD_TL = timeline({
  paused: true,
  onStart: () => {
    STATE.ON = !STATE.ON;
    set(document.documentElement, { '--on': STATE.ON ? 1 : 0 });
    set(document.documentElement, { '--shade-hue': gsap.utils.random(0, 359) });
    set('.lamp__eye', {
      rotate: STATE.ON ? 0 : 180 });

    set([DUMMY_CORD, HIT], { display: 'none' });
    set(CORDS[0], { display: 'block' });
    
 
    if (STATE.SOUND_ENABLED) {
        if (STATE.ON) {
            AUDIO.SWITCH_ON.play();
          
            AUDIO.HUM.play();
        } else {
            AUDIO.SWITCH_OFF.play();
            
            AUDIO.HUM.pause();
            AUDIO.HUM.currentTime = 0;
        }
    }
    
    
    updateAmbientLight();
    
    if (STATE.ON) {
      ON.setAttribute('checked', true);
      OFF.removeAttribute('checked');
    } else {
      ON.removeAttribute('checked');
      OFF.setAttribute('checked', true);
    }
  },
  onComplete: () => {
    set([DUMMY_CORD, HIT], { display: 'block' });
    set(CORDS[0], { display: 'none' });
    RESET();
  } });

for (let i = 1; i < CORDS.length; i++) {
  CORD_TL.add(
  to(CORDS[0], {
    morphSVG: CORDS[i],
    duration: CORD_DURATION,
    repeat: 1,
    yoyo: true }));
}

Draggable.create(PROXY, {
  trigger: HIT,
  type: 'x,y',
  onPress: e => {
    startX = e.x;
    startY = e.y;
  },
  onDrag: function () {
    set(DUMMY_CORD, {
      attr: {
        x2: this.x,
        y2: Math.max(400, this.y) } });
  },
  onRelease: function (e) {
    const DISTX = Math.abs(e.x - startX);
    const DISTY = Math.abs(e.y - startY);
    const TRAVELLED = Math.sqrt(DISTX * DISTX + DISTY * DISTY);
    to(DUMMY_CORD, {
      attr: { x2: ENDX, y2: ENDY },
      duration: CORD_DURATION,
      onComplete: () => {
        if (TRAVELLED > 50) {
          CORD_TL.restart();
        } else {
          RESET();
        }
      } });
  } });

 
SETTINGS_TOGGLE.addEventListener('click', () => {
    SETTINGS_PANEL.classList.add('active');
});

CLOSE_SETTINGS.addEventListener('click', () => {
    SETTINGS_PANEL.classList.remove('active');
});

 
LAMP_STYLE_SELECT.addEventListener('change', (e) => {
    STATE.CURRENT_STYLE = e.target.value;
    LAMP_ELEMENT.className = 'lamp ' + STATE.CURRENT_STYLE;
});

 
LIGHT_INTENSITY_SLIDER.addEventListener('input', (e) => {
    STATE.LIGHT_INTENSITY = e.target.value;
    updateLightIntensity();
});

 
AMBIENT_LIGHT_CHECKBOX.addEventListener('change', (e) => {
    STATE.AMBIENT_LIGHT_ENABLED = e.target.checked;
    updateAmbientLight();
});

 
SOUND_EFFECTS_CHECKBOX.addEventListener('change', (e) => {
    STATE.SOUND_ENABLED = e.target.checked;
   
    if (!STATE.SOUND_ENABLED && STATE.ON) {
        AUDIO.HUM.pause();
        AUDIO.HUM.currentTime = 0;
    } 
    else if (STATE.SOUND_ENABLED && STATE.ON) {
        AUDIO.HUM.play();
    }
});

 
function updateLightIntensity() {
    const intensity = STATE.LIGHT_INTENSITY / 100;
    set(document.documentElement, { 
        '--l-1': `hsla(45, calc((0 + (${STATE.ON ? 1 : 0} * 20)) * 1%), calc((50 + (${STATE.ON ? 1 : 0} * 50)) * 1%), ${0.2 * intensity})`,
        '--l-2': `hsla(45, calc((0 + (${STATE.ON ? 1 : 0} * 20)) * 1%), calc((50 + (${STATE.ON ? 1 : 0} * 50)) * 1%), ${0.85 * intensity})`
    });
    
 
    updateAmbientLight();
}
 
function updateAmbientLight() {
    if (STATE.AMBIENT_LIGHT_ENABLED && STATE.ON) {
        const intensity = STATE.LIGHT_INTENSITY / 100;
        gsap.to(AMBIENT_LIGHT_ELEMENT, {
            opacity: 0.3 * intensity,
            duration: 1
        });
    } else {
        gsap.to(AMBIENT_LIGHT_ELEMENT, {
            opacity: 0,
            duration: 1
        });
    }
}

 
updateLightIntensity();
updateAmbientLight();

gsap.set('.lamp', { display: 'block' });