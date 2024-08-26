(() => {
  const media = document.querySelectorAll("img, picture, video");
  document.querySelector("html").style.filter = "invert(1) hue-rotate(180deg)";
  media.forEach((mediaItem) => {
    mediaItem.style.filter = "invert(1) hue-rotate(180deg)";
  });
})();
