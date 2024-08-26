document.addEventListener('DOMContentLoaded', function() {
    const button = document.querySelector(".button");
    const circle = document.querySelector(".circle");
    const nightLightButton = document.getElementById('night-light-button');
    let nightLightOn = false;

    const contrastSlider = document.getElementById('contrast-slider');
    const saturationSlider = document.getElementById('saturation-slider');
    const grayscaleSlider = document.getElementById('grayscale-slider');
    const contrastValue = document.getElementById('contrast-value');
    const saturationValue = document.getElementById('saturation-value');
    const grayscaleValue = document.getElementById('grayscale-value');

    const updateFilters = async () => {
        let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab.url.startsWith("chrome://")) {
            return; // Do not perform any actions on chrome:// URLs
        }

        chrome.storage.local.get(['currentMode', 'nightLightOn'], ({ currentMode = "OFF", nightLightOn = false }) => {
            const contrast = contrastSlider.value;
            const saturation = saturationSlider.value;
            const grayscale = grayscaleSlider.value;
            const invert = currentMode === "ON" ? 1 : 0;
            const hueRotate = currentMode === "ON" ? 180 : 0;
            const nightLight = nightLightOn ? 'sepia(30%)' : '';

            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: (invert, hueRotate, contrast, saturation, grayscale, nightLight) => {
                    document.querySelector("html").style.filter = `
                        invert(${invert})
                        hue-rotate(${hueRotate}deg)
                        contrast(${contrast}%)
                        saturate(${saturation}%)
                        grayscale(${grayscale}%)
                        ${nightLight}
                    `;
                    const media = document.querySelectorAll("img, picture, video");
                    media.forEach((mediaItem) => {
                        mediaItem.style.filter = `
                            invert(${invert})
                            hue-rotate(${hueRotate}deg)
                            ${nightLight}
                        `;
                    });
                },
                args: [invert, hueRotate, contrast, saturation, grayscale, nightLight]
            });

            contrastValue.textContent = contrast;
            saturationValue.textContent = saturation;
            grayscaleValue.textContent = grayscale;
        });
    };

    button.addEventListener("click", async () => {
        let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab.url.startsWith("chrome://")) {
            return; // Do not perform any actions on chrome:// URLs
        }

        chrome.storage.local.get('currentMode', ({ currentMode = "OFF" }) => {
            const newMode = currentMode === "OFF" ? "ON" : "OFF";
            chrome.storage.local.set({ currentMode: newMode });

            if (newMode === "ON") {
                button.style.animation = "transformToBlue 1s ease-in-out 0s forwards";
                circle.style.animation = "moveCircleRight 1s ease-in-out 0s forwards";
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    files: ['appOn.js']
                });
            } else {
                button.style.animation = "transformToYellow 1s ease-in-out 0s forwards";
                circle.style.animation = "moveCircleLeft 1s ease-in-out 0s forwards";
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    files: ['appOff.js']
                });
            }
            updateFilters(); // Reapply filters after toggling the mode
        });
    });

    contrastSlider.addEventListener('input', updateFilters);
    saturationSlider.addEventListener('input', updateFilters);
    grayscaleSlider.addEventListener('input', updateFilters);

    nightLightButton.addEventListener('click', () => {
        nightLightOn = !nightLightOn;
        nightLightButton.style.backgroundColor = nightLightOn ? '#ffcd02' : '#035efd';
        chrome.storage.local.set({ nightLightOn });
        updateFilters(); // Reapply filters after toggling Night Light
    });

    document.getElementById('default-button').addEventListener('click', () => {
        contrastSlider.value = 100;
        saturationSlider.value = 100;
        grayscaleSlider.value = 0;
        nightLightOn = false;
        chrome.storage.local.set({ nightLightOn });
        updateFilters();
    });

    // Initialize filters based on stored values
    chrome.storage.local.get(['currentMode', 'nightLightOn'], ({ currentMode = "OFF", nightLightOn = false }) => {
        if (currentMode === "ON") {
            button.style.animation = "transformToBlue 1s ease-in-out 0s forwards";
            circle.style.animation = "moveCircleRight 1s ease-in-out 0s forwards";
        } else {
            button.style.animation = "transformToYellow 1s ease-in-out 0s forwards";
            circle.style.animation = "moveCircleLeft 1s ease-in-out 0s forwards";
        }
        nightLightButton.style.backgroundColor = nightLightOn ? '#ffcd02' : '#035efd';
        updateFilters();
    });
});
