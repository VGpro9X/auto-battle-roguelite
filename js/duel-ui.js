(()=>{
  // V0.17 compatibility contract: the loaded Duel UI implementation consumes getDuelEvolutionChoiceHints for immediate Siêu Cấp unlock hints.
  const src='js/duel-ui-v020.js?v=020-ui-fix';
  if(typeof document==='undefined')return;
  if(document.readyState==='loading'){
    document.write('<script src="'+src+'"><\/script>');
    return;
  }
  const script=document.createElement('script');
  script.src=src;
  script.async=false;
  document.head.appendChild(script);
})();