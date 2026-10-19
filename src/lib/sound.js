/** Short synthesized interface notes, no copyrighted recordings or audio downloads. */
/** @param {boolean} correct @param {number} streak */
export function playResultTone(correct,streak=0) {
  if(typeof window==='undefined'||!window.AudioContext)return;
  try {
    const context=new window.AudioContext();
    const start=context.currentTime;
    const notes=correct?(streak>=3?[523,659,784]:[523,659]):[330,262];
    for(const [i,frequency] of notes.entries()) {
      const osc=context.createOscillator();
      const gain=context.createGain();
      osc.type='sine';
      osc.frequency.value=frequency;
      const at=start+i*0.11;
      gain.gain.setValueAtTime(0.0001,at);
      gain.gain.exponentialRampToValueAtTime(0.09,at+0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001,at+0.14);
      osc.connect(gain);gain.connect(context.destination);
      osc.start(at);osc.stop(at+0.15);
    }
    // Close after the envelope rather than leaving audio nodes alive.
    void new Promise(resolve=>setTimeout(resolve,600)).then(()=>context.close()).catch(()=>{});
  } catch { /* Audio is decorative; gameplay never depends on it. */ }
}
