const LEADERBOARD_KEY="abr_leaderboards_v1";
const SETTINGS_KEY="abr_settings_v1";

function safeParse(value,fallback){
  try{return JSON.parse(value);}catch{return fallback;}
}

function loadLeaderboards(){
  const blank={"5":[],"10":[],"15":[],"20":[],"endless":[]};
  try{
    const saved=safeParse(localStorage.getItem(LEADERBOARD_KEY),null);
    if(!saved) return blank;
    for(const key of Object.keys(blank)) blank[key]=Array.isArray(saved[key])?saved[key]:[];
    return blank;
  }catch{return blank;}
}

function saveLeaderboards(data){
  try{localStorage.setItem(LEADERBOARD_KEY,JSON.stringify(data));}catch{}
}

function loadSettings(){
  const defaults={particles:true,autoPause:true};
  try{return{...defaults,...safeParse(localStorage.getItem(SETTINGS_KEY),{})};}catch{return defaults;}
}

function saveSettings(){
  try{localStorage.setItem(SETTINGS_KEY,JSON.stringify(settings));}catch{}
}

const leaderboards=loadLeaderboards();
const settings=loadSettings();

function recordRun(outcome){
  if(!state.mode) return false;
  const board=leaderboards[state.mode.id];
  const entry={
    time:Math.floor(state.t),
    kills:state.kills,
    eliteKills:state.eliteKills,
    level:player.level,
    score:state.mode.endless?0:calculateRunScore(),
    date:Date.now()
  };

  if(!state.mode.endless&&outcome!=="victory") return false;

  const previousBest=board[0]||null;
  board.push(entry);

  if(state.mode.endless){
    board.sort((a,b)=>b.time-a.time||b.kills-a.kills||b.level-a.level);
  }else{
    board.sort((a,b)=>b.score-a.score||b.kills-a.kills||b.level-a.level);
  }

  board.splice(10);
  saveLeaderboards(leaderboards);

  if(!previousBest) return board[0]===entry;
  if(state.mode.endless) return entry.time>previousBest.time||(entry.time===previousBest.time&&entry.kills>previousBest.kills);
  return entry.score>previousBest.score||(entry.score===previousBest.score&&entry.kills>previousBest.kills);
}
