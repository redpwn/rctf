(function() {
  window.ga=window.ga||function(){(ga.q=ga.q||[]).push(arguments)};ga.l=+new Date;

  var analyticsId = document.head.querySelector('meta[name="analytics-id"]').content;
  ga('create', analyticsId, 'auto');
  ga('set', 'location', location.href.replace(/(\?.*?)&?token=.*?(&|#|$)/, '$1$2'));

  ga('require', 'pageVisibilityTracker');
  ga('require', 'urlChangeTracker');

  ga('send', 'pageview');
})();
