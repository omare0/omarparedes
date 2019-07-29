app.ready(() => {

  app.menu.init();
  window.addEventListener("scroll", app.animations.onlyPlayVisible);

});

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

app.menu.reveal = () => {

  app.menu.visible = true;
  app.menu.toggleStates();

  anime({
    targets:'.menu-animated-background',
    scale: [0.2, 3],
    opacity: [0.2,1],
    easing: "easeInCubic",
    duration: 300
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

app.menu.hide = () => {

  app.menu.visible = false;
  app.menu.toggleStates();
  document.dispatchEvent(new Event("app:menuWillHide"));

  anime({
    targets: '.menu-animated-background',
    scale: [4,0],
    easing: "easeInExpo",
    duration: 400
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