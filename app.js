app.ready(() => {
    app.search.init();
    app.menu.init();
    app.keys.init();
  
    // Listen to keys, close menu if visible
    document.addEventListener("keyup", (e) => { if (e.keyCode == app.keys.ESC) app.keys.handleESC() });
      
    document.addEventListener("keydown", (e) => {
      if (e.keyCode == app.keys.arrowUp) app.keys.handleArrowUp(e);
      else if (e.keyCode == app.keys.arrowDown) app.keys.handleArrowDown(e);
      else if (e.keyCode == app.keys.enter) app.keys.handleEnter(e);
    });
  
    window.addEventListener("scroll", app.animations.onlyPlayVisible);
  });
  
  app.search.init = () => {
    // Exit if there's no search function on the page
    app.search.visible = false;
    app.search.storageKey = "globalSearchData";
    var searchIcon = document.querySelector(".js-search");
    if (!searchIcon) return;
  
    app.search.searchIcon = searchIcon;
    app.search.loadData();
  
    // Click handlers
    document.querySelector(".js-search").addEventListener("click", (e) => {
      e.preventDefault();
      !app.search.visible ? app.search.reveal() : app.search.hide();
    });
    // When searching
    document.querySelector(".js-search-input").addEventListener("input", (e) => {
      app.search.updateResultsForQuery(e.target.value);
    });
  }
  
  app.search.loadData = () => {
    // Check if data already exists, if so load it instead
    var cachedData = localStorage.getItem(app.search.storageKey);
    if (cachedData) {
      var data = JSON.parse(cachedData);
      app.search.data = data["items"];
      return;
    }
  
    console.log("Found no cached data. Loading new data and storing it.");
    // If not, cache this with local storage and don't fetch on every page load
    fetch("/js/searchable.json").then(response => {
      return response.json();
    }).then((data) => {
      localStorage.setItem(app.search.storageKey, JSON.stringify(data));
      app.search.data = data["items"];
    }).catch((err) => {
      // Handle error
    });
  }
  
  app.search.updateResultsForQuery = (query) => {
    query = query.toLowerCase();
    var hits = [];
    // Look through all items
    for (var i = 0; i < app.search.data.length; i++) {
      // For every item, look for hits
      var entryValues = Object.values(app.search.data[i]);
      var searchString = entryValues.join(" ").toLowerCase();
      var hit = searchString.indexOf(query);
      // Store new hit
      if (hit == -1) continue;
      hits.push(app.search.data[i]);
    }
    
    app.search.renderResults(hits);
  }
  
  app.search.renderResults = (results) => {
    var searchElements = document.createElement("div");
    searchElements.classList.add("site-search-content-results-list");
  
    for (var i = 0; i < results.length; i++) {
      // Create link
      var newResult = document.createElement("a");
      // Add "active" if first row
      var rowClass = "site-search-results-item js-site-search-results-item";
      if (i == 0) rowClass += " site-search-results-item-active";
      newResult.classList = rowClass;
      newResult.href = results[i]["url"];
      newResult.textContent = results[i]["title"];
  
      // Create span and append to link
      var linkSpan = document.createElement("span");
      linkSpan.classList = "site-search-results-item-description";
      linkSpan.textContent = results[i]["description"];
      newResult.appendChild(linkSpan);
      // Append row to results
      searchElements.appendChild(newResult);
    }
    // Update HTML
    var results = document.querySelector(".js-site-search-content-results");
    results.innerHTML = "";
    results.appendChild(searchElements);
  
    // Update mouseenter event to move focus to hovered item
    for (let resultsItem of document.querySelectorAll(".js-site-search-results-item")) {
      resultsItem.addEventListener("mouseenter", (e) => app.search.focusItem(e.target));
    }
  }
  
  app.loadAndFadeInImages = () => {
    // Load background images
    document.querySelectorAll("div[data-image]").forEach((elem, i) => {
      var url = "/images/" + elem.dataset.image;
      if (url == null || url.length <= 0 ) { return; }
  
      elem.classList.add("image-loading");
      var bg = document.createElement("div");
      bg.classList.add("case-item-bg");
      bg.style.backgroundImage = 'url(' + url + ')';
      elem.prepend(bg);
      elem.classList.remove('image-loading');
      elem.classList.add('image-ready');
    });
  }
  
  app.menu.init = () => {
    app.menu.visible = false;
    // Top menu
    document.querySelector(".menu").addEventListener("click", (e) => {
      e.preventDefault();
      !app.menu.visible ? app.menu.reveal() : app.menu.hide();
    });
  }
  
  app.menu.toggleStates = () => {
    document.querySelector('body').classList.toggle('no-scroll');
    document.querySelector('.menu').classList.toggle('menu-active');
    document.querySelector('.js-nav').classList.toggle('site-nav-active');
  }
  
  app.search.toggleStates = () => {
    document.querySelector('body').classList.toggle('no-scroll');
    document.querySelector('.js-search-overlay').classList.toggle('site-nav-active');
  }
  
  app.menu.reveal = () => {
    app.menu.visible = true;
    app.menu.toggleStates();
  
    anime({
      targets:'.menu-animated-background',
      scale: [0.2, 3],
      opacity: [0.2,1],
      easing: "easeInCubic",
      duration: 300,
      complete: () => { app.search.hideSearchIcon() }
    });
  
    var containerDelay = 200;
    anime({
      targets:'.js-nav',
      opacity: [0, 1],
      delay: containerDelay,
      easing: "easeInOutExpo",
      duration: 200
    });
  
    var menuItemDelay = 90;
    containerDelay += 75;
    document.querySelector(".js-nav-header").style.opacity = 0;
    anime({
      targets: ".js-nav-header",
      opacity: [0,1],
      delay: containerDelay,
      easing: "easeInOutExpo",
      duration: 200
    });
    document.querySelector(".js-nav-header-line").style.transform.replace(/scale\([0-9|\.]*\)/, 'scale(0.2)');
    anime({
      targets:'.js-nav-header-line',
      scaleX: [0.28, 1],
      delay: containerDelay,
      easing: "easeInOutExpo",
      duration: 600
    });
    containerDelay += 350;
  
    for (let animated of document.querySelectorAll(".js-nav-animate")) {
      animated.style.opacity = 0;
      animated.style.transform.replace(/scale\([0-9|\.]*\)/, 'scale(0.9)');
    }
  
    anime({
      targets: '.js-nav-animate',
      translateY: ["-7px", 0],
      scale: [0.9, 1],
      opacity: [0, 1],
      delay: (el, i) => { return containerDelay + menuItemDelay * (i+1) },
      duration: 1100,
      easing: "easeOutExpo",
      complete: () => { document.dispatchEvent(new Event('app:menuDidReveal')) }
    });
  }
  
  app.search.reveal = () => {
    app.search.toggleStates();
    app.search.visible = true;
  
    anime({
      targets:'.site-search-animated-background',
      scale: [0.2, 3],
      opacity: [0.2,1],
      easing: "easeInCubic",
      duration: 300,
      complete: () => { app.menu.hideMenuIcon() }
    });
  
    // Hide search icon and show X
    var searchIconDuration = 400;
    var searchIconDelay = 200;
    // Hide Search icon
    anime({
      targets: '.site-search-icon',
      translateY: "-5px",
      rotate: 90,
      duration: searchIconDuration,
      scale: 0,
      easing: 'easeOutExpo',
      delay: searchIconDelay
    });
    // Show close icon
    anime({
      targets: '.site-search-close-icon',
      opacity: 1,
      scale: [0,1],
      duration: searchIconDuration,
      easing: 'easeOutExpo',
      delay: searchIconDelay
    });
  
    anime({
      targets: '.site-search-close-icon-line-1',
      rotateZ: [45, 225],
      duration: searchIconDuration,
      easing: 'easeOutExpo',
      delay: searchIconDelay
    });
  
    anime({
      targets: '.site-search-close-icon-line-2',
      rotateZ: [45, 135],
      duration: searchIconDuration,
      easing: 'easeOutExpo',
      delay: searchIconDelay
    });
  
    document.querySelector(".js-search-input").style.opacity = 0;
    anime.timeline().add({
      targets:'.js-search-overlay',
      opacity: [0, 1],
      delay: 200,
      easing: "easeInOutExpo",
      duration: 200
    }).add({
      targets: '.js-search-input',
      opacity: [0,1],
      easing: "easeOutExpo",
      translateY: ["-20px", 0],
      duration: 700
    });
    // Focus on input field
    document.querySelector(".js-search-input").focus();
  }
  
  app.search.moveSelectionInDirection = (options) => {
    // Find index of current focus
    var activeSelection = document.querySelector(".site-search-results-item-active");
    var newSelection = options.direction === "up" ? activeSelection.previousElementSibling : activeSelection.nextElementSibling;
    // Select next item (if any)
    if (newSelection == null) return;
    activeSelection.classList.remove("site-search-results-item-active");
    newSelection.classList.add("site-search-results-item-active");
  }
  
  app.search.moveSelectionUp = () => app.search.moveSelectionInDirection({direction: "up"});
  app.search.moveSelectionDown = () => app.search.moveSelectionInDirection({direction: "down"});
  
  app.search.focusItem = (item) => {
    document.querySelector(".site-search-results-item-active").classList.remove("site-search-results-item-active");
    item.classList.add("site-search-results-item-active");
  }
  
  app.search.goToSelectedItem = () => {
    var href = document.querySelector(".site-search-results-item-active").getAttribute("href");
    window.location.href = href;
  }
  
  app.search.hide = () => {
    app.search.toggleStates();
    app.search.visible = false;
    var searchIconDuration = 400;
    var searchIconDelay = 200;
  
    anime({
      targets: '.js-search-input',
      opacity: [1,0],
      easing: "easeOutExpo",
      duration: 500,
      translateY: ["0", "-20px"]
    });
  
    anime({
      targets: '.site-search-animated-background',
      scale: [4,0],
      easing: "easeInExpo",
      duration: 400,
      complete: () => { app.menu.showMenuIcon() }
    });
  
    anime({
      targets:'.js-search-overlay',
      opacity: [1, 0],
      delay: 200,
      easing: "easeInOutExpo",
      duration: 200
    });
  
    // Animate the cross
    anime({
      targets: '.site-search-close-icon',
      opacity: [1,0],
      scale: 0,
      duration: searchIconDuration,
      easing: 'easeOutExpo',
      delay: searchIconDelay
    });
  
    anime({
      targets: '.site-search-close-icon-line-1',
      rotateZ: [225, 45],
      duration: searchIconDuration,
      easing: 'easeOutExpo',
      delay: searchIconDelay
    });
  
    anime({
      targets: '.site-search-close-icon-line-2',
      rotateZ: [135, 45],
      duration: searchIconDuration,
      easing: 'easeOutExpo',
      delay: searchIconDelay
    });
  
    anime({
      targets: '.site-search-icon',
      translateY: ["-5px", "0px"],
      rotate: [90,0],
      duration: searchIconDuration,
      opacity: [0,1],
      scale: [0,1],
      easing: 'easeOutExpo',
      delay: searchIconDelay
    });
  }
  
  app.menu.hide = () => {
    app.menu.visible = false;
    app.menu.toggleStates();
    document.dispatchEvent(new Event("app:menuWillHide"));
  
    anime({
      targets: '.menu-animated-background',
      scale: [4,0],
      easing: "easeInExpo",
      duration: 400,
      complete: () => { app.search.showSearchIcon() }
    });
  
    anime({
      targets:'.js-nav',
      opacity: [1, 0],
      easing: "easeInOutExpo",
      duration: 200
    });
  
    anime({
      targets:'.js-nav-header-line',
      scale: [1, 0.5],
      easing: "easeInExpo",
      duration: 300
    });
  
    anime({
      targets: '.js-nav-animate',
      translateY: "10px",
      scale: [1, 0.9],
      opacity: [1, 0],
      easing: "easeInExpo",
      duration: 200
    });
  }
  
  // Typically called by views that want to display something in the same 
  // position of the menu icon
  app.menu.hideMenuIcon = () => {
    document.querySelector(".menu").style.display = "none";
  }
  
  app.menu.showMenuIcon = () => {
    document.querySelector(".menu").style.display = "";
  }
  
  app.search.hideSearchIcon = () => {
    if (!app.search.searchIcon) return;
    app.search.searchIcon.style.display = "none";
  }
  
  app.search.showSearchIcon = () => {
    if (!app.search.searchIcon) return;
    app.search.searchIcon.style.display = "";
    anime({
      targets: ".js-search",
      opacity: [0,1],
      duration: 700,
      easing: "easeOutExpo"
    });
  }
  
  app.keys.handleESC = () => {
    document.dispatchEvent(new Event("pressed:ESC"));
    if (app.menu.visible) {
      app.menu.hide();
      return;
    }
    if (app.search.visible) {
      app.search.hide();
      return;
    }
  }
  
  // Keyboard Key handling
  app.keys.init = () => {
    app.keys.ESC = 27;
    app.keys.arrowUp = 38;
    app.keys.arrowDown = 40;
    app.keys.enter = 13;
  }
  
  app.keys.handleArrowUp = (e) => {
    if (app.search.visible) {
      e.preventDefault();
      app.search.moveSelectionUp();
    }
  }
  
  app.keys.handleArrowDown = (e) => {
    if (app.search.visible) {
      e.preventDefault();
      app.search.moveSelectionDown();
    }
  }
  
  app.keys.handleEnter = (e) => {
    if (app.search.visible) {
      e.preventDefault();
      app.search.goToSelectedItem();
    }
  }
  
  // Management of animations
  app.animations.track = (animeTimeline, el) => {
    // Add object to list of tracked animations
    app.animations.tracked.push({
      timeline: animeTimeline, 
      element: el
    });
  }
  
  app.animations.onlyPlayVisible = () => {
    app.animations.tracked.forEach((animation) => {
      app.animations.shouldPlay(animation) ? animation.timeline.play() : animation.timeline.pause();
    });
  }
  
  app.animations.shouldPlay = (animation) => {
    var winHeight = window.innerHeight;
    var bounds = animation.element.getBoundingClientRect();
    var offset = 5; // Greater offset -> animations will play less often
  
    // Check if bottom of animation is above view or if top of animation is below view
    if (bounds.bottom < 0+offset || bounds.top > winHeight-offset) return false;
    // Default to true
    return true;
  }